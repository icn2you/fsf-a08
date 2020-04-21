require('dotenv').config();

const _ = require('lodash'),
      keys = require('./keys.js'),
      // spotify = new Spotify(keys.spotify),
      usrCmd = process.argv[2],
      searchTerm = process.argv.slice(3);

switch (usrCmd) {
  case 'concert-this':
    console.log(`You want to ${usrCmd} for ${searchTerm.join(' ')}!`);
    break;
  case 'movie-this':
    console.log(`You want to ${usrCmd} for ${searchTerm.join(' ')}!`);
    break;
  case 'spotify-this-song':
    console.log(`You want to ${usrCmd} for ${searchTerm.join(' ')}!`);
    break;
  case 'do-what-it-says':
    console.log(`You want to ${usrCmd} for ${searchTerm.join(' ')}!`);
    break;
  default:
    console.log('BAD USER! Invalid command entered.');
};