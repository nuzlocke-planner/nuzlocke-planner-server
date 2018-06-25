const databaseUrl = process.env.DATA_NUZLOCKE_PLANNER;
const dbName = databaseUrl.split("/").pop();

var mongoClient = require('mongodb').MongoClient;

function connect (happy, error) {
    mongoClient.connect(databaseUrl, function (err, db) {
        if (err) {
            error(err);
        } else {
            happy(db.db(dbName));
        }
    });
}

function listNuzlockes(user, onSuccess, onError) {
    connect(
        (db) => {
            var collection = db.collection("nuzlockes");
            collection.find({user: user}).project({ "user": 0, "nuzlockes.pokemon": 0 }).toArray(
                (err, result) => {
                    if(err)
                        onError(err);
                    else
                        onSuccess(result[0]);
                }
            );
        },
        onError 
    );
}


function addNuzlocke(user, nuzlocke, onSuccess, onError) {
    connect(
        (db) => {
           // TODO
        },
        onError 
    );
}


function deleteNuzlocke(user, nuzlockeId, onSuccess, onError) {
    connect(
        (db) => {
           // TODO
        },
        onError 
    );
}


function getNuzlocke(user, nuzlockeId, onSuccess, onError) {
    connect(
        (db) => {
           // TODO
        },
        onError 
    );
}

exports.list = listNuzlockes;
exports.add = addNuzlocke;
exports.get = getNuzlocke;
exports.delete = deleteNuzlocke;