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
