// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: pink; icon-glyph: magic;
// widget code by Jason Snell <jsnell@sixcolors.com>
// based on code by Matt Silverlock
// gradient routine contributed by Rob Silverii


// ===== begin standard widget functions

// UI Element Functions
const addText = function(wg, text, color, font, text_size) {
	let label = wg.addText(text)
	label.textColor = color
	label.font = font
	
	if ( text_size != undefined ) {
		label.textSize = text_size
	}
}

const addSpacer = function(wg, size) {
	wg.addSpacer(size)
}

const setBackgroundGradient = function(wg, gradient, start_color, end_color) {
	gradient.colors = [start_color, end_color];
	gradient.locations = [0.0, 1];			
	// Set gradient
	wg.backgroundGradient = gradient;
}

// Parsing

const parseWidgetParameter = function(widgetParameter) {
	widgetParameter = widgetParameter || ''

	var result = {}

	const parametersComponents = widgetParameter.split(',')

	parametersComponents.forEach(parameter => {
		const parameterComponents = parameter.split(':')
		result[parameterComponents[0]] = parameterComponents[1]
	})

    console.log('result' + JSON.stringify(result))
	return result
}

// ===== end standard widgets functions


const API_URL = 'https://www.purpleair.com/json?show=';
// const CACHE_FILE = 'aqi_data.json'
// Find a nearby PurpleAir sensor ID via https://fire.airnow.gov/
// Click a sensor near your location: the  ID is the trailing integers
// https://www.purpleair.com/json has all sensors by location & ID.


let WIDGET_PARAMETER = args.widgetParameter || 'station:36991,units:c'

async function getSensorData(url, id) {
	let req = new Request(`${url}${id}`)
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
function calculateLevel(aqi) {
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


//Function to get AQI number from PPM reading
function aqiFromPM (pm) {
	if (pm > 350.5) {
		return calcAQI(pm, 500.0, 401.0, 500.0, 350.5)
	} else if (pm > 250.5) {
		return calcAQI(pm, 400.0, 301.0, 350.4, 250.5)
	} else if (pm > 150.5) {
		return calcAQI(pm, 300.0, 201.0, 250.4, 150.5)
	} else if (pm > 55.5) {
		return calcAQI(pm, 200.0, 151.0, 150.4, 55.5)
	} else if (pm > 35.5) {
		return calcAQI(pm, 150.0, 101.0, 55.4, 35.5)
	} else if (pm > 12.1) {
		return calcAQI(pm, 100.0, 51.0, 35.4, 12.1)
	} else if (pm >= 0.0) {
		return calcAQI(pm, 50.0, 0.0, 12.0, 0.0)
	} else {
		return '-'
	}
}

//Function that actually calculates the AQI number
function calcAQI(Cp, Ih, Il, BPh, BPl) {
	let a = (Ih - Il);
	let b = (BPh - BPl);
	let c = (Cp - BPl);
	return Math.round((a/b) * c + Il);     
}

async function run() {   
	let wg = new ListWidget()
	wg.setPadding(20,15,10,10)
	
	try {

		// Begin parse parameters
		const parameters = parseWidgetParameter(WIDGET_PARAMETER)
		const sensor_id = parameters.station
		const units = parameters.units
		// end parse parameters

		console.log(`Using sensor ID: ${sensor_id}`)
		
		let data = await getSensorData(API_URL, sensor_id)
		console.log(data)
		
		let stats = JSON.parse(data.val)
		let partLive = parseInt(stats.v1, 10)
		let partTime = parseInt(stats.v2, 10)
		let partDelta = partTime - partLive
		let temp_f = data.temp_f
		let temp_c = ((temp_f - 32) * 5 / 9).toFixed(1)
		
		
		if ( partDelta > 5 ) {
			theTrend = ' Improving' 
		} else if ( partDelta < -5 ) {
			theTrend = ' Worsening'
		} else {
			 theTrend = ''
		}
		
		// Start Setup

		let adj1 = parseInt(data.adj1, 10)
		let adj2 = parseInt(data.adj2, 10)
		let hum = parseInt(data.hum, 10)
		let dataAverage = ((adj1 + adj2)/2);
		
		
		// Apply EPA draft adjustment for wood smoke and PurpleAir
		// from https://cfpub.epa.gov/si/si_public_record_report.cfm?dirEntryId=349513&Lab=CEMM&simplesearch=0&showcriteria=2&sortby=pubDate&timstype=&datebeginpublishedpresented=08/25/2018
		
		let epaPM = ( (0.524 * dataAverage) - (.0085 * hum) + 5.71 )
        let aqi = aqiFromPM(epaPM)
		let aqitext = aqi.toString()
		let level = calculateLevel(aqi)		

		// End setup

		// Assign URL
		wg.url = 'https://www.purpleair.com/map?opt=1/i/mAQI/a10/cC0&select=' + sensor_id + '#14/' + data.lat + '/' + data.lon

		// ======= Start drawing
		setBackgroundGradient(wg,new LinearGradient(), new Color(level.startColor), new Color(level.endColor))
		
		// Location
		addText(wg, data.loc, new Color(level.textColor), Font.mediumSystemFont(12))

		// Temp Label
		addText(wg, temp_c + '°C', new Color(level.textColor), Font.semiboldRoundedSystemFont(20))
		addSpacer(wg, 10)
		
		// AQI Prefix
		addText(wg, 'AQI' + theTrend, new Color(level.textColor), Font.regularSystemFont(10))
		
		// AQI Number string
		addText(wg, aqitext, new Color(level.textColor), Font.semiboldRoundedSystemFont(20), 45)
		
		// AQI Level 
		addText(wg, level.label, new Color(level.textColor), Font.boldSystemFont(12))
		addSpacer(wg, 20)		
		
		// Last Updated 
		let updatedAt = new Date(data.ts*1000).toLocaleTimeString('en-US', { timeZone: 'PST', hour: '2-digit', minute:'2-digit'})
		addText(wg, `Updated ${updatedAt}`, new Color(level.textColor), Font.lightSystemFont(10))		 
		addSpacer(wg)
		// ======= End drawing		
	} catch (e) {
		console.log(e)
		addText(wg, `error: ${e}`, Color.red(), Font.boldSystemFont(12), 10)
	}

	wg.presentSmall()
	Script.setWidget(wg)
	Script.complete()
}

await run()
