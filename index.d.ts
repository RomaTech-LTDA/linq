// index.d.ts

/**
 * LazyQuery wraps an iterable source and accumulates a pipeline of
 * transformation steps applied on-demand.
 *
 * Intermediate operators (where, select, take, etc.) return a new LazyQuery
 * without executing anything.  Terminal operators (toArray, first, count,
 * etc.) trigger a single pass through the entire pipeline.
 *
 * This mirrors the behaviour of IEnumerable<T> in C# LINQ.
 */
export declare class LazyQuery<T> implements Iterable<T> {
    constructor(source: Iterable<T>);

    [Symbol.iterator](): Iterator<T>;

    // -----------------------------------------------------------------------
    // Intermediate operators
    // -----------------------------------------------------------------------

    /** Filters elements using a predicate. Equivalent to C# Enumerable.Where. */
    where(predicate: (item: T, index: number) => boolean): LazyQuery<T>;

    /** Projects each element into a new form. Equivalent to C# Enumerable.Select. */
    select<U>(selector: (item: T, index: number) => U): LazyQuery<U>;

    /** Projects each element to an iterable and flattens the results. Equivalent to C# Enumerable.SelectMany. */
    selectMany<U>(selector: (item: T, index: number) => Iterable<U>): LazyQuery<U>;

    /** Filters elements to those whose typeof matches the given string. Equivalent to C# Enumerable.OfType. */
    ofType(type: string): LazyQuery<T>;

    /** Returns the first n elements and stops iteration. Equivalent to C# Enumerable.Take. */
    take(n: number): LazyQuery<T>;

    /** Skips the first n elements. Equivalent to C# Enumerable.Skip. */
    skip(n: number): LazyQuery<T>;

    /** Yields elements while the predicate is true, then stops. Equivalent to C# Enumerable.TakeWhile. */
    takeWhile(predicate: (item: T) => boolean): LazyQuery<T>;

    /** Skips elements while the predicate is true, then yields the rest. Equivalent to C# Enumerable.SkipWhile. */
    skipWhile(predicate: (item: T) => boolean): LazyQuery<T>;

    /** Removes duplicate elements. Primitives use value equality; objects use deep equality. Equivalent to C# Enumerable.Distinct. */
    distinct(): LazyQuery<T>;

    /** Removes duplicates by projecting each element to a key. Equivalent to C# Enumerable.DistinctBy. */
    distinctBy<K>(selector: (item: T) => K): LazyQuery<T>;

    /** Appends a single item to the end of the sequence. Equivalent to C# Enumerable.Append. */
    append(item: T): LazyQuery<T>;

    /** Prepends a single item to the start of the sequence. Equivalent to C# Enumerable.Prepend. */
    prepend(item: T): LazyQuery<T>;

    /** Yields a default value if the sequence is empty. Equivalent to C# Enumerable.DefaultIfEmpty. */
    defaultIfEmpty(defaultValue: T): LazyQuery<T>;

    /** Concatenates another iterable to this sequence. Equivalent to C# Enumerable.Concat. */
    concat(other: Iterable<T>): LazyQuery<T>;

    /** Returns the set union of this sequence and another, without duplicates. Equivalent to C# Enumerable.Union. */
    union(other: Iterable<T>): LazyQuery<T>;

    /** Returns elements present in both this sequence and another. Equivalent to C# Enumerable.Intersect. */
    intersect(other: Iterable<T>): LazyQuery<T>;

    /** Returns elements from this sequence that do not appear in another. Equivalent to C# Enumerable.Except. */
    except(other: Iterable<T>): LazyQuery<T>;

    /** Combines this sequence with another element-by-element. Equivalent to C# Enumerable.Zip. */
    zip<U, R = [T, U]>(other: Iterable<U>, resultSelector?: (a: T, b: U) => R): LazyQuery<R>;

    /** Casts the sequence to another type (identity operation in JavaScript). Equivalent to C# Enumerable.Cast. */
    cast<U>(): LazyQuery<U>;

