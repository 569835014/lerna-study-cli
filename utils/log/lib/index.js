'use strict';
const log = require('npmlog')
log.level = process.env.LOG_LEVEL || 'info'
log.headingStyle = { fg: 'green', bg: 'black' }
log.heading = 'web-study-cli'
log.addLevel('success', {
  fg: 'green',
  bold: true
})
module.exports = log;
