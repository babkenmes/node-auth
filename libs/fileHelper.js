var fs = require('fs');

var fileHelper = {
    checkandDeleteFile: function (filename, logger) {
        fs.stat(filename, function(err, stats){
            if (stats.isFile(filename)) {
                fs.unlink(filename, function (err) {
                    if (err) throw err;
                    logger.info(filename + " deleted.");
                });
            }
            else {
                logger.error(filename + " file not found.");
            }
        });
    }
}

module.exports = fileHelper;