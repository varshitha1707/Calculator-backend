var axios = require('axios');
const host = process.env.hostAddress || "http://localhost:8080";
var jwt = require('jsonwebtoken');
const config = require('../config/config.json');
 
module.exports={
    mysqlHandler: (query, params, connection, callback) => {
        connection.execute(query, params,
            function(err, results, fields) {
                if(err) {
                    callback(err, null);
                } else {
                    callback(false, results);
                }
            }
        )
    },
    createJWTToken: (body, callback) => {
        return jwt.sign({
            data: body
        }, config.privateKey, { expiresIn: '5h' });
    }
}