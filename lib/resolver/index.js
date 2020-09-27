/**
 * @file jsResolver
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/24
 *
 */
var parseToAst = require('./parseToAst')
var traverse = require('@babel/traverse').default

module.exports = (source, options) => {
  var ast = typeof source !== 'string' ? source : parseToAst(source)
  var holder = { result: [] }
  traverse(
    ast,
    {
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
    },
    null,
    holder
  )

  return holder.result
}
