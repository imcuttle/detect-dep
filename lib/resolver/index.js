/**
 * @file jsResolver
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/24
 *
 */
const parseToAst = require('./parseToAst')
const traverse = require('@babel/traverse').default

module.exports = (source, options) => {
  const ast = typeof source !== 'string' ? source : parseToAst(source)
  const holder = { result: [] }

  traverse(
    ast,
    {
      CallExpression(path, state) {
        const name = path.get('callee').node.name
        const args = path.node.arguments
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
        const source = path.get('source')
        state.result.push(source.node.value)
      },
      ExportAllDeclaration(path, state) {
        if (!options.es6Export) {
          return
        }
        const source = path.get('source')
        state.result.push(source.node.value)
      },
      ExportNamedDeclaration(path, state) {
        if (!options.es6Export) {
          return
        }
        const source = path.get('source')
        state.result.push(source.node.value)
      }
    },
    null,
    holder
  )

  return holder.result
}
