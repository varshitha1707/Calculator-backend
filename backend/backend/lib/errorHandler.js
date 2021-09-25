var errorCodeMessage = require("../config/errorHandlerConfig.json");
const Sentry = require('@sentry/node');

exports.errorHandler = function(errorCode, err, res, customErrorCode) {
    let defaultErrorCode = 500;

    if (!errorCode || errorCode === 500) {
        errorCode = defaultErrorCode;
    }


    var errorMessage;
    if (customErrorCode) {
        errorMessage = err;
    } else {
        errorMessage = errorCode.toString() in errorCodeMessage ?
            errorCodeMessage[errorCode.toString()] : "Something Went Wrong";
        customErrorCode = "E" + errorCode
    }
    if (err) {
        res.status(errorCode).json({
            status: "error",
            requestId: null,
            exception: {
                error: {
                    description: "",
                    extras: "",
                    code: customErrorCode + "",
                    message: errorMessage
                }
            }
        });
    }

    if (process.env.errorLogging && errorCode === 500) {
        console.log("|____________________ This got logged to sentry ____________________|")
        console.log(err.message)
        Sentry.captureException(new Error(err.message));
        console.log("|____________________ This got logged to sentry ____________________|")
    }
};