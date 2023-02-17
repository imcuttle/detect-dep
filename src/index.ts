/**
 * @file getImports
 * @author Cuttle Cong
 * @date 2018/2/20
 * @description
 */
import * as nps from 'path'
import * as defaultFs from 'fs'
import resolvePath, { ResolvePathOpts } from './resolvePath'
import { ParserOptions } from '@babel/parser'
import { getOptsFromFs, isLocalPath, isModulePath } from './resolver/utils'
const uniq = require('array-uniq')

export const defaultOpts = {
  fs: defaultFs,
  esImport: true,
  esExport: true,
  esModule: true,
  dynamicImport: true,
  requireContext: true,
  requireEnsure: true,
  requireImport: true,
  localImport: true,
  moduleImport: true,
  allowWithoutExports: true,
  returnAbsolutePath: true,
  preserveSymlinks: false,
  from: null,
  recursive: true,
  resolver: require('./resolver').default,
  resolveExtensions: Object.keys(require.extensions),
  extensions: ['.js', '.jsx', '.tsx', '.ts']
}

export type DetectDepOpts = Partial<typeof defaultOpts> &
  Omit<ResolvePathOpts, 'basedir'> & {
    parserOpts?: ParserOptions
  }

function getOpts(options: DetectDepOpts) {
  options = Object.assign({}, defaultOpts, options)
  if (!options.esModule) {
    options.esImport = options.esExport = options.dynamicImport = false
  }

  return options
}

/**
 * @typedef {Object}
 * @public
 * @name AST
 * @see [Abstract syntax tree](https://en.wikipedia.org/wiki/Abstract_syntax_tree)
 * @see [babylon](https://github.com/babel/babel/tree/master/packages/babylon)
 */

/**
 *
 * @public
 * @param source {String|AST}
 * @param options {Object}
 * @param [options.esModule=true] {Boolean}
 *    Disable `esExport` `esImport` `dynamicImport` when is falsy
 * @param [options.requireEnsure=true] {Boolean}
 *    whether detecting `require.ensure(['./a', 'b'])` or not
 * @param [options.requireContext=true] {Boolean}
 *    whether detecting `require.context('./root', false, /\.jsx?$/)` or not
 * @param [options.dynamicImport=true] {Boolean}
 *    whether detecting `import('./foo')` `import('./foo/' + name)` or not
 * @param [options.esExport=true] {Boolean}
 *    whether detecting `export xx from 'xxx'` or not
 * @param [options.esImport=true] {Boolean}
 *    whether detecting `import ...` or not
 * @param [options.requireImport=true] {Boolean}
 *    whether detecting `require('...')` or not
 * @param [options.localImport=true] {Boolean}
 *    whether requiring `require('./local/path')` or not
 * @param [options.moduleImport=true] {Boolean}
 *    whether requiring `require('path')` or not
 * @param [options.extensions=['.js', '.jsx']] {string[]}
 *    Which file with matching extension should be detected recursively
 * @param [options.resolveExtensions=Object.keys(require.extensions)] {string[]}
 *    The resolved path's extensions which are allowed (would be extends options.extensions)
 * @param [options.from=''] {String}
 *    where is the source come from  (filename)
 * @param [options.recursive=true] {boolean}
 *    Detecting the source recursively.
 * @param [options.resolver=require('./resolver')] {(source, options) => string[]}
 *    The core method for resolving dependencies.
 * @param [options.returnAbsolutePath=true] {boolean}
 *    whether returning the local module's absolute path, or use real module id instead.
 * @todo options.allowWithoutExports {Boolean} true
 * @returns dependencies {String[]} - dependencies list
 * @example
 * const {detectDep} = require('detect-dep')
 * const dependencies = detectDep('some code', {})
 */
export function detectDep(source, options?: DetectDepOpts) {
  return detectDepInner(source, options, { tracks: [], checkExtension: false })
}

