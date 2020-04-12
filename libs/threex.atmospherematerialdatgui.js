/**
 * vendor.js framework definition
 * @type {Object}
 */
var THREEx	= THREEx || {};

THREEx.addAtmosphereMaterial2DatGui	= function(material, datGui){
	datGui		= datGui || new dat.GUI()
	var uniforms	= material.uniforms
	// options
	var options  = {
		coeficient	: uniforms['coeficient'].value,
		power		: uniforms['power'].value,
		glowColor	: '#'+uniforms.glowColor.value.getHexString(),
	}
	var onChange = function(){
		uniforms['coeficient'].value	= options.coeficient
		uniforms['power'].value		= options.power
		uniforms.glowColor.value.set( options.glowColor ); 
	}
	onChange()
	
	// config datGui
	datGui.add( options, 'coeficient'	, -10.0 , 10)
		.listen().onChange( onChange )
	datGui.add( options, 'power'		, -10.0 , 10)
		.listen().onChange( onChange )
	datGui.addColor( options, 'glowColor' )
		.listen().onChange( onChange )
}