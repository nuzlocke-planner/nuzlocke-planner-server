function nuzlocke_router(app, users, nuzlockeDb) {
    app.get('/nuzlocke/', users.getToken, (req, res) => {
        const token = req.token;
        users.verifyToken(token,
            (sessionInfo) => {
                nuzlockeDb.list(sessionInfo.user.username, 
                    (nuz) => {
                        res.json({nuz});
                        console.log(sessionInfo.user.username + " is listing its nuzlockes");
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
                        console.log("Nuzlocke successful added by " + sessionInfo.user.username);
                        res.json({code: 200, message: "Nuzlocke successfully added."})
                    } ,
                    (err) => {
                        console.log(err);
                        res.json({ code: 400, message: err })
                    } 
                );
            },
            (err) => {
                res.json({
                    error: err,
                    message: "Database error"
                });
                console.log("Error adding a nuzlocke");
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
                            console.log("Nuzlocke " + req.body.nuzlocke_id + " deleted successfully by " + sessionInfo.user.username);
                            res.json({
                                status: 200,
                                message: "Deleted successfully"
                            });
                        },
                        (err) => {
                            console.log("Nuzlocke " + req.body.nuzlocke_id + " cannot be deleted.");
                            res.json({
                                error: err,
                                message: "Database error"
                            });
                        });
                    } else {
                        console.log("FORBIDDEN: Nuzlocke " + req.body.nuzlocke_id + " cannot be deleted by " + sessionInfo.user.username);
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
                    console.log("Cannot get the user of nuzlocke " + req.body.nuzlocke_id);
                })
            },
            (err) => {
                res.json({
                    error: err,
                    message: "Database error"
                });
                console.log("Error deleting a nuzlocke");
            }
        );
    });
}

exports.nuzlocke_router = nuzlocke_router;