'use strict';

// ---------------------------------------------------------------------------
// Comparison helper
// ---------------------------------------------------------------------------

/**
 * Compares two primitive values for use in sort functions.
 * Returns -1 if a < b, 1 if a > b, or 0 if equal.
 *
 * @param {*} a
 * @param {*} b
 * @returns {number}
 */
function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

// ---------------------------------------------------------------------------
// Key derivation helper for set operations
// ---------------------------------------------------------------------------

/**
 * Returns a stable key for an element used in Set-based deduplication.
 * Primitives are returned as-is so Set lookups use reference equality,
 * which is O(1) and avoids the cost of JSON.stringify for the common case.
 * Objects fall back to JSON.stringify for deep equality.
 *
 * @param {*} value
 * @returns {*}
 */
function toKey(value) {
    if (value === null || typeof value !== 'object') return value;
    return JSON.stringify(value);
}

// ---------------------------------------------------------------------------
// LazyQuery
// ---------------------------------------------------------------------------

/**
 * LazyQuery wraps an iterable source and accumulates a pipeline of
 * transformation steps that are applied on-demand when the sequence is
 * consumed by a terminal operation or a for-of loop.
 *
 * This mirrors the behaviour of IEnumerable<T> in C# LINQ: intermediate
 * operators such as where(), select(), and take() do not iterate the source
 * or allocate result arrays. Iteration happens exactly once when a terminal
 * operator (toArray(), first(), count(), etc.) is called.
 *
 * @template T
 */
class LazyQuery {
    /**
     * @param {Iterable<T>} source - Any iterable (Array, Set, Map, generator, etc.)
     */
    constructor(source) {
        /** @private */
        this._source = source;
        /** @private @type {Array<function(Iterable): Iterable>} */
        this._ops = [];
    }

    // -----------------------------------------------------------------------
    // Internal pipeline machinery
    // -----------------------------------------------------------------------

    /**
     * Clones this query and appends one pipeline stage.
     * Keeping each stage immutable allows the same base query to be
     * branched into multiple derived queries without interference.
     *
     * @private
     * @param {function(Iterable): Iterable} op - A generator-based stage.
     * @returns {LazyQuery<*>}
     */
    _append(op) {
        const q = new LazyQuery(this._source);
        q._ops = [...this._ops, op];
        return q;
    }

    /**
     * Returns a generator that pipes the source through every accumulated
     * operation in order.  This is the single place where iteration occurs.
     *
     * @private
     * @returns {Generator}
     */
    *_run() {
        let iter = this._source;
        for (const op of this._ops) {
            iter = op(iter);
        }
        yield* iter;
    }

    /**
     * Makes LazyQuery iterable so it can be used in for-of loops and spread
     * expressions directly, without calling toArray() first.
     *
     * @returns {Iterator<T>}
     */
    [Symbol.iterator]() {
        return this._run();
    }

    // -----------------------------------------------------------------------
    // Intermediate operators  (return a new LazyQuery — nothing executes yet)
    // -----------------------------------------------------------------------

    /**
     * Filters elements using a predicate.
     * Equivalent to Array.prototype.filter / C# Enumerable.Where.
     *
     * @param {function(T, number): boolean} predicate
     * @returns {LazyQuery<T>}
     */
    where(predicate) {
        return this._append(function* (source) {
            let i = 0;
            for (const item of source) {
                if (predicate(item, i++)) yield item;
            }
        });
    }

    /**
     * Projects each element into a new form.
     * Equivalent to Array.prototype.map / C# Enumerable.Select.
     *
     * @template U
     * @param {function(T, number): U} selector
     * @returns {LazyQuery<U>}
     */
    select(selector) {
        return this._append(function* (source) {
            let i = 0;
            for (const item of source) {
                yield selector(item, i++);
            }
        });
    }

    /**
     * Projects each element to an iterable and flattens the results.
     * Equivalent to Array.prototype.flatMap / C# Enumerable.SelectMany.
     *
     * @template U
     * @param {function(T, number): Iterable<U>} selector
     * @returns {LazyQuery<U>}
     */
    selectMany(selector) {
        return this._append(function* (source) {
            let i = 0;
            for (const item of source) {
                yield* selector(item, i++);
            }
        });
    }

    /**
     * Filters elements to only those matching a JavaScript typeof string.
     * Equivalent to C# Enumerable.OfType (using typeof rather than instanceof).
     *
     * @param {string} type - A JavaScript typeof string, e.g. 'number', 'string'.
     * @returns {LazyQuery<T>}
     */
    ofType(type) {
        return this._append(function* (source) {
            for (const item of source) {
                if (typeof item === type) yield item;
            }
        });
    }

    /**
     * Returns the first n elements and stops iteration.
     * Equivalent to C# Enumerable.Take — no elements beyond n are pulled
     * from the source, making it safe to use on infinite generators.
     *
     * @param {number} n
     * @returns {LazyQuery<T>}
     */
    take(n) {
        return this._append(function* (source) {
            if (n <= 0) return;
            let count = 0;
            for (const item of source) {
                yield item;
                if (++count >= n) return;
            }
        });
    }

    /**
     * Skips the first n elements and yields the rest.
     * Equivalent to C# Enumerable.Skip.
     *
     * @param {number} n
     * @returns {LazyQuery<T>}
     */
    skip(n) {
        return this._append(function* (source) {
            let skipped = 0;
            for (const item of source) {
                if (skipped < n) { skipped++; continue; }
                yield item;
            }
        });
    }

    /**
     * Yields elements while the predicate returns true, then stops.
     * Equivalent to C# Enumerable.TakeWhile.
     *
     * @param {function(T): boolean} predicate
     * @returns {LazyQuery<T>}
     */
    takeWhile(predicate) {
        return this._append(function* (source) {
            for (const item of source) {
                if (!predicate(item)) break;
                yield item;
            }
        });
    }

