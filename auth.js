const { path_to_access_token } = require("./config");
const request = require("request");
const { addUserTokenRecord } = require("./firestore_service");

exports.auth = (req, res, db) => {
    var error = req.query.error;
    if (error == "access_denied") {
        return res.send(`<center><h1>Oops!. It looks like you denied to be friend with me :'(</h1></center><p>`);
    }


    var accessCode = req.query.code;
    if (accessCode) {
        var completePath = path_to_access_token(accessCode);
        request(completePath, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var teamInfo = JSON.parse(body);
                if (teamInfo.ok) {
                    addUserTokenRecord(db, teamInfo)
                        .then((v) => {
                            return res.send(
                                "<center><h1>You have authorized successfully.</h1></center>"
                            );
                        })
                        .catch((e) => {
                            return res.send(
                                `<center><h1>Oops!. Failed to authorize.</h1></center><p> ${JSON.stringify(
                  e
                )}</p><p>${JSON.stringify(teamInfo)}</p>`
                            );
                        });
                } else {
                    return res.send(
                        "<center><h1>Oops!. Failed to authorize. Please try again later.</h1></center>"
                    );
                }
            } else {
                return res.send(
                    "<center><h1>Oops!. Failed to authorize with invalid status code. Please try again later.</h1></center>"
                );
            }
        });
    } else {
        return res.send(
            "<center><h1>Invalid request. Please provide code parameter.</h1></center>"
        );
    }
};