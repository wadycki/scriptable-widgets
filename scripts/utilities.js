module.exports.parseWidgetParameter = function(widgetParameter) {
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

module.exports.convertFtoC = function(f) {
    return ((f - 32) * 5 / 9).toFixed(1)
}