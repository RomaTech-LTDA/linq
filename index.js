/**
 * Compares two values for sorting.
 * @param {*} a 
 * @param {*} b 
 * @returns {number} -1 if a < b, 1 if a > b, 0 otherwise
 */
function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

// Projection & Transformation

/**
 * Projects each element of the array into a new form.
 * @param {function(*, number, Array): *} selector 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'select', {
    enumerable: false,
    value: function (selector = x => x) {
        return this.map(selector);
    },
});

/**
 * Projects each element and flattens the resulting arrays.
 * @param {function(*, number, Array): Array} selector 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'selectMany', {
    enumerable: false,
    value: function (selector) {
        return this.flatMap(selector);
    },
});

/**
 * Casts the array to another type (shallow copy).
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'cast', {
    enumerable: false,
    value: function () {
        return this.map(x => x);
    },
});

/**
 * Filters the array by type.
 * @param {string} type 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'ofType', {
    enumerable: false,
    value: function (type) {
        return this.filter(x => typeof x === type);
    },
});

// Access & Query

/**
 * Filters elements based on predicate.
 * @param {function(*, number, Array): boolean} predicate 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'where', {
    enumerable: false,
    value: function (predicate = x => x) {
        return this.filter(predicate);
    },
});

/**
 * Returns the first matching element or the first element.
 * @param {function(*, number, Array): boolean} [predicate] 
 * @returns {*}
 */
Object.defineProperty(Array.prototype, 'first', {
    enumerable: false,
    value: function (predicate) {
        return predicate ? this.find(predicate) : this[0];
    },
});

/**
 * Returns the first matching element or null if none found.
 * @param {function(*, number, Array): boolean} [predicate] 
 * @returns {*|null}
 */
Object.defineProperty(Array.prototype, 'firstOrDefault', {
    enumerable: false,
    value: function (predicate) {
        return this.where(predicate)[0] ?? null;
    },
});

/**
 * Returns the last matching element or the last element.
 * @param {function(*, number, Array): boolean} [predicate] 
 * @returns {*}
 */
Object.defineProperty(Array.prototype, 'last', {
    enumerable: false,
    value: function (predicate) {
        const list = predicate ? this.filter(predicate) : this;
        return list[list.length - 1];
    },
});

/**
 * Returns the last matching element or null if none found.
 * @param {function(*, number, Array): boolean} [predicate] 
 * @returns {*|null}
 */
Object.defineProperty(Array.prototype, 'lastOrDefault', {
    enumerable: false,
    value: function (predicate) {
        const list = predicate ? this.filter(predicate) : this;
        return list.length ? list[list.length - 1] : null;
    },
});

/**
 * Returns the single matching element or throws.
 * @param {function(*, number, Array): boolean} predicate 
 * @returns {*}
 * @throws {Error}
 */
Object.defineProperty(Array.prototype, 'single', {
    enumerable: false,
    value: function (predicate = x => x) {
        const filtered = this.filter(predicate);
        if (filtered.length !== 1) throw new Error('Sequence does not contain exactly one element');
        return filtered[0];
    },
});

/**
 * Returns the single matching element or null, throws if multiple.
 * @param {function(*, number, Array): boolean} predicate 
 * @returns {*|null}
 * @throws {Error}
 */
Object.defineProperty(Array.prototype, 'singleOrDefault', {
    enumerable: false,
    value: function (predicate = x => x) {
        const filtered = this.filter(predicate);
        if (filtered.length > 1) throw new Error('Sequence contains more than one element');
        return filtered[0] ?? null;
    },
});

/**
 * Determines if any elements match the predicate or if array is non-empty.
 * @param {function(*, number, Array): boolean} [predicate] 
 * @returns {boolean}
 */
Object.defineProperty(Array.prototype, 'any', {
    enumerable: false,
    value: function (predicate) {
        return predicate ? this.some(predicate) : this.length > 0;
    },
});

/**
 * Determines if all elements match the predicate.
 * @param {function(*, number, Array): boolean} predicate 
 * @returns {boolean}
 */
Object.defineProperty(Array.prototype, 'all', {
    enumerable: false,
    value: function (predicate) {
        return this.every(predicate);
    },
});

/**
 * Checks if array contains a value.
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
 * Returns the element at the specified index.
 * @param {number} index 
 * @returns {*}
 * @throws {Error}
 */
Object.defineProperty(Array.prototype, 'elementAt', {
    enumerable: false,
    value: function (index = 0) {
        if (index < 0 || index >= this.length) throw new Error('Index out of range');
        return this[index];
    },
});

/**
 * Returns the element at index or null if out of bounds.
 * @param {number} index 
 * @returns {*|null}
 */
Object.defineProperty(Array.prototype, 'elementAtOrDefault', {
    enumerable: false,
    value: function (index) {
        return this[index] ?? null;
    },
});

// Aggregation

