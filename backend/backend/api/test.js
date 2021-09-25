module.exports = function(urlPrsr, app, errorHandler, responder) {

    app.post("/api/calculator/functionalities", urlPrsr, (req, res) => { 
        try {
            let body = req.body;
            let num1 = body.number1;
            let num2 = body.number2;
            let action = body.Action;

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
                
            let result = num1 + num2;
            responder.respond(result,res);
            return;
            }
            else if(action==="subtract") {
                let result = num1 - num2;
                responder.respond(result,res);
            return;
            }   
            else if(action==="multiply") {
                let result = num1 * num2;
                responder.respond(result,res);
            return;
            }
            else if(action==="divide") {
                let result = num1 / num2;
                responder.respond(result,res);
            return;
            }
            else {
                errorHandler.errorHandler(400, "Invalid action", res, "Err400");
                return;
            }
            
        }catch(error) {
            errorHandler.errorHandler(500, error, res);
            return;
        }
    });
    
}






                // res.status(200).json({
                //     message: "number1 or number2 missing",
                //     success: false,
                //     error: true,
                // });