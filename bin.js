#!/usr/bin/env node
/**
 * @file bin
 * @author Cuttle Cong
 * @date 2018/9/11
 *
 */
const meow = require('meow')
const concat = require('concat-stream')
const fs = require('fs')

const { detectDep, defaultOpts } = require('.')
/**
 * esImport: true,
 esExport: true,
 esModule: true,
 dynamicImport: true,
 requireContext: true,
 requireEnsure: true,
 requireImport: true,
 */

const cli = meow(
  `
    Usage
      $ detect-dep [options] <file>

    Options
      --help                   Show the help

      --version                Show the version

      --no-require-import      Ignore detect \`require('...')\`
                               [Default: ${!defaultOpts.requireImport}]

      --no-es-import           Ignore detect ES import syntax
                               [Default: ${!defaultOpts.esImport}]

      --no-es-export           Ignore detect ES export syntax
                               [Default: ${!defaultOpts.esExport}]

      --no-dynamic-import      Ignore detect \`import('...')\`
                               [Default: ${!defaultOpts.dynamicImport}]

      --no-es-module           Ignore detect ES module (dynamic import, es import, es export)
                               [Default: ${!defaultOpts.esModule}]

      --no-require-context     Ignore detect \`require.context\`
                               [Default: ${!defaultOpts.requireContext}]

      --no-require-ensure      Ignore detect \`require.ensure\`
                               [Default: ${!defaultOpts.requireEnsure}]

      --no-local-import        Ignore detect \`require('./local/path')\`
                               [Default: ${!defaultOpts.localImport}]

      --no-mod-import          Ignore detect \`require('lodash')\`
                               [Default: ${!defaultOpts.moduleImport}]

      --extensions, -e         Which file with matching extension should be detected recursively.
                               [Default: ${defaultOpts.extensions.join(',')}]

      --resolve-extensions     The resolved path's extensions which are allowed (would be extends options.extensions)
                               [Default: ${defaultOpts.resolveExtensions.join(',')}]

      --from                   Where is the source come from (filename), It would be inferred by '<file>'
                               [Default: ${defaultOpts.from}]

      --no-recursive           Detecting the source shallowly
                               [Default: ${!defaultOpts.recursive}]

      --no-return-absolute     Return the origin module id from code
                               [Default: ${!defaultOpts.returnAbsolutePath}]

      --preserve-symlinks      if true, doesn't resolve as the real path before resolving.
                               [Default: ${!defaultOpts.preserveSymlinks}]

    Examples
      $ cat file.js | detect-dep --from file.js
      $ detect-dep file.js
`,
  {
    autoHelp: true,
    autoVersion: true,
    flags: {
      noRequireImport: {
        type: 'boolean',
        default: !defaultOpts.requireImport
      },
      noEsExport: {
        type: 'boolean',
        default: !defaultOpts.esExport
      },
      noEsImport: {
        type: 'boolean',
        default: !defaultOpts.esImport
      },
      noEsModule: {
        type: 'boolean',
        default: !defaultOpts.esModule
      },
      noRequireContext: {
        type: 'boolean',
        default: !defaultOpts.requireContext
      },
      noRequireEnsure: {
        type: 'boolean',
        default: !defaultOpts.requireEnsure
      },
      noLocalImport: {
        type: 'boolean',
        default: !defaultOpts.localImport
      },
      noModImport: {
        type: 'boolean',
        default: !defaultOpts.moduleImport
      },
      extensions: {
        type: 'string',
        alias: 'e',
        default: defaultOpts.extensions.join(',')
      },
      resolveExtensions: {
        type: 'string',
        default: defaultOpts.resolveExtensions.join(',')
      },
      from: {
        type: 'string',
        default: defaultOpts.from || ''
      },
      noRecursive: {
        type: 'boolean',
        default: !defaultOpts.recursive
      },
      preserveSymlinks: {
        type: 'boolean',
        default: defaultOpts.preserveSymlinks
      },
      noReturnAbsolute: {
        type: 'boolean',
        default: !defaultOpts.returnAbsolutePath
      }
    }
  }
)

const opts = {}

Object.keys(cli.flags)
  .filter((name) => /^no[A-Z]/.test(name))
  .forEach((key) => {
    let name = key.slice(2)
    name = name[0].toLowerCase() + name.slice(1)
    if (cli.flags.hasOwnProperty(name)) {
      opts[name] = cli.flags[name]
    } else {
      opts[name] = !cli.flags[key]
    }
  })

function run(content, filename) {
  if (!content) {
    throw new Error(`The content ${filename ? `from file '${filename}' ` : ''}is empty`)
  }

  const deps = detectDep(content, {
    es6Import: opts.es6Import,
    localImport: opts.localImport,
    requireImport: opts.requireImport,
    moduleImport: opts.modImport,
    returnAbsolutePath: opts.returnAbsolute,
    recursive: opts.recursive,
    from: filename,
    preserveSymlinks: cli.flags.preserveSymlinks,
    extensions: cli.flags.extensions.split(','),
    resolveExtensions: cli.flags.resolveExtensions.split(',')
  })

  if (filename) {
    console.log(filename + ':')
  }
  console.log('  ' + deps.join('\n  ') + '\n')
}

if (cli.input.length) {
  cli.input.forEach((filename) => {
    run(fs.readFileSync(filename, { encoding: 'utf8' }), filename)
  })
} else {
  process.stdin.pipe(
    concat(function (buf) {
      run(buf.toString(), cli.flags.from)
    })
  )
}
