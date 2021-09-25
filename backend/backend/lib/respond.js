exports.respond = function(data, res) {
    console.log("|______________ Responder Data ____________|");
    console.log(data)
    if (data) {
        res.status(200).json({
            status: "success",
            requestId: null,
            result: data
        });
    }
};