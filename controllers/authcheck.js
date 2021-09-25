const config = require('../config/config');
var jwt = require('jsonwebtoken');
const utility = require('../modules/utility');
const util = require('util');

module.exports = function (
  urlPrsr,
  app,
  errorHandler,
  responder,
  mysqlConnection
) {
  return (req, res, next) => {
    try {
      console.log("API Endpoint " + req.originalUrl);
      console.log("Req Body : ", req.body);

      let apiEndPoint = req.originalUrl.split("?")[0];
      console.log(apiEndPoint);

      console.log("\n|________ you came here in authcheck __________|\n");

      var accessToken = req.headers["authorization"];
      if (accessToken != undefined && accessToken != null) {

        jwt.verify(accessToken, config.privateKey, function(err, decoded) {
          if(err) {
            console.log(err);
            errorHandler.errorHandler(403, "Invalid Token", res);
          } else {

            let mysqlPromise = util.promisify(utility.mysqlHandler);
            let verifyTokenQuery = "select token from revoked_tokens where token = ?";
            let params = [accessToken];

            mysqlPromise(verifyTokenQuery, params, mysqlConnection)
            .then((result) => {
              if(result.length > 0) {
                let error = "Invalid token";
                console.log("token revoked");
                errorHandler.errorHandler(403, error, res);    
              } else {
                // req.username = decoded.data.username;
                // req.userId = decoded.data.userId;
                req.userId = decoded.data;
                next();    
              }
            })
            .catch((error) => {
                console.log("\n|_____ Error catched by Try Catch _____|\n",error,"\n");
                errorHandler.errorHandler(500, error, res);    
            })
          }
        });
      } else { 
        errorHandler.errorHandler(403, "Forbidden", res);
        // next();
      }
    } catch (err) {
      console.log("\n|___ Error catched by Try Catch _____|\n", err, "\n");
      errorHandler.errorHandler(500, err.toString(), res);
    }
  };
};
