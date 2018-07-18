const databaseUrl = process.env.DATA_NUZLOCKE_PLANNER;
const dbName = databaseUrl.split("/").pop();
var mongo = require('mongodb');
var mongoObjectId = require('mongodb').ObjectID;
var mongoClient = mongo.MongoClient;
var NuzlockePlannerError = require("./lib/NuzlockePlannerError");

function mapToObjectID(ids) {
    var result = [];
    for (var i = 0; i < ids.length; i++)
        result[i] = new mongoObjectId(ids[i]);

    return result;
}

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
                        if (!result) {
                            onError(new NuzlockePlannerError("Null result"));
                        } else {
                            result.nuzlockes = mapToObjectID(result.nuzlockes);
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
                }
            );
        },
        onError 
    );
}


function addNuzlocke(user, nuzlocke, onSuccess, onError) {
    if (nuzlocke.hasOwnProperty("trainer_name") &&
        nuzlocke.hasOwnProperty("gender") &&
        nuzlocke.hasOwnProperty("game")) {
        nuzlocke.pokemon = [];
        nuzlocke.team = [];
        connect(
            (db) => {
                db.collection("nuzlockes").insertOne(nuzlocke, function(err, res) {
                    if (err) {
                        onError(err);
                    } else {
                        var id = res.insertedId;
                        db.collection("users").updateOne({ user:user }, { $push: { nuzlockes: id }}, 
                        (err, res) => {
                            if (err)
                                onError(err)
                            else {
                                nuzlocke._id = id;
                                onSuccess(nuzlocke);
                            }
                        });
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
    nuzlockesId = new mongoObjectId(nuzlockesId);
    connect(
        (db) => {
           db.collection("nuzlockes").deleteOne({ _id: nuzlockesId }, 
            (err, res) => {
                if (err) {
                    onError(err);
                } else {
                    db.collection("users").updateOne({ user:user }, { $pull: { nuzlockes: nuzlockesId }},
                    (err, res) => {
                        if (err) {
                            onError(err);
                        } else {
                            onSuccess();
                        }                
                    });
                }
            });
        },
        onError 
    );
}

function getNuzlockeUser(nuzlockeId, onSuccess, onError) {
    connect(
        (db) => {
            var collection = db.collection("users");
            collection.findOne({nuzlockes: { $all: [new mongoObjectId(nuzlockeId)]} },
                (err, result) => {
                    if(err) {
                        onError(err);
                    } else {
                        onSuccess(result);
                    }
                }
            );
        },
        onError 
    );
}   


function catchPokemon(nuzlockeId, pokemon, onSuccess, onError) {
    if(pokemon.hasOwnProperty("dex_number") && 
        pokemon.hasOwnProperty("found_at")) {
            getNuzlocke(nuzlockeId, 
                (result) => {
                    if(containsAll(result.pokemon, team)){
                        connect(
                            (db) => {
                                var collection = db.collection("nuzlockes");
                                collection.updateOne({nuzlockes: { _id: new mongoObjectId(nuzlockeId)}}, {  $push: { pokemon: pokemon } },
                                    (err) => {
                                        if(err) {
                                            onError(err);
                                        } else {
                                            onSuccess();
                                        }
                                    }
                                );
                            },
                            onError 
                        );
                    } else {
                        onError(new NuzlockePlannerError("Invalid team"));
                    }
                   
                },
                onError
            );
            
    } else {
        onError(new NuzlockePlannerError("Properties missing"));
    }
}

function updateTeam(nuzlockeId, team, onSuccess, onError) {
    getNuzlocke(nuzlockeId, 
        (result) => {
            if(containsAll(result.pokemon, team)) {
                connect(
                    (db) => {
                        var collection = db.collection("nuzlockes");
                        collection.updateOne({nuzlockes: { _id: new mongoObjectId(nuzlockeId)}}, { team: team },
                            (err) => {
                                if(err) {
                                    onError(err);
                                } else {
                                    onSuccess();
                                }
                            }
                        );
                    },
                    onError 
                );
            } else {
                onError(new NuzlockePlannerError("Invalid team"));
            }
           
        },
        onError
    );
}

function addUser(user, onSuccess, onError) {
    connect(
        (db) => {
            db.collection("users").insertOne({ user: user, nuzlockes: [] },
                (err, res) => {
                    if (err) {
                        onError(new NuzlockePlannerError("Error adding a new user"));
                    } else {
                        onSuccess(res.insertedId);
                    }
                }
            )
        },
        onError 
    );
}

function deleteUser(user, onSuccess, onError) {
    connect(
        (db) => {
            db.collection("users").deleteOne({ user: user },
                (err) => {
                    if(err) {
                        onError(new NuzlockePlannerError("Error deleting the user"));
                    } else {
                        db.collection("nuzlockes").deleteMany({ user: user },
                            (err) => {
                                if (err) {
                                    onError(new NuzlockePlannerError("Error deleting the user"));
                                } else {
                                    onSuccess("Nuzlockes and user deleted");
                                }
                            }
                        );
                    }
                }
            )
        },
        onError 
    );
}

function getNuzlocke(nuzlockeId, onSuccess, onError) {
    connect(
        (db) => {
            var collection = db.collection("nuzlockes");
            collection.findOne({_id: new mongoObjectId(nuzlockeId)},
                (err, result) => {
                    if(err) {
                        onError(err);
                    } else {
                        onSuccess(result);
                    }
                }
            );
        },
        onError 
    );
}

// Array1 contains all the elements in array2
function containsAll(array1, array2) {
    for(let i = 0; i < array2.length; i++) {
        if (!array1.includes(array2[i]))
            return false;
    }
    return true;
}

exports.list = listNuzlockes;
exports.add = addNuzlocke;
exports.get = getNuzlocke;
exports.getNuzlockeUser = getNuzlockeUser;
exports.delete = deleteNuzlocke;
exports.addUser = addUser;
exports.deleteUser = deleteUser;
exports.catchPokemon = catchPokemon;
exports.switchTeam = updateTeam;