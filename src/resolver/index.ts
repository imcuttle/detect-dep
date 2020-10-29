/**
 * @file jsResolver
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/24
 *
 */
import { DetectDepOpts } from '../index'
import parseToAst from './parseToAst'
import traverse from '@babel/traverse'
import parseRequest from './parseRequest'
import { findMatchFiles } from './utils'

export const resolveDependencies = (node: import('@babel/types').Node, options: DetectDepOpts, path) => {
  try {
    const output = parseRequest(node, { mergeRaw: true })
    // Just supports `require('./context' + name)`
    if (!output.length || output[0].type !== 'raw') {
      return []
    }
    if (output.length === 1) {
      return [output[0].value]
    }

    const [head] = output
    const tail = output[output.length - 1]
    return findMatchFiles(head.value as string, true, tail.type === 'raw' ? (tail.value as string) : null, options)
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`Error happened in code: \`${String(path)}\`, filename: ${options.from}`)
      console.error(err)
    }
    return []
  }
}

export default function resolver(source: string | import('@babel/types').File, options: DetectDepOpts = {}) {
  const ast =
    typeof source !== 'string'
      ? source
      : parseToAst(source, {
          ...(options && options.parserOpts),
          sourceFilename: options.from
        })
  const holder = { result: [] }

  traverse(
    ast,
    {
      CallExpression(path: any, state) {
        const { name, type, object, property } = path.get('callee').node
        const args = path.node.arguments
        // require('./foo')
        if (options.requireImport && name === 'require') {
          if (args && !!args.length) {
            const requestChunks = resolveDependencies(args[0], options, path)
            state.result = state.result.concat(requestChunks)
          }
        }
        // import('./foo')
        else if (options.dynamicImport && type === 'Import') {
          if (args && !!args.length) {
            const requestChunks = resolveDependencies(args[0], options, path)
            state.result = state.result.concat(requestChunks)
          }
        }
        // require.context()
        else if (
          options.requireContext &&
          type === 'MemberExpression' &&
          object.type === 'Identifier' &&
          object.name === 'require' &&
          property.type === 'Identifier' &&
          property.name === 'context'
        ) {
          const [contextNode, recursiveNode, regNode] = args
          const chunks = parseRequest(contextNode, { mergeRaw: true })
          if (chunks.length !== 1 || !chunks[0] || chunks[0].type !== 'raw') {
            return
          }
          if (recursiveNode && recursiveNode.type !== 'BooleanLiteral') {
            return
          }
          if (regNode && regNode.type !== 'RegExpLiteral') {
            return
          }

          const requestChunks = findMatchFiles(
            chunks[0].value as string,
            recursiveNode ? recursiveNode.value : false,
            regNode ? new RegExp(regNode.pattern, regNode.flags) : /^\./,
            options
          )
          state.result = state.result.concat(requestChunks)
        }
        // require.ensure(['react', './root.png'])
        else if (
          options.requireEnsure &&
          type === 'MemberExpression' &&
          object.type === 'Identifier' &&
          object.name === 'require' &&
          property.type === 'Identifier' &&
          property.name === 'ensure'
        ) {
          const [depsNode] = args

          if (depsNode && depsNode.type === 'ArrayExpression' && depsNode.elements.length) {
            const requestChunks = depsNode.elements.reduce(
              (acc, elemNode) => acc.concat(resolveDependencies(elemNode, options, path)),
              []
            )
            state.result = state.result.concat(requestChunks)
          }
        }
      },
      ImportDeclaration(path, state) {
        if (!options.esImport) {
          return
        }
        const source = path.get('source')
        state.result.push(source.node.value)
      },
      ExportAllDeclaration(path, state) {
        if (!options.esExport) {
          return
        }
        const source = path.get('source')
        state.result.push(source.node.value)
      },
      ExportNamedDeclaration(path, state) {
        if (!options.esExport) {
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
