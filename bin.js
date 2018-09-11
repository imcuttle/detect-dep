#!/usr/bin/env node
/**
 * @file bin
 * @author Cuttle Cong
 * @date 2018/9/11
 *
 */
const meow = require('meow')
const getStdin = require('get-stdin')
const fs = require('fs')

const detectDep = require('./index')
const defaultOpts = detectDep.defaultOpts

const cli = meow(
  `
    Usage
      $ detect-dep [options] <file>
 
    Options
      --help                   Show the help
      
      --version                Show the version
      
      --no-require-import      Ignore detect \`require('...')\`
                               [Default: ${!defaultOpts.requireImport}]
      
      --no-es6-import          Ignore detect \`import ...\`
                               [Default: ${!defaultOpts.es6Import}]
                               
      --no-local-import        Ignore detect \`require('./local/path')\`
                               [Default: ${!defaultOpts.localImport}]
                               
      --no-mod-import          Ignore detect \`require('lodash')\`
                               [Default: ${!defaultOpts.moduleImport}]
                               
      --extensions, -e         Which file with matching extension should be detected recursively.
                               [Default: ${defaultOpts.extensions.join(',')}]
                               
      --resolve-extensions     The resolved path's extensions which are allowed (would be extends options.extensions)
                               [Default: ${defaultOpts.resolveExtensions.join(
                                 ','
                               )}]
                               
      --from                   Where is the source come from (filename), It would be inferred by '<file>'
                               [Default: ${defaultOpts.from}]
      
      --no-recursive           Detecting the source shallowly
                               [Default: ${!defaultOpts.recursive}]
                               
 
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
      noEs6Import: {
        type: 'boolean',
        default: !defaultOpts.es6Import
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
        default: defaultOpts.from
      },
      noRecursive: {
        type: 'boolean',
        default: !defaultOpts.recursive
      }
    }
  }
)

function run(content, filename) {
  if (!content) {
    throw new Error(`The content ${filename ? `from file '${filename}' ` : ''}is empty`)
  }

  const deps = detectDep(content, {
    es6Import: !cli.flags.noEs6Import,
    localImport: !cli.flags.noLocalImport,
    requireImport: !cli.flags.noRequireImport,
    moduleImport: !cli.flags.noModImport,
    recursive: !cli.flags.noRecursive,
    from: filename,
    extensions: cli.flags.extensions.split(','),
    resolveExtensions: cli.flags.resolveExtensions.split(',')
  })

  if (filename) {
    console.log(filename + ':')
  }
  console.log('  ' + deps.join('\n  ') + '\n')
}

if (cli.input.length) {
  cli.input.forEach(filename => {
    run(fs.readFileSync(filename, { encoding: 'utf8' }), filename)
  })
} else {
  getStdin().then(content => {
    run(content, cli.flags.from)
  })
}
