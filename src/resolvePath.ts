/**
 * @file resolvePath
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/26
 *
 */
import * as defaultFS from 'fs'
import * as resolve from 'resolve'
import * as browserResolve from 'browser-resolve'

const getOptsFromFs = (fs) => {
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

export type ResolvePathOpts = resolve.Opts & {
  browser?: boolean
  fs?: Partial<
    Pick<resolve.SyncOpts, 'readFileSync' | 'isFile' | 'isDirectory' | 'realpathSync'> & {
      statSync?: typeof defaultFS.statSync
    }
  >
}

function resolvePath(path, { fs = defaultFS, browser = false, ...syncOpts }: ResolvePathOpts = {}) {
  const resolveOpts = {
    ...getOptsFromFs(fs),
    ...syncOpts
  }

  if (browser) {
    return browserResolve.sync(path, resolveOpts)
  }

  return resolve.sync(path, resolveOpts)
}

export default resolvePath
