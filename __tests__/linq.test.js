require('../index');

describe('Array.prototype LINQ-like extensions', () => {
  const data = [1, 2, 3, 4, 5];

  test('select', () => {
    expect(data.select(x => x * 2)).toEqual([2, 4, 6, 8, 10]);
  });

  test('selectMany', () => {
    const nested = [[1], [2, 3], [4]];
    expect(nested.selectMany(x => x)).toEqual([1, 2, 3, 4]);
  });

  test('cast', () => {
    expect(data.cast()).toEqual(data);
  });

  test('ofType', () => {
    const mixed = [1, 'a', true, 2];
    expect(mixed.ofType('number')).toEqual([1, 2]);
  });

  test('where', () => {
    expect(data.where(x => x > 3)).toEqual([4, 5]);
  });

  test('first', () => {
    expect(data.first()).toBe(1);
    expect(data.first(x => x > 3)).toBe(4);
  });

  test('firstOrDefault', () => {
    expect(data.firstOrDefault(x => x > 10)).toBeNull();
    expect(data.firstOrDefault(x => x > 3)).toBe(4);
  });

  test('last', () => {
    expect(data.last()).toBe(5);
    expect(data.last(x => x < 4)).toBe(3);
  });

  test('lastOrDefault', () => {
    expect(data.lastOrDefault(x => x > 10)).toBeNull();
    expect(data.lastOrDefault(x => x > 2)).toBe(5);
  });

  test('single', () => {
    expect([42].single()).toBe(42);
  });

  test('singleOrDefault', () => {
    expect([42].singleOrDefault()).toBe(42);
    expect([].singleOrDefault()).toBeNull();
  });

  test('any', () => {
    expect(data.any()).toBe(true);
    expect(data.any(x => x > 4)).toBe(true);
  });

  test('all', () => {
    expect(data.all(x => x > 0)).toBe(true);
  });

  test('contains', () => {
    expect(data.contains(3)).toBe(true);
  });

  test('elementAt', () => {
    expect(data.elementAt(2)).toBe(3);
  });

  test('elementAtOrDefault', () => {
    expect(data.elementAtOrDefault(10)).toBeNull();
    expect(data.elementAtOrDefault(0)).toBe(1);
  });

  test('count', () => {
    expect(data.count()).toBe(5);
    expect(data.count(x => x > 2)).toBe(3);
  });

  test('sum', () => {
    expect(data.sum()).toBe(15);
  });

  test('average', () => {
    expect(data.average()).toBe(3);
  });

  test('min', () => {
    expect(data.min()).toBe(1);
  });

  test('max', () => {
    expect(data.max()).toBe(5);
  });

  test('aggregate', () => {
    expect(data.aggregate((a, b) => a + b, 0)).toBe(15);
  });

  test('orderBy / thenBy', () => {
    const complex = [{ a: 2, b: 1 }, { a: 1, b: 2 }, { a: 1, b: 1 }];
    const sorted = complex.orderBy(x => x.a).thenBy(x => x.b);
    expect(sorted.map(x => `${x.a}-${x.b}`)).toEqual(['1-1', '1-2', '2-1']);
  });

  test('take', () => {
    expect(data.take(3)).toEqual([1, 2, 3]);
  });

  test('skip', () => {
    expect(data.skip(2)).toEqual([3, 4, 5]);
  });

  test('takeWhile', () => {
    expect(data.takeWhile(x => x < 4)).toEqual([1, 2, 3]);
  });

  test('skipWhile', () => {
    expect(data.skipWhile(x => x < 4)).toEqual([4, 5]);
  });

  test('distinct', () => {
    expect([1, 1, 2, 3, 3].distinct()).toEqual([1, 2, 3]);
  });

  test('distinctBy', () => {
    const people = [{ id: 1 }, { id: 1 }, { id: 2 }];
    expect(people.distinctBy(x => x.id)).toEqual([{ id: 1 }, { id: 2 }]);
  });

  test('union', () => {
    expect([1, 2].union([2, 3])).toEqual([1, 2, 3]);
  });

  test('intersect', () => {
    expect([1, 2, 3].intersect([2, 3, 4])).toEqual([2, 3]);
  });

  test('except', () => {
    expect([1, 2, 3].except([2])).toEqual([1, 3]);
  });

  test('join', () => {
    const a = [{ id: 1 }, { id: 2 }];
    const b = [{ id: 1, value: 'x' }];
    const result = a.join(b, x => x.id, x => x.id, (x, y) => ({ x, y }));
    expect(result.length).toBe(1);
    expect(result[0].x.id).toBe(1);
  });

  test('groupJoin', () => {
    const a = [{ id: 1 }, { id: 2 }];
    const b = [{ id: 1, val: 'x' }, { id: 1, val: 'y' }];
    const result = a.groupJoin(b, x => x.id, x => x.id, (x, ys) => ys);
    expect(result[0].length).toBe(2);
  });

  test('groupBy', () => {
    const values = [1, 2, 2, 3];
    const groups = values.groupBy(x => x);
    expect(groups[2]).toEqual([2, 2]);
  });

  test('toDictionary', () => {
    const dict = [{ id: 1 }, { id: 2 }].toDictionary(x => x.id);
    expect(dict[1]).toEqual({ id: 1 });
  });

  test('append / prepend', () => {
    expect([2, 3].append(4)).toEqual([2, 3, 4]);
    expect([2, 3].prepend(1)).toEqual([1, 2, 3]);
  });

  test('defaultIfEmpty', () => {
    expect([].defaultIfEmpty(42)).toEqual([42]);
    expect([1].defaultIfEmpty(42)).toEqual([1]);
  });

  test('sequenceEqual', () => {
    expect([1, 2].sequenceEqual([1, 2])).toBe(true);
    expect([1, 2].sequenceEqual([2, 1])).toBe(false);
  });

  test('zip', () => {
    expect([1, 2].zip(['a', 'b'], (x, y) => `${x}${y}`)).toEqual(['1a', '2b']);
  });
});
