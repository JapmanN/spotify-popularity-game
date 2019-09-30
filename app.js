// ================
// REQUIRE PACKAGES
// ================
const express       = require("express"),
	  app           = express(),
	  SpotifyWebApi = require('spotify-web-api-node');

// =================
// APPLICATION SETUP
// =================
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));


// ================
// APPLICATION CODE
// ================
var spotifyApi = new SpotifyWebApi({
	scopes: ['user-read-private', 'user-read-email', 'user-follow-read', 'user-library-read'],
	redirectUri: 'REDIRECT_URI',
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	state: 'mySTATE'
});

// Create Authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(spotifyApi._credentials.scopes, spotifyApi._credentials.state);

app.get('/login', (req, res) => {
	res.redirect(authorizeURL);
});

app.get('/callback', (req, res) => {
	var code = req.query.code;	
	// Retrieve an access token and a refresh token
	
	spotifyApi.authorizationCodeGrant(code).then(function(data) {
		// Set the access token on the API object to use it in later calls
		spotifyApi.setAccessToken(data.body['access_token']);
		spotifyApi.setRefreshToken(data.body['refresh_token']);
		res.redirect('/app');
	}, function(err) {
		console.log('Something went wrong!', err);
	});
});

app.get('/app', (req, res) => {
	spotifyApi.getMe().then(function(user) {
		spotifyApi.getFollowedArtists().then(function(followedArtists) {
			spotifyApi.getMySavedTracks({limit: 50}).then(function(savedTracks) {
				// var songs = {};
				// savedTracks.body.items.forEach(function(track) {
				// 	var trackPopularity = track.track.popularity; 
				// 	songs[track.track.name] = trackPopularity;
				// });
				res.render("index", {user: user, followedArtists: followedArtists, savedTracks: savedTracks});
			}, function(err) {
				console.log('Something went wrong!', err);
			});
		}, function(err) {
			console.log('Something went wrong!', err);
		});
	}, function(err) {
		console.log('Something went wrong!', err);
	});
});

// ==============
// SERVER STARTUP
// ==============
app.listen(3000, () => { console.log("server is running..."); });