    /**
     * Skips elements while the predicate returns true, then yields the rest.
     * Equivalent to C# Enumerable.SkipWhile.
     *
     * @param {function(T): boolean} predicate
     * @returns {LazyQuery<T>}
     */
    skipWhile(predicate) {
        return this._append(function* (source) {
            let skipping = true;
            for (const item of source) {
                if (skipping && predicate(item)) continue;
                skipping = false;
                yield item;
            }
        });
    }

    /**
     * Removes duplicate elements using Set semantics.
     * Primitives are compared by value; objects by deep JSON equality.
     * Equivalent to C# Enumerable.Distinct.
     *
     * @returns {LazyQuery<T>}
     */
    distinct() {
        return this._append(function* (source) {
            const seen = new Set();
            for (const item of source) {
                const key = toKey(item);
                if (!seen.has(key)) {
                    seen.add(key);
                    yield item;
                }
            }
        });
    }

    /**
     * Removes duplicates by projecting each element to a key.
     * The first element for each key is kept.
     * Equivalent to C# Enumerable.DistinctBy.
     *
     * @param {function(T): *} selector
     * @returns {LazyQuery<T>}
     */
    distinctBy(selector) {
        return this._append(function* (source) {
            const seen = new Set();
            for (const item of source) {
                const key = selector(item);
                if (!seen.has(key)) {
                    seen.add(key);
                    yield item;
                }
            }
        });
    }

    /**
     * Appends a single item to the end of the sequence.
     * Equivalent to C# Enumerable.Append.
     *
     * @param {T} item
     * @returns {LazyQuery<T>}
     */
    append(item) {
        return this._append(function* (source) {
            yield* source;
            yield item;
        });
    }

    /**
     * Prepends a single item to the beginning of the sequence.
     * Equivalent to C# Enumerable.Prepend.
     *
     * @param {T} item
     * @returns {LazyQuery<T>}
     */
    prepend(item) {
        return this._append(function* (source) {
            yield item;
            yield* source;
        });
    }

    /**
     * Yields a default value if the sequence is empty, otherwise yields
     * the sequence unchanged.
     * Equivalent to C# Enumerable.DefaultIfEmpty.
     *
     * @param {T} defaultValue
     * @returns {LazyQuery<T>}
     */
    defaultIfEmpty(defaultValue) {
        return this._append(function* (source) {
            let empty = true;
            for (const item of source) {
                empty = false;
                yield item;
            }
            if (empty) yield defaultValue;
        });
    }

    /**
     * Yields elements from this sequence followed by elements from another
     * iterable. Equivalent to C# Enumerable.Concat.
     *
     * @param {Iterable<T>} other
     * @returns {LazyQuery<T>}
     */
    concat(other) {
        return this._append(function* (source) {
            yield* source;
            yield* other;
        });
    }

    /**
     * Returns the set union of this sequence and another, removing duplicates.
     * Both sequences are consumed lazily in order; duplicates are tracked with
     * a Set so each unique element is yielded exactly once.
     * Equivalent to C# Enumerable.Union.
     *
     * @param {Iterable<T>} other
     * @returns {LazyQuery<T>}
     */
    union(other) {
        return this._append(function* (source) {
            const seen = new Set();
            for (const item of source) {
                const key = toKey(item);
                if (!seen.has(key)) { seen.add(key); yield item; }
            }
            for (const item of other) {
                const key = toKey(item);
                if (!seen.has(key)) { seen.add(key); yield item; }
            }
        });
    }

    /**
     * Returns elements that appear in both this sequence and another.
     * The other iterable is fully consumed once to build a lookup Set;
     * then the source is scanned lazily.
     * Equivalent to C# Enumerable.Intersect.
     *
     * @param {Iterable<T>} other
     * @returns {LazyQuery<T>}
     */
    intersect(other) {
        return this._append(function* (source) {
            // Materialise only the smaller side (other) into a Set.
            const otherSet = new Set();
            for (const item of other) otherSet.add(toKey(item));
            const yielded = new Set();
            for (const item of source) {
                const key = toKey(item);
                if (otherSet.has(key) && !yielded.has(key)) {
                    yielded.add(key);
                    yield item;
                }
            }
        });
    }

    /**
     * Returns elements from this sequence that do not appear in another.
     * Equivalent to C# Enumerable.Except.
     *
     * @param {Iterable<T>} other
     * @returns {LazyQuery<T>}
     */
    except(other) {
        return this._append(function* (source) {
            const excluded = new Set();
            for (const item of other) excluded.add(toKey(item));
            for (const item of source) {
                if (!excluded.has(toKey(item))) yield item;
            }
        });
    }

    /**
     * Combines this sequence with another element-by-element.
     * Stops at the shorter sequence.
     * Equivalent to C# Enumerable.Zip.
     *
     * @template U, R
     * @param {Iterable<U>} other
     * @param {function(T, U): R} [resultSelector]
     * @returns {LazyQuery<R>}
     */
    zip(other, resultSelector = (a, b) => [a, b]) {
        return this._append(function* (source) {
            const itB = other[Symbol.iterator]();
            for (const a of source) {
                const { value: b, done } = itB.next();
                if (done) break;
                yield resultSelector(a, b);
            }
        });
    }

    // -----------------------------------------------------------------------
    // Terminal operators  (consume the pipeline and return a concrete value)
    // -----------------------------------------------------------------------

    /**
     * Materialises the lazy sequence into a plain Array.
     * This is the primary terminal operator — equivalent to C# .ToList()
     * or .ToArray().
     *
     * @returns {T[]}
     */
    toArray() {
        return [...this._run()];
    }

