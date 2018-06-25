const databaseUrl = process.env.DATA_NUZLOCKE_PLANNER;
const dbName = databaseUrl.split("/").pop();
var mongo = require('mongodb');
var mongoClient = mongo.MongoClient;

var NuzlockePlannerError = function (message, error) {
    Error.call(this, message);
    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
    this.name = 'NuzlockePlannerError';
    this.message = message;
    if (error) this.inner = error;
};
  
NuzlockePlannerError.prototype = Object.create(Error.prototype);
NuzlockePlannerError.prototype.constructor = NuzlockePlannerError;
  
  
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
            var collection = db.collection("users");
            collection.findOne({user: user},
                (err, result) => {
                    if(err) {
                        onError(err);
                    } else {
                        for (var i = 0; i < result.nuzlockes.length; i++)
                            result.nuzlockes[i] = new mongo.ObjectID(result.nuzlockes[i]);
                            
                        db.collection("nuzlockes").find({ "_id" : {
                            $in: result.nuzlockes
                        }}).toArray((err, res) => {
                            if(err)
                                onError(err);
                            else
                                onSuccess(res);
                        });
                    }
                }
            );
        },
        onError 
    );
}


function addNuzlocke(user, nuzlocke, onSuccess, onError) {
    if (nuzlocke.hasOwnProperty("trainer_name") &&
        nuzlocke.hasOwnProperty("generation") &&
        nuzlocke.hasOwnProperty("game")) {
        connect(
            (db) => {

                db.collection("nuzlockes").insertOne(nuzlocke, function(err, res) {
                    if (err) {
                        onError(err);
                    } else {
                        onSuccess();
                    }
                  });
            },
            onError 
        );
    } else {
        onError(new NuzlockePlannerError("Properties missing"));
    }
}


function deleteNuzlocke(user, nuzlockesId, onSuccess, onError) {
    connect(
        (db) => {
           db.collection("nuzlockes").findOne({ user: user, _id: nuzlockesId })
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
