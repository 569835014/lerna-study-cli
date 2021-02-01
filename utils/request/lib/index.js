'use strict';

const axios = require('axios');
const BASE_URL = process.env.CLI_BASE_URL? process.env.CLI_BASE_URL : 'http://web-study.cli.com:7002';
const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

module.exports = request;
