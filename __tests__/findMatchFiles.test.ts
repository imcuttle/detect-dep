import { findMatchFiles } from '../src/resolver/utils'
import { detectDepFileSync } from '../src'

const fixture = (name) => __dirname + '/fixture/findMatchFiles/' + name

describe('findMatchFiles', function () {
  it('absolute path', function () {
    expect(findMatchFiles(fixture('absolute'), false, null)).toEqual([fixture('absolute/root.png')])

    expect(findMatchFiles(fixture('absolute'), false, '.jpg')).toEqual([])
  })

  it('recursive=true', function () {
    expect(
      findMatchFiles('./config./', true, null, {
        from: fixture('dynamic/index.js')
      })
    ).toMatchInlineSnapshot(`
      Array [
        "./config./foo.js",
      ]
    `)

    expect(
      findMatchFiles('./config.', true, null, {
        from: fixture('dynamic/index.js')
      })
    ).toMatchInlineSnapshot(`
      Array [
        "./config./foo.js",
        "./config.a.js",
        "./config.b.js",
        "./config.env/foo.js",
      ]
    `)
  })

  it('recursive=false', function () {
    expect(
      findMatchFiles('./config./', false, null, {
        from: fixture('dynamic/index.js')
      })
    ).toMatchInlineSnapshot(`
      Array [
        "./config./foo.js",
      ]
    `)

    expect(
      findMatchFiles('./config.', false, null, {
        from: fixture('dynamic/index.js')
      })
    ).toMatchInlineSnapshot(`
      Array [
        "./config./foo.js",
        "./config.a.js",
        "./config.b.js",
      ]
    `)
  })

  it('absolute path - recursive', function () {
    expect(findMatchFiles(fixture('absolute'), true, /\.png/)).toEqual([
      fixture('absolute/a/a.png'),
      fixture('absolute/root.png')
    ])

    expect(findMatchFiles(fixture('absolute'), true, '.jpg')).toEqual([])
  })

  it('module path - recursive', function () {
    expect(
      findMatchFiles('react', true, /\.png/, {
        from: fixture('module/index.js')
      })
    ).toEqual(['react/a/a.png', 'react/root.png'])

    expect(
      findMatchFiles('react/', true, /\.png/, {
        from: fixture('module/index.js')
      })
    ).toEqual(['react/a/a.png', 'react/root.png'])
  })

  it('relative path - recursive', function () {
    expect(
      findMatchFiles('.', true, /\.png/, {
        from: fixture('relative/index.js')
      })
    ).toEqual(['./a/a.png', './node_modules/react/a/a.png', './node_modules/react/root.png', './root.png'])

    expect(
      findMatchFiles('./', true, /\.png/, {
        from: fixture('relative/index.js')
      })
    ).toEqual(['./a/a.png', './node_modules/react/a/a.png', './node_modules/react/root.png', './root.png'])
  })
})
