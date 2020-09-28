/**
 * @file parseToAst
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
import * as getImports from '../src'

const stripRootDir = (tree, root = __dirname) => {
  const cache = new Map()
  const stripRootDirInner = (tree) => {
    if (cache.get(tree)) {
      return
    }
    if (tree.id && tree.id.startsWith(root)) {
      tree.id = tree.id.slice(root.length)
    }
    cache.set(tree, true)

    tree.children.forEach((child) => stripRootDirInner(child))
  }

  stripRootDirInner(tree)
  return tree
}

describe('getImports-tree', function () {
  it('case 9 recursive success', function () {
    expect(stripRootDir(getImports.tree(__dirname + '/fixture/main.js'))).toMatchInlineSnapshot(`
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
              "id": "/fixture/B/b-0.js",
            },
          ],
          "id": "/fixture/B/b.jsx",
        },
      ],
      "id": "/fixture/A/a.js",
    },
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [
                [Circular],
              ],
              "id": "/fixture/A/a.js",
            },
          ],
          "id": "/fixture/B/b-0.js",
        },
      ],
      "id": "/fixture/B/b.jsx",
    },
  ],
  "id": "/fixture/main.js",
}
`)
  })

  it('case 10 with circle', function () {
    expect(stripRootDir(getImports.tree(__dirname + '/fixture/circle/index.js'))).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        [Circular],
      ],
      "id": "/fixture/circle/a.js",
    },
    Object {
      "children": Array [],
      "id": "/fixture/circle/b.js",
    },
  ],
  "id": "/fixture/circle/index.js",
}
`)
  })

  it('should typescript recursively', function () {
    const path = __dirname + '/fixture/ts-main.ts'
    expect(
      stripRootDir(
        getImports.tree(path, {
          moduleImport: false,
          resolveExtensions: ['.json'],
          extensions: ['.ts', '.tsx', '.js', '.jsx']
        })
      )
    ).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        Object {
          "children": Array [],
          "id": "/fixture/ts-A/aa.js",
        },
      ],
      "id": "/fixture/ts-A/a.tsx",
    },
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "children": Array [],
              "id": "/fixture/ts-A/aa.js",
            },
          ],
          "id": "/fixture/ts-A/a.tsx",
        },
      ],
      "id": "/fixture/ts-B/b.jsx",
    },
    Object {
      "children": Array [],
      "id": "/fixture/package.json",
    },
  ],
  "id": "/fixture/ts-main.ts",
}
`)
  })

  it('should typescript custom resolver', function () {
    const path = __dirname + '/fixture/ts-main.ts'
    const aPath = __dirname + '/fixture/ts-A/a.tsx'
    expect(
      stripRootDir(
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
      )
    ).toMatchInlineSnapshot(`
Object {
  "children": Array [
    Object {
      "children": Array [
        [Circular],
      ],
      "id": "/fixture/ts-A/a.tsx",
    },
  ],
  "id": "/fixture/ts-main.ts",
}
`)
  })
})
