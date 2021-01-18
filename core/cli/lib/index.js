'use strict';
const pkg = require( '../package.json' )
const log = require( '@web-study/log' )
const exec = require( '@web-study/exec' )
const { LOWEST_NODE_VERSION, DEFAULT_CLI_HOME } = require( './const' )
const semver = require( 'semver' )
const colors = require( 'colors/safe' )
const rootCheck = require( 'root-check' )
const pathExists = require( 'path-exists' ).sync
const userHome = require( 'user-home' )
const dotenv = require( 'dotenv' )
const path = require( 'path' )
const commander = require( 'commander' )
const program = new commander.Command()

async function core () {
  try {
    await prepare();
    registerCommand();
  } catch ( e ) {
    log.error( e.message )
    if (process.env.LOG_LEVEL === 'verbose') {
      console.error( e );
    }
  }

}

function checkPkgVersion () {
  log.notice( 'cli', pkg.version )
}

function checkNodeVersion () {
  const nodeVersion = process.version;
  if (!semver.gte( nodeVersion, LOWEST_NODE_VERSION )) {
    throw new Error( colors.red( `需要安装v${ LOWEST_NODE_VERSION }版本的Node.js,当前${ colors.green( nodeVersion ) }` ) )
  }
}

function checkRoot () {
  /**
   * 对当前用户的gid和uid进行修改
   */
  rootCheck();
}

function checkUserHome () {
  if (!userHome || !pathExists( userHome )) {
    throw new Error( colors.red( '当前登录用户主目录不存在！' ) )
  }

}

function checkEnv () {
  const envPath = path.resolve( userHome, '.env' )
  if (pathExists( envPath )) {
    dotenv.config( {
      path: envPath
    } );
  }
  createDefaultConfig();
}

async function checkGlobalUpdate () {
  const currentVersion = pkg.version;
  const npmName = pkg.name;
  const { getNpmSemverVersion } = require( '@web-study/get-npm-info' )
  const lastVersion = await getNpmSemverVersion( currentVersion, npmName );
  if (lastVersion && semver.gt( lastVersion, currentVersion )) {
    log.warn( colors.yellow( `请手动更新${ npmName },当前版本:${ colors.red( `${ currentVersion }` ) },最新版本:${ colors.green( `${ lastVersion }` ) }` ) )
  }
}

function createDefaultConfig () {
  const cliConfig = {
    home: userHome
  }
  if (process.env.CLI_HOME) {
    cliConfig.cliHome = path.join( userHome, process.env.CLI_HOME )
  } else {
    cliConfig.cliHome = path.join( userHome, DEFAULT_CLI_HOME )
  }
  process.env.CLI_HOME_PATH = cliConfig.cliHome;
  return cliConfig
}

async function prepare () {
  checkPkgVersion();
  checkNodeVersion();
  checkRoot();
  checkUserHome()
  checkEnv()
  await checkGlobalUpdate()
  return;
}

function registerCommand () {
  program
    .name( Object.keys( pkg.bin )[ 0 ] )
    .usage( '<command> [options]' )
    .version( pkg.version )
    .option( '-d, --debug', '是否开启调试模式', false )
    .option( '-tp, --targetPath <targetPath>', '是否制定本地调试文件路径', '' )
  program
    .command( 'init [projectName]' )
    .option( '-f, --force', '是否强制初始化项目' )
    .action( exec )
  program.on( 'option:debug', function () {
    if (program.debug) {
      process.env.LOG_LEVEL = 'verbose'
    } else {
      process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
  } )
  program.on( 'option:targetPath', function () {
    if (program.targetPath) {
      process.env.CLI_TARGET_PATH = program.targetPath
    }
  } )
  program.on( 'command:*', function (obj) {
    const availableCommands = program.commands.map( cmd => cmd.name() );
    console.log( colors.red( '未知的命令(command): ' + obj[ 0 ] ) )
    if (availableCommands > 0) {
      console.log( colors.green( '可以命令:' + availableCommands.join( ',' ) ) )
    }
  } )
  program.parse( process.argv )
  if (program.args && program.args.length < 1) {
    program.outputHelp();
  }
}

module.exports = core;