    /**
     * Returns the first element, or the first element matching a predicate.
     * Throws if the sequence is empty and no predicate is supplied.
     * Equivalent to C# Enumerable.First.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {T}
     */
    first(predicate) {
        for (const item of this._run()) {
            if (!predicate || predicate(item)) return item;
        }
        throw new Error('Sequence contains no matching element');
    }

    /**
     * Returns the first element matching a predicate, or null if none found.
     * Equivalent to C# Enumerable.FirstOrDefault.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {T|null}
     */
    firstOrDefault(predicate) {
        for (const item of this._run()) {
            if (!predicate || predicate(item)) return item;
        }
        return null;
    }

    /**
     * Returns the last element, or the last element matching a predicate.
     * The entire pipeline must be consumed to find the last element.
     * Equivalent to C# Enumerable.Last.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {T}
     */
    last(predicate) {
        let found = false;
        let result;
        for (const item of this._run()) {
            if (!predicate || predicate(item)) { result = item; found = true; }
        }
        if (!found) throw new Error('Sequence contains no matching element');
        return result;
    }

    /**
     * Returns the last element matching a predicate, or null if none found.
     * Equivalent to C# Enumerable.LastOrDefault.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {T|null}
     */
    lastOrDefault(predicate) {
        let result = null;
        let found = false;
        for (const item of this._run()) {
            if (!predicate || predicate(item)) { result = item; found = true; }
        }
        return found ? result : null;
    }

    /**
     * Returns exactly one element, or exactly one element matching a predicate.
     * Throws if the count of matching elements is not exactly one.
     * Equivalent to C# Enumerable.Single.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {T}
     */
    single(predicate) {
        let found = false;
        let result;
        for (const item of this._run()) {
            if (!predicate || predicate(item)) {
                if (found) throw new Error('Sequence contains more than one matching element');
                result = item;
                found = true;
            }
        }
        if (!found) throw new Error('Sequence contains no matching element');
        return result;
    }

    /**
     * Returns one element or null; throws if more than one element matches.
     * Equivalent to C# Enumerable.SingleOrDefault.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {T|null}
     */
    singleOrDefault(predicate) {
        let found = false;
        let result = null;
        for (const item of this._run()) {
            if (!predicate || predicate(item)) {
                if (found) throw new Error('Sequence contains more than one matching element');
                result = item;
                found = true;
            }
        }
        return found ? result : null;
    }

    /**
     * Returns true if the sequence has any elements, or any elements
     * matching a predicate.  Short-circuits on the first match.
     * Equivalent to C# Enumerable.Any.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {boolean}
     */
    any(predicate) {
        for (const item of this._run()) {
            if (!predicate || predicate(item)) return true;
        }
        return false;
    }

    /**
     * Returns true only if every element satisfies the predicate.
     * Short-circuits on the first failure.
     * Equivalent to C# Enumerable.All.
     *
     * @param {function(T): boolean} predicate
     * @returns {boolean}
     */
    all(predicate) {
        for (const item of this._run()) {
            if (!predicate(item)) return false;
        }
        return true;
    }

    /**
     * Returns true if the sequence contains the specified value.
     * Uses strict equality (===) for primitives.
     * Equivalent to C# Enumerable.Contains.
     *
     * @param {T} value
     * @returns {boolean}
     */
    contains(value) {
        for (const item of this._run()) {
            if (item === value) return true;
        }
        return false;
    }

    /**
     * Counts all elements, or elements matching a predicate, without
     * allocating an intermediate array.
     * Equivalent to C# Enumerable.Count.
     *
     * @param {function(T): boolean} [predicate]
     * @returns {number}
     */
    count(predicate) {
        let n = 0;
        for (const item of this._run()) {
            if (!predicate || predicate(item)) n++;
        }
        return n;
    }

    /**
     * Sums all elements, or projected values from a selector.
     * Equivalent to C# Enumerable.Sum.
     *
     * @param {function(T): number} [selector]
     * @returns {number}
     */
    sum(selector) {
        let total = 0;
        for (const item of this._run()) {
            total += selector ? selector(item) : item;
        }
        return total;
    }

    /**
     * Returns the average of all elements or projected values.
     * Returns 0 for an empty sequence.
     * Equivalent to C# Enumerable.Average.
     *
     * @param {function(T): number} [selector]
     * @returns {number}
     */
    average(selector) {
        let total = 0;
        let n = 0;
        for (const item of this._run()) {
            total += selector ? selector(item) : item;
            n++;
        }
        return n === 0 ? 0 : total / n;
    }

    /**
     * Returns the minimum value in the sequence, optionally using a selector.
     * Uses a loop instead of Math.min(...spread) to avoid stack overflow on
     * large sequences.
     * Equivalent to C# Enumerable.Min.
     *
     * @param {function(T): number} [selector]
     * @returns {number}
     */
    min(selector) {
        let result = Infinity;
        for (const item of this._run()) {
            const v = selector ? selector(item) : item;
            if (v < result) result = v;
        }
        return result;
    }

    /**
     * Returns the maximum value in the sequence, optionally using a selector.
     * Uses a loop instead of Math.max(...spread) to avoid stack overflow on
     * large sequences.
     * Equivalent to C# Enumerable.Max.
     *
     * @param {function(T): number} [selector]
     * @returns {number}
     */
    max(selector) {
        let result = -Infinity;
        for (const item of this._run()) {
            const v = selector ? selector(item) : item;
            if (v > result) result = v;
        }
        return result;
    }

    /**
     * Applies an accumulator function over the sequence, starting from a seed.
     * Equivalent to Array.prototype.reduce / C# Enumerable.Aggregate.
     *
     * @template U
     * @param {function(U, T): U} accumulator
     * @param {U} seed
     * @returns {U}
     */
    aggregate(accumulator, seed) {
        let acc = seed;
        for (const item of this._run()) {
            acc = accumulator(acc, item);
        }
        return acc;
    }

