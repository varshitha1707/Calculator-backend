let utility = require('../modules/utility');
const util = require('util');

module.exports = function(urlPrsr, app, authCheck,  errorHandler, responder, mysqlConnection) {

    app.post("/api/calculator/user/signup", urlPrsr,(req, res) => { 
        try {

            let body = req.body;
            let username = body.username;
            let password = body.password;
            let userQuery = "select id from user_details where username = ?";
            let params = [username];


            let mysqlPromise = util.promisify(utility.mysqlHandler);

            mysqlPromise(userQuery, params, mysqlConnection)
            .then((result) => {
                if(result.length > 0) {
                    let error="Username is not available";
                    errorHandler.errorHandler(400, error, res, "Err400");
                }else {
                    console.log(result);
                    let createUserQuery = "insert into user_details (username, password) values  (? , ?)";
                    params = [username, password];
                    if (!password) {
                        let password = Math.random().toString(36).slice(-5)
                        params = [username, password];
                    }
                    return mysqlPromise(createUserQuery, params, mysqlConnection);
                }
            })
            .then((result) => {
                responder.respond( {
                    message:"user created",
                    data: result.insertId
                }, res);
                })
                .catch((error) => {
                    // errorHandler.errorHandler(500, err, res, "Err500");
                    console.log(error);
                });
            } catch (error) {
                errorHandler.errorHandler(500, error, res, "Err500");
            }   
        });

    app.post("/api/calculator/user/login", urlPrsr,(req, res) => {
        try{
            let body = req.body;
            let username = body.username;
            let password = body.password;

            let checkQuery = "SELECT id FROM user_details WHERE username = ? and password = ?"
            let params = [username, password];

            let mysqlPromise = util.promisify(utility.mysqlHandler);
            
            mysqlPromise(checkQuery, params, mysqlConnection)
            .then((result) => {
                if (result.length > 0) {
                    var jwt = require('jsonwebtoken');
                    // console.log(result[0].id);
                    let authToken = jwt.sign({
                        data: result[0].id
                    }, "ezgb?fV+A&zjg=B(WoYVZtQM1E62=)", { expiresIn: '5h' });
                
                    let message = "User Logged In"
                    responder.respond({
                    message: message,
                    data: authToken 
                }, res);
                }
                else {
                    let error = "Username or Password incorrect"
                    errorHandler.errorHandler(403, error, res, "Err403")
                }
            })
            .catch((error) => {
                errorHandler.errorHandler(500, "Something went wrong", res, "Err500");
                return;
            })
        }catch(error) {
            errorHandler.errorHandler(500, "Something went wrong", res, "Err500");
            return;
        }
    });

    app.post("/api/calculator/operations", urlPrsr, authCheck, (req, res) => { 
        try {
            var accessToken = req.headers["authorization"];
            let userId = req.userId;
            // let accessToken = req.accessToken;
            // if (!accessToken) {
            //     let error = "Access Token is required";
            //     errorHandler.errorHandler(403, error, res, "Err403");
            //     return;
            // }
            // let jwt = require('jsonwebtoken');
            // jwt.verify(accessToken, "ezgb?fV+A&zjg=B(WoYVZtQM1E62=)",function(err, decoded){
            //     if (err) {
            //         console.log(err);
            //         let error = "Access Token is invalid";
            //         errorHandler.errorHandler(403, error, res, "Err403");
            //         return;
            //     }
            //     else {
            //         userId = decoded.data;
            //         console.log(userId);
            //     }
            // });

            let revokeTokenIsOrNot ="select id from revoked_tokens where token=?";
            let tokenParams = [accessToken];
            let mysqlPromise = util.promisify(utility.mysqlHandler);

            mysqlPromise(revokeTokenIsOrNot, tokenParams, mysqlConnection)
            .then((result) => {
                if(result.length > 0) {
                    let error="Token is revoked";
                    errorHandler.errorHandler(403, error, res, "Err403");
                    responseSent = true;
                }
                else {
                    let body = req.body;
                    let num1 = body.number1;
                    let num2 = body.number2;
                    let action = body.Action;
                    let result = 0;
        
                    console.log(num1, num2)
                    if (!(num1 && num2)) {
                        errorHandler.errorHandler(400, "Both numbers are required", res, "Err400");
                        return;
                    }
        
                    let dataTypeNum1 =  typeof num1;
                    let dataTypeNum2 =  typeof num2;
        
                    if (!(dataTypeNum1==="number" && dataTypeNum2==="number")) {
                        errorHandler.errorHandler(400, "Both numbers should be a number", res, "Err400");
                        return;
                    }
                
                    if(action==="add") {
                        result = num1 + num2;
                    }
                    else if(action==="subtract") {
                        result = num1 - num2;
                    }   
                    else if(action==="multiply") {
                        result = num1 * num2;
                    }
                    else if(action==="divide") {
                        result = num1 / num2;
                    }
                    else {
                        errorHandler.errorHandler(400, "Invalid action", res, "Err400");
                        return;
                    }
        
                    let operationQuery = "Insert into history (userId, number1, number2, action, result) values(?, ?, ?, ?, ?)"
                    let params = [userId, num1, num2, action, result];
        
                    let mysqlPromise = util.promisify(utility.mysqlHandler);
                    responder.respond(result,res);
                    return mysqlPromise(operationQuery, params, mysqlConnection)
                }
            })
        }catch(error) {
            errorHandler.errorHandler(500, error, res);
            console.log(error);
            return;
        }
    });

    app.get("/api/calculator/history", urlPrsr, authCheck, (req, res) => {
        try {
            let userId = req.userId;
            let queryParams = req.query;
            let action = queryParams.action;
            // console.log(action, userId);
            let getQuery = "select * from history where Action=? and userId=? ";
            let params = [action, userId];
            console.log(params);
            let mysqlPromise = util.promisify(utility.mysqlHandler);
            mysqlPromise(getQuery, params, mysqlConnection)
            .then((result) => {
                responder.respond(
                    {
                        message: result,
                        action: action,
                    }, res
                );
            })
            .catch((error) => {
                console.log(error);
                errorHandler.errorHandler(500, error, res);
            });
        } catch (error) {
            console.log(error);
            errorHandler.errorHandler(500, "Something went wrong", res, "Err500");
        }
    })

    app.post("/api/calculator/user/logout", urlPrsr, authCheck, (req, res) => { 
        try{
            var accessToken = req.headers["authorization"];
            let userId = req.userId;
            // if (!accessToken) {
            //     let error = "Access Token is required";
            //     errorHandler.errorHandler(403, error, res, "Err403");
            //     return;
            // }
            // let jwt = require('jsonwebtoken');
            // jwt.verify(accessToken, "ezgb?fV+A&zjg=B(WoYVZtQM1E62=)",function(err, decoded){
            //     if (err) {
            //         console.log(err);
            //         let error = "Access Token is invalid";
            //         errorHandler.errorHandler(403, error, res, "Err403");
            //         return;
            //     }
            //     else {
            //         userId = decoded.data;
            //         console.log(userId);
            //     }
            // });

            let revoketokenQuery = "Insert into revoked_tokens (token) values (?)"
            let params = [accessToken];

            let mysqlPromise = util.promisify(utility.mysqlHandler);
            
            mysqlPromise(revoketokenQuery, params, mysqlConnection)
            .then((response) => {
                    let message = "User Logged out"
                    responder.respond({
                    message: message,
                }, res);
            })
            .catch((error) => {
                console.log(error);
                errorHandler.errorHandler(500, "Something went wrong", res, "Err500");
                return;
            })
        }catch(error) {
            console.log(error);
            errorHandler.errorHandler(500, "Something went wrong2", res, "Err500");
            return;
        }
    });
}



    // res.status(200).json({
    //     message: "number1 or number2 missing",
    //     success: false,
    //     error: true,
    // })
