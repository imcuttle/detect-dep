/**
 * @file getImports
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
var parseToAst = require('./parseToAst')
var traverse = require('babel-traverse').default
var nps = require('path')

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
    allowWithoutExports: true
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
 *  whether detecting `import ...` or not
 * @param [options.requireImport=true] {Boolean}
 *  whether detecting `require('...')` or not
 * @param [options.localImport=true] {Boolean}
 *  whether requiring `require('./local/path')` or not
 * @param [options.moduleImport=true] {Boolean}
 *  whether requiring `require('path')` or not
 * @todo options.allowWithoutExports {Boolean} true
 * @returns dependencies {String[]} - dependencies list
 * @example
 * const detectDep = require('detect-dep')
 * const dependencies = detectDep('some code', {})
 */
module.exports = function detectDep(source, options) {
  options = options || {}
  options = getOpts(options)

  var ast = parseToAst(source)
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

  if (!options.moduleImport) {
    holder.result = holder.result.filter(isLocalPath)
  }
  if (!options.localImport) {
    holder.result = holder.result.filter(isModulePath)
  }

  return holder.result
}
