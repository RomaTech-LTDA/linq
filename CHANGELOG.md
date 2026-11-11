# Changelog

All notable changes to @romatech/linq will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [3.4.0] - 2026-11-11

This version is higher than every version already on npm (1.0.0, 1.0.1, 2.0.0,
3.0.0 and 3.3.0), so projects on `^3` receive it. The code published as 2.0.0,
3.0.0 and 3.3.0 is the same (3.0.0 differs only in line endings); 3.4.0
replaces all three. The `latest` dist-tag on npm still points to 2.0.0; a
normal `npm publish` of 3.4.0 moves it to 3.4.0.

### Breaking
- No change to the exported API or to `index.d.ts`. Two fixes below change the
  result of existing code; read the **Behavior change** notes before upgrading.

### Security
- No runtime dependencies; `npm audit --omit=dev` reports 0 vulnerabilities.
- Dev dependencies (Jest 29 tree) updated within their semver ranges, which
  removes the high and moderate advisories. Six low advisories remain in
  `jest` → `deepmerge`; they need Jest 30 (major) and do not ship in the package.

### Fixed
- The `Array.prototype` methods were defined non-writable and non-configurable.
  Loading the CommonJS and ES module builds in the same process, or loading
  another package that defines `orderBy` (such as `@romatech/order-by`) after
  this one, threw `TypeError: Cannot redefine property`, and assigning a
  same-named own property on an array (`arr.count = 1`) threw in strict mode.
  They are now writable and configurable, like built-in methods. A package
  loaded later can now replace a method without an error.
- `orderBy`, `orderByDesc`, `thenBy` and `thenByDesc` (on `Array` and on
  `LazyQuery`) with `undefined` or `NaN` sort keys made the comparator
  inconsistent, so the result could come back unsorted (keys
  `[3, undefined, 1, 2]` stayed `[3, undefined, 1, 2]`).
- `Array.prototype.take(n)` and `skip(n)` with a negative `n` returned `slice`
  results (`[1,2,3,4].take(-1)` gave `[1,2,3]`, `skip(-1)` gave `[4]`). They now
  match LINQ and `LazyQuery`: `take` returns `[]` and `skip` returns every element.
- The set operations (`distinct`, `union`, `intersect`, `except`, on `Array` and
  on `LazyQuery`) treated a string and an object with the same JSON
  (`'{"a":1}'` and `{ a: 1 }`) as the same element.
- The `Array` callbacks now receive `(item, index, array)`, as `index.d.ts`
  declares:
  - `first`, `firstOrDefault`, `last`, `lastOrDefault`, `any`, `count`, `sum`,
    `average`, `min` and `max` received only the item; `index` and `array` were
    `undefined` (`[1,1,1].sum((x, i) => i)` gave `NaN`, now `3`).
  - `where`, `select` and `selectMany` already received `(item, index)`; they
    now also receive `array`.
  - `single`, `singleOrDefault` and `all` already received all three.
  - `takeWhile`, `skipWhile`, `distinctBy`, `orderBy`/`thenBy`, `groupBy`,
    `toDictionary`, `toMap` and the join key selectors still receive only the
    item, as their typings and the `LazyQuery` versions do.

### Changed
- **Behavior change:** `null`, `undefined` and `NaN` sort keys are equal to each
  other and smaller than every other key: they come first with
  `orderBy`/`thenBy` and last with `orderByDesc`/`thenByDesc`, as `null` does
  in C#. Before, among numeric keys a `null` key was compared as `0`, so it now
  moves before negative numbers: `[-1, null, 1]` used to stay in that order and
  now becomes `[null, -1, 1]`; `undefined` and `NaN` keys used to leave the
  result unsorted. Keys of mixed types (numbers and strings) still have no
  defined order.
- **Behavior change:** the `Array` callbacks of `first`, `firstOrDefault`,
  `last`, `lastOrDefault`, `any`, `count`, `sum`, `average`, `min` and `max`
  now receive the index as their second argument, and every callback listed
  under Fixed receives the array as its third. A function passed directly that
  uses those parameters behaves differently. For example
  `['10', '10'].sum(parseInt)` gave `20` and now parses with the index as the
  radix and returns `NaN`; write `sum(x => parseInt(x, 10))`.
- README: on a plain `Array`, `take`, `skip`, `distinct` and the other set
  operators run immediately and return an `Array`; only `where`, `select`,
  `selectMany`, `cast` and `ofType` start a lazy query. The ordering of missing
  keys is documented.
- Landing page (`index.html`, GitHub Pages only, not in the package) moved to the
  shared template.
- CI runs `npm ci` and the tests on Node 22 and 24 with read-only permissions;
  `.nvmrc` is now 22 (Node 20 is end of life). The publish workflow uses
  `npm ci` on Node 22, and the GitHub release is created with `gh` in a
  separate job that has `contents: write` but no access to `NPM_TOKEN` (the
  third-party `softprops/action-gh-release` action is no longer used). The
  publish trigger is unchanged: a push to `main` that changes `package.json`
  with a version not yet on npm (the `src/**` and `tsconfig.json` path filters
  were dropped because those files do not exist).

## Earlier releases

Detailed notes were not kept for earlier versions. Published to npm:
1.0.0 (2025-07-10), 1.0.1 (2025-08-20), 3.0.0 (2026-06-15), 3.3.0 (2026-06-18)
and 2.0.0 (2026-06-26). This file previously had a `[3.2.0] - 2026-06-18`
entry; that version was never published.