    /**
     * Returns the element at the specified zero-based index.
     * Throws if the index is out of range.
     * Equivalent to C# Enumerable.ElementAt.
     *
     * @param {number} index
     * @returns {T}
     */
    elementAt(index) {
        let i = 0;
        for (const item of this._run()) {
            if (i++ === index) return item;
        }
        throw new Error('Index out of range');
    }

    /**
     * Returns the element at the specified index, or null if out of range.
     * Equivalent to C# Enumerable.ElementAtOrDefault.
     *
     * @param {number} index
     * @returns {T|null}
     */
    elementAtOrDefault(index) {
        let i = 0;
        for (const item of this._run()) {
            if (i++ === index) return item;
        }
        return null;
    }

    /**
     * Checks whether this sequence and another contain the same elements in the
     * same order using deep equality via JSON.stringify.
     * Equivalent to C# Enumerable.SequenceEqual.
     *
     * @param {Iterable<T>} other
     * @returns {boolean}
     */
    sequenceEqual(other) {
        const itA = this._run();
        const itB = other[Symbol.iterator]();
        while (true) {
            const a = itA.next();
            const b = itB.next();
            if (a.done && b.done) return true;
            if (a.done !== b.done) return false;
            if (JSON.stringify(a.value) !== JSON.stringify(b.value)) return false;
        }
    }

    // -----------------------------------------------------------------------
    // Operators that must fully materialise the source before returning
    // (sorting needs the full set; grouping and joining build lookup maps)
    // These return plain Arrays or plain Objects, not LazyQuery, because the
    // C# equivalents are also terminal / require full enumeration.
    // -----------------------------------------------------------------------

    /**
     * Sorts the sequence in ascending order by a key selector.
     * Uses the Schwartzian transform (decorate-sort-undecorate) so the
     * selector is called exactly once per element rather than once per
     * comparison.
     * Returns a plain Array augmented with thenBy / thenByDesc for chaining.
     * Equivalent to C# Enumerable.OrderBy.
     *
     * @param {function(T): *} selector
     * @returns {T[] & { thenBy: function, thenByDesc: function }}
     */
    orderBy(selector) {
        return _chainSort(this.toArray(), [selector], [false]);
    }

    /**
     * Sorts the sequence in descending order by a key selector.
     * Equivalent to C# Enumerable.OrderByDescending.
     *
     * @param {function(T): *} selector
     * @returns {T[] & { thenBy: function, thenByDesc: function }}
     */
    orderByDesc(selector) {
        return _chainSort(this.toArray(), [selector], [true]);
    }

    /**
     * Groups elements into a plain object whose keys are the results of the
     * key selector and whose values are arrays of matching elements.
     * Equivalent to C# Enumerable.GroupBy (simplified — returns a dictionary
     * rather than a sequence of IGrouping).
     *
     * @param {function(T): string|number|symbol} keySelector
     * @returns {Record<string, T[]>}
     */
    groupBy(keySelector) {
        const result = Object.create(null);
        for (const item of this._run()) {
            const key = keySelector(item);
            if (!result[key]) result[key] = [];
            result[key].push(item);
        }
        return result;
    }

    /**
     * Performs a hash-based inner join against another array.
     * Builds a Map from the inner array keyed by innerKeySelector (O(m)),
     * then probes the map for each outer element (O(n)).
     * Equivalent to C# Enumerable.Join.
     *
     * @template U, K, R
     * @param {U[]} inner
     * @param {function(T): K} outerKeySelector
     * @param {function(U): K} innerKeySelector
     * @param {function(T, U): R} resultSelector
     * @returns {R[]}
     */
    innerJoin(inner, outerKeySelector, innerKeySelector, resultSelector) {
        const map = new Map();
        for (const item of inner) {
            const key = innerKeySelector(item);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(item);
        }
        const results = [];
        for (const outerItem of this._run()) {
            const matches = map.get(outerKeySelector(outerItem));
            if (matches) {
                for (const innerItem of matches) {
                    results.push(resultSelector(outerItem, innerItem));
                }
            }
        }
        return results;
    }

    /**
     * Performs a group join (left outer join with grouping) against another
     * array.  Each outer element is paired with the array of all matching
     * inner elements (which may be empty).
     * Equivalent to C# Enumerable.GroupJoin.
     *
     * @template U, K, R
     * @param {U[]} inner
     * @param {function(T): K} outerKeySelector
     * @param {function(U): K} innerKeySelector
     * @param {function(T, U[]): R} resultSelector
     * @returns {R[]}
     */
    groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector) {
        const map = new Map();
        for (const item of inner) {
            const key = innerKeySelector(item);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(item);
        }
        const results = [];
        for (const outerItem of this._run()) {
            const matches = map.get(outerKeySelector(outerItem)) || [];
            results.push(resultSelector(outerItem, matches));
        }
        return results;
    }

    /**
     * Converts the sequence to a plain object (dictionary), keyed by a
     * selector and optionally projected by a value selector.
     * Equivalent to C# .ToDictionary().
     *
     * @template K, V
     * @param {function(T): K} keySelector
     * @param {function(T): V} [valueSelector]
     * @returns {Record<K, V>}
     */
    toDictionary(keySelector, valueSelector) {
        const dict = Object.create(null);
        for (const item of this._run()) {
            dict[keySelector(item)] = valueSelector ? valueSelector(item) : item;
        }
        return dict;
    }

    /**
     * Converts the sequence to a native JavaScript Set.
     * Equivalent to C# .ToHashSet().
     *
     * @returns {Set<T>}
     */
    toSet() {
        return new Set(this._run());
    }

    /**
     * Converts the sequence to a native JavaScript Map using the provided
     * key and value selectors.
     * Equivalent to C# .ToDictionary() with a Map as the backing store.
     *
     * @template K, V
     * @param {function(T): K} keySelector
     * @param {function(T): V} [valueSelector]
     * @returns {Map<K, V>}
     */
    toMap(keySelector, valueSelector) {
        const map = new Map();
        for (const item of this._run()) {
            map.set(keySelector(item), valueSelector ? valueSelector(item) : item);
        }
        return map;
    }

    /**
     * Casts the lazy sequence to another type.
     * In JavaScript this is an identity operation that simply re-wraps the
     * source; actual type conversion is not enforced at runtime.
     * Equivalent to C# Enumerable.Cast<T>.
     *
     * @returns {LazyQuery<*>}
     */
    cast() {
        return this._append(function* (source) { yield* source; });
    }

    /**
     * Returns a string representation useful for debugging.
     * Evaluates the pipeline and shows up to 10 elements.
     *
     * @returns {string}
     */
    toString() {
        const preview = this.take(10).toArray();
        const suffix = preview.length === 10 ? ', ...' : '';
        return `LazyQuery [${preview.map(x => JSON.stringify(x)).join(', ')}${suffix}]`;
    }
}

