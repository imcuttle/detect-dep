/**
 * @file parseToAst
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
var getImports = require('./getImports')

function c(lines) {
  return lines.join('\n')
}

describe('getImports', function () {
  it('case 1', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "bbb"'
      ]))
    ).toEqual(['a', 'bbb'])
  })

  it('case 2', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "bbb"'
      ]), { es6Import: false })
    ).toEqual([])
  })

  it('case 3', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "bbb"',
        'require("xx")'
      ]), {  })
    ).toEqual(['a', 'bbb', 'xx'])
  })

  it('case 4', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "bbb"',
        'require("xx")'
      ]), { requireImport: false })
    ).toEqual(['a', 'bbb'])
  })

  it('case 5', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "bbb"',
        'require(require("xx"))'
      ]), { requireImport: true })
    ).toEqual(['a', 'bbb', 'xx'])
  })

  it('case 6', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "bbb"',
        'require(require("xx"))'
      ]), { requireImport: true })
    ).toEqual(['a', 'bbb', 'xx'])
  })

  it('case 7', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "bbb"',
        'require(require("xx"))'
      ]), { moduleImport: false })
    ).toEqual([])
  })

  it('case 8', function () {
    expect(
      getImports(c([
        'import a from "a"',
        'import b from "/User/sss"',
        'require(require("./aa"))'
      ]), { localImport: false })
    ).toEqual(['a'])
  })

})