    // -----------------------------------------------------------------------
    // Terminal operators
    // -----------------------------------------------------------------------

    /** Materialises the sequence into a plain Array. Equivalent to C# .ToList() or .ToArray(). */
    toArray(): T[];

    /** Converts the sequence to a native Set. Equivalent to C# .ToHashSet(). */
    toSet(): Set<T>;

    /**
     * Converts the sequence to a native Map.
     * Equivalent to C# .ToDictionary() with a Map backing store.
     */
    toMap<K, V = T>(keySelector: (item: T) => K, valueSelector?: (item: T) => V): Map<K, V>;

    /**
     * Converts the sequence to a plain object dictionary.
     * Equivalent to C# .ToDictionary().
     */
    toDictionary<K extends string | number | symbol, V = T>(
        keySelector: (item: T) => K,
        valueSelector?: (item: T) => V
    ): Record<K, V>;

    /** Returns the first element or first matching a predicate. Throws if empty. Equivalent to C# Enumerable.First. */
    first(predicate?: (item: T) => boolean): T;

    /** Returns the first matching element or null. Equivalent to C# Enumerable.FirstOrDefault. */
    firstOrDefault(predicate?: (item: T) => boolean): T | null;

    /** Returns the last element or last matching a predicate. Throws if empty. Equivalent to C# Enumerable.Last. */
    last(predicate?: (item: T) => boolean): T;

    /** Returns the last matching element or null. Equivalent to C# Enumerable.LastOrDefault. */
    lastOrDefault(predicate?: (item: T) => boolean): T | null;

    /** Returns exactly one element. Throws if count is not exactly one. Equivalent to C# Enumerable.Single. */
    single(predicate?: (item: T) => boolean): T;

    /** Returns one element or null; throws if more than one matches. Equivalent to C# Enumerable.SingleOrDefault. */
    singleOrDefault(predicate?: (item: T) => boolean): T | null;

    /** Returns true if any element matches the predicate. Short-circuits. Equivalent to C# Enumerable.Any. */
    any(predicate?: (item: T) => boolean): boolean;

    /** Returns true if all elements satisfy the predicate. Equivalent to C# Enumerable.All. */
    all(predicate: (item: T) => boolean): boolean;

    /** Returns true if the sequence contains the value (strict equality). Equivalent to C# Enumerable.Contains. */
    contains(value: T): boolean;

    /** Counts elements without allocating an intermediate array. Equivalent to C# Enumerable.Count. */
    count(predicate?: (item: T) => boolean): number;

    /** Sums elements or projected values. Equivalent to C# Enumerable.Sum. */
    sum(selector?: (item: T) => number): number;

    /** Returns the average value. Equivalent to C# Enumerable.Average. */
    average(selector?: (item: T) => number): number;

    /** Returns the minimum value using a loop (safe for large sequences). Equivalent to C# Enumerable.Min. */
    min(selector?: (item: T) => number): number;

    /** Returns the maximum value using a loop (safe for large sequences). Equivalent to C# Enumerable.Max. */
    max(selector?: (item: T) => number): number;

    /** Applies an accumulator function over the sequence. Equivalent to C# Enumerable.Aggregate. */
    aggregate<U>(accumulator: (acc: U, val: T) => U, seed: U): U;

    /** Returns the element at the specified index. Throws if out of range. Equivalent to C# Enumerable.ElementAt. */
    elementAt(index: number): T;

    /** Returns the element at the specified index or null if out of range. Equivalent to C# Enumerable.ElementAtOrDefault. */
    elementAtOrDefault(index: number): T | null;

    /** Checks whether this sequence and another are equal element-by-element. Equivalent to C# Enumerable.SequenceEqual. */
    sequenceEqual(other: Iterable<T>): boolean;

    /**
     * Sorts the sequence in ascending order by a key selector.
     * Uses the Schwartzian transform.
     * Returns an Array with thenBy / thenByDesc attached.
     * Equivalent to C# Enumerable.OrderBy.
     */
    orderBy<K>(selector: (item: T) => K): T[] & OrderedArray<T>;