// ---------------------------------------------------------------------------
// Sorting helpers (shared between LazyQuery and Array.prototype)
// ---------------------------------------------------------------------------

/**
 * Sorts an array using multiple key selectors and direction flags via the
 * Schwartzian transform.  Each selector is called exactly once per element
 * (O(n) projections) rather than once per comparison (O(n log n) projections).
 *
 * @param {Array} array - The array to sort (will not be mutated).
 * @param {Function[]} selectors - Key selector functions in priority order.
 * @param {boolean[]} directions - true = descending, false = ascending.
 * @returns {Array} A new sorted array with thenBy / thenByDesc methods attached.
 */
function _chainSort(array, selectors, directions) {
    // Decorate: compute all keys for every element once.
    const decorated = array.map(item => ({
        item,
        keys: selectors.map(fn => fn(item)),
    }));

    // Sort using pre-computed keys.
    decorated.sort((a, b) => {
        for (let i = 0; i < selectors.length; i++) {
            const result = directions[i]
                ? compare(b.keys[i], a.keys[i])
                : compare(a.keys[i], b.keys[i]);
            if (result !== 0) return result;
        }
        return 0;
    });

    // Undecorate: strip the key wrappers.
    const sorted = decorated.map(d => d.item);

    // Attach thenBy / thenByDesc so callers can chain further sort criteria.
    return _attachThenBy(sorted, selectors, directions);
}

/**
 * Attaches thenBy and thenByDesc methods to an already-sorted array, allowing
 * additional sort criteria to be appended without re-running the whole sort
 * from scratch.
 *
 * @param {Array} array
 * @param {Function[]} selectors
 * @param {boolean[]} directions
 * @returns {Array}
 */
function _attachThenBy(array, selectors, directions) {
    Object.defineProperty(array, 'thenBy', {
        enumerable: false,
        configurable: true,
        value: function (fn) {
            return _chainSort(this, [...selectors, fn], [...directions, false]);
        },
    });

    Object.defineProperty(array, 'thenByDesc', {
        enumerable: false,
        configurable: true,
        value: function (fn) {
            return _chainSort(this, [...selectors, fn], [...directions, true]);
        },
    });

    return array;
}

// ---------------------------------------------------------------------------
// Array.prototype extensions
// ---------------------------------------------------------------------------
// Each method either:
//   (a) delegates to a LazyQuery pipeline stage and returns a new LazyQuery, or
//   (b) is a terminal that works directly on the array for convenience.
//
// Intermediate operators (where, select, take, etc.) are called directly on the
// array and return a LazyQuery, exactly like calling .Where() on an
// IEnumerable<T> in C#. Terminal operators (first, count, toArray, etc.) execute
// immediately on the array.
// ---------------------------------------------------------------------------

// -- Projection & Transformation --

/** @see LazyQuery#select */
Object.defineProperty(Array.prototype, 'select', {
    enumerable: false,
    value: function (selector) {
        return new LazyQuery(this).select(selector);
    },
});

/** @see LazyQuery#selectMany */
Object.defineProperty(Array.prototype, 'selectMany', {
    enumerable: false,
    value: function (selector) {
        return new LazyQuery(this).selectMany(selector);
    },
});

/** @see LazyQuery#cast */
Object.defineProperty(Array.prototype, 'cast', {
    enumerable: false,
    value: function () {
        return new LazyQuery(this).cast();
    },
});

/** @see LazyQuery#ofType */
Object.defineProperty(Array.prototype, 'ofType', {
    enumerable: false,
    value: function (type) {
        return new LazyQuery(this).ofType(type);
    },
});

// -- Access & Query --

/** @see LazyQuery#where */
Object.defineProperty(Array.prototype, 'where', {
    enumerable: false,
    value: function (predicate) {
        return new LazyQuery(this).where(predicate);
    },
});

/**
 * Returns the first element, or first element matching a predicate.
 * Short-circuits — does not iterate beyond the first match.
 * Equivalent to C# Enumerable.First.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {*}
 */
Object.defineProperty(Array.prototype, 'first', {
    enumerable: false,
    value: function (predicate) {
        if (!predicate) {
            if (this.length === 0) throw new Error('Sequence contains no elements');
            return this[0];
        }
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i])) return this[i];
        }
        throw new Error('Sequence contains no matching element');
    },
});

/**
 * Returns the first element matching a predicate, or null.
 * Short-circuits — does not iterate beyond the first match.
 * Equivalent to C# Enumerable.FirstOrDefault.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {*|null}
 */
Object.defineProperty(Array.prototype, 'firstOrDefault', {
    enumerable: false,
    value: function (predicate) {
        if (!predicate) return this.length > 0 ? this[0] : null;
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i])) return this[i];
        }
        return null;
    },
});

