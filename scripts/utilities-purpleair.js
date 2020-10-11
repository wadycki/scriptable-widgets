const API_URL = 'https://www.purpleair.com/json?show=';
let utilities = importModule('utilities.js')

module.exports.purpleAirURL = function(data) {
    return 'https://www.purpleair.com/map?opt=1/i/mAQI/a10/cC0&select=' + data.sensor_id + '#14/' + data.lat + '/' + data.lon
}

async function _getSensorData(id) {
	let req = new Request(API_URL + id)
	let json = await req.loadJSON()
      
    

    let stats = JSON.parse(json.results[0].Stats)
    let partLive = parseInt(stats.v1, 10)
    let partTime = parseInt(stats.v2, 10)
    let partDelta = partTime - partLive
	// Tempertautre_F: Temperature inside of the sensor housing in Fahrenheit. On average, this is 8F higher than ambient conditions. (From BME280)
    let temp_f = json.results[0].temp_f	- 8
    let temp_c = utilities.convertFtoC(temp_f)		
    
    if ( partDelta > 5 ) {
        theTrend = ' Improving' 
    } else if ( partDelta < -5 ) {
        theTrend = ' Worsening'
    } else {
         theTrend = ''
    }
    
    // Start Setup
    let adj1 = parseInt(json.results[0].pm2_5_cf_1, 10)
    let adj2 = parseInt(json.results[1].pm2_5_cf_1, 10)
    let hum = parseInt(json.results[0].humidity, 10)
    let dataAverage = adj1;

    if (adj2 >= 0.0) {
        dataAverage = ((adj1 + adj2) / 2);
    }

	return {
		'sensor_id': id,
		'val': json.results[0].Stats,
		'pm2_average': dataAverage,
		'adj1': adj1,
		'adj2': adj2,
		'ts': json.results[0].LastSeen,
		'temp_f': temp_f,
		'temp_c': temp_c,
		'trend': theTrend,
		'hum': hum,
		'loc': json.results[0].Label,
		'lat': json.results[0].Lat,
		'lon': json.results[0].Lon
	}
}

module.exports.getSensorData = _getSensorData