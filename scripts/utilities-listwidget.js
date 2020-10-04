// UI Element Functions
module.exports.addText = function(wg, text, color, font, text_size) {
	let label = wg.addText(text)
	label.textColor = color
	label.font = font
	
	if ( text_size != undefined ) {
		label.textSize = text_size
	}
}

module.exports.addSpacer = function(wg, size) {
	wg.addSpacer(size)
}

module.exports.setBackgroundGradient = function(wg, gradient, start_color, end_color) {
	gradient.colors = [start_color, end_color];
	gradient.locations = [0.0, 1];			
	// Set gradient
	wg.backgroundGradient = gradient;
}

