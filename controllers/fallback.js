module.exports = function(urlPrsr, app, authCheck, errorHandler, responder, mongoose, userMdl, admin) {
    app.get("*", urlPrsr, authCheck, (req, res) => {try{
        console.log("\n|__________ You have reached the fallback __________|\n")
        res.send("|__________ You have reached the fallback __________|")
    }
    catch(err)
    {
        console.log("\n|_____ Error catched by Try Catch _____|\n",err,"\n");
        errorHandler.errorHandler(500, err.toString(), res);
    }
    });
};