require('dotenv').config();

const _ = require('lodash'),
      axios = require('axios'),
      fs = require('fs'),
      moment = require('moment'),
      Spotify = require('node-spotify-api'),
      keys = require('./keys.js'),
      spotify = new Spotify(keys.spotify),
      usrCmd = process.argv[2],
      searchTerms = process.argv.slice(3);

let queryURL = '';

// DEBUG:
// console.log(`You want to ${usrCmd} for ${searchTerms.join(' ')}!`);

/**************************************************************
  logOutput()
  - Append msg and data to specified file.
 **************************************************************/
function logOutput(file, msg, data) {
  fs.appendFile(file, 
    `\n${msg}\n${data}`, 
    (err) => {
    if (err)
      console.error(err);
  });
}

/**************************************************************
  concertThis()
  - Query concert data for specified artist.
 **************************************************************/
function concertThis() {
  // Format artist's name for query URL and output to user.
  let artist = '', 
      artistProperName = '';

  _.forEach(searchTerms, (word) => {
    let partialName = _.lowerCase(word);

    artist += `${partialName}+`;
    artistProperName += _.upperFirst(partialName) + ' ';
  });

  artist = _.trimEnd(artist, '+');
  artistProperName = _.trimEnd(artistProperName, ' ');
  
  // Create query URL, and get data from Bandsintown
  queryURL = `https://rest.bandsintown.com/artists/${artist}/events?app_id=codingbootcamp`;

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
      logOutput('log.txt', userMsg, concertInfo.join('\n'));   
    })
    .catch(console.error);
}

/**************************************************************
  movieThis()
  - Query relevant OMDb data for specified movie.
 **************************************************************/
function movieThis() {
  // Format the name of the movie for query to OMDB API.
  let movie = (searchTerms.length > 0) ? '' : 'Mr.+Nobody',
      movieProperName = '',
      movieInfo = [];
  
  _.forEach(searchTerms, (term) => {
    let partialName = _.capitalize(term);

    movie += `${partialName}+`;
    movieProperName += `${partialName} `;
  });

  movie = _.trimEnd(movie, '+');
  movieProperName = _.trimEnd(movieProperName, ' ');   

  // Create query URL, and get data from OMDb.
  queryURL = `http://www.omdbapi.com/?apikey=trilogy&s=${movie}&type=movie`;

  axios.get(queryURL)
    .then((res) => {
      // DEBUG:
      // console.log(res);

      const movieData = res.data.Search;
      let resCount = 0;
      
      // For each result returned in the first query, execute a second query
      // to obtain the relevant movie details of that particular result.
      _.forEach(movieData, (movie) => {
        let movieIDQueryURL = `http://www.omdbapi.com/?apikey=trilogy&i=${movie.imdbID}`;


        axios.get(movieIDQueryURL)
          .then((res) => {
            // DEBUG:
            // console.log(res);

            let release = res.data;

            movieInfo.push(
              '--------------------------------------------------\n' +
              `Movie Title: ${release.Title}\n` +
              `Year Released: ${release.Year}\n` +
              `IMDb Rating: ${release.imdbRating}\n` +
              `Rotten Tomatoes Rating: ${release.Ratings}\n` +
              `Production Country: ${release.Country}\n` +
              `Primary Language: ${release.Language}\n` +
              `Plot: ${release.Plot}\n` +
              `Actors: ${release.Actors}`
            );

            resCount++;

            // If the relevant details of all movies have been retrieved,
            // output the result(s) to the UI. 
            if (resCount === movieData.length) {
              let userMsg = '';
          
              if (movieInfo.length > 0) {
                userMsg = `\nFollowing are ${resCount} releases for *${movieProperName}*:\n`;
                movieInfo.push('--------------------------------------------------\n');
              }
              else {
                userMsg = `I couldn't find any movies entitled *${movieProperName}*. =[`
              }
          
              // Output result(s) to user.
              console.log(userMsg);
              
              _.forEach(movieInfo, (movie) => {
                console.log(movie);
              });

              // Output result(s) to log file.
              logOutput('log.txt', userMsg, movieInfo.join('\n'));              
            }
          })
          .catch(console.error)       
      });
    });
}

/**************************************************************
  spotifyThis()
  - Query relevant Spotify data for specified song.
 **************************************************************/
function spotifyThis() {
  // Format the name of the tune for query to Spotify API.
  let tune = (searchTerms.length > 0) ? '' : 'The Sign';
  
  _.forEach(searchTerms, (word) => {
    tune += `${_.capitalize(word)} `;
  });

  tune = _.trimEnd(tune, ' ');

  spotify
    .search({ type: 'track', query: tune })
    .then((res) => {
      // DEBUG:
      // console.log(res);

      const tunesData = res.tracks;
      let tunesInfo = [];

      _.forEach(tunesData.items, (song) => {
        tunesInfo.push(
          '----------------------------------------------------------------------\n' +
          `Artist(s): ${song.artists[0].name}\n` +
          `Song: ${song.name}\n` +
          `Preview: ${song.preview_url}\n` +
          `Album: ${song.album.name}`
        );
      });          

      let userMsg = '';

      if (tunesInfo.length > 0) {
        userMsg = `\nFollowing are the matches Spotify found for "${tune}":\n`;
        tunesInfo.push('----------------------------------------------------------------------\n');
      }
      else {
        userMsg = `Spotify has no matches for "${tune}". =[`
      }

      // Output result(s) to user.
      console.log(userMsg);

      _.forEach(tunesInfo, (song) => {
        console.log(song);
      });

      // Output result(s) to log file.
      logOutput('log.txt', userMsg, tunesInfo.join('\n'));   
    })
    .catch(console.error);
}

switch (usrCmd) {
  case 'concert-this':
    // ASSERT: User wants to see concert info for a particular artist.
    concertThis();

    break;
  case 'movie-this':
    // ASSERT: User wants details for a particular movie.
    movieThis();

    break;
  case 'spotify-this-song':
    // ASSERT: User wants details for a particular song/tune.
    spotifyThis();

    break;
  case 'do-what-it-says':
    fs.readFile('random.txt', 'utf8', (err, data) => {
      if (err) throw err;

      let input = data.split(',');

      console.log(input);
    });
    break;
  default:
    console.log('BAD USER! Invalid command entered.');
};