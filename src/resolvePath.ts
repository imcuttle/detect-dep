/**
 * @file resolvePath
 * @author imcuttle <moyuyc95@gmail.com>
 * @date 2019/6/26
 *
 */
import * as defaultFS from 'fs'
import * as resolve from 'resolve'
import * as browserResolve from 'browser-resolve'
import { getOptsFromFs } from './resolver/utils'

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
