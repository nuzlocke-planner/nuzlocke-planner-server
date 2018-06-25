const databaseUrl = process.env.DATA_NUZLOCKE_PLANNER;
var mongoClient = require('mongodb').MongoClient;

function listNuzlockes(userId, onSuccess, onError) {
    mongoClient.connect(url, function (err, db) {
        if (err) {
            onError(err);
        } else {
            // TODO: Get nuzlockes
            onSuccess(db);
            db.close();
        }
    });
}


function addNuzlocke(userId, nuzlocke, onSuccess, onError) {
    mongoClient.connect(url, function (err, db) {
        if (err) {
            onError(err);
        } else {
            // TODO: Add nuzlocke
            onSuccess(db);
            db.close();
        }
    });
}


function deleteNuzlocke(userId, nuzlockeId, onSuccess, onError) {
    mongoClient.connect(url, function (err, db) {
        if (err) {
            onError(err);
        } else {
            // TODO: Delete nuzlocke
            onSuccess(db);
            db.close();
        }
    });
}


function getNuzlocke(userId, nuzlockeId, onSuccess, onError) {
    mongoClient.connect(url, function (err, db) {
        if (err) {
            onError(err);
        } else {
            // TODO: Obtain a nuzlocke
            onSuccess(db);
            db.close();
        }
    });
}

exports.list = listNuzlockes;
exports.add = addNuzlocke;
exports.get = getNuzlocke;
exports.delete = deleteNuzlocke;