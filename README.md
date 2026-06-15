# @romatech/linq

A lightweight library that extends JavaScript arrays with LINQ-style methods
inspired by .NET's `System.Linq.Enumerable`.  It introduces a `LazyQuery`
pipeline that defers execution until a terminal operator is called — the same
model as `IEnumerable<T>` in C#.

## How it works

Calling methods like `where()`, `select()`, or `take()` on an array does not
execute anything immediately.  Each call returns a `LazyQuery` object that
records the operation.  Execution happens in a single pass only when a terminal
operator such as `toArray()`, `first()`, or `count()` is invoked.

```js
// Nothing executes until .toArray() is called — just like C# LINQ.
const result = users
  .where(u => u.active)       // returns LazyQuery (deferred)
  .select(u => u.name)        // returns LazyQuery (deferred)
  .take(10)                   // returns LazyQuery (deferred)
  .toArray();                 // single pass, stops after 10 results
```

This avoids allocating intermediate arrays and short-circuits the source
iteration as soon as the result is complete, matching the behaviour of C# LINQ.

## Installation

```bash
npm install @romatech/linq
```

## Usage

Import once anywhere in your application to enable the prototype extensions.

### CommonJS

```js
require('@romatech/linq');
```

### ES Modules

```js
import '@romatech/linq';
```

### Basic pipeline (C#-style)

```js
require('@romatech/linq');

const users = [
  { name: 'Alice', age: 30, active: true  },
  { name: 'Bob',   age: 25, active: false },
  { name: 'Carol', age: 30, active: true  },
  { name: 'Dave',  age: 22, active: true  },
];

// Exactly like C#: users.Where(...).OrderBy(...).Select(...).Take(...).ToList()
const result = users
  .where(u => u.active)
  .orderBy(u => u.age)
  .select(u => u.name)
  .take(2)
  .toArray();

console.log(result); // ['Dave', 'Alice']
```

### Short-circuit with first()

```js
// Stops iteration as soon as the first match is found.
const user = users
  .where(u => u.age > 28)
  .first();

console.log(user.name); // 'Alice'
```

### Aggregation

```js
const groups = users.groupBy(u => u.age);
// { 30: [...], 25: [...], 22: [...] }

const totalAge = users.select(u => u.age).sum();   // 107
const average  = users.select(u => u.age).average(); // 26.75
```

### Joining

```js
const orders = [
  { userId: 1, amount: 100 },
  { userId: 2, amount:  50 },
];

const result = users.innerJoin(
  orders,
  u => u.id,
  o => o.userId,
  (u, o) => ({ name: u.name, amount: o.amount })
);
```

### Converting to other collections

```js
// To a Set
const nameSet = users.select(u => u.name).toSet();

// To a Map
const byName = users.toMap(u => u.name);

// To a plain dictionary object
const dict = users.toDictionary(u => u.name, u => u.age);
```

## API reference

Methods marked **intermediate** return a `LazyQuery` — nothing executes until
a **terminal** is called.  Methods that operate directly on an `Array` and
return a concrete value are **terminal**.

### Intermediate operators (return LazyQuery)

These are available on both `Array` and `LazyQuery`:

| Method | C# equivalent | Description |
|---|---|---|
| `.where(predicate)` | `Where` | Filters elements by predicate. |
| `.select(selector)` | `Select` | Projects each element into a new form. |
| `.selectMany(selector)` | `SelectMany` | Projects and flattens. |
| `.ofType(type)` | `OfType` | Filters elements by JavaScript `typeof`. |
| `.take(n)` | `Take` | Returns the first n elements. Short-circuits. |
| `.skip(n)` | `Skip` | Skips the first n elements. |
| `.takeWhile(predicate)` | `TakeWhile` | Yields while predicate holds, then stops. |
| `.skipWhile(predicate)` | `SkipWhile` | Skips while predicate holds, then yields rest. |
| `.distinct()` | `Distinct` | Removes duplicate elements. |
| `.distinctBy(selector)` | `DistinctBy` | Removes duplicates by key. |
| `.union(other)` | `Union` | Set union without duplicates. |
| `.intersect(other)` | `Intersect` | Elements present in both sequences. |
| `.except(other)` | `Except` | Elements not in the other sequence. |
| `.concat(other)` | `Concat` | Appends another sequence. |
| `.zip(other, selector?)` | `Zip` | Combines two sequences element-by-element. |
| `.append(item)` | `Append` | Appends a single item. |
| `.prepend(item)` | `Prepend` | Prepends a single item. |
| `.defaultIfEmpty(value)` | `DefaultIfEmpty` | Yields a default if empty. |
| `.cast()` | `Cast` | Identity cast. |

### Terminal operators

Terminal operators consume the pipeline and return a concrete value:

