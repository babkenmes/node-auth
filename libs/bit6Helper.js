const config = require('./config');
const logger = require('./log')(module);

var apiKey = config.get("bit6:BIT6_API_KEY");
var apiSecret = config.get("bit6:BIT6_API_SECRET");

var tokenGenerator = require('../libs/bit6/bit6-token-generator')(apiKey, apiSecret);

var bit6Helper = {
    generatePresenterToken: function (presentationId) {
        if (!presentationId) {
            logger.error("presentationId undefined");
            throw 'presentationId undefined';
        }
        
        var bit6Identifier = "usr:" + presentationId;
        logger.info("Generated token. PresentationId:" + presentationId);
        return tokenGenerator.createToken([bit6Identifier]);
    }
}

module.exports = bit6Helper;
