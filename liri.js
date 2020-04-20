require('dotenv').config();

const keys = require('./keys.js'),
      spotify = new Spotify(keys.spotify);