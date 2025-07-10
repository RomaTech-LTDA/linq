// index.d.ts

declare global {
  interface Array<T> {
    // Projection & Transformation

    /**
     * Projects each element of a sequence into a new form.
     *
     * @template U The type of the value returned by the selector.
     * @param selector A transform function to apply to each element.
     * @returns An array of the transformed elements.
     */
    select<U>(selector: (item: T, index: number, array: T[]) => U): U[];

    /**
     * Projects each element to an array and flattens the resulting arrays into one array.
     *
     * @template U The type of the values in the resulting flattened array.
     * @param selector A transform function to apply to each element.
     * @returns A flattened array of the results.
     */
    selectMany<U>(selector: (item: T, index: number, array: T[]) => U[]): U[];

    /**
     * Casts all elements to a specified type.
     *
     * @template U The type to cast each element to.
     * @returns The casted array.
     */
    cast<U>(): U[];

    /**
     * Filters elements based on their type.
     *
     * @param type A string representing the JavaScript type (e.g., 'string', 'number').
     * @returns A filtered array of elements matching the type.
     */
    ofType(type: string): T[];

    // Access & Query

    /**
     * Filters a sequence based on a predicate.
     *
     * @param predicate A function to test each element for a condition.
     * @returns A filtered array.
     */
    where(predicate: (item: T, index: number, array: T[]) => boolean): T[];

    /**
     * Returns the first element or the first that matches a predicate.
     *
     * @param predicate Optional function to test each element.
     * @returns The first element or the first matching element.
     */
    first(predicate?: (item: T, index: number, array: T[]) => boolean): T;

    /**
     * Returns the first element that matches the predicate or null if no match is found.
     *
     * @param predicate Optional function to test each element.
     * @returns The matching element or null.
     */
    firstOrDefault(predicate?: (item: T, index: number, array: T[]) => boolean): T | null;

    /**
     * Returns the last element or the last that matches a predicate.
     *
     * @param predicate Optional function to test each element.
     * @returns The last element or the last matching element.
     */
    last(predicate?: (item: T, index: number, array: T[]) => boolean): T;

    /**
     * Returns the last element that matches the predicate or null if no match is found.
     *
     * @param predicate Optional function to test each element.
     * @returns The matching element or null.
     */
    lastOrDefault(predicate?: (item: T, index: number, array: T[]) => boolean): T | null;

    /**
     * Returns the only element that matches a predicate or throws if not exactly one match.
     *
     * @param predicate A function to test each element.
     * @returns The matching element.
     */
    single(predicate: (item: T, index: number, array: T[]) => boolean): T;

    /**
     * Returns the only element that matches a predicate or null if no match or throws if more than one.
     *
     * @param predicate A function to test each element.
     * @returns The matching element or null.
     */
    singleOrDefault(predicate: (item: T, index: number, array: T[]) => boolean): T | null;

    /**
     * Returns true if any elements match the predicate or if the array is not empty.
     *
     * @param predicate Optional function to test each element.
     * @returns `true` if any match, otherwise `false`.
     */
    any(predicate?: (item: T, index: number, array: T[]) => boolean): boolean;

    /**
     * Returns true if all elements match the predicate.
     *
     * @param predicate A function to test each element.
     * @returns `true` if all match, otherwise `false`.
     */
    all(predicate: (item: T, index: number, array: T[]) => boolean): boolean;

    /**
     * Determines whether the array contains a specified element.
     *
     * @param value The value to locate.
     * @returns `true` if found, otherwise `false`.
     */
    contains(value: T): boolean;

    /**
     * Returns the element at the specified index or throws if out of range.
     *
     * @param index The zero-based index.
     * @returns The element at the specified position.
     */
    elementAt(index: number): T;

    /**
     * Returns the element at the specified index or null if out of range.
     *
     * @param index The zero-based index.
     * @returns The element or null.
     */
    elementAtOrDefault(index: number): T | null;

    // Aggregation

    /**
     * Returns the number of elements in the array or matching a predicate.
     *
     * @param predicate Optional function to test each element.
     * @returns The number of elements.
     */
    count(predicate?: (item: T, index: number, array: T[]) => boolean): number;

    /**
     * Computes the sum of elements, optionally using a selector.
     *
     * @param selector Optional function to transform each element.
     * @returns The sum.
     */
    sum(selector?: (item: T, index: number, array: T[]) => number): number;

    /**
     * Computes the average of elements, optionally using a selector.
     *
     * @param selector Optional function to transform each element.
     * @returns The average.
     */
    average(selector?: (item: T, index: number, array: T[]) => number): number;

    /**
     * Returns the minimum value, optionally using a selector.
     *
     * @param selector Optional function to transform each element.
     * @returns The minimum.
     */
    min(selector?: (item: T, index: number, array: T[]) => number): number;

    /**
     * Returns the maximum value, optionally using a selector.
     *
     * @param selector Optional function to transform each element.
     * @returns The maximum.
     */
    max(selector?: (item: T, index: number, array: T[]) => number): number;

    /**
     * Applies an accumulator function over the array.
     *
     * @template U The type of the accumulated result.
     * @param accumulator Function to apply to each element.
     * @param seed The initial accumulator value.
     * @returns The accumulated value.
     */
    aggregate<U>(accumulator: (acc: U, val: T) => U, seed: U): U;

    // Sorting & Flow

    /**
     * Sorts the array by a key selector in ascending order.
     *
     * @template K The type of the key.
     * @param selector Function to extract the key.
     * @returns A sorted array with chainable `thenBy` and `thenByDesc`.
     */
    orderBy<K>(selector: (item: T) => K): T[] & {
      thenBy(selector: (item: T) => any): T[];
      thenByDesc(selector: (item: T) => any): T[];
    };

    /**
     * Sorts the array by a key selector in descending order.
     *
     * @template K The type of the key.
     * @param selector Function to extract the key.
     * @returns A sorted array with chainable `thenBy` and `thenByDesc`.
     */
    orderByDesc<K>(selector: (item: T) => K): T[] & {
      thenBy(selector: (item: T) => any): T[];
      thenByDesc(selector: (item: T) => any): T[];
    };

    /**
     * Returns the first `n` elements of the array.
     *
     * @param n Number of elements to take.
     * @returns The sliced array.
     */
    take(n: number): T[];

    /**
     * Skips the first `n` elements.
     *
     * @param n Number of elements to skip.
     * @returns The remaining array.
     */
    skip(n: number): T[];

    /**
     * Takes elements from the array while the predicate returns true.
     *
     * @param predicate Condition function.
     * @returns The resulting array.
     */
    takeWhile(predicate: (item: T) => boolean): T[];

    /**
     * Skips elements while the predicate is true, then returns the rest.
     *
     * @param predicate Condition function.
     * @returns The resulting array.
     */
    skipWhile(predicate: (item: T) => boolean): T[];

    // Set & Collection

    /**
     * Returns a new array with distinct elements.
     *
     * @returns The array without duplicates.
     */
    distinct(): T[];

    /**
     * Returns distinct elements using a selector to determine uniqueness.
     *
     * @template K The type of the key to compare.
     * @param selector Function to extract the key.
     * @returns An array with unique elements.
     */
    distinctBy<K>(selector: (item: T) => K): T[];

    /**
     * Returns the union of two arrays.
     *
     * @param other The array to union with.
     * @returns The union of the arrays.
     */
    union(other: T[]): T[];

    /**
     * Returns the intersection of two arrays.
     *
     * @param other The array to intersect with.
     * @returns The intersection array.
     */
    intersect(other: T[]): T[];

    /**
     * Returns elements that are in the first array but not in the second.
     *
     * @param other The array to compare.
     * @returns The resulting array.
     */
    except(other: T[]): T[];

    // Joins & Grouping

    /**
     * Performs an inner join with another array based on key match.
     *
     * @template U The inner array item type.
     * @template K The type of the join key.
     * @template R The result type.
     * @param inner The array to join with.
     * @param outerKeySelector Function to extract the key from outer items.
     * @param innerKeySelector Function to extract the key from inner items.
     * @param resultSelector Function to project the result.
     * @returns The joined array.
     */
    join<U, K, R>(
      inner: U[],
      outerKeySelector: (item: T) => K,
      innerKeySelector: (item: U) => K,
      resultSelector: (outer: T, inner: U) => R
    ): R[];

    /**
     * Groups and joins with another array.
     *
     * @template U The inner array item type.
     * @template K The key type.
     * @template R The result type.
     * @param inner The array to join with.
     * @param outerKeySelector Function to extract the key from outer items.
     * @param innerKeySelector Function to extract the key from inner items.
     * @param resultSelector Function to project the result.
     * @returns The grouped joined array.
     */
    groupJoin<U, K, R>(
      inner: U[],
      outerKeySelector: (item: T) => K,
      innerKeySelector: (item: U) => K,
      resultSelector: (outer: T, inners: U[]) => R
    ): R[];

    /**
     * Groups elements by a key.
     *
     * @template K The key type.
     * @param keySelector Function to extract the key.
     * @returns A record of grouped arrays by key.
     */
    groupBy<K extends string | number | symbol>(keySelector: (item: T) => K): Record<K, T[]>;

    // Conversion & Utilities

    /**
     * Converts the array to a dictionary.
     *
     * @template K The key type.
     * @template V The value type.
     * @param keySelector Function to extract keys.
     * @param valueSelector Optional function to extract values.
     * @returns A key-value map.
     */
    toDictionary<K extends string | number | symbol, V = T>(
      keySelector: (item: T) => K,
      valueSelector?: (item: T) => V
    ): Record<K, V>;

    /**
     * Returns a new array with the item added to the end.
     *
     * @param item The item to append.
     * @returns A new array.
     */
    append(item: T): T[];

    /**
     * Returns a new array with the item added to the start.
     *
     * @param item The item to prepend.
     * @returns A new array.
     */
    prepend(item: T): T[];

    /**
     * Returns the original array or a default value if empty.
     *
     * @param defaultValue The default value.
     * @returns The original array or one with the default value.
     */
    defaultIfEmpty(defaultValue: T): T[];

    /**
     * Checks if two arrays are equal in sequence.
     *
     * @param other The array to compare.
     * @returns `true` if equal, otherwise `false`.
     */
    sequenceEqual(other: T[]): boolean;

    /**
     * Combines two arrays by merging elements at the same index.
     *
     * @template U The type of elements in the second array.
     * @template R The result type.
     * @param other The second array.
     * @param resultSelector Optional function to combine values.
     * @returns The zipped array.
     */
    zip<U, R = [T, U]>(other: U[], resultSelector?: (item1: T, item2: U) => R): R[];
  }
}

export {};
