const request = require('@web-study/request');
request.interceptors.response.use(( response ) => {
  return response.data;
}, error => {
  return Promise.reject(error);
});
module.exports = function() {
  return request({
    url: '/project/template',
    method: 'get',
  });
};
