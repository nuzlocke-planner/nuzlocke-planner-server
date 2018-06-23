const redis = require('redis');
const jwt = require('jsonwebtoken');
const NotExistError = require("./lib/NotExistError");
const InvalidCredentialsError = require("./lib/InvalidCredentialsError");
const RedisError = require("./lib/RedisError");
const crypto = require("crypto");

var secretKey;

var client;

// Module options
var options = {
    passwordValidation: (pass) => pass.length > 9,
    passwordValidationErrMessage: 'Password must have at leat 9 characters.'
}

function displayMessage(msg) {
    console.log(msg);
}


function initRedisClient(credentials, onConnect, onError) {
    const connectionString = 'redis://' + credentials.username + ':' +
        credentials.password + '@' + credentials.host + ':' + credentials.port;

    client = redis.createClient(connectionString);

    // Generate a random key to access to jwt
    secretKey = crypto.randomBytes(20).toString('hex');

    client.on('error', (err) => onError(new RedisError(err)));
    client.on('connect', () => onConnect());
}


// User is an objet with at least 'username' and 'password' properties
// Callback is a function that recieves and error and a message
function register(userId, user, callback) {
    if (user.hasOwnProperty('username') && user.hasOwnProperty('password')) {
        if (options.passwordValidation(user.password)) {
            client.exists(userId, (err, reply) => {
                if (reply === 1 || err) {
                    // User already exists
                    callback(new NotExistError("User does not exist."));
                } else {
                    // New user to register
                    client.hmset(userId, user);
                    callback(null, 'User registered successfully');
                }
            });
        } else {
            callback('Password is not valid', options.passwordValidationErrMessage);
        }
    } else {
        callback('Invalid user object.', 'Check if user object has usernamen and password properties.');
    }
}


function getUser(userId, onSucced, onError = displayMessage) {
    client.exists(userId, (err, reply) => {
        if (reply === 0) {
            onError(new NotExistError("User does not exist."));
        } else if (err) {
            onError(new RedisError(err));
        } else {
            client.hgetall(userId, (err, user) => {
                if (err) {
                    onError(new RedisError(err));
                } else {
                    onSucced(user);
                }
            });
        }
    });
}

function deleteUser(userId, onDelete, onError) {
    client.exists(userId, (err, reply) => {
        if (reply === 0) {
            onError(new NotExistError("User does not exist."))
        } else if (err) {
            onError(new RedisError(err));
        } else {
            client.del(userId, (err, reply) => {
                if (err) {
                    onError(new RedisError(err));
                } else {
                    onDelete('User deleted successfully');
                }
            });
        }
    });
}


function login(userId, password, expiresIn, onSucced, onError) {
    getUser(userId, (user) => {
            if (user.password === password) {
                // Generate the auth token
                jwt.sign({
                    user: user
                }, secretKey, {
                    expiresIn: expiresIn,
                }, (err, token) => {
                    if (err) {
                        onError(new RedisError(err));
                    } else {
                        onSucced(token);
                    }
                });
            } else {
                onError(new InvalidCredentialsError('Invalid password'));
            }
        },
        onError
    );
}

//FORMAT TOKEN
// Authorization: Bearer <access_token>

// Set token to request object
function getToken(req, res, next) {
    // Get auth header value
    const bearerHeader = req.headers['authorization'];

    // Check if not undefine
    if (typeof bearerHeader !== 'undefined') {
        // split at the space
        const token = bearerHeader.split(' ')[1];
        // Set the token to request
        req.token = token;
        // Call the function after the middleware one
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}


function verifyToken(token, onValid, onInvalid = displayMessage) {
    jwt.verify(token, secretKey, (err, authData) => {
        if (err) {
            onInvalid(new InvalidCredentialsError("Invalid token."));
        } else {
            onValid(authData);
        }
    });
}


exports.initRedisClient = initRedisClient;
exports.register = register;
exports.getUser = getUser;
exports.deleteUser = deleteUser;
exports.options = options;
exports.login = login;
exports.getToken = getToken;
exports.verifyToken = verifyToken;