var router = require("express").Router();

function nuzlocke_router(users) {

    router.get(':username/nuzlockes/', users.getToken, (req, res) => {
        const token = req.token;
        users.verifyToken(token,
            (sessionInfo) => {
                // TODO: Return created nuzlockes
            },
            (err) => res.json({
                err
            })
        );

    });

    router.post(':username/nuzlockes/', users.getToken, (req, res) => {
        const token = req.token;
        users.verifyToken(token,
            (sessionInfo) => {
                // TODO: Add new nuzlocke
            },
            (err) => res.json({
                err
            })
        );

    });

    return router;
}

exports.nuzlocke_router = nuzlocke_router;