    /**
     * Sorts the sequence in descending order by a key selector.
     * Equivalent to C# Enumerable.OrderByDescending.
     */
    orderByDesc<K>(selector: (item: T) => K): T[] & OrderedArray<T>;

    /**
     * Groups elements into a plain object keyed by the key selector.
     * Equivalent to C# Enumerable.GroupBy.
     */
    groupBy<K extends string | number | symbol>(keySelector: (item: T) => K): Record<K, T[]>;

    /**
     * Performs a hash-based inner join against another array.
     * Equivalent to C# Enumerable.Join.
     */
    innerJoin<U, K, R>(
        inner: U[],
        outerKeySelector: (item: T) => K,
        innerKeySelector: (item: U) => K,
        resultSelector: (outer: T, inner: U) => R
    ): R[];

    /**
     * Performs a group join (left outer join with grouping) against another array.
     * Equivalent to C# Enumerable.GroupJoin.
     */
    groupJoin<U, K, R>(
        inner: U[],
        outerKeySelector: (item: T) => K,
        innerKeySelector: (item: U) => K,
        resultSelector: (outer: T, inners: U[]) => R
    ): R[];

    /** Returns a debug string showing up to 10 elements. */
    toString(): string;
}

/**
 * A sorted array with additional thenBy / thenByDesc chaining methods.
 * Returned by orderBy and orderByDesc.
 */
export interface OrderedArray<T> extends Array<T> {
    /**
     * Applies a secondary ascending sort criterion.
     * Equivalent to C# .ThenBy().
     */
    thenBy<K>(selector: (item: T) => K): T[] & OrderedArray<T>;

    /**
     * Applies a secondary descending sort criterion.
     * Equivalent to C# .ThenByDescending().
     */
    thenByDesc<K>(selector: (item: T) => K): T[] & OrderedArray<T>;
}