export function detectDepFileSync(filename, options?: Omit<DetectDepOpts, 'from'>) {
  options = getOpts(options)
  return detectDepInner(
    String(options.fs.readFileSync(filename)),
    { ...options, from: filename },
    { tracks: [], checkExtension: false }
  )
}

function detectDepInner(source, options: DetectDepOpts = {}, { tracks = [], checkExtension = true } = {}) {
  options = getOpts(options)
  const { fs = defaultFs } = options
  const { realpathSync } = getOptsFromFs(fs)

  if (options.from) {
    options.from = nps.resolve(options.from)
    if (options && options.preserveSymlinks === false) {
      options.from = realpathSync(options.from)
    }

    if (checkExtension && options.extensions.indexOf(nps.extname(options.from)) < 0) {
      return []
    }
  }

  let result = options.resolver(source, options) || []
  let newPaths = []

  const resolveExtensions = uniq(options.extensions.concat(options.resolveExtensions))
  if (options.from && !!options.recursive) {
    result = result.map(function (path) {
      if (isLocalPath(path)) {
        const local = resolvePath(path, {
          ...options,
          fs,
          // @ts-ignore
          filename: options.from,
          basedir: nps.dirname(options.from),
          extensions: resolveExtensions
        })
        if (!tracks.includes(local) && options.extensions.indexOf(nps.extname(local)) >= 0) {
          tracks.push(local)

          newPaths = newPaths.concat(
            detectDepInner(String(fs.readFileSync(local)), Object.assign({}, options, { from: local }), {
              checkExtension,
              tracks
            })
          )
        }
      }
      return path
    })
  }

  result = result.concat(newPaths).filter(Boolean)
  if (!options.moduleImport) {
    result = result.filter(isLocalPath)
  }
  if (!options.localImport) {
    result = result.filter(isModulePath)
  }

  result = uniq(result)

  if (!options.returnAbsolutePath) {
    return result
  }

  const map = {},
    tmpResult = []
  if (options.from) {
    map[options.from] = true
  }
  result.forEach(function (path) {
    let absolutePath = path
    if (isLocalPath(path) && options.from) {
      absolutePath = resolvePath(path, {
        ...options,
        fs,
        // @ts-ignore  提示用
        filename: options.from,
        basedir: nps.dirname(options.from),
        extensions: resolveExtensions
      })
      if (!map.hasOwnProperty(absolutePath)) {
        tmpResult.push(absolutePath)
      }
      map[absolutePath] = true
    } else {
      if (!map.hasOwnProperty(absolutePath)) {
        tmpResult.push(absolutePath)
      }
      map[absolutePath] = true
    }
  })
  return tmpResult
}

/**
 * @public
 * @typedef {Object}
 * @name Module
 * @property id {string}
 * @property children {Module[]}
 */

/**
 * @public
 * @param path {string}
 * @param options - See `detectDep`
 * @example
 * const {tree} = require('detect-dep')
 * const moduleTree = tree('/path/to/file')
 *
 * {
 *   id: '/path/to/file',
 *   children: [
 *     {
 *       id: '/path/to/file/b.jsx',
 *       children: []
 *     }
 *   ]
 * }
 * @return {Module}
 */
export function tree(path, options: DetectDepOpts = {}) {
  options = getOpts(options)
  const { fs = defaultFs, ...opts } = options

  function treeRecursive(path, opts, map) {
    path = nps.resolve(path)

    if (map.hasOwnProperty(path)) {
      return map[path]
    }

    const dependencies = detectDepInner(
      fs.readFileSync(path).toString(),
      {
        ...options,
        from: path,
        recursive: false,
        returnAbsolutePath: true
      },
      { checkExtension: true, tracks: [] }
    )

    map[path] = {
      id: path
    }
    map[path].children = dependencies.map((filename) => {
      return treeRecursive(filename, opts, map)
    })

    return map[path]
  }

  return treeRecursive(path, options, {})
}
