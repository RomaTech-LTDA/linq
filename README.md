# @romatech/linq
 🧠 A comprehensive utility that extends Array.prototype with a rich set of methods for:

- ✅ Projection & Transformation: select, selectMany, cast, ofType

- ✅ Access & Query: where, first, firstOrDefault, last, lastOrDefault, single, singleOrDefault, any, all, contains, elementAt, elementAtOrDefault

- ✅ Aggregation: count, sum, average, min, max, aggregate

- ✅ Sorting & Flow: orderBy, orderByDesc, thenBy, thenByDesc, take, skip, takeWhile, skipWhile

- ✅ Set & Collection: distinct, distinctBy, union, intersect, except

- ✅ Joins & Grouping: join, groupJoin, groupBy

- ✅ Conversion & Utilities: toDictionary, append, prepend, defaultIfEmpty, sequenceEqual, zip

Chainable, immutable, fully typed, and compatible with CommonJS and ES Modules.

>🧩 This package adds safe, non-enumerable methods to Array.prototype.

  

## 🚀 Installation
```bash
npm install @romatech/linq
```
  

## 📦 Usage
>✅ You must import the package once to enable prototype extensions.

### CommonJS
```js
require('@romatech/linq');

const numbers = [1, 2, 3, 4, 5];

const result = numbers
.where(x => x > 2)
.orderByDesc(x => x)
.take(2);

console.log(result); // [5, 4]
```

### ES Modules
```ts
import '@romatech/linq';

const users = [
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 30 },
];

const grouped = users.groupBy(u => u.age);

console.log(grouped);
// {
// 25: [{ name: 'Bob', age: 25 }],
// 30: [{ name: 'Alice', age: 30 }, { name: 'Charlie', age: 30 }]
// }
```

## 🧠 API
### Projection & Transformation
carray.select(fn) — Maps each element by the selector function.
`array.selectMany(fn)` — Maps each element and flattens the result.
`array.cast()` — Casts elements (identity).
`array.ofType(type)` — Filters elements by JavaScript type.

### Access & Query
`array.where(predicate)` — Filters elements by predicate.
`array.first(predicate?)` — Returns the first element matching predicate or first element.
`array.firstOrDefault(predicate?)` — Like first but returns null if none.
`array.last(predicate?)` — Returns the last element matching predicate or last element.
`array.lastOrDefault(predicate?)` — Like last but returns null if none.
`array.single(predicate?)` — Returns exactly one element matching predicate; throws if zero or multiple.
`array.singleOrDefault(predicate?)` — Returns one or zero elements matching predicate; throws if multiple.
`array.any(predicate?)` — Checks if any element matches predicate or if array has elements.
`array.all(predicate)` — Checks if all elements satisfy predicate.
`array.contains(value)` — Checks if value exists in array.
`array.elementAt(index)` — Returns element at index; throws if out of bounds.
`array.elementAtOrDefault(index)` — Returns element or null if out of bounds.

### Aggregation
`array.count(predicate?)` — Counts elements matching predicate or total.
`array.sum(selector?)` — Sums values or selected values.
`array.average(selector?)` — Computes average of values or selected values.
`array.min(selector?)` — Returns minimum value or selected values.
`array.max(selector?)` — Returns maximum value or selected values.
`array.aggregate(accumulator, seed)` — Aggregates values using accumulator function and seed.

### Sorting & Flow
`array.orderBy(fn)` — Sort ascending by selector.
`array.orderByDesc(fn)` — Sort descending by selector.
`array.thenBy(fn)` — Chain secondary ascending sort.
`array.thenByDesc(fn)` — Chain secondary descending sort.
`array.take(n)` — Takes first n elements.
`array.skip(n)` — Skips first n elements.
`array.takeWhile(predicate)` — Takes elements while predicate is true.
`array.skipWhile(predicate)` — Skips elements while predicate is true.

### Set & Collection
`array.distinct()` — Removes deep-equal duplicates.
`array.distinctBy(fn)` — Removes duplicates by selector return value.
`array.union(otherArray)` — Union of arrays (unique).
`array.intersect(otherArray)` — Intersection of arrays.
`array.except(otherArray)` — Elements except those in otherArray.