declare global {
    interface Array<T> {
        // -- Conversion (terminal) --

        /**
         * Returns a shallow copy of this array.
         * Included for API symmetry with LazyQuery.toArray().
         * Equivalent to C# .ToList() / .ToArray().
         */
        toArray(): T[];

        /**
         * Converts this array to a native Set.
         * Equivalent to C# .ToHashSet().
         */
        toSet(): Set<T>;

        /**
         * Converts this array to a native Map using key and optional value selectors.
         * Equivalent to C# .ToDictionary() with a Map backing store.
         */
        toMap<K, V = T>(keySelector: (item: T) => K, valueSelector?: (item: T) => V): Map<K, V>;

        // -- Projection & Transformation --

        /**
         * Projects each element into a new form.
         * Returns a LazyQuery; call .toArray() to materialise.
         * Equivalent to C# Enumerable.Select.
         */
        select<U>(selector: (item: T, index: number, array: T[]) => U): LazyQuery<U>;

        /**
         * Projects each element to an array and flattens the results.
         * Returns a LazyQuery; call .toArray() to materialise.
         * Equivalent to C# Enumerable.SelectMany.
         */
        selectMany<U>(selector: (item: T, index: number, array: T[]) => Iterable<U>): LazyQuery<U>;

        /**
         * Returns a LazyQuery that is an identity cast of this array.
         * Equivalent to C# Enumerable.Cast.
         */
        cast<U>(): LazyQuery<U>;

        /**
         * Filters elements by JavaScript typeof string.
         * Returns a LazyQuery; call .toArray() to materialise.
         * Equivalent to C# Enumerable.OfType.
         */
        ofType(type: string): LazyQuery<T>;

        // -- Access & Query --

        /**
         * Filters elements using a predicate.
         * Returns a LazyQuery; call .toArray() to materialise.
         * Equivalent to C# Enumerable.Where.
         */
        where(predicate: (item: T, index: number, array: T[]) => boolean): LazyQuery<T>;

        /**
         * Returns the first element or first matching a predicate.
         * Throws if the sequence is empty or no match is found.
         * Equivalent to C# Enumerable.First.
         */
        first(predicate?: (item: T, index: number, array: T[]) => boolean): T;

        /**
         * Returns the first element matching a predicate, or null.
         * Equivalent to C# Enumerable.FirstOrDefault.
         */
        firstOrDefault(predicate?: (item: T, index: number, array: T[]) => boolean): T | null;

        /**
         * Returns the last element or last matching a predicate.
         * Throws if the sequence is empty or no match is found.
         * Equivalent to C# Enumerable.Last.
         */
        last(predicate?: (item: T, index: number, array: T[]) => boolean): T;

        /**
         * Returns the last element matching a predicate, or null.
         * Equivalent to C# Enumerable.LastOrDefault.
         */
        lastOrDefault(predicate?: (item: T, index: number, array: T[]) => boolean): T | null;

        /**
         * Returns exactly one element.  Throws if count is not exactly one.
         * Equivalent to C# Enumerable.Single.
         */
        single(predicate?: (item: T, index: number, array: T[]) => boolean): T;

        /**
         * Returns one element or null; throws if more than one matches.
         * Equivalent to C# Enumerable.SingleOrDefault.
         */
        singleOrDefault(predicate?: (item: T, index: number, array: T[]) => boolean): T | null;

        /**
         * Returns true if any element matches the predicate or if the array is non-empty.
         * Short-circuits on first match.
         * Equivalent to C# Enumerable.Any.
         */
        any(predicate?: (item: T, index: number, array: T[]) => boolean): boolean;

        /**
         * Returns true if all elements satisfy the predicate.
         * Equivalent to C# Enumerable.All.
         */
        all(predicate: (item: T, index: number, array: T[]) => boolean): boolean;

        /**
         * Returns true if the array contains the value (strict equality).
         * Equivalent to C# Enumerable.Contains.
         */
        contains(value: T): boolean;

        /**
         * Returns the element at the specified zero-based index.
         * Throws if out of bounds.
         * Equivalent to C# Enumerable.ElementAt.
         */
        elementAt(index: number): T;

        /**
         * Returns the element at the specified index or null if out of bounds.
         * Equivalent to C# Enumerable.ElementAtOrDefault.
         */
        elementAtOrDefault(index: number): T | null;

        // -- Aggregation --

        /**
         * Counts elements or elements matching a predicate.
         * Does not allocate an intermediate array.
         * Equivalent to C# Enumerable.Count.
         */
        count(predicate?: (item: T, index: number, array: T[]) => boolean): number;

        /**
         * Sums all elements or projected values.
         * Equivalent to C# Enumerable.Sum.
         */
        sum(selector?: (item: T, index: number, array: T[]) => number): number;

        /**
         * Returns the average of all elements or projected values.
         * Equivalent to C# Enumerable.Average.
         */
        average(selector?: (item: T, index: number, array: T[]) => number): number;

        /**
         * Returns the minimum value or minimum projected value.
         * Uses a loop to avoid stack overflow on large arrays.
         * Equivalent to C# Enumerable.Min.
         */
        min(selector?: (item: T, index: number, array: T[]) => number): number;

        /**
         * Returns the maximum value or maximum projected value.
         * Uses a loop to avoid stack overflow on large arrays.
         * Equivalent to C# Enumerable.Max.
         */
        max(selector?: (item: T, index: number, array: T[]) => number): number;

        /**
         * Applies an accumulator function over the array.
         * Equivalent to C# Enumerable.Aggregate.
         */
        aggregate<U>(accumulator: (acc: U, val: T) => U, seed: U): U;

        // -- Sorting & Flow --

        /**
         * Sorts the array in ascending order by a key selector.
         * Uses the Schwartzian transform (selector called once per element).
         * Returns an Array with thenBy / thenByDesc for chaining.
         * Equivalent to C# Enumerable.OrderBy.
         */
        orderBy<K>(selector: (item: T) => K): T[] & OrderedArray<T>;

        /**
         * Sorts the array in descending order by a key selector.
         * Equivalent to C# Enumerable.OrderByDescending.
         */
        orderByDesc<K>(selector: (item: T) => K): T[] & OrderedArray<T>;

        /**
         * Returns the first n elements.
         * Equivalent to C# Enumerable.Take.
         */
        take(n: number): T[];

        /**
         * Skips the first n elements.
         * Equivalent to C# Enumerable.Skip.
         */
        skip(n: number): T[];

        /**
         * Takes elements while the predicate returns true, then stops.
         * Equivalent to C# Enumerable.TakeWhile.
         */
        takeWhile(predicate: (item: T) => boolean): T[];

        /**
         * Skips elements while the predicate returns true, then yields the rest.
         * Equivalent to C# Enumerable.SkipWhile.
         */
        skipWhile(predicate: (item: T) => boolean): T[];

        // -- Set & Collection --

        /**
         * Returns a new array without duplicate elements.
         * Equivalent to C# Enumerable.Distinct.
         */
        distinct(): T[];

        /**
         * Returns a new array without duplicates, using a key selector.
         * Equivalent to C# Enumerable.DistinctBy.
         */
        distinctBy<K>(selector: (item: T) => K): T[];

        /**
         * Returns the set union of this array and another, without duplicates.
         * Equivalent to C# Enumerable.Union.
         */
        union(other: T[]): T[];

        /**
         * Returns elements present in both this array and another.
         * Equivalent to C# Enumerable.Intersect.
         */
        intersect(other: T[]): T[];

        /**
         * Returns elements from this array not present in another.
         * Equivalent to C# Enumerable.Except.
         */
        except(other: T[]): T[];

        // -- Joins & Grouping --

        /**
         * Performs a hash-based inner join with another array.
         * Equivalent to C# Enumerable.Join.
         */
        innerJoin<U, K, R>(
            inner: U[],
            outerKeySelector: (item: T) => K,
            innerKeySelector: (item: U) => K,
            resultSelector: (outer: T, inner: U) => R
        ): R[];

        /**
         * Performs a group join (left outer join with grouping) with another array.
         * Equivalent to C# Enumerable.GroupJoin.
         */
        groupJoin<U, K, R>(
            inner: U[],
            outerKeySelector: (item: T) => K,
            innerKeySelector: (item: U) => K,
            resultSelector: (outer: T, inners: U[]) => R
        ): R[];

        /**
         * Groups elements into a plain object keyed by the key selector.
         * Equivalent to C# Enumerable.GroupBy.
         */
        groupBy<K extends string | number | symbol>(keySelector: (item: T) => K): Record<K, T[]>;

        // -- Conversion & Utilities --

        /**
         * Converts the array to a plain object dictionary.
         * Equivalent to C# .ToDictionary().
         */
        toDictionary<K extends string | number | symbol, V = T>(
            keySelector: (item: T) => K,
            valueSelector?: (item: T) => V
        ): Record<K, V>;

        /**
         * Returns a new array with the item appended at the end.
         * Equivalent to C# Enumerable.Append.
         */
        append(item: T): T[];

        /**
         * Returns a new array with the item prepended at the start.
         * Equivalent to C# Enumerable.Prepend.
         */
        prepend(item: T): T[];

        /**
         * Returns this array if non-empty, or a single-element array with the default value.
         * Equivalent to C# Enumerable.DefaultIfEmpty.
         */
        defaultIfEmpty(defaultValue: T): T[];

        /**
         * Returns true if this array and another are equal in sequence.
         * Uses deep equality via JSON.stringify.
         * Equivalent to C# Enumerable.SequenceEqual.
         */
        sequenceEqual(other: T[]): boolean;

        /**
         * Combines this array with another element-by-element.
         * Stops at the shorter array.
         * Equivalent to C# Enumerable.Zip.
         */
        zip<U, R = [T, U]>(other: U[], resultSelector?: (item1: T, item2: U) => R): R[];
    }
}

export {};
