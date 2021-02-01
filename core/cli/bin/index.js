#!/usr/bin/env node
const importLocal = require('import-local');
// 如果本地项目装了cli，则用本地项目的
console.info(__filename);
if (importLocal(__filename)) {
  require('npmlog').info('cli', '正在使用本地版本');
} else {
  // 否则用全局的
  require('../lib/index')(process.argv.slice(0).splice(2));
}
