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

describe('getImports-tree', function() {
  it('case 9 recursive success', function() {
    expect(getImports.tree(__dirname + '/fixture/main.js'))
      .toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                [Circular],
              ],
              "id": "/Users/yucong02/self/detect-dep/test/fixture/B/b-0.js",
            },
          ],
          "id": "/Users/yucong02/self/detect-dep/test/fixture/B/b.jsx",
        },
      ],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/A/a.js",
    },
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                [Circular],
              ],
              "id": "/Users/yucong02/self/detect-dep/test/fixture/A/a.js",
            },
          ],
          "id": "/Users/yucong02/self/detect-dep/test/fixture/B/b-0.js",
        },
      ],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/B/b.jsx",
    },
  ],
  "id": "/Users/yucong02/self/detect-dep/test/fixture/main.js",
}
`)
  })

  it('case 10 with circle', function() {
    expect(getImports.tree(__dirname + '/fixture/circle/index.js'))
      .toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        [Circular],
      ],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/circle/a.js",
    },
    Object {
      "children": Array [],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/circle/b.js",
    },
  ],
  "id": "/Users/yucong02/self/detect-dep/test/fixture/circle/index.js",
}
`)
  })

  it('should typescript recursively', function() {
    const path = __dirname + '/fixture/ts-main.ts'
    expect(
      getImports.tree(path, {
        moduleImport: false,
        resolveExtensions: ['.json'],
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      })
    ).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        Object {
          "children": Array [],
          "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-A/aa.js",
        },
      ],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-A/a.tsx",
    },
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [],
              "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-A/aa.js",
            },
          ],
          "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-A/a.tsx",
        },
      ],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-B/b.jsx",
    },
    Object {
      "children": Array [],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/package.json",
    },
  ],
  "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-main.ts",
}
`)
  })

  it('should typescript custom resolver', function() {
    const path = __dirname + '/fixture/ts-main.ts'
    const aPath = __dirname + '/fixture/ts-A/a.tsx'
    expect(
      getImports.tree(path, {
        moduleImport: false,
        resolveExtensions: ['.json'],
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        resolver: (source, opts) => {
          if (opts.from === aPath) {
            return [path]
          }
          return [aPath]
        }
      })
    ).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        [Circular],
      ],
      "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-A/a.tsx",
    },
  ],
  "id": "/Users/yucong02/self/detect-dep/test/fixture/ts-main.ts",
}
`)
  })
})
