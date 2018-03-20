//Colour Definitions
var RED		= {r:1.0, g:0.0, b:0.0};
var GREEN	= {r:0.0, g:1.0, b:0.0};
var BLUE	= {r:0.0, g:0.0, b:1.0};
var BLACK	= {r:0.0, g:0.0, b:0.0};
var WHITE	= {r:1.0, g:1.0, b:1.0};
var MAGENTA	= {r:0.255, g:0.0, b:0.255};

var array = [];

function clearArray(){
	array = [];
}

function addTriangle(Colour1, Colour2, Colour3){
	
	if(Colour1 === undefined || Colour1 == null){
		Colour1 = WHITE;
	}
	
	var tmp = Math.cos(90*(Math.PI/180));
	array.push(0);
	var temp = Math.sin(90*(Math.PI/180));
	array.push(temp);
	console.log(tmp);
	console.log(temp);
	array.push(Colour1.r);
	array.push(Colour1.g);
	array.push(Colour1.b);
	
	if(Colour2 === undefined || Colour2 == null){
		Colour2 = Colour1;
	}
	
	array.push(Math.cos(210*(Math.PI/180)));
	array.push(Math.sin(210*(Math.PI/180)));
	array.push(Colour2.r);
	array.push(Colour2.g);
	array.push(Colour2.b);
	
	if(Colour3 === undefined || Colour3 == null){
		Colour3 = Colour1;
	}
	
	array.push(Math.cos(330*(Math.PI/180)));
	array.push(Math.sin(330*(Math.PI/180)));
	array.push(Colour3.r);
	array.push(Colour3.g);
	array.push(Colour3.b);
}

function getFloatArray(){
	return new Float32Array(array);
}

function addRegularPolygon(numVert, Colour){
	var chunks = 360/numVert;
	
	if(Colour === undefined || Colour == null){
		Colour = WHITE;
	}
	
	for(var i = 0; i < 360; i = i + chunks){
		array.push(Math.sin(i*(Math.PI/180)));
		array.push(Math.cos(i*(Math.PI/180)));
		array.push(Colour.r);
		array.push(Colour.g);
		array.push(Colour.b);
	}
}