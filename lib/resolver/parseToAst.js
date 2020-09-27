/**
 * @file parseToAst
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */

const babylon = require('@babel/parser')

const opts = {
  allowImportExportEverywhere: true,
  allowAwaitOutsideFunction: true,
  sourceType: 'module',
  locations: false,
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
    // 'asyncGenerators',
    // 'classConstructorCall',
    // 'classProperties',
    // 'decorators',
    // 'doExpressions',
    // 'exportExtensions',
    // 'flow',
    // 'functionBind',
    // 'functionSent',
    // 'jsx',
    // 'objectRestSpread',
    // 'dynamicImport'
  ]
}

module.exports = function parseToAst(source) {
  return babylon.parse(source, opts)
}
