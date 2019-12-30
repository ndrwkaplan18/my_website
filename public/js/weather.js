const axios = require('axios');

var getWeather = async (address) => {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
    var encodedAddress = encodeURIComponent(address);
    return axios.get('http://162.243.171.11/amkapla2/hw7/aks/js/keys.json').then((result) => {
        const {googleApiKey, darkSkyApiKey} = result.data;
        var geocodeURL = `https://maps.googleapis.com/maps/api/geocode/json?key=${googleApiKey}&address=${encodedAddress}`;
        var result;
        return axios.get(geocodeURL).then((response) => {
            if(response.data.status === 'ZERO_RESULTS'){
                throw new Error('Unable to find that address');
            }
            result = 'Weather for ' + response.data.results[0].formatted_address;
            var lat = response.data.results[0].geometry.location.lat;
            var lng = response.data.results[0].geometry.location.lng;
            var weatherURL = `https://api.darksky.net/forecast/${darkSkyApiKey}/${lat},${lng}`;
    
            return axios.get(weatherURL).then((response) => {
                var temperature = response.data.currently.temperature;
                var apparentTemperature = response.data.currently.apparentTemperature;
                result = result + `:<br> Its currently ${temperature}°. It feels like ${apparentTemperature}°.`;
                return result;
            });
    });
    }).catch((e) => {
        if(e.code === 'ENOTFOUND'){
            result = 'Unable to connect to API servers';
        }
        else {
            console.log(e.message);
        }
    });
}

module.exports = {
    getWeather
}