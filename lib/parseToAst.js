/**
 * @file parseToAst
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */

var babylon = require('babylon')

var opts = {
  allowImportExportEverywhere: true,
  sourceType: 'module',
  locations: false,
  plugins: [
    'asyncGenerators',
    'classConstructorCall',
    'classProperties',
    'decorators',
    'doExpressions',
    'exportExtensions',
    'flow',
    'functionBind',
    'functionSent',
    'jsx',
    'objectRestSpread',
    'dynamicImport'
  ]
}

module.exports = function parseToAst(source) {
  return babylon.parse(source, opts)
}
