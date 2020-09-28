/**
 * @file parseToAst
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
import parseToAst from '../src/resolver/parseToAst'

function testSnapshot(codes) {
  expect(parseToAst(codes.join('\n'))).toMatchSnapshot()
}

describe('parseToAst', function () {
  it('JSX', function () {
    testSnapshot(["import React from 'react'", 'const a = <div></div>'])
  })

  it('classProperties', function () {
    testSnapshot(['class View {', '  a = 2', '  ab = () => {}', '  static v = () => {}', '}'])
  })
})
