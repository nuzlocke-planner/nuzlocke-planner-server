var log = require("../utils").log;

// To generate the user id, any kind of id is valid, but it must be unique
function hash(s) {
    return s.split("")
        .reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
}

function usersRouter(app, users, nuzlockeDb) {
    // Override password validation
    users.options.passwordValidation = (pass) => pass.length > 9 && pass.match(/[a-z]/i);
    users.options.passwordValidationErrMessage = 'Password must be larger than 9 characters and include at least one letter';

    // Register new user
    app.post('/auth/signup', (req, res) => {
        if (req.body.username && req.body.password && req.body.name && req.body.surname && req.body.email) {
            // Use the ID that you prefer, this case will be using username hash
            const usernameHash = hash(req.body.username);
            var user = {
                'username': req.body.username,
                'password': req.body.password,
                'name': req.body.name,
                'surname': req.body.surname,
                'email': req.body.email
            };

            // Register new user
            users.register(usernameHash, user, (err, msg) => {
                if (!err) {
                    nuzlockeDb.addUser(user.username, 
                        (result) => {
                            log("New user " + usernameHash + " - " + req.body.username + " registered");
                            log("User " + result + " - " + req.body.username + " added on nuzlocke database registered.") 
                            res.json({
                                status: 200,
                                msg: 'New user registerd',
                                id: usernameHash
                            });
                        },
                        (err) => {
                            res.json({
                                error: err,
                            });
                            log("ERROR: Cannot add user " + user.username + " at nuzlockes database.");
                            users.deleteUser(hash(user.username),
                                (msg) => log("Deleted user " + user.username + " becacuse it cannot be inserted on nuzlockdb"),
                                (err) => log("ERROR: Inconsistent data. Look yout data looking for user " + user.usuername)
                            );
                        }
                    );
                } else {
                    res.json({
                        error: err,
                        msg: msg
                    });
                    log("ERROR: Database error registering a user: " + err);
                }
            });
        } else {
            res.json({
                status: 400,
                msg: 'Missing some properties'
            });
            log("ERROR: Missing values for the register");
        }
    });

    // Get user info
    app.get('/auth/user/:username', (req, res) => {
        users.getUser(hash(req.params.username),
            (user) => res.json({ username: user.username, name: user.name, surname: user.surname, email: user.email }), 
            (err) => res.json({ err })
        );
    });

    // Get user info
    app.post('/auth/login', (req, res) => {
        if (req.body.username && req.body.password) {
            users.login(hash(req.body.username), 
                req.body.password, 
                "1000s",
                (token, user) => {
                    res.json({ user, token, timeout: 1000000 });
                    log("User " + user.username + " logged in successfully. "); 
                }, 
                (err) => {
                    res.json({ err });
                    log("ERROR: " + err); 
                }
            );
        } else {
            res.json({ err: 'Password and username are mandatory.' });
            log("ERROR: Missing values on login"); 
        }
    });

    // Delete user
    // Middle function to get the token
    app.get('/auth/delete/:username',  (req, res) => {
        if (req.params.username) {
            const token = req.token;
            const userId = hash(req.params.username);
            // users.verifyToken(token,
            //     (sessionInfo) => {
            //         users.getUser(userId, 
            //             (user) => {
            //                 if (sessionInfo.user.username === user.username) {
            //                     users.deleteUser(userId,
            //                         (msg) => res.json({ msg }),
            //                         (err) => res.json({ err })
            //                     );
            //                 } else {
            //                     res.json({ error: "You cannot delete other users" });
            //                 }
            //             },
            //             (err) => res.json({ err })
            //         )
            //     },
            //     (err) => res.json({ err })
            // );
            var onError = (err) => res.json({error: err});
            users.deleteUser(hash(req.params.username),
                msg => nuzlockeDb.deleteUser(req.params.username, (msg) => res.json({ msg }), onError),
                onError
            );
        } else {
            res.json({ msg: 'No username specified' });
        }
    });
}

exports.usersRouter = usersRouter;