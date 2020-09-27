/**
 * @file getImports
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
var nps = require('path')
var uniq = require('array-uniq')
var defaultFs = require('fs')
const resolvePath = require("./resolvePath");

function isModulePath(path) {
  return !isLocalPath(path)
}

function isLocalPath(path) {
  path = path || ''
  path = path.trim()

  return nps.isAbsolute(path) || path.startsWith('.')
}

const defaultOpts = {
  es6Import: true,
  es6Export: true,
  es6: true,
  requireImport: true,
  localImport: true,
  moduleImport: true,
  allowWithoutExports: true,
  returnAbsolutePath: true,
  from: null,
  recursive: true,
  resolver: require('./resolver'),
  resolveExtensions: Object.keys(require.extensions),
  extensions: ['.js', '.jsx', '.node', '.json']
}

function getOpts(options) {
  options = Object.assign({}, defaultOpts, options)
  if (!options.es6) {
    options.es6Import = options.es6Export = false
  }

  return options
}

/**
 * @typedef {Object}
 * @public
 * @name AST
 * @see [Abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
 * @see [babylon](https://github.com/babel/babel/tree/master/packages/babylon)
 */

/**
 *
 * @public
 * @param source {String|AST}
 * @param options {Object}
 * @param [options.es6Import=true] {Boolean}
 *    whether detecting `import ...` or not
 * @param [options.requireImport=true] {Boolean}
 *    whether detecting `require('...')` or not
 * @param [options.localImport=true] {Boolean}
 *    whether requiring `require('./local/path')` or not
 * @param [options.moduleImport=true] {Boolean}
 *    whether requiring `require('path')` or not
 * @param [options.extensions=['.js', '.jsx']] {string[]}
 *    Which file with matching extension should be detected recursively
 * @param [options.resolveExtensions=Object.keys(require.extensions)] {string[]}
 *    The resolved path's extensions which are allowed (would be extends options.extensions)
 * @param [options.from=''] {String}
 *    where is the source come from  (filename)
 * @param [options.recursive=true] {boolean}
 *    Detecting the source recursively.
 * @param [options.resolver=require('./resolver')] {(source, options) => string[]}
 *    The core method for resolving dependencies.
 * @param [options.returnAbsolutePath=true] {boolean}
 *    whether returning the local module's absolute path, or use real module id instead.
 * @todo options.allowWithoutExports {Boolean} true
 * @returns dependencies {String[]} - dependencies list
 * @example
 * const detectDep = require('detect-dep')
 * const dependencies = detectDep('some code', {})
 */
function detectDep(source, options) {
  return detectDepInner(source, options, { tracks: [], checkExtension: false })
}

function detectDepInner(source, options, {tracks = [], ...config} = {}) {
  config = Object.assign(
    {
      checkExtension: true
    },
    config
  )
  const {fs = defaultFs} = config

  tracks = tracks || []
  options = options || {}
  options = getOpts(options)
  if (options.from) {
    options.from = nps.resolve(options.from)

    if (
      config.checkExtension &&
      options.extensions.indexOf(nps.extname(options.from)) < 0
    ) {
      return []
    }
  }

  var result = options.resolver(source, options) || []

  var resolveExtensions = uniq(
    options.extensions.concat(options.resolveExtensions)
  )
  if (options.from && !!options.recursive) {
    var newPaths = []
    result = result.map(function(path) {
      if (isLocalPath(path)) {
        var local = resolvePath(path, {
          fs,
          basedir: nps.dirname(options.from),
          moduleFileExtensions: resolveExtensions
        })
        if (
          !tracks.includes(local) &&
          options.extensions.indexOf(nps.extname(local)) >= 0
        ) {
          tracks.push(local)
          newPaths = newPaths.concat(
            detectDepInner(
              fs.readFileSync(local).toString(),
              Object.assign({}, options, { from: local }),
              {
                ...config,
                tracks
              }
            )
          )
        }
      }
      return path
    })
  }

  result = result.concat(newPaths).filter(Boolean)
  if (!options.moduleImport) {
    result = result.filter(isLocalPath)
  }
  if (!options.localImport) {
    result = result.filter(isModulePath)
  }

  result = uniq(result)

  if (!options.returnAbsolutePath) {
    return result
  }

  var map = {},
    tmpResult = []
  if (options.from) {
    map[options.from] = true
  }
  result.forEach(function(path) {
    var abPath = path
    if (isLocalPath(path) && options.from) {
      abPath = resolvePath(path, {
        fs,
        basedir: nps.dirname(options.from),
        moduleFileExtensions: resolveExtensions
      })
      if (!map.hasOwnProperty(abPath)) {
        tmpResult.push(abPath)
      }
      map[abPath] = true
    } else {
      if (!map.hasOwnProperty(abPath)) {
        tmpResult.push(abPath)
      }
      map[abPath] = true
    }
  })
  return tmpResult
}

/**
 * @public
 * @typedef {Object}
 * @name Module
 * @property id {string}
 * @property children {Module[]}
 */

/**
 * @public
 * @param path {string}
 * @param opts - See `detectDep`
 * @example
 * const detectDep = require('detect-dep')
 * const moduleTree = detectDep.tree('/path/to/file')
 *
 * {
 *   id: '/path/to/file',
 *   children: [
 *     {
 *       id: '/path/to/file/a.js',
 *       children: []
 *     }
 *   ]
 * }
 * @return {Module}
 */
function tree(path, {fs = defaultFs, ...opts} = {}) {
  function treeRecursive(path, opts, map) {
    path = nps.resolve(path)

    if (map.hasOwnProperty(path)) {
      return map[path]
    }

    const dependencies = detectDepInner(
      fs.readFileSync(path).toString(),
      {
        ...opts,
        from: path,
        recursive: false,
        returnAbsolutePath: true
      },
      { checkExtension: true, tracks: [] }
    )

    map[path] = {
      id: path
    }
    map[path].children = dependencies.map(filename => {
      return treeRecursive(filename, opts, map)
    })

    return map[path]
  }

  return treeRecursive(path, opts, {})
}

module.exports = detectDep
module.exports.defaultOpts = defaultOpts
module.exports.tree = tree