| Method | C# equivalent | Description |
|---|---|---|
| `.toArray()` | `ToList()` / `ToArray()` | Materialises into a plain Array. |
| `.toSet()` | `ToHashSet()` | Materialises into a native `Set`. |
| `.toMap(keyFn, valueFn?)` | `ToDictionary()` | Materialises into a native `Map`. |
| `.toDictionary(keyFn, valueFn?)` | `ToDictionary()` | Materialises into a plain object. |
| `.first(predicate?)` | `First` | First element or first match. Throws if empty. |
| `.firstOrDefault(predicate?)` | `FirstOrDefault` | First match or `null`. |
| `.last(predicate?)` | `Last` | Last element or last match. Throws if empty. |
| `.lastOrDefault(predicate?)` | `LastOrDefault` | Last match or `null`. |
| `.single(predicate?)` | `Single` | Exactly one match. Throws otherwise. |
| `.singleOrDefault(predicate?)` | `SingleOrDefault` | One match or `null`. Throws if > 1. |
| `.any(predicate?)` | `Any` | `true` if any match. Short-circuits. |
| `.all(predicate)` | `All` | `true` if all match. Short-circuits on failure. |
| `.contains(value)` | `Contains` | `true` if value is in the sequence. |
| `.count(predicate?)` | `Count` | Element count. No intermediate array. |
| `.sum(selector?)` | `Sum` | Sum of values. |
| `.average(selector?)` | `Average` | Average of values. |
| `.min(selector?)` | `Min` | Minimum. Safe for large sequences. |
| `.max(selector?)` | `Max` | Maximum. Safe for large sequences. |
| `.aggregate(fn, seed)` | `Aggregate` | Folds with accumulator. |
| `.elementAt(index)` | `ElementAt` | Element at index. Throws if out of range. |
| `.elementAtOrDefault(index)` | `ElementAtOrDefault` | Element at index or `null`. |
| `.sequenceEqual(other)` | `SequenceEqual` | Element-by-element equality. |
| `.orderBy(selector)` | `OrderBy` | Sorts ascending. Returns Array with `thenBy`/`thenByDesc`. |
| `.orderByDesc(selector)` | `OrderByDescending` | Sorts descending. |
| `.groupBy(keySelector)` | `GroupBy` | Groups into a plain object. |
| `.innerJoin(inner, outerKey, innerKey, result)` | `Join` | Hash-based inner join. |
| `.groupJoin(inner, outerKey, innerKey, result)` | `GroupJoin` | Left outer join with grouping. |

### Sorting chain

`orderBy` and `orderByDesc` return a plain Array extended with chaining:

```js
const sorted = people
  .orderBy(p => p.lastName)
  .thenBy(p => p.firstName)
  .thenByDesc(p => p.age);
```

## C# comparison

| C# | @romatech/linq |
|---|---|
| `users.Where(u => u.Active).Select(u => u.Name).Take(10).ToList()` | `users.where(u => u.active).select(u => u.name).take(10).toArray()` |
| `users.First(u => u.Age > 30)` | `users.first(u => u.age > 30)` |
| `users.OrderBy(u => u.Name).ThenByDescending(u => u.Age)` | `users.orderBy(u => u.name).thenByDesc(u => u.age)` |
| `users.GroupBy(u => u.Department)` | `users.groupBy(u => u.department)` |
| `users.Count(u => u.Active)` | `users.count(u => u.active)` |

## Performance notes

- **Single pass**: pipelines iterate the source exactly once when consumed,
  regardless of how many intermediate operators are chained.
- **Short-circuit**: `take`, `first`, `any`, and `all` stop iteration as soon
  as the result is determined.
- **No spread overflow**: `min` and `max` use a loop instead of
  `Math.min(...array)`, making them safe for arrays with any number of elements.
- **Schwartzian transform**: `orderBy` and `orderByDesc` call the key selector
  once per element (O(n)) rather than once per comparison (O(n log n)).
- **Set operations**: `distinct`, `union`, `intersect`, and `except` use `Set`
  lookups. Primitives are stored directly (O(1)); objects fall back to
  `JSON.stringify` for deep equality.

## TypeScript support

Full type definitions are included. The `LazyQuery<T>` class and the
`OrderedArray<T>` interface are exported.

```ts
import '@romatech/linq';
import { LazyQuery } from '@romatech/linq';

interface User {
  name: string;
  age: number;
  active: boolean;
}

const users: User[] = [ /* ... */ ];

const names: string[] = users
  .where(u => u.active)
  .select(u => u.name)
  .toArray();
```

## Compatibility

- Node.js >= 11 (Node 18+ recommended)
- Works in browsers via bundlers (Vite, Webpack, esbuild)
- Compatible with CommonJS (`require`) and ES Modules (`import`)

## Running tests

```bash
npm install
npm test
```

Tests are written with [Jest](https://jestjs.io) and cover both the
`Array.prototype` extensions and the `LazyQuery` pipeline, including
short-circuit behaviour and large-array safety.

## Prototype extension notice

This package adds non-enumerable methods to `Array.prototype`.  The extensions
are safe for application code.  Avoid using this package in libraries where
modifying global prototypes is undesirable.

## License

MIT (c) RomaTech / Leandro Romanelli
