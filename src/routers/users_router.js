const log = require("../utils").log;
const UsersCtrl = require("../controllers/users.controller");

// To generate the user id, any kind of id is valid, but it must be unique
function hash(s) {
  return s.split("")
    .reduce(function (a, b) {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a
    }, 0);
}

function usersRouter(app, users) {
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
          UsersCtrl.add(user.username, (err) => {
            if (!err) {
              log("New user " + usernameHash + " - " + req.body.username + " registered");
              res.json({ status: 200, msg: 'New user registerd', id: usernameHash });
            } else {
              res.status(500).json({error: err, msg: "Error when trying to prepare the nuzlocke data"});
              log("ERROR: Cannot add user " + user.username + " at nuzlockes database.");
              users.deleteUser(hash(user.username),
                (msg) => log("Deleted user " + user.username + " becacuse it cannot be inserted on nuzlockdb"),
                (err) => log("ERROR: Inconsistent data. Look yout data looking for user " + user.username)
              );
            }
          });
        } else {
          res.json({ error: err, msg: msg });
          log("ERROR: Database error registering a user: " + err);
        }
      });
    } else {
      res.status(400).json({msg: 'Missing some properties'});
      log("ERROR: Missing values for the register");
    }
  });

  app.get('/auth/user/:username', (req, res) => {
    users.getUser(hash(req.params.username),
      (user) => res.json({
        username: user.username,
        name: user.name,
        surname: user.surname,
        email: user.email
      }),
      (err) => res.status(403).send(err)
    );
  });

  app.post('/auth/login', (req, res) => {
    if (req.body.username && req.body.password) {
      users.login(hash(req.body.username), req.body.password, "1000s", (token, user) => {
          res.json({ user, token, timeout: 1000000 });
          log("User " + user.username + " logged in successfully. ");
        },
        (err) => {
          res.status(403).send(err);
          log("ERROR: " + err);
        }
      );
    } else {
      res.status(400).json({err: 'Password and username are mandatory.'});
      log("ERROR: Missing values on login");
    }
  });

  // Delete user
  // Middle function to get the token
  app.delete('/auth/', users.getToken, (req, res) => {
    const token = req.token;
    users.verifyToken(token,
      (sessionInfo) => {
        const userId = hash(sessionInfo.user.username);
        users.deleteUser(userId,
            (msg) => UsersCtrl.delete(sessionInfo.user.username, () => res.json({ msg })),
            (err) => res.send({ err })
        );
      },
      (err) => res.send(err)
    );
  });
}

exports.usersRouter = usersRouter;