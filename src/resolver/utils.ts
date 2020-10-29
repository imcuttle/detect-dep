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

  const { isDirectory } = getOptsFromFs(fs)
  if (isRelativePath(context)) {
    contextPath = nps.resolve(basedir, context)
  } else if (isModulePath(context)) {
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

  const matchHead = (filename: string, matchTest = tailMatch) => {
    if (!matchTest) return true
    if (typeof matchTest === 'string') {
      return filename.startsWith(matchTest)
    }
    if (matchTest instanceof RegExp) {
      return matchTest.test(filename)
    }
    return false
  }

  const normalizedContextPath = !contextPath.endsWith('/') ? contextPath + '/' : contextPath
  const normalizeFilename = (filename) => {
    if (isRelativePath(context)) {
      return './' + nps.relative(basedir, filename)
    } else if (isModulePath(context)) {
      if (filename.startsWith(normalizedContextPath)) {
        return nps.join(context, filename.slice(normalizedContextPath.length))
      }
    }
    return filename
  }

  const matchContextAsFile = () => {
    // filename match
    // require(`config.${env}.js`)
    let matchedFiles = []

    // require(`config./${env}.js`)
    if (context.endsWith('/')) {
      return []
    }
    const basename = nps.basename(context)
    const contextDirname = nps.dirname(contextPath)
    const filenames = fs
      .readdirSync(contextDirname)
      .filter((name) => match(name) && matchHead(name, basename))
      .map((name) => nps.join(contextDirname, name))
      .filter((filename) => nps.normalize(contextPath) !== filename)

    filenames.forEach((filename) => {
      if (isDirectory(filename)) {
        if (!recursive) {
          return
        }
        matchedFiles = matchedFiles.concat(
          findMatchFiles(normalizeFilename(filename), recursive, tailMatch, { fs, from, ...opts })
        )
      } else {
        matchedFiles.push(normalizeFilename(filename))
      }
    })
    return matchedFiles
  }

  let matchedFiles = []
  if (isDirectory(contextPath)) {
    let filenames = getLeafFiles(contextPath, recursive, fs)

    matchedFiles = matchedFiles.concat(
      filenames.map((filename) => normalizeFilename(filename)).filter((filename) => match(filename))
    )
  }
  return matchedFiles.concat(matchContextAsFile())
}
