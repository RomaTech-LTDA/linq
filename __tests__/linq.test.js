const { LazyQuery } = require('../index');

// ---------------------------------------------------------------------------
// Array.prototype LINQ extensions
// ---------------------------------------------------------------------------

describe('Array.prototype LINQ-like extensions', () => {
    const data = [1, 2, 3, 4, 5];

    // -- Projection & Transformation --

    test('select - maps each element', () => {
        expect(data.select(x => x * 2).toArray()).toEqual([2, 4, 6, 8, 10]);
    });

    test('selectMany - flattens projected arrays', () => {
        const nested = [[1], [2, 3], [4]];
        expect(nested.selectMany(x => x).toArray()).toEqual([1, 2, 3, 4]);
    });

    test('cast - returns identity lazy sequence', () => {
        expect(data.cast().toArray()).toEqual(data);
    });

    test('ofType - filters by typeof', () => {
        const mixed = [1, 'a', true, 2];
        expect(mixed.ofType('number').toArray()).toEqual([1, 2]);
    });

    // -- Access & Query --

    test('where - filters elements by predicate', () => {
        expect(data.where(x => x > 3).toArray()).toEqual([4, 5]);
    });

    test('where - preserves falsy values when predicate allows them', () => {
        expect([0, 1, 2].where(x => x >= 0).toArray()).toEqual([0, 1, 2]);
    });

    test('first - returns first element', () => {
        expect(data.first()).toBe(1);
        expect(data.first(x => x > 3)).toBe(4);
    });

    test('first - returns first falsy value correctly', () => {
        expect([0, 1, 2].first()).toBe(0);
    });

    test('firstOrDefault - returns null when no match', () => {
        expect(data.firstOrDefault(x => x > 10)).toBeNull();
        expect(data.firstOrDefault(x => x > 3)).toBe(4);
    });

    test('firstOrDefault - returns first falsy value, not null', () => {
        expect([0, 1, 2].firstOrDefault()).toBe(0);
    });

    test('last - returns last element', () => {
        expect(data.last()).toBe(5);
        expect(data.last(x => x < 4)).toBe(3);
    });

    test('lastOrDefault - returns null when no match', () => {
        expect(data.lastOrDefault(x => x > 10)).toBeNull();
        expect(data.lastOrDefault(x => x > 2)).toBe(5);
    });

    test('single - returns sole element', () => {
        expect([42].single()).toBe(42);
    });

    test('single - works with falsy value', () => {
        expect([0].single()).toBe(0);
    });

    test('single - throws when multiple elements match', () => {
        expect(() => [1, 2].single()).toThrow();
    });

    test('singleOrDefault - returns sole element or null', () => {
        expect([42].singleOrDefault()).toBe(42);
        expect([].singleOrDefault()).toBeNull();
    });

    test('singleOrDefault - works with falsy value', () => {
        expect([0].singleOrDefault()).toBe(0);
    });

    test('any - returns true when array has elements', () => {
        expect(data.any()).toBe(true);
        expect(data.any(x => x > 4)).toBe(true);
        expect([].any()).toBe(false);
    });

    test('all - returns true when all match', () => {
        expect(data.all(x => x > 0)).toBe(true);
        expect(data.all(x => x > 3)).toBe(false);
    });

    test('contains - checks value presence', () => {
        expect(data.contains(3)).toBe(true);
        expect(data.contains(99)).toBe(false);
    });

    test('elementAt - returns element at index', () => {
        expect(data.elementAt(2)).toBe(3);
    });

    test('elementAt - throws when out of bounds', () => {
        expect(() => data.elementAt(99)).toThrow();
    });

    test('elementAtOrDefault - returns null when out of bounds', () => {
        expect(data.elementAtOrDefault(10)).toBeNull();
        expect(data.elementAtOrDefault(0)).toBe(1);
    });

    test('elementAtOrDefault - returns falsy value at index correctly', () => {
        expect([0, 1, 2].elementAtOrDefault(0)).toBe(0);
    });

    // -- Aggregation --

    test('count - total and filtered count', () => {
        expect(data.count()).toBe(5);
        expect(data.count(x => x > 2)).toBe(3);
    });

    test('sum - sums all or projected values', () => {
        expect(data.sum()).toBe(15);
        expect(data.sum(x => x * 2)).toBe(30);
    });

    test('average - computes average', () => {
        expect(data.average()).toBe(3);
    });

    test('min - returns minimum value', () => {
        expect(data.min()).toBe(1);
    });

    test('min - safe with large arrays (no stack overflow)', () => {
        const large = Array.from({ length: 200000 }, (_, i) => i);
        expect(large.min()).toBe(0);
    });

    test('max - returns maximum value', () => {
        expect(data.max()).toBe(5);
    });

    test('max - safe with large arrays (no stack overflow)', () => {
        const large = Array.from({ length: 200000 }, (_, i) => i);
        expect(large.max()).toBe(199999);
    });

    test('aggregate - folds with accumulator and seed', () => {
        expect(data.aggregate((a, b) => a + b, 0)).toBe(15);
    });

    // -- Sorting & Flow --

    test('orderBy / thenBy - multi-key ascending sort', () => {
        const complex = [{ a: 2, b: 1 }, { a: 1, b: 2 }, { a: 1, b: 1 }];
        const sorted = complex.orderBy(x => x.a).thenBy(x => x.b);
        expect(sorted.map(x => `${x.a}-${x.b}`)).toEqual(['1-1', '1-2', '2-1']);
    });

    test('orderByDesc / thenByDesc - multi-key descending sort', () => {
        const complex = [{ a: 1, b: 2 }, { a: 2, b: 1 }, { a: 2, b: 2 }];
        const sorted = complex.orderByDesc(x => x.a).thenByDesc(x => x.b);
        expect(sorted.map(x => `${x.a}-${x.b}`)).toEqual(['2-2', '2-1', '1-2']);
    });

    test('orderBy - Schwartzian transform: selector called once per element', () => {
        let calls = 0;
        const arr = [3, 1, 2];
        arr.orderBy(x => { calls++; return x; });
        expect(calls).toBe(arr.length);
    });

    test('take - returns first n elements', () => {
        expect(data.take(3)).toEqual([1, 2, 3]);
    });

    test('skip - skips first n elements', () => {
        expect(data.skip(2)).toEqual([3, 4, 5]);
    });

    test('takeWhile - takes while predicate holds', () => {
        expect(data.takeWhile(x => x < 4)).toEqual([1, 2, 3]);
    });

    test('skipWhile - skips while predicate holds', () => {
        expect(data.skipWhile(x => x < 4)).toEqual([4, 5]);
    });

    // -- Set & Collection --

    test('distinct - removes duplicates', () => {
        expect([1, 1, 2, 3, 3].distinct()).toEqual([1, 2, 3]);
    });

    test('distinctBy - removes duplicates by key', () => {
        const people = [{ id: 1 }, { id: 1 }, { id: 2 }];
        expect(people.distinctBy(x => x.id)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('union - merges arrays removing duplicates', () => {
        expect([1, 2].union([2, 3])).toEqual([1, 2, 3]);
    });

    test('intersect - returns common elements', () => {
        expect([1, 2, 3].intersect([2, 3, 4])).toEqual([2, 3]);
    });

    test('except - returns elements not in other', () => {
        expect([1, 2, 3].except([2])).toEqual([1, 3]);
    });

    // -- Joins & Grouping --

    test('innerJoin - matches on key', () => {
        const a = [{ id: 1 }, { id: 2 }];
        const b = [{ id: 1, value: 'x' }];
        const result = a.innerJoin(b, x => x.id, x => x.id, (x, y) => ({ x, y }));
        expect(result.length).toBe(1);
        expect(result[0].x.id).toBe(1);
    });

    test('groupJoin - left outer join with grouping', () => {
        const a = [{ id: 1 }, { id: 2 }];
        const b = [{ id: 1, val: 'x' }, { id: 1, val: 'y' }];
        const result = a.groupJoin(b, x => x.id, x => x.id, (x, ys) => ys);
        expect(result[0].length).toBe(2);
        expect(result[1].length).toBe(0);
    });

    test('groupBy - groups elements by key', () => {
        const values = [1, 2, 2, 3];
        const groups = values.groupBy(x => x);
        expect(groups[2]).toEqual([2, 2]);
    });

    // -- Conversion & Utilities --

    test('toDictionary - converts to keyed object', () => {
        const dict = [{ id: 1 }, { id: 2 }].toDictionary(x => x.id);
        expect(dict[1]).toEqual({ id: 1 });
    });

    test('toArray - returns a shallow copy', () => {
        const arr = [1, 2, 3];
        const copy = arr.toArray();
        expect(copy).toEqual(arr);
        expect(copy).not.toBe(arr);
    });

    test('toSet - returns a native Set', () => {
        const s = [1, 2, 2, 3].toSet();
        expect(s).toBeInstanceOf(Set);
        expect([...s]).toEqual([1, 2, 3]);
    });

    test('toMap - returns a native Map', () => {
        const m = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }].toMap(x => x.id, x => x.name);
        expect(m).toBeInstanceOf(Map);
        expect(m.get(1)).toBe('a');
    });

    test('append / prepend - add items immutably', () => {
        expect([2, 3].append(4)).toEqual([2, 3, 4]);
        expect([2, 3].prepend(1)).toEqual([1, 2, 3]);
    });

    test('defaultIfEmpty - returns default for empty array', () => {
        expect([].defaultIfEmpty(42)).toEqual([42]);
        expect([1].defaultIfEmpty(42)).toEqual([1]);
    });

    test('sequenceEqual - compares arrays element-by-element', () => {
        expect([1, 2].sequenceEqual([1, 2])).toBe(true);
        expect([1, 2].sequenceEqual([2, 1])).toBe(false);
    });

    test('zip - combines arrays element-wise', () => {
        expect([1, 2].zip(['a', 'b'], (x, y) => `${x}${y}`)).toEqual(['1a', '2b']);
    });

    // -- Native join preserved --

    test('native Array.join is not overwritten', () => {
        expect([1, 2, 3].join(',')).toBe('1,2,3');
        expect(typeof [].join).toBe('function');
        expect(typeof [].join(',')).toBe('string');
    });
});

// ---------------------------------------------------------------------------
// LazyQuery - deferred pipeline tests
// ---------------------------------------------------------------------------

describe('LazyQuery deferred execution', () => {
    test('pipeline does not execute until a terminal is called', () => {
        let calls = 0;
        const query = [1, 2, 3].where(x => { calls++; return x > 1; });
        expect(calls).toBe(0);       // nothing has run yet
        query.toArray();
        expect(calls).toBe(3);       // now it ran
    });

    test('take short-circuits: only pulls what is needed', () => {
        let calls = 0;
        const result = [1, 2, 3, 4, 5]
            .where(x => { calls++; return true; })
            .take(2)
            .toArray();
        expect(result).toEqual([1, 2]);
        expect(calls).toBe(2); // true short-circuit: only 2 elements evaluated
    });

    test('chained where + select + take runs in a single pass', () => {
        const visited = [];
        const result = [1, 2, 3, 4, 5]
            .where(x => { visited.push(`w${x}`); return x % 2 !== 0; })
            .select(x => { visited.push(`s${x}`); return x * 10; })
            .take(2)
            .toArray();

        expect(result).toEqual([10, 30]);
        // With proper short-circuit, the pipeline evaluates:
        //   w1 (odd, passes) -> s1 -> yield 10  (take has 1)
        //   w2 (even, skipped)
        //   w3 (odd, passes) -> s3 -> yield 30  (take has 2, stops)
        // Elements 4 and 5 are never touched.
        expect(visited).toEqual(['w1', 's1', 'w2', 'w3', 's3']);
    });

    test('LazyQuery is iterable with for-of', () => {
        const result = [];
        for (const x of [1, 2, 3].where(x => x > 1)) {
            result.push(x);
        }
        expect(result).toEqual([2, 3]);
    });

    test('chaining where().select().first() works C#-style', () => {
        const result = [1, 2, 3, 4, 5]
            .where(x => x > 2)
            .select(x => x * 10)
            .first();
        expect(result).toBe(30);
    });

    test('where().count() does not allocate intermediate array', () => {
        const count = [1, 2, 3, 4, 5].where(x => x > 2).count();
        expect(count).toBe(3);
    });

    test('select().sum() single-pass accumulation', () => {
        const total = [1, 2, 3].select(x => x * 2).sum();
        expect(total).toBe(12);
    });

    test('where().min() uses loop, not spread', () => {
        const large = Array.from({ length: 200000 }, (_, i) => 200000 - i);
        expect(large.where(x => true).min()).toBe(1);
    });

    test('where().max() uses loop, not spread', () => {
        const large = Array.from({ length: 200000 }, (_, i) => i);
        expect(large.where(x => true).max()).toBe(199999);
    });

    test('where().sequenceEqual() compares lazily', () => {
        expect([1, 2, 3].where(x => x > 1).sequenceEqual([2, 3])).toBe(true);
        expect([1, 2].where(x => true).sequenceEqual([2, 1])).toBe(false);
    });

    test('first() short-circuits on lazy pipeline', () => {
        let calls = 0;
        const result = [1, 2, 3]
            .where(x => { calls++; return x > 1; })
            .first();
        expect(result).toBe(2);
        expect(calls).toBe(2); // evaluated 1 (no match) and 2 (match), then stopped
    });

    test('single() on pipeline throws on multiple matches', () => {
        expect(() => [1, 2].where(x => true).single()).toThrow();
    });

    test('any() short-circuits on lazy pipeline', () => {
        let calls = 0;
        const result = [1, 2, 3]
            .where(x => { calls++; return x > 1; })
            .any();
        expect(result).toBe(true);
        expect(calls).toBe(2);
    });

    test('defaultIfEmpty on lazy pipeline yields default for empty source', () => {
        expect([].where(x => true).defaultIfEmpty(99).toArray()).toEqual([99]);
        expect([1].where(x => true).defaultIfEmpty(99).toArray()).toEqual([1]);
    });

    test('concat on lazy pipeline', () => {
        const result = [1, 2].where(x => true).concat([3, 4]).toArray();
        expect(result).toEqual([1, 2, 3, 4]);
    });

    test('toSet on lazy pipeline', () => {
        const s = [1, 2, 2, 3].where(x => true).toSet();
        expect(s).toBeInstanceOf(Set);
        expect([...s]).toEqual([1, 2, 3]);
    });

    test('toMap on lazy pipeline', () => {
        const m = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
            .where(x => true)
            .toMap(x => x.id, x => x.name);
        expect(m).toBeInstanceOf(Map);
        expect(m.get(1)).toBe('a');
        expect(m.get(2)).toBe('b');
    });

    test('groupBy on lazy pipeline returns grouped object', () => {
        const groups = [1, 2, 2, 3].where(x => true).groupBy(x => x);
        expect(groups[2]).toEqual([2, 2]);
    });

    test('innerJoin on lazy pipeline', () => {
        const a = [{ id: 1 }, { id: 2 }];
        const b = [{ id: 1, v: 'x' }];
        const result = a.where(x => true).innerJoin(b, x => x.id, x => x.id, (o, i) => ({ ...o, ...i }));
        expect(result.length).toBe(1);
        expect(result[0].v).toBe('x');
    });

    test('union on lazy pipeline', () => {
        const result = [1, 2].where(x => true).union([2, 3]).toArray();
        expect(result).toEqual([1, 2, 3]);
    });

    test('intersect on lazy pipeline', () => {
        const result = [1, 2, 3].where(x => true).intersect([2, 3, 4]).toArray();
        expect(result).toEqual([2, 3]);
    });

    test('except on lazy pipeline', () => {
        const result = [1, 2, 3].where(x => true).except([2]).toArray();
        expect(result).toEqual([1, 3]);
    });

    test('zip on lazy pipeline', () => {
        const result = [1, 2].where(x => true).zip(['a', 'b'], (x, y) => `${x}${y}`).toArray();
        expect(result).toEqual(['1a', '2b']);
    });

    test('orderBy on lazy pipeline uses Schwartzian transform', () => {
        const result = [3, 1, 2].where(x => true).orderBy(x => x);
        expect(result).toEqual([1, 2, 3]);
    });

    test('LazyQuery can be branched without interference', () => {
        const base = [1, 2, 3, 4, 5].where(x => x > 2);
        const branch1 = base.take(2).toArray();
        const branch2 = base.select(x => x * 10).toArray();
        expect(branch1).toEqual([3, 4]);
        expect(branch2).toEqual([30, 40, 50]);
    });

    test('full C#-style pipeline without asQuery', () => {
        const users = [
            { name: 'Alice', age: 30, active: true },
            { name: 'Bob', age: 25, active: false },
            { name: 'Carol', age: 35, active: true },
            { name: 'Dave', age: 22, active: true },
        ];

        const result = users
            .where(u => u.active)
            .orderBy(u => u.age)
            .map(u => u.name);

        // orderBy returns a plain Array, so .map works natively.
        expect(result).toEqual(['Dave', 'Alice', 'Carol']);
    });
});

// ---------------------------------------------------------------------------
// Regression tests
// ---------------------------------------------------------------------------

describe('regressions', () => {
    const path = require('path');
    const { spawnSync } = require('child_process');
    const root = path.join(__dirname, '..');

    const runNode = (code) => spawnSync(process.execPath, ['-e', code], { cwd: root, encoding: 'utf8' });

    test('Array.prototype extensions are writable and configurable', () => {
        const names = ['select', 'where', 'first', 'count', 'orderBy', 'orderByDesc', 'take', 'toArray', 'toMap'];
        for (const name of names) {
            const d = Object.getOwnPropertyDescriptor(Array.prototype, name);
            expect(d.enumerable).toBe(false);
            expect(d.writable).toBe(true);
            expect(d.configurable).toBe(true);
        }
    });

    test('an own property with an extension name can be assigned in strict mode', () => {
        'use strict';
        const arr = [1, 2];
        expect(() => { arr.count = 3; }).not.toThrow();
        expect(arr.count).toBe(3);
        expect([1, 2].count()).toBe(2);
    });

    test('loading the CommonJS and ES module builds in one process does not throw', () => {
        const r = runNode("require('./index.js'); import('./index.mjs').then(() => console.log('ok'), e => { console.error(e.message); process.exit(1); });");
        expect(r.stderr).toBe('');
        expect(r.status).toBe(0);
    });

    test('a package that redefines orderBy can load after this one', () => {
        const r = runNode("require('./index.js'); Object.defineProperty(Array.prototype, 'orderBy', { enumerable: false, configurable: true, writable: true, value: function () { return 'other'; } }); console.log([].orderBy());");
        expect(r.stderr).toBe('');
        expect(r.stdout.trim()).toBe('other');
    });

    test('orderBy places null, undefined and NaN keys first and sorts the rest', () => {
        const items = [{ v: 3 }, { v: null }, { v: 1 }, { v: undefined }, { v: 2 }, { v: NaN }];
        const asc = items.orderBy(x => x.v).map(x => x.v);
        expect(asc.slice(3)).toEqual([1, 2, 3]);
        expect(asc.slice(0, 3).every(v => v == null || Number.isNaN(v))).toBe(true);
        const desc = items.orderByDesc(x => x.v).map(x => x.v);
        expect(desc.slice(0, 3)).toEqual([3, 2, 1]);
    });

    test('orderBy with missing keys is stable and thenBy breaks ties', () => {
        const items = [{ a: null, b: 2 }, { a: 1, b: 0 }, { a: undefined, b: 1 }];
        const sorted = items.orderBy(x => x.a).thenBy(x => x.b);
        expect(sorted.map(x => x.b)).toEqual([1, 2, 0]);
    });

    test('LazyQuery.orderBy handles missing keys too', () => {
        expect(new LazyQuery([3, null, 1, undefined, 2]).orderBy(x => x)).toEqual([null, undefined, 1, 2, 3]);
    });

    test('Array take/skip with a negative count behave like LINQ and LazyQuery', () => {
        expect([1, 2, 3, 4].take(-1)).toEqual([]);
        expect([1, 2, 3, 4].skip(-1)).toEqual([1, 2, 3, 4]);
        expect([1, 2, 3, 4].take(-1)).toEqual(new LazyQuery([1, 2, 3, 4]).take(-1).toArray());
        expect([1, 2, 3, 4].skip(-1)).toEqual(new LazyQuery([1, 2, 3, 4]).skip(-1).toArray());
    });

    test('set operations do not treat a string and an object with the same JSON as equal', () => {
        const obj = { a: 1 };
        const str = '{"a":1}';
        expect([str, obj].distinct()).toEqual([str, obj]);
        expect([str].intersect([obj])).toEqual([]);
        expect([str].except([obj])).toEqual([str]);
        expect([str].union([obj])).toEqual([str, obj]);
        expect(new LazyQuery([str, obj]).distinct().toArray()).toEqual([str, obj]);
        expect([{ a: 1 }, { a: 1 }, 'x', 'x', 1, 1].distinct()).toEqual([{ a: 1 }, 'x', 1]);
    });

    test('Array callbacks receive (item, index, array) as typed in index.d.ts', () => {
        const arr = [10, 20, 30];
        const seen = [];
        const spy = (item, index, array) => { seen.push([item, index, array === arr]); return false; };
        const callbacks = {
            where: () => arr.where(spy).toArray(),
            select: () => arr.select(spy).toArray(),
            selectMany: () => arr.selectMany((x, i, a) => { spy(x, i, a); return []; }).toArray(),
            first: () => { try { arr.first(spy); } catch (e) { /* no match */ } },
            firstOrDefault: () => arr.firstOrDefault(spy),
            last: () => { try { arr.last(spy); } catch (e) { /* no match */ } },
            lastOrDefault: () => arr.lastOrDefault(spy),
            any: () => arr.any(spy),
            count: () => arr.count(spy),
            sum: () => arr.sum((x, i, a) => { spy(x, i, a); return 0; }),
            average: () => arr.average((x, i, a) => { spy(x, i, a); return 0; }),
            min: () => arr.min((x, i, a) => { spy(x, i, a); return 0; }),
            max: () => arr.max((x, i, a) => { spy(x, i, a); return 0; }),
        };
        for (const [name, call] of Object.entries(callbacks)) {
            seen.length = 0;
            call();
            const sorted = [...seen].sort((p, q) => p[1] - q[1]);
            expect({ name, seen: sorted }).toEqual({
                name,
                seen: [[10, 0, true], [20, 1, true], [30, 2, true]],
            });
        }
        expect([1, 1, 1].sum((x, i) => i)).toBe(3);
        expect([5, 6, 7].count((x, i) => i === 2)).toBe(1);
    });
});

describe('Array and LazyQuery callback parity', () => {
    test('takeWhile, skipWhile and distinctBy call the callback with the item only, like LazyQuery', () => {
        const usesSecondArg = (x, i) => i === undefined;
        const data = [1, 2, 3];
        expect(data.takeWhile(usesSecondArg)).toEqual(new LazyQuery(data).takeWhile(usesSecondArg).toArray());
        expect(data.skipWhile(usesSecondArg)).toEqual(new LazyQuery(data).skipWhile(usesSecondArg).toArray());
        const keyOf = (x, i) => (i === undefined ? x % 2 : i);
        expect(data.distinctBy(keyOf)).toEqual(new LazyQuery(data).distinctBy(keyOf).toArray());
        expect(data.takeWhile(usesSecondArg)).toEqual([1, 2, 3]);
        expect(data.distinctBy(keyOf)).toEqual([1, 2]);
    });
});
