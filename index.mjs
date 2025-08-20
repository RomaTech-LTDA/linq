function compare(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

// Projection & Transformation

Object.defineProperty(Array.prototype, 'select', {
    enumerable: false,
    value: function (selector = x => x) {
        return this.map(selector);
    },
});

Object.defineProperty(Array.prototype, 'selectMany', {
    enumerable: false,
    value: function (selector) {
        return this.flatMap(selector);
    },
});

Object.defineProperty(Array.prototype, 'cast', {
    enumerable: false,
    value: function () {
        return this.map(x => x);
    },
});

Object.defineProperty(Array.prototype, 'ofType', {
    enumerable: false,
    value: function (type) {
        return this.filter(x => typeof x === type);
    },
});

// Access & Query

Object.defineProperty(Array.prototype, 'where', {
    enumerable: false,
    value: function (predicate = x => x) {
        return this.filter(predicate);
    },
});

Object.defineProperty(Array.prototype, 'first', {
    enumerable: false,
    value: function (predicate) {
        return predicate ? this.find(predicate) : this[0];
    },
});

Object.defineProperty(Array.prototype, 'firstOrDefault', {
    enumerable: false,
    value: function (predicate) {
        return this.where(predicate)[0] ?? null;
    },
});

Object.defineProperty(Array.prototype, 'last', {
    enumerable: false,
    value: function (predicate) {
        const list = predicate ? this.filter(predicate) : this;
        return list[list.length - 1];
    },
});

Object.defineProperty(Array.prototype, 'lastOrDefault', {
    enumerable: false,
    value: function (predicate) {
        const list = predicate ? this.filter(predicate) : this;
        return list.length ? list[list.length - 1] : null;
    },
});

Object.defineProperty(Array.prototype, 'single', {
    enumerable: false,
    value: function (predicate = x => x) {
        const filtered = this.filter(predicate);
        if (filtered.length !== 1) throw new Error('Sequence does not contain exactly one element');
        return filtered[0];
    },
});

Object.defineProperty(Array.prototype, 'singleOrDefault', {
    enumerable: false,
    value: function (predicate = x => x) {
        const filtered = this.filter(predicate);
        if (filtered.length > 1) throw new Error('Sequence contains more than one element');
        return filtered[0] ?? null;
    },
});

Object.defineProperty(Array.prototype, 'any', {
    enumerable: false,
    value: function (predicate) {
        return predicate ? this.some(predicate) : this.length > 0;
    },
});

Object.defineProperty(Array.prototype, 'all', {
    enumerable: false,
    value: function (predicate) {
        return this.every(predicate);
    },
});

Object.defineProperty(Array.prototype, 'contains', {
    enumerable: false,
    value: function (value) {
        return this.includes(value);
    },
});

Object.defineProperty(Array.prototype, 'elementAt', {
    enumerable: false,
    value: function (index = 0) {
        if (index < 0 || index >= this.length) throw new Error('Index out of range');
        return this[index];
    },
});

Object.defineProperty(Array.prototype, 'elementAtOrDefault', {
    enumerable: false,
    value: function (index) {
        return this[index] ?? null;
    },
});

// Aggregation

Object.defineProperty(Array.prototype, 'count', {
    enumerable: false,
    value: function (predicate) {
        return predicate ? this.filter(predicate).length : this.length;
    },
});

Object.defineProperty(Array.prototype, 'sum', {
    enumerable: false,
    value: function (selector) {
        return this.reduce((acc, x) => acc + (selector ? selector(x) : x), 0);
    },
});

Object.defineProperty(Array.prototype, 'average', {
    enumerable: false,
    value: function (selector) {
        const values = selector ? this.map(selector) : this;
        return values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    },
});

Object.defineProperty(Array.prototype, 'min', {
    enumerable: false,
    value: function (selector) {
        const values = selector ? this.map(selector) : this;
        return Math.min(...values);
    },
});

Object.defineProperty(Array.prototype, 'max', {
    enumerable: false,
    value: function (selector) {
        const values = selector ? this.map(selector) : this;
        return Math.max(...values);
    },
});

Object.defineProperty(Array.prototype, 'aggregate', {
    enumerable: false,
    value: function (accumulator, seed) {
        return this.reduce(accumulator, seed);
    },
});

// Sorting & Flow

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

function addChainMethods(array, selectors, directions) {
  Object.defineProperty(array, 'thenBy', {
    enumerable: false,
    value: function (fn) {
      return chainSort(this, [...selectors, fn], [...directions, false]);
    },
  });

  Object.defineProperty(array, 'thenByDesc', {
    enumerable: false,
    value: function (fn) {
      return chainSort(this, [...selectors, fn], [...directions, true]);
    },
  });

  return array;
}

Object.defineProperty(Array.prototype, 'orderBy', {
  enumerable: false,
  value: function (fn) {
    return chainSort(this, [fn], [false]);
  },
});

Object.defineProperty(Array.prototype, 'orderByDesc', {
  enumerable: false,
  value: function (fn) {
    return chainSort(this, [fn], [true]);
  },
});

Object.defineProperty(Array.prototype, 'take', {
    enumerable: false,
    value: function (n) {
        return this.slice(0, n);
    },
});

Object.defineProperty(Array.prototype, 'skip', {
    enumerable: false,
    value: function (n) {
        return this.slice(n);
    },
});

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

Object.defineProperty(Array.prototype, 'union', {
    enumerable: false,
    value: function (other) {
        return [...this, ...other].distinct();
    },
});

Object.defineProperty(Array.prototype, 'intersect', {
    enumerable: false,
    value: function (other) {
        const set = new Set(other.map(x => JSON.stringify(x)));
        return this.filter(x => set.has(JSON.stringify(x)));
    },
});

Object.defineProperty(Array.prototype, 'except', {
    enumerable: false,
    value: function (other) {
        const set = new Set(other.map(x => JSON.stringify(x)));
        return this.filter(x => !set.has(JSON.stringify(x)));
    },
});

// Joins & Grouping

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

Object.defineProperty(Array.prototype, 'toDictionary', {
    enumerable: false,
    value: function (keySelector, valueSelector = x => x) {
        return this.reduce((dict, item) => {
            dict[keySelector(item)] = valueSelector(item);
            return dict;
        }, {});
    },
});

Object.defineProperty(Array.prototype, 'append', {
    enumerable: false,
    value: function (item) {
        return [...this, item];
    },
});

Object.defineProperty(Array.prototype, 'prepend', {
    enumerable: false,
    value: function (item) {
        return [item, ...this];
    },
});

Object.defineProperty(Array.prototype, 'defaultIfEmpty', {
    enumerable: false,
    value: function (defaultValue) {
        return this.length ? this : [defaultValue];
    },
});

Object.defineProperty(Array.prototype, 'sequenceEqual', {
    enumerable: false,
    value: function (other) {
        if (this.length !== other.length) return false;
        return this.every((val, i) => JSON.stringify(val) === JSON.stringify(other[i]));
    },
});

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

export default {};
