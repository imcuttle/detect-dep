// import parseToAst from '../src/resolver/parseToAst'
import { parseExpression } from '@babel/parser'
import parseRequest from '../src/resolver/parseRequest'

const parse = (code: string, opts?) => {
  const ast = parseExpression(code)
  return parseRequest(ast, opts)
}

describe('parseRequest', function () {
  it('should support string template', function () {
    expect(parse('`""${x}asda${xx}${xx}/end`')).toEqual([
      { type: 'raw', value: '""' },
      { type: 'identifier', value: 'x' },
      { type: 'raw', value: 'asda' },
      { type: 'identifier', value: 'xx' },
      { type: 'identifier', value: 'xx' },
      { type: 'raw', value: '/end' }
    ])
  })

  it('should support string template nesting', function () {
    expect(parse('`""${x}asda${`/foo/bar/${name}`}`')).toEqual([
      { type: 'raw', value: '""' },
      { type: 'identifier', value: 'x' },
      { type: 'raw', value: 'asda' },
      { type: 'raw', value: '/foo/bar/' },
      { type: 'identifier', value: 'name' }
    ])
  })

  it('should support string concat', function () {
    expect(parse(`'/foo/' + 'bar/' + 'ddd'`)).toEqual([
      { type: 'raw', value: '/foo/' },
      { type: 'raw', value: 'bar/' },
      { type: 'raw', value: 'ddd' }
    ])
  })

  it('should support string concat nesting', function () {
    expect(parse("'/foo/' + abc + 'ddd' + ('x' + `${abc}/end`)")).toEqual([
      { type: 'raw', value: '/foo/' },
      { type: 'identifier', value: 'abc' },
      { type: 'raw', value: 'ddd' },
      { type: 'raw', value: 'x' },
      { type: 'identifier', value: 'abc' },
      { type: 'raw', value: '/end' }
    ])
  })

  it('should merge raw near by value, with mergeRaw', function () {
    expect(parse("'/foo/' + abc + 'ddd' + ('x' + `${abc}/end`)", { mergeRaw: true })).toEqual([
      { type: 'raw', value: '/foo/' },
      { type: 'identifier', value: 'abc' },
      { type: 'raw', value: 'dddx' },
      { type: 'identifier', value: 'abc' },
      { type: 'raw', value: '/end' }
    ])
  })
})
