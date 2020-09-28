/**
 * @file parseToAst
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */

import { ParserOptions, parse } from '@babel/parser'

const defaultOpts: ParserOptions = {
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  sourceType: 'module',
  // locations: false,
  plugins: [
    'jsx',
    // 'flow',
    'typescript',

    'asyncGenerators',
    'bigInt',
    'classProperties',
    'classPrivateProperties',
    'classPrivateMethods',
    'decorators-legacy',
    'doExpressions',
    'dynamicImport',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'functionBind',
    'functionSent',
    'importMeta',
    'logicalAssignment',
    'nullishCoalescingOperator',
    'numericSeparator',
    'objectRestSpread',
    'optionalCatchBinding',
    'optionalChaining',
    'partialApplication',
    // 'pipelineOperator',
    'throwExpressions',
    'topLevelAwait'
  ]
}

export default function parseToAst(source, opts?: ParserOptions) {
  return parse(source, {
    ...defaultOpts,
    ...opts
  })
}
