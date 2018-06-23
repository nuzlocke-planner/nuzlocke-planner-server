var router = require("express").Router();

// To generate the user id, any kind of id is valid, but it must be unique
function hash(s) {
    return s.split("")
        .reduce(function (a, b) {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a
        }, 0);
}

function usersRouter(users) {
    // Register new user
    router.post('/auth/signup', (req, res) => {
        if (req.body.username) {
            // Use the ID that you prefer, this case will be using username hash
            const usernameHash = hash(req.body.username);
            var user = {
                'username': req.body.username,
                'password': req.body.password
            };

            // Register new user
            users.register(usernameHash, user, (err, msg) => {
                if (!err) {
                    res.json({
                        status: 200,
                        msg: 'New user registerd',
                        id: usernameHash
                    });
                } else {
                    res.json({
                        error: err,
                        msg: msg
                    });
                }
            });
        } else {
            res.json({
                msg: 'No username specified'
            });
        }
    });

    // Get user info
    router.get('/auth/user/:username', (req, res) => {
        users.getUser(hash(req.params.username),
            (user) => res.json({ user }), 
            (err) => res.json({ err })
        );
    });

    // Get user info
    router.post('/auth/login', (req, res) => {
        if (req.body.username && req.body.password) {
            users.login(hash(req.body.username), 
                req.body.password, 
                "30s",
                (token) => res.json({ token }), 
                (err) => res.json({ err })
            );
        } else {
            res.json({ err: 'Password and username are mandatory.' });
        }
    });

    // Delete user
    // Middle function to get the token
    router.delete('/auth/delete', users.getToken, (req, res) => {
        if (req.body.username) {
            const token = req.token;
            const userId = hash(req.body.username);
            users.verifyToken(token,
                (sessionInfo) => {
                    users.getUser(userId, 
                        (user) => {
                            if (sessionInfo.user.username === user.username) {
                                users.deleteUser(userId,
                                    (msg) => res.json({ msg }),
                                    (err) => res.json({ err })
                                );
                            } else {
                                res.json({ error: "You cannot delete other users" });
                            }
                        },
                        (err) => res.json({ err })
                    )
                },
                (err) => res.json({ err })
            );
        } else {
            res.json({ msg: 'No username specified' });
        }
    });

    return router;
}

exports.usersRouter = usersRouter;