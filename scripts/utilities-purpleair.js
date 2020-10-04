const API_URL = 'https://www.purpleair.com/json?show=';


async function _getSensorData(id) {
	let req = new Request(API_URL + id)
	let json = await req.loadJSON()
	  
	return {
		'val': json.results[0].Stats,
		'adj1': json.results[0].pm2_5_cf_1,
		'adj2': json.results[1].pm2_5_cf_1,
		'ts': json.results[0].LastSeen,
		'temp_f': json.results[0].temp_f,
		'hum': json.results[0].humidity,
		'loc': json.results[0].Label,
		'lat': json.results[0].Lat,
		'lon': json.results[0].Lon
	}
}

module.exports.getSensorData = _getSensorData(id)