/**
 * Returns the last element, or last element matching a predicate.
 * Equivalent to C# Enumerable.Last.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {*}
 */
Object.defineProperty(Array.prototype, 'last', {
    enumerable: false,
    value: function (predicate) {
        if (!predicate) {
            if (this.length === 0) throw new Error('Sequence contains no elements');
            return this[this.length - 1];
        }
        for (let i = this.length - 1; i >= 0; i--) {
            if (predicate(this[i])) return this[i];
        }
        throw new Error('Sequence contains no matching element');
    },
});

/**
 * Returns the last element matching a predicate, or null.
 * Equivalent to C# Enumerable.LastOrDefault.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {*|null}
 */
Object.defineProperty(Array.prototype, 'lastOrDefault', {
    enumerable: false,
    value: function (predicate) {
        if (!predicate) return this.length > 0 ? this[this.length - 1] : null;
        for (let i = this.length - 1; i >= 0; i--) {
            if (predicate(this[i])) return this[i];
        }
        return null;
    },
});

/**
 * Returns exactly one element matching a predicate, or the only element.
 * Throws if the count of matching elements is not exactly one.
 * Equivalent to C# Enumerable.Single.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {*}
 */
Object.defineProperty(Array.prototype, 'single', {
    enumerable: false,
    value: function (predicate) {
        const source = predicate ? this.filter(predicate) : this;
        if (source.length !== 1) throw new Error('Sequence does not contain exactly one element');
        return source[0];
    },
});

/**
 * Returns one element or null; throws if more than one element matches.
 * Equivalent to C# Enumerable.SingleOrDefault.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {*|null}
 */
Object.defineProperty(Array.prototype, 'singleOrDefault', {
    enumerable: false,
    value: function (predicate) {
        const source = predicate ? this.filter(predicate) : this;
        if (source.length > 1) throw new Error('Sequence contains more than one element');
        return source.length === 1 ? source[0] : null;
    },
});

/**
 * Returns true if the array has any elements, or any matching a predicate.
 * Short-circuits on first match.
 * Equivalent to C# Enumerable.Any.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {boolean}
 */
Object.defineProperty(Array.prototype, 'any', {
    enumerable: false,
    value: function (predicate) {
        if (!predicate) return this.length > 0;
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i])) return true;
        }
        return false;
    },
});

/**
 * Returns true if every element satisfies a predicate.
 * Equivalent to C# Enumerable.All.
 *
 * @param {function(*): boolean} predicate
 * @returns {boolean}
 */
Object.defineProperty(Array.prototype, 'all', {
    enumerable: false,
    value: function (predicate) {
        return this.every(predicate);
    },
});

/**
 * Returns true if the array contains the value (strict equality).
 * Equivalent to C# Enumerable.Contains.
 *
 * @param {*} value
 * @returns {boolean}
 */
Object.defineProperty(Array.prototype, 'contains', {
    enumerable: false,
    value: function (value) {
        return this.includes(value);
    },
});

/**
 * Returns the element at the specified zero-based index.
 * Throws if out of bounds.
 * Equivalent to C# Enumerable.ElementAt.
 *
 * @param {number} index
 * @returns {*}
 */
Object.defineProperty(Array.prototype, 'elementAt', {
    enumerable: false,
    value: function (index) {
        if (index < 0 || index >= this.length) throw new Error('Index out of range');
        return this[index];
    },
});

/**
 * Returns the element at the specified index or null if out of bounds.
 * Equivalent to C# Enumerable.ElementAtOrDefault.
 *
 * @param {number} index
 * @returns {*|null}
 */
Object.defineProperty(Array.prototype, 'elementAtOrDefault', {
    enumerable: false,
    value: function (index) {
        if (index < 0 || index >= this.length) return null;
        return this[index];
    },
});

// -- Aggregation --

/**
 * Counts elements or elements matching a predicate without allocating an
 * intermediate array.
 * Equivalent to C# Enumerable.Count.
 *
 * @param {function(*): boolean} [predicate]
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'count', {
    enumerable: false,
    value: function (predicate) {
        if (!predicate) return this.length;
        let n = 0;
        for (let i = 0; i < this.length; i++) {
            if (predicate(this[i])) n++;
        }
        return n;
    },
});

/**
 * Sums all elements or selected values.
 * The selector branch decision is hoisted outside the loop.
 * Equivalent to C# Enumerable.Sum.
 *
 * @param {function(*): number} [selector]
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'sum', {
    enumerable: false,
    value: function (selector) {
        let total = 0;
        if (selector) {
            for (let i = 0; i < this.length; i++) total += selector(this[i]);
        } else {
            for (let i = 0; i < this.length; i++) total += this[i];
        }
        return total;
    },
});

/**
 * Returns the average of all values or selected values.
 * Single-pass implementation with no intermediate array.
 * Equivalent to C# Enumerable.Average.
 *
 * @param {function(*): number} [selector]
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'average', {
    enumerable: false,
    value: function (selector) {
        if (this.length === 0) return 0;
        let total = 0;
        if (selector) {
            for (let i = 0; i < this.length; i++) total += selector(this[i]);
        } else {
            for (let i = 0; i < this.length; i++) total += this[i];
        }
        return total / this.length;
    },
});

/**
 * Returns the minimum value or minimum projected value.
 * Uses a loop instead of Math.min(...spread) to avoid stack overflow
 * on arrays with more than ~125 000 elements.
 * Equivalent to C# Enumerable.Min.
 *
 * @param {function(*): number} [selector]
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'min', {
    enumerable: false,
    value: function (selector) {
        let result = Infinity;
        for (let i = 0; i < this.length; i++) {
            const v = selector ? selector(this[i]) : this[i];
            if (v < result) result = v;
        }
        return result;
    },
});

/**
 * Returns the maximum value or maximum projected value.
 * Uses a loop instead of Math.max(...spread) to avoid stack overflow
 * on arrays with more than ~125 000 elements.
 * Equivalent to C# Enumerable.Max.
 *
 * @param {function(*): number} [selector]
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'max', {
    enumerable: false,
    value: function (selector) {
        let result = -Infinity;
        for (let i = 0; i < this.length; i++) {
            const v = selector ? selector(this[i]) : this[i];
            if (v > result) result = v;
        }
        return result;
    },
});

/**
 * Applies an accumulator function over the array.
 * Equivalent to Array.prototype.reduce / C# Enumerable.Aggregate.
 *
 * @param {function(*, *): *} accumulator
 * @param {*} seed
 * @returns {*}
 */
