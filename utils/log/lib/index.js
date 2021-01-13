'use strict';
const log = require('npmlog')
log.level = process.env.LOG_LEVEL || 'info'
log.addLevel('success', {
  fg: 'green',
  bold: true
})
module.exports = log;
