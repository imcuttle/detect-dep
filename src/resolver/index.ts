/**
 * @file jsResolver
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/24
 *
 */
import { DetectDepOpts } from '../index'
import parseToAst from './parseToAst'
import traverse from '@babel/traverse'

module.exports = (source: string | import('@babel/types').File, options: DetectDepOpts = {}) => {
  const ast = typeof source !== 'string' ? source : parseToAst(source, options.parserOpts)
  const holder = { result: [] }

  traverse(
    ast,
    {
      CallExpression(path: any, state) {
        const { name, type } = path.get('callee').node
        const args = path.node.arguments
        // require('./foo')
        if (options.requireImport && name === 'require') {
          if (args && !!args.length && args[0].value) {
            state.result.push(args[0].value)
          }
        }

        // import('./foo')
        if (options.dynamicImport && type === 'import') {
          if (args && !!args.length) {
            // import(`./foo/${name}`);
            if (args[0].type === 'TemplateLiteral') {
            }
            // import('./foo');
            else if (args[0].type === 'StringLiteral') {
              state.result.push(args[0].value)
            }
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
