# detect-dep

[![Build status](https://img.shields.io/travis/imcuttle/detect-dep/master.svg?style=flat-square)](https://travis-ci.org/imcuttle/detect-dep)
[![Test coverage](https://img.shields.io/codecov/c/github/imcuttle/detect-dep.svg?style=flat-square)](https://codecov.io/github/imcuttle/detect-dep?branch=master)
[![NPM version](https://img.shields.io/npm/v/detect-dep.svg?style=flat-square)](https://www.npmjs.com/package/detect-dep)
[![NPM Downloads](https://img.shields.io/npm/dm/detect-dep.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/detect-dep)
[![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io/)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=flat-square)](https://conventionalcommits.org)

> Detect the dependencies by walking AST

**Support detecting dynamic import and `require.context`**

## Installation

```bash
npm install detect-dep
# or use yarn
yarn add detect-dep
```

## Usage

### Package

```javascript
import { detectDep } from 'detect-dep'
const dependencies = detectDep('some code' /* opts */)
```

### Cli

```bash
npm i detect-dep -g
detect-dep --help
detect-dep --version
```

## API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### AST

[lib/index.js:97-99](https://github.com/imcuttle/detect-dep/blob/3abe7e1f28d2c9338023df443cb59f656e9fe748/lib/index.js#L51-L57 'Source code on GitHub')

- **See: [Abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
  **
- **See: [babylon](https://github.com/babel/babel/tree/master/packages/babylon)
  **

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### detectDep

[lib/index.js:97-99](https://github.com/imcuttle/detect-dep/blob/3abe7e1f28d2c9338023df443cb59f656e9fe748/lib/index.js#L97-L99 'Source code on GitHub')

#### Parameters

- `source` {String|AST}
- `options` {Object}
  - `options.esModule` {Boolean}
    Disable `esExport` `esImport` `dynamicImport` when is falsy (optional, default `true`)
  - `options.requireContext` {Boolean}
    whether detecting `require.context('./root', false, /\.jsx?$/)` or not (optional, default `true`)
  - `options.dynamicImport` {Boolean}
    whether detecting `import('./foo')` `import('./foo/' + name)` or not (optional, default `true`)
  - `options.esExport` {Boolean}
    whether detecting `export xx from 'xxx'` or not (optional, default `true`)
  - `options.esImport` {Boolean}
    whether detecting `import ...` or not (optional, default `true`)
  - `options.requireImport` {Boolean}
    whether detecting `require('...')` or not (optional, default `true`)
  - `options.localImport` {Boolean}
    whether requiring `require('./local/path')` or not (optional, default `true`)
  - `options.moduleImport` {Boolean}
    whether requiring `require('path')` or not (optional, default `true`)
  - `options.extensions` {string\[]}
    Which file with matching extension should be detected recursively (optional, default `['.js','.jsx']`)
  - `options.resolveExtensions` {string\[]}
    The resolved path's extensions which are allowed (would be extends options.extensions) (optional, default `Object.keys(require.extensions)`)
  - `options.from` {String}
    where is the source come from (filename) (optional, default `''`)
  - `options.recursive` {boolean}
    Detecting the source recursively. (optional, default `true`)
  - `options.resolver` {(source, options) => string\[]}
    The core method for resolving dependencies. (optional, default `require('./resolver')`)
  - `options.returnAbsolutePath` {boolean}
    whether returning the local module's absolute path, or use real module id instead. (optional, default `true`)

#### Examples

```javascript
const { detectDep } = require('detect-dep')
const dependencies = detectDep('some code', {})
```

Returns **any** dependencies {String\[]} - dependencies list

### Module

[lib/index.js:196-214](https://github.com/imcuttle/detect-dep/blob/3abe7e1f28d2c9338023df443cb59f656e9fe748/lib/index.js#L170-L176 'Source code on GitHub')

Type: [Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)

### tree

[lib/index.js:196-214](https://github.com/imcuttle/detect-dep/blob/3abe7e1f28d2c9338023df443cb59f656e9fe748/lib/index.js#L196-L214 'Source code on GitHub')

#### Parameters

- `path` {string}
- `options` See `detectDep` (optional, default `{}`)

#### Examples

```javascript
const {tree} = require('detect-dep')
const moduleTree = tree('/path/to/file')

{
  id: '/path/to/file',
  children: [
    {
      id: '/path/to/file/b.jsx',
      children: []
    }
  ]
}
```

Returns **[Module](#module)**

## Contributing

- Fork it!
- Create your new branch:  
  `git checkout -b feature-new` or `git checkout -b fix-which-bug`
- Start your magic work now
- Make sure npm test passes
- Commit your changes:  
  `git commit -am 'feat: some description (close #123)'` or `git commit -am 'fix: some description (fix #123)'`
- Push to the branch: `git push`
- Submit a pull request :)

## Authors

This library is written and maintained by imcuttle, <a href="mailto:moyuyc95@gmail.com">moyuyc95@gmail.com</a>.

## License

MIT - [imcuttle](https://github.com/imcuttle) 🐟
