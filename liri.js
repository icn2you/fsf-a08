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
console.log(`You want to ${usrCmd} for ${searchTerms.join(' ')}!`);

switch (usrCmd) {
  case 'concert-this':
    // ASSERT: User wants to see concert info for a particular artist.
    
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
    // ASSERT: User wants details for a particular movie.

    // Set the maximum number of results to return
    const numMovies = 25;

    // Format the name of the movie for query to OMDB API.
    let movie = (searchTerms.length > 0) ? '' : 'Mr.+Nobody',
        movieProperName = '';
    
    _.forEach(searchTerms, (term) => {
      let partialName = _.capitalize(term);

      movie += `${partialName}+`;
      movieProperName += `${partialName} `;
    });

    movie = _.trimEnd(movie, '+');
    movieProperName = _.trimEnd(movieProperName, ' ');   

    // Create query URL, and get data from Bandsintown
    queryURL = `http://www.omdbapi.com/?apikey=trilogy&s=${movie}&type=movie&page=${numMovies}`;

    async function queryMovieDB() {
      let movieInfo = [];

      await axios.get(queryURL)
        .then((res) => {
          // DEBUG:
          // console.log(res);

          const movieData = res.data.Search;        
          // console.log(movieData);
          
          _.forEach(movieData, async (movie) => {
            let movieIDQueryURL = `http://www.omdbapi.com/?apikey=trilogy&i=${movie.imdbID}`;


            await axios.get(movieIDQueryURL)
              .then((res) => {
                // DEBUG:
                // console.log(res);

                let release = res.data;

                console.log(release.Title);

                movieInfo.push(
                  '--------------------------------------------------\n' +
                  `Movie Title: ${release.Title}\n` +
                  `Year Released: ${release.Year}\n` +
                  `IMDb Rating: ${release.imdbRating}\n` +
                  `Rotten Tomatoes Rating: ${release.Ratings}\n` +
                  `Production Country: ${release.Country}\n` +
                  `Primary Language: ${release.Language}\n` +
                  `Plot: ${release.Plot}\n` +
                  `Actors: ${release.Actors}\n`
                );

                console.log(`movieInfo has ${movieInfo.length} elements.`);

              })
              .catch(console.error)       
          });
        });

      return movieInfo;
    }

    const movies = queryMovieDB();

    console.log(`movieInfo has a total of ${movies.length} elements.`);

    let userMsg = '';

    if (movies.length > 0) {
      userMsg = `\nFollowing are ${numMovies} releases for ${movieProperName}:\n`;
      movieInfo.push('--------------------------------------------------\n');
    }
    else {
      userMsg = `I couldn't find any movies entitled *${movieProperName}*. =[`
    }

    // Output result(s) to user.
    console.log(userMsg);

    _.forEach(movies, (movie) => {
      console.log(movie);
    });



          /*

        });

        // Output result(s) to log file.
        fs.appendFile('log.txt', 
          `\n${userMsg}\n${concertInfo.join('\n')}`, 
          (err) => {
          if (err)
            console.error(err);
        });
        */


    break;
  case 'spotify-this-song':
    // ASSERT: User wants details for a particular song/tune.

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
        fs.appendFile('log.txt', 
          `\n${userMsg}\n${tunesInfo.join('\n')}`, 
          (err) => {
          if (err)
            console.error(err);
        });
      })
      .catch(console.error);

    break;
  case 'do-what-it-says':
    console.log('UNDER CONSTRUCTION');
    break;
  default:
    console.log('BAD USER! Invalid command entered.');
};