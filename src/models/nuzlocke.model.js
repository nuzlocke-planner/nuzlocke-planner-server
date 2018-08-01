var mongoose = require('mongoose');
var Schema = mongoose.Schema;

let pokemonSchema = Schema({
  dex_number: {
    type: Number,
    required: true
  },
  found_at: {
    type: Number,
    required: true
  },
  nickname: {
    type: String,
    required: true
  }
});

let gameSchema = Schema({
  generation: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  version_group: {
    type: String,
    required: true
  }
});

var NuzlockeSchema = Schema({
  game: {
   type: gameSchema,
   required: true
  },
  gender: {
    type: String,
    required: true
  },
  trainer_name: {
    type: String,
    required: true
  },
  pokemon: {
    type: [pokemonSchema.tree],
    default: [],
  },
  team: {
    type: [pokemonSchema],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

var NuzlockeModel = mongoose.model('Nuzlocke', NuzlockeSchema);

module.exports = NuzlockeModel;