/**
 * Returns count of elements optionally filtered by predicate.
 * @param {function(*, number, Array): boolean} [predicate] 
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'count', {
    enumerable: false,
    value: function (predicate) {
        return predicate ? this.filter(predicate).length : this.length;
    },
});

/**
 * Sums all elements or selected values.
 * @param {function(*, number, Array): number} [selector] 
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'sum', {
    enumerable: false,
    value: function (selector) {
        return this.reduce((acc, x) => acc + (selector ? selector(x) : x), 0);
    },
});

/**
 * Returns average of all values.
 * @param {function(*, number, Array): number} [selector] 
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'average', {
    enumerable: false,
    value: function (selector) {
        const values = selector ? this.map(selector) : this;
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    },
});

/**
 * Returns the minimum value.
 * @param {function(*, number, Array): number} [selector] 
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'min', {
    enumerable: false,
    value: function (selector) {
        const values = selector ? this.map(selector) : this;
        return Math.min(...values);
    },
});

/**
 * Returns the maximum value.
 * @param {function(*, number, Array): number} [selector] 
 * @returns {number}
 */
Object.defineProperty(Array.prototype, 'max', {
    enumerable: false,
    value: function (selector) {
        const values = selector ? this.map(selector) : this;
        return Math.max(...values);
    },
});

/**
 * Aggregates elements using an accumulator function.
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

// Sorting & Flow

/**
 * Helper function to chain multiple sorting criteria.
 * @param {Array} array 
 * @param {Function[]} selectors 
 * @param {boolean[]} directions 
 * @returns {Array}
 */
function chainSort(array, selectors, directions) {
    const sorted = [...array].sort((a, b) => {
        for (let i = 0; i < selectors.length; i++) {
            const result = directions[i]
                ? compare(selectors[i](b), selectors[i](a))
                : compare(selectors[i](a), selectors[i](b));
            if (result !== 0) return result;
        }
        return 0;
    });

    return addChainMethods(sorted, selectors, directions);
}

/**
 * Adds thenBy and thenByDesc methods to sorted arrays.
 * @param {Array} array 
 * @param {Function[]} selectors 
 * @param {boolean[]} directions 
 * @returns {Array}
 */
function addChainMethods(array, selectors, directions) {
    /**
     * Sorts by additional ascending key.
     * @param {Function} selector 
     * @returns {Array}
     */
    Object.defineProperty(array, 'thenBy', {
        enumerable: false,
        value: function (fn) {
          return chainSort(this, [...selectors, fn], [...directions, false]);
        },
      });

    /**
     * Sorts by additional descending key.
     * @param {Function} selector 
     * @returns {Array}
     */
    Object.defineProperty(array, 'thenByDesc', {
        enumerable: false,
        value: function (fn) {
          return chainSort(this, [...selectors, fn], [...directions, true]);
        },
      });

    return array;
}

/**
 * Sorts elements in ascending order based on selector.
 * @param {Function} selector 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'orderBy', {
  enumerable: false,
  value: function (fn) {
    return chainSort(this, [fn], [false]);
  },
});

/**
 * Sorts elements in descending order based on selector.
 * @param {Function} selector 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'orderByDesc', {
  enumerable: false,
  value: function (fn) {
    return chainSort(this, [fn], [true]);
  },
});

/**
 * Returns the first n elements.
 * @param {number} n 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'take', {
    enumerable: false,
    value: function (n) {
        return this.slice(0, n);
    },
});

/**
 * Skips the first n elements.
 * @param {number} n 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'skip', {
    enumerable: false,
    value: function (n) {
        return this.slice(n);
    },
});

/**
 * Takes elements while predicate returns true.
 * @param {Function} predicate 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'takeWhile', {
    enumerable: false,
    value: function (predicate) {
        const result = [];
        for (const item of this) {
            if (!predicate(item)) break;
            result.push(item);
        }
        return result;
    },
});

/**
 * Skips elements while predicate returns true, then includes the rest.
 * @param {Function} predicate 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'skipWhile', {
    enumerable: false,
    value: function (predicate) {
        const result = [];
        let skipping = true;
        for (const item of this) {
            if (skipping && predicate(item)) continue;
            skipping = false;
            result.push(item);
        }
        return result;
    },
});

// Set & Collection

/**
 * Removes duplicate elements.
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'distinct', {
    enumerable: false,
    value: function () {
        const seen = new Set();
        return this.filter(item => {
            const key = JSON.stringify(item)
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },
});

/**
 * Removes duplicates using a selector function.
 * @param {Function} selector 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'distinctBy', {
    enumerable: false,
    value: function (selector = x => x) {
        const seen = new Set();
        return this.filter(item => {
            const key = selector(item);
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    },
});

/**
 * Combines elements from two arrays, removing duplicates.
 * @param {Array} other 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'union', {
    enumerable: false,
    value: function (other) {
        return [...this, ...other].distinct();
    },
});

/**
 * Returns elements present in both arrays.
 * @param {Array} other 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'intersect', {
    enumerable: false,
    value: function (other) {
        const set = new Set(other.map(x => JSON.stringify(x)));
        return this.filter(x => set.has(JSON.stringify(x)));
    },
});

/**
 * Returns elements in current array not in the other.
 * @param {Array} other 
 * @returns {Array}
 */