Object.defineProperty(Array.prototype, 'aggregate', {
    enumerable: false,
    value: function (accumulator, seed) {
        return this.reduce(accumulator, seed);
    },
});

// -- Sorting & Flow --

/**
 * Sorts the array in ascending order by a key selector.
 * Uses the Schwartzian transform so the selector is called once per element
 * rather than once per comparison.
 * Returns a plain Array with thenBy / thenByDesc attached.
 * Equivalent to C# Enumerable.OrderBy.
 *
 * @param {function(*): *} selector
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'orderBy', {
    enumerable: false,
    value: function (selector) {
        return _chainSort(this, [selector], [false]);
    },
});

/**
 * Sorts the array in descending order by a key selector.
 * Equivalent to C# Enumerable.OrderByDescending.
 *
 * @param {function(*): *} selector
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'orderByDesc', {
    enumerable: false,
    value: function (selector) {
        return _chainSort(this, [selector], [true]);
    },
});

/** @see LazyQuery#take */
Object.defineProperty(Array.prototype, 'take', {
    enumerable: false,
    value: function (n) {
        return this.slice(0, n);
    },
});

/** @see LazyQuery#skip */
Object.defineProperty(Array.prototype, 'skip', {
    enumerable: false,
    value: function (n) {
        return this.slice(n);
    },
});

/**
 * Takes elements while a predicate returns true, then stops.
 * Equivalent to C# Enumerable.TakeWhile.
 *
 * @param {function(*): boolean} predicate
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'takeWhile', {
    enumerable: false,
    value: function (predicate) {
        const result = [];
        for (let i = 0; i < this.length; i++) {
            if (!predicate(this[i])) break;
            result.push(this[i]);
        }
        return result;
    },
});

/**
 * Skips elements while a predicate returns true, then yields the rest.
 * Equivalent to C# Enumerable.SkipWhile.
 *
 * @param {function(*): boolean} predicate
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'skipWhile', {
    enumerable: false,
    value: function (predicate) {
        let i = 0;
        while (i < this.length && predicate(this[i])) i++;
        return this.slice(i);
    },
});

// -- Set & Collection --

/**
 * Returns a new array with duplicate elements removed.
 * Primitives use Set reference equality; objects use JSON.stringify.
 * Equivalent to C# Enumerable.Distinct.
 *
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'distinct', {
    enumerable: false,
    value: function () {
        const seen = new Set();
        const result = [];
        for (let i = 0; i < this.length; i++) {
            const key = toKey(this[i]);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(this[i]);
            }
        }
        return result;
    },
});

/**
 * Returns a new array with duplicates removed using a key selector.
 * Equivalent to C# Enumerable.DistinctBy.
 *
 * @param {function(*): *} selector
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'distinctBy', {
    enumerable: false,
    value: function (selector) {
        const seen = new Set();
        const result = [];
        for (let i = 0; i < this.length; i++) {
            const key = selector(this[i]);
            if (!seen.has(key)) {
                seen.add(key);
                result.push(this[i]);
            }
        }
        return result;
    },
});

/**
 * Returns the set union of this array and another, without duplicates.
 * Equivalent to C# Enumerable.Union.
 *
 * @param {Array} other
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'union', {
    enumerable: false,
    value: function (other) {
        const seen = new Set();
        const result = [];
        const push = item => {
            const key = toKey(item);
            if (!seen.has(key)) { seen.add(key); result.push(item); }
        };
        for (let i = 0; i < this.length; i++) push(this[i]);
        for (let i = 0; i < other.length; i++) push(other[i]);
        return result;
    },
});

/**
 * Returns elements present in both this array and another.
 * Builds a Set from the other array (O(m)), then probes it for each element
 * in this array (O(n)), avoiding the O(n*m) naive approach.
 * Equivalent to C# Enumerable.Intersect.
 *
 * @param {Array} other
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'intersect', {
    enumerable: false,
    value: function (other) {
        const otherSet = new Set(other.map(toKey));
        const seen = new Set();
        const result = [];
        for (let i = 0; i < this.length; i++) {
            const key = toKey(this[i]);
            if (otherSet.has(key) && !seen.has(key)) {
                seen.add(key);
                result.push(this[i]);
            }
        }
        return result;
    },
});

/**
 * Returns elements from this array that are not present in another.
 * Equivalent to C# Enumerable.Except.
 *
 * @param {Array} other
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'except', {
    enumerable: false,
    value: function (other) {
        const excluded = new Set(other.map(toKey));
        const result = [];
        for (let i = 0; i < this.length; i++) {
            if (!excluded.has(toKey(this[i]))) result.push(this[i]);
        }
        return result;
    },
});

// -- Joins & Grouping --

/**
 * Performs a hash-based inner join with another array.
 * Equivalent to C# Enumerable.Join.
 *
 * @param {Array} inner
 * @param {function(*): *} outerKeySelector
 * @param {function(*): *} innerKeySelector
 * @param {function(*, *): *} resultSelector
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'innerJoin', {
    enumerable: false,
    value: function (inner, outerKeySelector, innerKeySelector, resultSelector) {
        const map = new Map();
        for (let i = 0; i < inner.length; i++) {
            const key = innerKeySelector(inner[i]);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(inner[i]);
        }
        const results = [];
        for (let i = 0; i < this.length; i++) {
            const matches = map.get(outerKeySelector(this[i]));
            if (matches) {
                for (let j = 0; j < matches.length; j++) {
                    results.push(resultSelector(this[i], matches[j]));
                }
            }
        }
        return results;
    },
});

/**
 * Performs a group join (left outer join with grouping) with another array.
 * Equivalent to C# Enumerable.GroupJoin.
 *
 * @param {Array} inner
 * @param {function(*): *} outerKeySelector
 * @param {function(*): *} innerKeySelector
 * @param {function(*, *[]): *} resultSelector
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'groupJoin', {
    enumerable: false,
    value: function (inner, outerKeySelector, innerKeySelector, resultSelector) {
        const map = new Map();
        for (let i = 0; i < inner.length; i++) {
            const key = innerKeySelector(inner[i]);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(inner[i]);
        }
        const results = [];
        for (let i = 0; i < this.length; i++) {
            const matches = map.get(outerKeySelector(this[i])) || [];
            results.push(resultSelector(this[i], matches));
        }
        return results;
    },
});

/**
 * Groups elements into a plain object keyed by the key selector.
 * Equivalent to C# Enumerable.GroupBy (returns a dictionary).
 *
 * @param {function(*): string|number|symbol} keySelector
 * @returns {Object}
 */
