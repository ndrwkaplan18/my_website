const yargs = require('yargs');
const axios = require('axios');
const argv = yargs
    .options({
        a: {
            demand: true,
            alias: 'address',
            describe: 'Address for which to fetch the weather',
            string: true
        }
    })
    .help()
    .alias('help', 'h')
    .argv;

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
var encodedAddress = encodeURIComponent(argv.address);
const {googleApiKey, darkSkyApiKey} = require('./apiKeys');
var geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${googleApiKey}&address=${encodedAddress}`;

axios.get(geocodeURL).then((response) => {
    if(response.data.status === 'ZERO_RESULTS'){
        throw new Error('Unable to find that address');
    }
    console.log(response.data.results[0].formatted_address);
    var lat = response.data.results[0].geometry.location.lat;
    var lng = response.data.results[0].geometry.location.lng;
    var weatherURL = `https://api.darksky.net/forecast/${darkSkyApiKey}/${lat},${lng}`;

    return axios.get(weatherURL).then((response) => {
        var temperature = response.data.currently.temperature;
        var apparentTemperature = response.data.currently.apparentTemperature;
        console.log(`Its currently ${temperature}. It feels like ${apparentTemperature}.`);
    });

}).catch((e) => {
    if(e.code === 'ENOTFOUND'){
        console.log('Unable to connect to API servers');
    }
    else {
        console.log(e.message);
    }
});