/**
 * @file getImports
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
var parseToAst = require('./parseToAst')
var traverse = require('babel-traverse').default
var nps = require('path')
var uniq = require('array-uniq')
var fs = require('fs')

function isModulePath(path) {
  return !isLocalPath(path)
}

function isLocalPath(path) {
  path = path || ''
  path = path.trim()

  return nps.isAbsolute(path) || path.startsWith('.')
}

function getOpts(options) {
  return Object.assign({
    es6Import: true,
    requireImport: true,
    localImport: true,
    moduleImport: true,
    allowWithoutExports: true,
    from: null,
    recursive: true
  }, options)
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
 * @param [options.from=''] {String}
 *    where is the source from  (filename)
 * @param [options.recursive=true] {boolean}
 *    detecting the source recursively.
 * @todo options.allowWithoutExports {Boolean} true
 * @returns dependencies {String[]} - dependencies list
 * @example
 * const detectDep = require('detect-dep')
 * const dependencies = detectDep('some code', {})
 */
module.exports = function detectDep(source, options, tracks) {
  tracks = tracks || []
  options = options || {}
  options = getOpts(options)
  if (options.from) {
    options.from = nps.resolve(options.from)
  }

  var ast = typeof source !== 'string' ? source : parseToAst(source)
  var holder = { result: [] }
  traverse(ast, {
    CallExpression(path, state) {
      var name = path.get('callee').node.name
      var args = path.node.arguments
      if (options.requireImport && name === 'require') {
        if (args && !!args.length && args[0].value) {
          state.result.push(args[0].value)
        }
      }
    },
    ImportDeclaration(path, state) {
      if (!options.es6Import) {
        return
      }
      var source = path.get('source')
      state.result.push(source.node.value)
    }
  }, null, holder)

  if (options.from && !!options.recursive) {
    var newPaths = []
    holder.result = holder.result.map(function (path) {
      if (isLocalPath(path)) {
        var local = nps.resolve(nps.dirname(options.from), path)
        local = require.resolve(local)
        if (!tracks.includes(local) && local.endsWith('.js') || local.endsWith('.jsx')) {
          tracks.push(local)
          newPaths = newPaths.concat(
            detectDep(
              fs.readFileSync(local).toString(),
              Object.assign({}, options, { from: local }),
              tracks
            )
          )
        }
      }
      return path
    })
  }

  holder.result = holder.result.concat(newPaths).filter(Boolean)
  if (!options.moduleImport) {
    holder.result = holder.result.filter(isLocalPath)
  }
  if (!options.localImport) {
    holder.result = holder.result.filter(isModulePath)
  }

  holder.result = uniq(holder.result)

  var map = {}, result = []
  holder.result.forEach(function (path) {
    var abPath = path
    if (isLocalPath(path)) {
      abPath = nps.resolve(nps.dirname(options.from), path)
      abPath = require.resolve(abPath)
      if (!map[abPath]) {
        result.push(abPath)
      }
      map[abPath] = true
    }
    else {
      if (!map[abPath]) {
        result.push(abPath)
      }
      map[abPath] = true
    }
    // tracks.push(abPath)
  })
  return result
}
