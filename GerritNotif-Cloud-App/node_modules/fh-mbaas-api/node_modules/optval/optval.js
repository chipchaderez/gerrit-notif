module.exports = function(param, defaultVal) {
  return (typeof(param) === 'undefined' || param === null) ? defaultVal : param;
}