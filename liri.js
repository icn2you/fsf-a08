require('dotenv').config();

const _ = require('lodash'),
      axios = require('axios'),
      fs = require('fs'),
      moment = require('moment'),
      keys = require('./keys.js'),
      // spotify = new Spotify(keys.spotify),
      usrCmd = process.argv[2],
      searchTerms = process.argv.slice(3);

switch (usrCmd) {
  case 'concert-this':
    // ASSERT: User wants to see concert info for a particular artist.
    
    // Format artist's name for query URL and output to user.
    let artist = '', 
        artistProperName = '';

    _.forEach(searchTerms, (word) => {
      artist += `${_.lowerCase(word)}+`;
      artistProperName += _.upperFirst(word) + ' ';
    });

    artist = _.trimEnd(artist, '+');
    artistProperName = _.trimEnd(artistProperName, ' ');
    
    // Create query URL, and get data from Bandsintown
    const queryURL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;

    axios.get(queryURL)
      .then((res) => {
        // DEBUG:
        // console.log(res);

        const concertData = res.data;        
        let concertInfo = [];

        _.forEach(concertData, (concert) => {
          concertInfo.push(
              '--------------------------------------------------\n' +
              `Concert Venue: ${concert.venue.name}\n` +
              `Venue Location: ${concert.venue.location}\n` +
              `Concert Date: ${moment(concert.datetime).format('MM/DD/YYYY')}`
            );
        });

        let userMsg = '';

        if (concertInfo.length > 0) {
          userMsg = `\n${artistProperName} has the following concerts coming up:\n`;
          concertInfo.push('--------------------------------------------------\n');
        }
        else {
          userMsg = `${artistProperName} has no concerts coming up. =[`
        }

        // Output result(s) to user.
        console.log(userMsg);

        _.forEach(concertInfo, (concert) => {
          console.log(concert);
        })

        // Output result(s) to log file.
        fs.appendFile('log.txt', 
          `\n${userMsg}\n${concertInfo.join('\n')}`, 
          (err) => {
          if (err)
            console.error(err);
        });
      })
      .catch(console.error);

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