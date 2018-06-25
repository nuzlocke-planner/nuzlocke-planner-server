var nuzlockeDb = require("../nuzlocke_db");

function nuzlocke_router(app, users) {
    app.get('/nuzlocke/', users.getToken, (req, res) => {
        const token = req.token;
        users.verifyToken(token,
            (sessionInfo) => {
                nuzlockeDb.list(sessionInfo.user.username, (nuz) => res.json({nuz}), (err) => {throw err;});
            },
            (err) => res.json({
                err
            })
        );
    });

    app.put('/nuzlocke/', users.getToken, (req, res) => {
        const token = req.token;
        users.verifyToken(token,
            (sessionInfo) => {
                var n = {
                    "user": sessionInfo.user.username,
                    "nuzlockes": []
                }
            },
            (err) => res.json({
                err
            })
        );

    });
}

exports.nuzlocke_router = nuzlocke_router;