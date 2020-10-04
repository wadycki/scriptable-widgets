// Widget attributes: AQI level threshold, text label, gradient start and end colors, text color
const levelAttributes = [
	{
		threshold: 300,
		label: 'Hazardous',
		startColor: '9e2043',
		endColor: '7e0023',
		textColor: 'ffffff',
	},
	{
		threshold: 200,
		label: 'Very Unhealthy',
		startColor: '8f3f97',
		endColor: '6f1f77',
		textColor: 'ffffff',
	},
	{
		threshold: 150,
		label: 'Unhealthy',
		startColor: 'FF3D3D',
		endColor: 'D60000',
		textColor: '000000',
	},
	{
		threshold: 100,
		label: 'Unhealthy (S.G.)',
		startColor: 'FFA63D',
		endColor: 'D67200',
		textColor: '000000',
	},
	{
		threshold: 50,
		label: 'Moderate',
		startColor: 'ffff00',
		endColor: 'cccc00',
		textColor: '000000',
	},
	{
		threshold: 0,
		label: 'Good',
		startColor: '00e400',
		endColor: '00bb00',
		textColor: '000000',
	},
];

// Get level attributes for AQI
const getLevelAttributes = (level, attributes) =>
	attributes
		.filter((c) => level > c.threshold)
		.sort((a, b) => b.threshold - a.threshold)[0];
		

// Calculates the AQI level based on
// https://cfpub.epa.gov/airnow/index.cfm?action=aqibasics.aqi#unh
module.exports.calculateLevel = function(aqi) {
	let res = {
		level: 'OK',
		label: 'fine',
		startColor: 'white',
		endColor: 'white',
	};

	let level = parseInt(aqi, 10) || 0;

	// Set attributes
	res = getLevelAttributes(level, levelAttributes);
	
	// Set level
	res.level = level;

	return res;
}


//Function that actually calculates the AQI number
module.exports.calcAQI = function(Cp, Ih, Il, BPh, BPl) {
	let a = (Ih - Il);
	let b = (BPh - BPl);
	let c = (Cp - BPl);
	return Math.round((a/b) * c + Il);     
}

//Function to get AQI number from PPM reading
module.exports.aqiFromPM = function (pm) {
	if (pm > 350.5) {
		return module.exports.calcAQI(pm, 500.0, 401.0, 500.0, 350.5)
	} else if (pm > 250.5) {
		return module.exports.calcAQI(pm, 400.0, 301.0, 350.4, 250.5)
	} else if (pm > 150.5) {
		return module.exports.calcAQI(pm, 300.0, 201.0, 250.4, 150.5)
	} else if (pm > 55.5) {
		return module.exports.calcAQI(pm, 200.0, 151.0, 150.4, 55.5)
	} else if (pm > 35.5) {
		return module.exports.calcAQI(pm, 150.0, 101.0, 55.4, 35.5)
	} else if (pm > 12.1) {
		return module.exports.calcAQI(pm, 100.0, 51.0, 35.4, 12.1)
	} else if (pm >= 0.0) {
		return module.exports.calcAQI(pm, 50.0, 0.0, 12.0, 0.0)
	} else {
		return '-'
	}
}

module.exports.epaPM25toAQI = function(pm25, humidity) {
    return ( (0.524 * pm25) - (.0085 * humidity) + 5.71 )
}