Object.defineProperty(Array.prototype, 'groupBy', {
    enumerable: false,
    value: function (keySelector) {
        const result = Object.create(null);
        for (let i = 0; i < this.length; i++) {
            const key = keySelector(this[i]);
            if (!result[key]) result[key] = [];
            result[key].push(this[i]);
        }
        return result;
    },
});

// -- Conversion & Utilities --

/**
 * Converts the array to a plain object keyed by a selector, with an optional
 * value selector.
 * Equivalent to C# .ToDictionary().
 *
 * @param {function(*): *} keySelector
 * @param {function(*): *} [valueSelector]
 * @returns {Object}
 */
Object.defineProperty(Array.prototype, 'toDictionary', {
    enumerable: false,
    value: function (keySelector, valueSelector) {
        const dict = Object.create(null);
        for (let i = 0; i < this.length; i++) {
            dict[keySelector(this[i])] = valueSelector ? valueSelector(this[i]) : this[i];
        }
        return dict;
    },
});

/**
 * Returns a new array with the item appended at the end.
 * Equivalent to C# Enumerable.Append.
 *
 * @param {*} item
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'append', {
    enumerable: false,
    value: function (item) {
        return [...this, item];
    },
});

/**
 * Returns a new array with the item prepended at the start.
 * Equivalent to C# Enumerable.Prepend.
 *
 * @param {*} item
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'prepend', {
    enumerable: false,
    value: function (item) {
        return [item, ...this];
    },
});

/**
 * Returns this array if non-empty, or a single-element array containing the
 * default value.
 * Equivalent to C# Enumerable.DefaultIfEmpty.
 *
 * @param {*} defaultValue
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'defaultIfEmpty', {
    enumerable: false,
    value: function (defaultValue) {
        return this.length > 0 ? this : [defaultValue];
    },
});

/**
 * Returns true if this array and another contain the same elements in the
 * same order, using deep equality via JSON.stringify.
 * Equivalent to C# Enumerable.SequenceEqual.
 *
 * @param {Array} other
 * @returns {boolean}
 */
Object.defineProperty(Array.prototype, 'sequenceEqual', {
    enumerable: false,
    value: function (other) {
        if (this.length !== other.length) return false;
        for (let i = 0; i < this.length; i++) {
            if (JSON.stringify(this[i]) !== JSON.stringify(other[i])) return false;
        }
        return true;
    },
});

/**
 * Combines this array with another element-by-element, stopping at the
 * shorter array.
 * Equivalent to C# Enumerable.Zip.
 *
 * @param {Array} other
 * @param {function(*, *): *} [resultSelector]
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'zip', {
    enumerable: false,
    value: function (other, resultSelector = (a, b) => [a, b]) {
        const len = Math.min(this.length, other.length);
        const result = new Array(len);
        for (let i = 0; i < len; i++) {
            result[i] = resultSelector(this[i], other[i]);
        }
        return result;
    },
});

/**
 * Returns a shallow copy of this array.
 * Included for API symmetry with LazyQuery.toArray() so that pipelines
 * ending with .toArray() work regardless of whether the source is a
 * LazyQuery or a plain Array.
 * Equivalent to C# .ToList() / .ToArray().
 *
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'toArray', {
    enumerable: false,
    value: function () {
        return [...this];
    },
});

/**
 * Converts this array to a native Set.
 * Equivalent to C# .ToHashSet().
 *
 * @returns {Set}
 */
Object.defineProperty(Array.prototype, 'toSet', {
    enumerable: false,
    value: function () {
        return new Set(this);
    },
});

/**
 * Converts this array to a native Map using key and optional value selectors.
 * Equivalent to C# .ToDictionary() with a Map backing store.
 *
 * @param {function(*): *} keySelector
 * @param {function(*): *} [valueSelector]
 * @returns {Map}
 */
Object.defineProperty(Array.prototype, 'toMap', {
    enumerable: false,
    value: function (keySelector, valueSelector) {
        const map = new Map();
        for (let i = 0; i < this.length; i++) {
            map.set(keySelector(this[i]), valueSelector ? valueSelector(this[i]) : this[i]);
        }
        return map;
    },
});

module.exports = { LazyQuery };
