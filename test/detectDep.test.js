/**
 * @file parseToAst
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
var fs = require('fs')
var getImports = require('../lib/detectDep')

function c(lines) {
  return lines.join('\n')
}

describe('getImports', function() {
  it('case 1', function() {
    expect(getImports(c(['import a from "a"', 'import b from "bbb"']))).toEqual(
      ['a', 'bbb']
    )
  })

  it('case 2', function() {
    expect(
      getImports(c(['import a from "a"', 'import b from "bbb"']), {
        es6Import: false
      })
    ).toEqual([])
  })

  it('case 3', function() {
    expect(
      getImports(
        c(['import a from "a"', 'import b from "bbb"', 'require("xx")']),
        {}
      )
    ).toEqual(['a', 'bbb', 'xx'])
  })

  it('case 4', function() {
    expect(
      getImports(
        c(['import a from "a"', 'import b from "bbb"', 'require("xx")']),
        { requireImport: false }
      )
    ).toEqual(['a', 'bbb'])
  })

  it('case 5', function() {
    expect(
      getImports(
        c([
          'import a from "a"',
          'import b from "bbb"',
          'require(require("xx"))'
        ]),
        { requireImport: true }
      )
    ).toEqual(['a', 'bbb', 'xx'])
  })

  it('case 6', function() {
    expect(
      getImports(
        c([
          'import a from "a"',
          'import b from "bbb"',
          'require(require("xx"))'
        ]),
        { requireImport: true }
      )
    ).toEqual(['a', 'bbb', 'xx'])
  })

  it('case 7', function() {
    expect(
      getImports(
        c([
          'import a from "a"',
          'import b from "bbb"',
          'require(require("xx"))'
        ]),
        { moduleImport: false }
      )
    ).toEqual([])
  })

  it('case 8', function() {
    expect(
      getImports(
        c([
          'import a from "a"',
          'import b from "/User/sss"',
          'require(require("./aa"))'
        ]),
        { localImport: false }
      )
    ).toEqual(['a'])
  })

  it('case 9 recursive error', function() {
    expect(() =>
      getImports(fs.readFileSync(__dirname + '/fixture/error.js').toString(), {
        from: __dirname + '/fixture/error.js'
      })
    ).toThrow(/Cannot find module/)
  })

  it('case 9 recursive success', function() {
    expect(
      getImports(fs.readFileSync(__dirname + '/fixture/main.js').toString(), {
        from: __dirname + '/fixture/main.js'
      })
    ).toEqual([
      __dirname + '/fixture/' + 'A/a.js',
      __dirname + '/fixture/' + 'B/b.jsx',
      __dirname + '/fixture/' + 'B/b-0.js'
    ])
  })

  it('case 9 recursive: false success', function() {
    expect(
      getImports(fs.readFileSync(__dirname + '/fixture/main.js').toString(), {
        from: __dirname + '/fixture/main.js',
        recursive: false
      })
    ).toEqual([
      __dirname + '/fixture/' + 'A/a.js',
      __dirname + '/fixture/' + 'B/b.jsx'
    ])
  })


  it('case 10 with circle', function() {
    expect(
      getImports(fs.readFileSync(__dirname + '/fixture/circle/index.js').toString(), {
        from: __dirname + '/fixture/circle/index.js',
        recursive: true
      })
    ).toEqual([
      __dirname + '/fixture/' + 'circle/a.js',
      __dirname + '/fixture/' + 'circle/b.js'
    ])
  })

  it('should typescript recursively', function() {
    const path = __dirname + '/fixture/ts-main.ts'
    expect(
      getImports(fs.readFileSync(path).toString(), {
        from: path,
        recursive: true,
        moduleImport: false,
        resolveExtensions: ['.json'],
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      })
    ).toEqual([
      __dirname + '/fixture/' + 'ts-A/a.tsx',
      __dirname + '/fixture/' + 'ts-B/b.jsx',
      __dirname + '/fixture/' + 'package.json',
      __dirname + '/fixture/' + 'ts-A/aa.js'
    ])
  })

  it('should typescript shallowly', function() {
    const path = __dirname + '/fixture/ts-main.ts'
    expect(
      getImports(fs.readFileSync(path).toString(), {
        from: path,
        recursive: false,
        moduleImport: false,
        resolveExtensions: ['.json'],
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      })
    ).toEqual([
      __dirname + '/fixture/' + 'ts-A/a.tsx',
      __dirname + '/fixture/' + 'ts-B/b.jsx',
      __dirname + '/fixture/' + 'package.json'
    ])
  })

  it('should --no-return-absolute', function() {
    const path = __dirname + '/fixture/main.js'
    expect(
      getImports(fs.readFileSync(path).toString(), {
        from: path,
        recursive: true,
        returnAbsolutePath: false
      })
    ).toEqual(['./A/a.js', './B/b', '../B/b', './b-0', '../A/a'])
  })

  it('should --no-return-absolute even error', function() {
    const path = __dirname + '/fixture/error-shallow.js'
    expect(
      getImports(fs.readFileSync(path).toString(), {
        from: path,
        recursive: false,
        returnAbsolutePath: false
      })
    ).toEqual(['./A/b.js', './A/aaa.js', './A/vvv.js'])
  })
})
