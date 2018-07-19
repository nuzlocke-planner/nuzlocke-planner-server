const log = require("../utils").log;

function same_user(users, nuzlockeDb, res, nuzlocke_id, token, callback) {
    users.verifyToken(token,
        (sessionInfo) => {
            nuzlockeDb.getNuzlockeUser(nuzlocke_id, 
            (userDoc) => {
                if (userDoc && sessionInfo.user.username === userDoc.user) {
                    callback(sessionInfo);
                } else {
                    log("FORBIDDEN: Nuzlocke " + nuzlocke_id + " cannot be edited by " + sessionInfo.user.username);
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
                log("Cannot get the user of nuzlocke " + nuzlocke_id);
            })
        },
        (err) => {
            res.json({
                status: 403,
                message: "Forbidden"
            });
        }
    );
}

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
                        game: {
                            generation: req.body.generation,
                            name: req.body.game_name
                        }, 
                        gender: req.body.gender,
                        trainer_name: req.body.trainer_name
                    },
                    (added) => {
                        log("Nuzlocke successfully added by " + sessionInfo.user.username);
                        res.json({status: 200, message: "Nuzlocke " + added._id + " successfully added.", added});
                    } ,
                    (err) => {
                        log(err);
                        res.json({ status: 500, message: err })
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

    app.post('/nuzlocke/:id/catch', users.getToken, (req, res) => {
        same_user(users, nuzlockeDb, res, req.params.id, req.token, info => {
            nuzlockeDb.catchPokemon(req.params.id,  { dex_number: req.body.dex_number, found_at:  req.body.found_at},
            () => {
                log(info.user.username + " added a new pokemon " + req.body.dex_number + " to nuzlocke " +  req.params.id);
                res.json({
                    status: 200,
                    message: "Pokemon added successfully"
                });
            },
            (err) => {
                log(info.user.username + " cannot add the pokemon " + req.body.dex_number + " to nuzlocke " + req.params.id);
                res.json({
                    error: err,
                    message: "Database error"
                });
            });
        });
    });

    app.post('/nuzlocke/:id/team', users.getToken, (req, res) => {
        same_user(users, nuzlockeDb, res, req.params.id, req.token, info => {
            nuzlockeDb.updateTeam(req.params.id,  req.body.team,
            () => {
                log(info.user.username + " added a new pokemon " + req.body.dex_number + " to nuzlocke " +  req.params.id);
                res.json({
                    status: 200,
                    message: "Team edited successfully",
                    team: req.body.team
                });
            },
            (err) => {
                log(info.user.username + " cannot edit the team of nuzlocke " + req.params.id);
                res.json({
                    error: err,
                    message: "Database error"
                });
            });
        });
    });

    app.delete('/nuzlocke/:id', users.getToken, (req, res) => {
        same_user(users, nuzlockeDb, res, req.params.id, req.token, info => {
            nuzlockeDb.delete(info.user.username, req.params.id,
            () => {
                log("Nuzlocke " + req.params.id + " deleted successfully by " + info.user.username);
                res.json({
                    status: 200,
                    message: "Deleted successfully"
                });
            },
            (err) => {
                log("Nuzlocke " + req.params.id + " cannot be deleted.");
                res.json({
                    error: err,
                    message: "Database error"
                });
            });
        });
    });
}

exports.nuzlocke_router = nuzlocke_router;