### Joins & Grouping
`array.join(inner, outerKeySelector, innerKeySelector, resultSelector)` — Joins arrays on keys.
`array.groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector)` — Groups join results.
`array.groupBy(keySelector)` — Groups elements by key.

### Conversion & Utilities
`array.toDictionary(keySelector, valueSelector?)` — Converts array to dictionary/object.
`array.append(item)` — Returns new array with item appended.
`array.prepend(item)` — Returns new array with item prepended.
`array.defaultIfEmpty(defaultValue)` — Returns default if array empty.
`array.sequenceEqual(other)` — Checks if arrays are deeply equal.
`array.zip(other, resultSelector?) `— Combines arrays element-wise.

## 🧱 TypeScript Support
Fully typed with comprehensive definitions available.
```ts
type Selector<T> = (item: T) => any;

interface OrderedArray<T> extends Array<T> {
thenBy(fn: Selector<T>): OrderedArray<T>;
thenByDesc(fn: Selector<T>): OrderedArray<T>;
}

interface Array<T> {
select<U>(fn: (item: T) => U): U[];
selectMany<U>(fn: (item: T) => U[]): U[];
cast(): T[];
ofType(type: string): T[];
where(fn: (item: T) => boolean): T[];
first(fn?: (item: T) => boolean): T | undefined;
firstOrDefault(fn?: (item: T) => boolean): T | null;
last(fn?: (item: T) => boolean): T | undefined;
lastOrDefault(fn?: (item: T) => boolean): T | null;
single(fn?: (item: T) => boolean): T;
singleOrDefault(fn?: (item: T) => boolean): T | null;
any(fn?: (item: T) => boolean): boolean;
all(fn: (item: T) => boolean): boolean;
contains(value: T): boolean;
elementAt(index: number): T;
elementAtOrDefault(index: number): T | null;
count(fn?: (item: T) => boolean): number;
sum(fn?: (item: T) => number): number;
average(fn?: (item: T) => number): number;
min(fn?: (item: T) => number): number;
max(fn?: (item: T) => number): number;
aggregate<U>(fn: (acc: U, val: T) => U, seed: U): U;
orderBy(fn: (item: T) => any): OrderedArray<T>;
orderByDesc(fn: (item: T) => any): OrderedArray<T>;
thenBy(fn: (item: T) => any): OrderedArray<T>;
thenByDesc(fn: (item: T) => any): OrderedArray<T>;
take(n: number): T[];
skip(n: number): T[];
takeWhile(fn: (item: T) => boolean): T[];
skipWhile(fn: (item: T) => boolean): T[];
distinct(): T[];
distinctBy(fn: (item: T) => any): T[];
union(other: T[]): T[];
intersect(other: T[]): T[];
except(other: T[]): T[];
join<U,  R>(
  inner: U[],
  outerKeySelector: (outer: T) => any,
  innerKeySelector: (inner: U) => any,
  resultSelector: (outer: T, inner: U) => R
): R[];
groupJoin<U,  R>(
  inner: U[],
  outerKeySelector: (outer: T) => any,
  innerKeySelector: (inner: U) => any,
  resultSelector: (outer: T, inners: U[]) => R
): R[];
groupBy<K  extends  keyof  any>(fn: (item: T) => K): Record<K,  T[]>;
toDictionary<K  extends  keyof  any,  V>(keySelector: (item: T) => K, valueSelector?: (item: T) => V): Record<K,  V>;
append(item: T): T[];
prepend(item: T): T[];
defaultIfEmpty(item: T): T[];
sequenceEqual(other: T[]): boolean;
zip<U,  R>(other: U[], resultSelector?: (a: T, b: U) => R): R[];
}
```

## ✅ Compatibility
- Node.js LTS (≥ v11 recommended; Node 18+ fully supported)

- Works in browsers (via bundlers like Vite/Webpack)

- Fully compatible with CommonJS and ESM

## 🧪 Tests
```bash
npm install
npm test
```
All tests are implemented with [Jest](https://jestjs.io) and validate sorting logic and method chaining behavior.

## ⚠️ Prototype Extension Warning
This package extends `Array.prototype` with non-enumerable methods for rich querying and transformation.

>✅ Safe in most applications.
>❌ Avoid in libraries where global prototype changes are discouraged.

## 🪪 License
MIT © RomaTech / Leandro Romanelli