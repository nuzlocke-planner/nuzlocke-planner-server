const log = require("../utils").log;

function nuzlocke_router(app, users, nuzlockeDb) {
    app.get('/nuzlocke/', users.getToken, (req, res) => {
        const token = req.token;
        users.verifyToken(token,
            (sessionInfo) => {
                nuzlockeDb.list(sessionInfo.user.username, 
                    (nuz) => {
                        res.json({nuz});
                        log("User: " + sessionInfo.user.username + " is listing its nuzlockes");
                    }, (err) => {throw err;});
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
                nuzlockeDb.add(
                    sessionInfo.user.username, 
                    { 
                        generation: req.body.generation,
                        game: req.body.game,
                        trainer_name: req.body.trainer_name
                    },
                    () => {
                        log("Nuzlocke successful added by " + sessionInfo.user.username);
                        res.json({status: 200, message: "Nuzlocke successfully added."})
                    } ,
                    (err) => {
                        log(err);
                        res.json({ status: 400, message: err })
                    } 
                );
            },
            (err) => {
                res.json({
                    status: 403,
                    message: "Forbidden"
                });
                log("FORBIDDEN: Error adding a nuzlocke");
            }
        );
    });

    app.delete('/nuzlocke/', users.getToken, (req, res) => {
        const token = req.token;
        
        users.verifyToken(token,
            (sessionInfo) => {
                nuzlockeDb.getNuzlockeUser(req.body.nuzlocke_id, 
                (userDoc) => {
                    if (sessionInfo.user.username === userDoc.user) {
                        nuzlockeDb.delete(sessionInfo.user.username, req.body.nuzlocke_id,
                        () => {
                            log("Nuzlocke " + req.body.nuzlocke_id + " deleted successfully by " + sessionInfo.user.username);
                            res.json({
                                status: 200,
                                message: "Deleted successfully"
                            });
                        },
                        (err) => {
                            log("Nuzlocke " + req.body.nuzlocke_id + " cannot be deleted.");
                            res.json({
                                error: err,
                                message: "Database error"
                            });
                        });
                    } else {
                        log("FORBIDDEN: Nuzlocke " + req.body.nuzlocke_id + " cannot be deleted by " + sessionInfo.user.username);
                        res.json({
                            error: 403,
                            message: "Forbidden"
                        });
                    }
                },
                (err) => {
                    res.json({
                        error: err,
                        message: "Database error"
                    });
                    log("Cannot get the user of nuzlocke " + req.body.nuzlocke_id);
                })
            },
            (err) => {
                res.json({
                    status: 403,
                    message: "Forbidden"
                });
                log("FORBIDDEN: Cannot delete any nuzlocke");
            }
        );
    });
}

exports.nuzlocke_router = nuzlocke_router;