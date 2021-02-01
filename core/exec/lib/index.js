'use strict';
const Package = require( '@web-study/package' )
const { exec: spawn } = require('@web-study/utils')
const log = require( '@web-study/log' )
const path = require( 'path' );
const prefix = '@web-study'
// 所有commander的配置列表
const PACKAGE_MAP = {
  init: `${ prefix }/init`
}
const CACHE_DIR = 'dependencies/'
let pkg

async function exec (name, cmdObj) {
  let targetPath = process.env.CLI_TARGET_PATH
  const homePath = process.env.CLI_HOME_PATH
  let storeDir = '';
  log.verbose( 'targetPath', targetPath )
  log.verbose( 'homePath', homePath )
  const cmdName = cmdObj.name();
  const packageName = PACKAGE_MAP[ cmdName ];
  const packageVersion = 'latest';

  if (!targetPath) {
    targetPath = path.resolve( homePath, CACHE_DIR );
    storeDir = path.resolve( targetPath, 'node_modules' );
    log.verbose( 'targetPath', targetPath )
    log.verbose( 'storeDir', storeDir )
    pkg = new Package( {
      targetPath,
      storeDir,
      packageName,
      packageVersion
    } );
    if (await pkg.exists()) {
      // 更新package
      await pkg.update();
    } else {
      // 安装package
      await pkg.install();
    }
  } else {
    pkg = new Package( {
      targetPath,
      packageName,
      packageVersion
    } );
  }

  const rootFile = pkg.getRootFilePath();
  if (rootFile) {
    try {
      const argv = Array.from( arguments )
      const cmd = argv[ argv.length - 1 ]
      const o = Object.create( null );
      Object.keys( cmd ).forEach( (key) => {
        const value = cmd[ key ]
        if (cmd.hasOwnProperty( key ) && !key.startsWith( '_' ) && key !== 'parent' && value) {
          o[ key ] =  value
        }
      } )
      argv[ argv.length - 1 ] = o;
      const code = `require('${ rootFile }').call( null, ${ JSON.stringify( argv ) } ) `;
      const child = spawn( 'node', [ '-e', code ], {
        cwd: process.cwd(),
        stdio: 'inherit'
      } )
      child.on( 'error', e => {
        log.error( e.message )
        process.exit( 1 )
      } )
      child.on( 'exit', e => {
        log.verbose( '命令执行成功:' + e );
        process.exit( e )
      } )

    } catch ( e ) {
      log.error( e.message )
    }
  }
}
module.exports = exec;
