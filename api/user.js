const util = require('util');
const moment = require('moment');
let utility = require('../modules/utility');
const { json } = require('body-parser');

module.exports = function(urlPrsr, app, authCheck, errorHandler, responder, mysqlConnection) {

    app.post("/api/user/create", urlPrsr, authCheck, (req, res) => { 

        try {

            
            let email = req.body.email;

            var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

            if(!req.body.email || !email.match(validRegex)) {
                let error = "Invalid email";
                errorHandler.errorHandler(400, error, res, "ER400");
                return;
            }

            let respnseSent = false;
            let userCheckQuery = "select username from user_details where username=?";
            let params = [email];
            let password = Math.random().toString(36).slice(-5);


            let mysqlPromise = util.promisify(utility.mysqlHandler);

            mysqlPromise(userCheckQuery, params, mysqlConnection)
            .then((result) => {
                if(result.length > 0) {
                    let error = "user already exist";
                    errorHandler.errorHandler(400, error, res, "ER400");
                    respnseSent = true;
                } else {
                    let createUserQuery = `insert into user_details (username, password) values (?, ?)`;
                    params = [email, password];
                    return mysqlPromise(createUserQuery, params, mysqlConnection);
                }
            })
            .then((result) => {
                if(!respnseSent) {
                    let message = "User created with password " + password;
                    responder.respond({ message: message }, res);
                }
            })
            .catch((error) => {
                console.log("\n|_____ Error catched by Try Catch _____|\n",error,"\n");
                errorHandler.errorHandler(500, error, res);    
            })
        } catch(error) {
            console.log("\n|_____ Error catched by Try Catch _____|\n",error,"\n");
            errorHandler.errorHandler(500, error, res);
        }
    });

    app.post("/api/user/login", urlPrsr, (req, res) => { 

        try {

            let username = req.body.username;
            let password = req.body.password;

            var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

            if(!username || !username.match(validRegex)) {
                let error = "Invalid username";
                errorHandler.errorHandler(400, error, res, "ER400");
                return;
            }

            if(!password) {
                let error = "Password required";
                errorHandler.errorHandler(400, error, res, "ER400");
                return;
            }

            let respnseSent = false;
            let checkPasswordQuery = "select id, username from user_details where username=? and password = ?";
            let params = [username, password];

            let mysqlPromise = util.promisify(utility.mysqlHandler);

            mysqlPromise(checkPasswordQuery, params, mysqlConnection)
            .then((result) => {
                if(result.length > 0) {
                    let authToken = utility.createJWTToken({
                        userId : result[0].id,
                        username: result[0].username
                    })
                    responder.respond({ data: authToken }, res);
                } else {
                    let error = "Invalid username or passoword";
                    errorHandler.errorHandler(400, error, res, "ER400");
                    respnseSent = true;
                }
            })
            .catch((error) => {
                console.log("\n|_____ Error catched by Try Catch _____|\n",error,"\n");
                errorHandler.errorHandler(500, error, res);    
            })
        } catch(error) {
            console.log("\n|_____ Error catched by Try Catch _____|\n",error,"\n");
            errorHandler.errorHandler(500, error, res);
        }
    });

    app.post("/api/user/logout", urlPrsr, authCheck, (req, res) => { 

        try {

            let token = req.headers["authorization"];

            let revokeTokenQuery = "insert into revoked_tokens (token) values (?)";
            let params = [token];

            let mysqlPromise = util.promisify(utility.mysqlHandler);

            mysqlPromise(revokeTokenQuery, params, mysqlConnection)
            .then((result) => {
                responder.respond({ message: "Logged out successfully." }, res);
            })
            .catch((error) => {
                console.log("\n|_____ Error catched by Try Catch _____|\n",error,"\n");
                errorHandler.errorHandler(500, error, res);    
            })
        } catch(error) {
            console.log("\n|_____ Error catched by Try Catch _____|\n",error,"\n");
            errorHandler.errorHandler(500, error, res);
        }
    });
};