Object.defineProperty(Array.prototype, 'except', {
    enumerable: false,
    value: function (other) {
        const set = new Set(other.map(x => JSON.stringify(x)));
        return this.filter(x => !set.has(JSON.stringify(x)));
    },
});

// Joins & Grouping

/**
 * Performs an inner join on two arrays.
 * @template T, U, K, R
 * @param {U[]} inner - The inner array.
 * @param {(item: T) => K} outerKeySelector - Function to select key from outer element.
 * @param {(item: U) => K} innerKeySelector - Function to select key from inner element.
 * @param {(outer: T, inner: U) => R} resultSelector - Function to create result from matched pairs.
 * @returns {R[]}
 */
Object.defineProperty(Array.prototype, 'join', {
  enumerable: false,
  value: function (inner = [], outerKeySelector = x => x, innerKeySelector = x => x, resultSelector = (o, i) => i) {
    const map = new Map();
    for (const innerItem of inner) {
      const key = innerKeySelector(innerItem);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(innerItem);
    }

    const results = [];
    for (const outerItem of this) {
      const key = outerKeySelector(outerItem);
      const innerItems = map.get(key) || [];
      for (const innerItem of innerItems) {
        results.push(resultSelector(outerItem, innerItem));
      }
    }
    return results;
  },
});

/**
 * Performs a group join on two arrays (like left outer join with grouping).
 * @template T, U, K, R
 * @param {U[]} inner - The inner array.
 * @param {(item: T) => K} outerKeySelector 
 * @param {(item: U) => K} innerKeySelector 
 * @param {(outer: T, inners: U[]) => R} resultSelector 
 * @returns {R[]}
 */
Object.defineProperty(Array.prototype, 'groupJoin', {
    enumerable: false,
    value: function (inner = [], outerKeySelector = x => x, innerKeySelector = x => x, resultSelector = (outer, inner) => inner) {
        const map = new Map();
        for (const innerItem of inner) {
            const key = innerKeySelector(innerItem);
            if (!map.has(key)) map.set(key, []);
            map.get(key).push(innerItem);
        }

        return this.map(outerItem => {
            const key = outerKeySelector(outerItem);
            const innerItems = map.get(key) || [];
            return resultSelector(outerItem, innerItems);
        });
    },
});

/**
 * Groups elements by keySelector into an object.
 * @template T, K
 * @param {(item: T) => K} keySelector 
 * @returns {Record<string, T[]>}
 */
Object.defineProperty(Array.prototype, 'groupBy', {
    enumerable: false,
    value: function (keySelector = x => x) {
        return this.reduce((acc, item) => {
            const key = keySelector(item);
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});
    },
});

// Conversion & Utilities

/**
 * Converts array into an object (dictionary) using key and optional value selector.
 * @template T, K extends string | number | symbol, V
 * @param {(item: T) => K} keySelector 
 * @param {(item: T) => V} [valueSelector] 
 * @returns {Record<K, V>}
 */
Object.defineProperty(Array.prototype, 'toDictionary', {
    enumerable: false,
    value: function (keySelector, valueSelector = x => x) {
        return this.reduce((dict, item) => {
            dict[keySelector(item)] = valueSelector(item);
            return dict;
        }, {});
    },
});

/**
 * Appends an item to the end of the array.
 * @template T
 * @param {T} item 
 * @returns {T[]}
 */
Object.defineProperty(Array.prototype, 'append', {
    enumerable: false,
    value: function (item) {
        return [...this, item];
    },
});

/**
 * Prepends an item to the beginning of the array.
 * @template T
 * @param {T} item 
 * @returns {T[]}
 */
Object.defineProperty(Array.prototype, 'prepend', {
    enumerable: false,
    value: function (item) {
        return [item, ...this];
    },
});

/**
 * Returns the original array or a default array if empty.
 * @template T
 * @param {T} defaultValue 
 * @returns {T[]}
 */
Object.defineProperty(Array.prototype, 'defaultIfEmpty', {
    enumerable: false,
    value: function (defaultValue) {
        return this.length ? this : [defaultValue];
    },
});

/**
 * Checks whether another array has the same sequence of elements.
 * @template T
 * @param {T[]} other 
 * @returns {boolean}
 */
Object.defineProperty(Array.prototype, 'sequenceEqual', {
    enumerable: false,
    value: function (other) {
        if (this.length !== other.length) return false;
        return this.every((val, i) => JSON.stringify(val) === JSON.stringify(other[i]));
    },
});

/**
 * Combines two arrays element-by-element using a selector or as pairs.
 * @template T, U, R
 * @param {U[]} other 
 * @param {(item1: T, item2: U) => R} [resultSelector] 
 * @returns {R[]}
 */
Object.defineProperty(Array.prototype, 'zip', {
    enumerable: false,
    value: function (other, resultSelector = (a, b) => [a, b]) {
        const len = Math.min(this.length, other.length);
        const result = [];
        for (let i = 0; i < len; i++) {
            result.push(resultSelector(this[i], other[i]));
        }
        return result;
    },
});

module.exports = {};
