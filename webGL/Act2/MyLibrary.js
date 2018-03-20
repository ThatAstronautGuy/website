//Colour Definitions
var RED 	= {r:1.0, g:0.0, b:0.0};
var GREEN 	= {r:0.0, g:1.0, b:0.0};
var BLUE 	= {r:0.0, g:0.0, b:1.0};
var BLACK 	= {r:0.0, g:0.0, b:0.0};
var WHITE 	= {r:1.0, g:1.0, b:1.0};



var array = [];

function clearArray() {
	array = [];
}

function addTriangle(Colour1, Colour2, Colour3){
	
	if(Colour1 === undefined || Colour1 == null){
		Colour1 = WHITE;
	}
	array.push(Math.cos(90*Math.PI/180));
	array.push(Math.sin(90*Math.PI/180));
	array.push(Colour1.r);
	array.push(Colour1.g);
	array.push(Colour1.b);

	if(Colour2 === undefined || Colour2 == null){
		Colour2 = Colour1;
	}
	array.push(Math.cos(210*Math.PI/180));
	array.push(Math.sin(210*Math.PI/180));
	array.push(Colour2.r);
	array.push(Colour2.g);
	array.push(Colour2.b);

	if(Colour3 === undefined || Colour3 == null){
		Colour3 = Colour1;
	}
	array.push(Math.cos(330*Math.PI/180));
	array.push(Math.sin(330*Math.PI/180));
	array.push(Colour3.r);
	array.push(Colour3.g);
	array.push(Colour3.b);
}

function addSquare(Colour1, Colour2, Colour3, Colour4){
	
	if(Colour1 === undefined || Colour1 == null){
		Colour1 = WHITE;
	}
	
	array.push(-0.25);
	array.push(0.25);
	array.push(Colour1.r);
	array.push(Colour1.g);
	array.push(Colour1.b);

	if(Colour2 === undefined || Colour2 == null){
		Colour2 = Colour1;
	}
	array.push(0.25);
	array.push(0.25);
	array.push(Colour2.r);
	array.push(Colour2.g);
	array.push(Colour2.b);

	if(Colour3 === undefined || Colour3 == null){
		Colour3 = Colour1;
	}
	array.push(0.25);
	array.push(-0.25);
	array.push(Colour3.r);
	array.push(Colour3.g);
	array.push(Colour3.b);

	if(Colour4 === undefined || Colour4 == null){
		Colour4 = Colour1;
	}
	array.push(-0.25);
	array.push(-0.25);
	array.push(Colour4.r);
	array.push(Colour4.g);
	array.push(Colour4.b);
	
}

function addRegularPolygon(numSides, Colour1){
	
	if(numSides < 3) return;
	var ang = 0.0;
	var angStep = 360 / numSides;
	
	array.push(0);
	array.push(0);
	array.push(Colour1.r);
	array.push(Colour1.g);
	array.push(Colour1.b);
	
	for(; ang < 360; ang += angStep){
		array.push(Math.cos(ang * Math.PI / 180));
		array.push(Math.sin(ang * Math.PI / 180));
		array.push(Colour1.r);
		array.push(Colour1.g);
		array.push(Colour1.b);
	}
	array.push(Math.cos(0));
	array.push(Math.sin(0));
	array.push(Colour1.r);
	array.push(Colour1.g);
	array.push(Colour1.b);
}

function getFloatArray() {
	
	return new Float32Array(array);
}

function getNumVertices() {
	return array.length/5;
}