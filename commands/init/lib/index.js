'use strict';

module.exports = index;

function index(projectName, cmdObj = {}) {
  const targetPath = process.env.CLI_TARGET_PATH
  console.log(projectName)
  console.log(targetPath)
}
