import * as nps from 'path'
import * as defaultFs from 'fs'
import resolvePath from '../resolvePath'
import { DetectDepOpts } from '../index'

export function isModulePath(path) {
  return !isLocalPath(path)
}

export function isLocalPath(path) {
  return isAbsolutePath(path) || isRelativePath(path)
}

export const getOptsFromFs = (fs) => {
  return {
    readFileSync: fs.readFileSync.bind(fs),
    isFile: function isFile(file) {
      try {
        var stat = fs.statSync(file)
      } catch (e) {
        if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return false
        throw e
      }
      return stat.isFile() || stat.isFIFO()
    },
    isDirectory: function isDirectory(dir) {
      try {
        var stat = fs.statSync(dir)
      } catch (e) {
        if (e && (e.code === 'ENOENT' || e.code === 'ENOTDIR')) return false
        throw e
      }
      return stat.isDirectory()
    },
    realpathSync: function realpathSync(file) {
      try {
        var realpath = typeof fs.realpathSync.native === 'function' ? fs.realpathSync.native : fs.realpathSync
        return realpath(file)
      } catch (realPathErr) {
        if (realPathErr.code !== 'ENOENT') {
          throw realPathErr
        }
      }
      return file
    }
  }
}

export function isRelativePath(path) {
  path = path || ''
  path = path.trim()

  return path.startsWith('.')
}

export function isAbsolutePath(path) {
  path = path || ''
  path = path.trim()

  return nps.isAbsolute(path)
}

const getLeafFiles = (context: string, recursive: boolean, fs: typeof defaultFs) => {
  const names = fs.readdirSync(context)
  const filenames = names.map((name) => nps.join(context, name))

  const { isFile, isDirectory } = getOptsFromFs(fs)
  if (!recursive) {
    return filenames.filter((filename) => isFile(filename))
  }

  let results = []
  filenames.forEach((filename) => {
    if (isDirectory(filename)) {
      results = results.concat(getLeafFiles(filename, recursive, fs))
    } else if (isFile(filename)) {
      results.push(filename)
    }
  })

  return results
}

export const findMatchFiles = (
  context: string,
  recursive: boolean,
  tailMatch: NonNullable<RegExp | string>,
  { fs = defaultFs, from = '', ...opts }: DetectDepOpts = {}
) => {
  // 没有传入文件名则不支持相对路径搜索
  if (!from && isRelativePath(context)) {
    return []
  }

  let contextPath
  const basedir = from ? nps.dirname(from) : process.cwd()
  if (isRelativePath(context)) {
    // fs.read
    contextPath = nps.resolve(basedir, context)
  } else if (isModulePath(context)) {
    const { isDirectory } = getOptsFromFs(fs)
    resolvePath(context, {
      ...opts,
      // @ts-ignore
      filename: from,
      basedir,
      packageFilter(pkg, dir) {
        contextPath = dir
        if (opts.packageFilter) {
          return opts.packageFilter(pkg, dir)
        }
        return pkg
      }
    })
  } else {
    contextPath = context
  }

  const match = (filename: string) => {
    if (!tailMatch) return true
    if (typeof tailMatch === 'string') {
      return filename.endsWith(tailMatch)
    }
    if (tailMatch instanceof RegExp) {
      return tailMatch.test(filename)
    }
    return false
  }

  let filenames = getLeafFiles(contextPath, recursive, fs)
  contextPath = !contextPath.endsWith('/') ? contextPath + '/' : contextPath

  return filenames
    .map((filename) => {
      if (isRelativePath(context)) {
        return './' + nps.relative(basedir, filename)
      } else if (isModulePath(context)) {
        if (filename.startsWith(contextPath)) {
          return nps.join(context, filename.slice(contextPath.length))
        }
      }
      return filename
    })
    .filter((filename) => match(filename))
}
