# detect-dep

Detect the dependencies of import/require by walking AST

[![build status](https://img.shields.io/travis/imcuttle/detect-dep/master.svg?style=flat-square)](https://travis-ci.org/imcuttle/detect-dep)
[![Test coverage](https://img.shields.io/codecov/c/github/imcuttle/detect-dep.svg?style=flat-square)](https://codecov.io/github/imcuttle/detect-dep?branch=master)
[![NPM version](https://img.shields.io/npm/v/detect-dep.svg?style=flat-square)](https://www.npmjs.com/package/detect-dep)
[![NPM Downloads](https://img.shields.io/npm/dm/detect-dep.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/detect-dep)

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### AST

[lib/detectDep.js:59-92](https://github.com/imcuttle/detect-dep/blob/934fea49b89f5a2e5bb6e6f1609ea780c3d8f8d4/lib/detectDep.js#L59-L92 "Source code on GitHub")

-   **See: [Abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)**
-   **See: [babylon](https://github.com/babel/babel/tree/master/packages/babylon)**

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### detectDep

[lib/detectDep.js:59-92](https://github.com/imcuttle/detect-dep/blob/934fea49b89f5a2e5bb6e6f1609ea780c3d8f8d4/lib/detectDep.js#L59-L92 "Source code on GitHub")

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

**Examples**

```javascript
const detectDep = require('detect-dep')
const dependencies = detectDep('some code', {})
```

Returns **any** dependencies {String\[]} - dependencies list
