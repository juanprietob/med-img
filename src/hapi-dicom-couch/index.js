exports.plugin = {};
exports.plugin.register = async function (server, conf) {
  
  require('./dicom-couch.routes')(server, conf);
  require('./dicom-couch-projects.routes')(server, conf);

};

exports.plugin.pkg = require('./package.json');