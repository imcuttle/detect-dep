# detect-dep

Detect the dependencies of import/require by walking AST

[![build status](https://img.shields.io/travis/imcuttle/detect-dep/master.svg?style=flat-square)](https://travis-ci.org/imcuttle/detect-dep)
[![Test coverage](https://img.shields.io/codecov/c/github/imcuttle/detect-dep.svg?style=flat-square)](https://codecov.io/github/imcuttle/detect-dep?branch=master)
[![NPM version](https://img.shields.io/npm/v/detect-dep.svg?style=flat-square)](https://www.npmjs.com/package/detect-dep)
[![NPM Downloads](https://img.shields.io/npm/dm/detect-dep.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/detect-dep)

## Install

```bash
npm install detect-dep --save
```

## Usage

```javascript
const detectDep = require('detect-dep')
const dependencies = detectDep('some code')
```

## CLI

```bash
npm i detect-dep -g
detect-dep --help
detect-dep --version
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### AST

[lib/detectDep.js:76-171](https://github.com/imcuttle/detect-dep/blob/0319b2ace09658624e5fd2b563109120e3d90dcf/lib/detectDep.js#L76-L171 "Source code on GitHub")

-   **See: [Abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)**
-   **See: [babylon](https://github.com/babel/babel/tree/master/packages/babylon)**

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### detectDep

[lib/detectDep.js:76-171](https://github.com/imcuttle/detect-dep/blob/0319b2ace09658624e5fd2b563109120e3d90dcf/lib/detectDep.js#L76-L171 "Source code on GitHub")

**Parameters**

-   `source`  {String|AST}
-   `options`  {Object}
    -   `options.es6Import`  {Boolean}
           whether detecting `import ...` or not (optional, default `true`)
    -   `options.requireImport`  {Boolean}
           whether detecting `require('...')` or not (optional, default `true`)
    -   `options.localImport`  {Boolean}
           whether requiring `require('./local/path')` or not (optional, default `true`)
    -   `options.moduleImport`  {Boolean}
           whether requiring `require('path')` or not (optional, default `true`)
    -   `options.extensions`  {string\[]}
           Which file with matching extension should be detected recursively (optional, default `['.js','.jsx']`)
    -   `options.resolveExtensions`  {string\[]}
           The resolved path's extensions which are allowed (would be extends options.extensions) (optional, default `Object.keys(require.extensions)`)
    -   `options.from`  {String}
           where is the source come from  (filename) (optional, default `''`)
    -   `options.recursive`  {boolean}
           detecting the source recursively. (optional, default `true`)
-   `tracks`  

**Examples**

```javascript
const detectDep = require('detect-dep')
const dependencies = detectDep('some code', {})
```

Returns **any** dependencies {String\[]} - dependencies list

## Related

-   [hot-module-require](https://github.com/imcuttle/hot-module-require) - Detect module's update recursively on Node.js

## License

MIT
