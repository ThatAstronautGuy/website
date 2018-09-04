var canvas, canvas2;
var ctx, ctx2;

function main(){
	
	canvas = document.getElementById('canvas');
	
    ctx = canvas.getContext('2d');
	if(!ctx){
		console.log('Failed to get 2D drawing context');
		return;
	}

	canvas2 = document.getElementById('canvas2');
    ctx2 = canvas2.getContext('2d');
	if(!ctx2){
		console.log('Failed to get 2D drawing context for second canvas');
		return;
	}

    var img = new Image();
	//drawing of the test image - img1
	img.onload = function () {
		canvas.width  = ctx.width  = img.width;
		canvas.height = ctx.height = img.height;
		//draw background image
		ctx.drawImage(img, 0, 0);
		manipType = 0;
		convertImage();
	};
 
	img.src = 'tulips.jpg';
}

function convertImage(){
	
	var imgData = ctx.getImageData(0, 0, ctx.width, ctx.height);
	
	canvas2.width  = ctx2.width  = ctx.width;
	canvas2.height = ctx2.height = ctx.height;
	ctx2.font = "30px Arial";
	ctx2.fillStyle = "yellow";
	
	switch(manipType){
	case 1: greyAverage(imgData.data); break;
	case 2: luma(imgData.data); break;
	case 3: luminance(imgData.data); break;
	case 4: desat(imgData.data); break;
	case 5: max(imgData.data); break;
	case 6: min(imgData.data); break;
	case 7: redAsGrey(imgData.data); break;
	case 8: greenAsGrey(imgData.data); break;
	case 9: blueAsGrey(imgData.data); break;
	case 10: redFilter(imgData.data); break;
	case 11: greenFilter(imgData.data); break;
	case 12: blueFilter(imgData.data); break;
	case 13: noRed(imgData.data); break;
	case 14: noGreen(imgData.data); break;
	case 15: noBlue(imgData.data); break;
	case 16: limit(imgData.data, 4); break;
	case 17: limit(imgData.data, 16); break;
	case 18: limit(imgData.data, 32); break;
	case 19: limit(imgData.data, 50); break;
	case 20: limitColour(imgData.data, 64); break;
	case 21: limitColour(imgData.data, 512); break;
	case 22: limitColour(imgData.data, 4096); break;
	case 23: limitColour(imgData.data, 125000); break;
	}
	
	ctx2.putImageData(imgData, 0, 0);	
}

function applyFilter(type){
	manipType = type;
	convertImage();
}

function greyAverage(pixelData){
	var newColour;
	
	for(var i = 0; i < pixelData.length; i+=4){
		newColour = (pixelData[i] + pixelData[i+1] + pixelData[i+2])/3;

		pixelData[i] = newColour;
		pixelData[i+1] = newColour;
		pixelData[i+2] = newColour;
	}
}

function luma(pixelData){
	var red = 21.25/100;
	var green = 71.52/100;
	var blue = 7.22/100;

	for(var i = 0; i < pixelData.length; i+=4){
		newColour = (pixelData[i]*red + pixelData[i+1]*green + pixelData[i+2]*blue);

		pixelData[i] = newColour;
		pixelData[i+1] = newColour;
		pixelData[i+2] = newColour;
	}
}

function luminance(pixelData){
	var red = 29.9/100;
	var green = 58.7/100;
	var blue = 11.4/100;

	for(var i = 0; i < pixelData.length; i+=4){
		newColour = (pixelData[i]*red + pixelData[i+1]*green + pixelData[i+2]*blue);

		pixelData[i] = newColour;
		pixelData[i+1] = newColour;
		pixelData[i+2] = newColour;
	}
}

function desat(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		newColour = (Math.max(pixelData[i], pixelData[i+1], pixelData[i+2]) + Math.min(pixelData[i], pixelData[i+1], pixelData[i+2]))/2;	

		pixelData[i] = newColour;
		pixelData[i+1] = newColour;
		pixelData[i+2] = newColour;
	}
}

function max(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		newColour = Math.max(pixelData[i], pixelData[i+1], pixelData[i+2]);

		pixelData[i] = newColour;
		pixelData[i+1] = newColour;
		pixelData[i+2] = newColour;
	}
}

function min(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		newColour = Math.min(pixelData[i], pixelData[i+1], pixelData[i+2]);

		pixelData[i] = newColour;
		pixelData[i+1] = newColour;
		pixelData[i+2] = newColour;
	}
}

function redAsGrey(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i+1] = pixelData[i];
		pixelData[i+2] = pixelData[i];
	}
}

function greenAsGrey(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i] = pixelData[i+1];
		pixelData[i+2] = pixelData[i+1];
	}
}

function blueAsGrey(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i] = pixelData[i+2];
		pixelData[i+1] = pixelData[i+2];
	}
}

function redFilter(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i+1] = 0;
		pixelData[i+2] = 0;
	}
}

function greenFilter(pixelData){	
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i] = 0;
		pixelData[i+2] = 0;
	}
}

function blueFilter(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i] = 0;
		pixelData[i+1] = 0;
	}
}

function noRed(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i] = 0;
	}
}

function noGreen(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i+1] = 0;
	}
}

function noBlue(pixelData){
	for(var i = 0; i < pixelData.length; i+=4){
		pixelData[i+2] = 0;
	}
}

function limit(pixelData, numShades){
	var groupSize = 256 * (1/ numShades)-1;
	
	for(var i = 0; i < pixelData.length; i+=4){
		var averageGrey = (pixelData[i] + pixelData[i+1] + pixelData[i+2])/3;
		newColour = Math.round((averageGrey / groupSize) + 0.5, 0) * groupSize;
		
		pixelData[i] = newColour;
		pixelData[i+1] = newColour;
		pixelData[i+2] = newColour;
	}
}

function limitColour(pixelData, numShades){
	var group = 256/(Math.ceil(Math.pow(numShades, (1/3))))-1;
	
	for(var i = 0; i < pixelData.length; i+=4){
		var newRed     = Math.round((pixelData[i] / group) + 0.5, 0) * group;
		var newGreen = Math.round((pixelData[i+1] / group) + 0.5, 0) * group;
		var newBlue    = Math.round((pixelData[i+2] / group) + 0.5, 0) * group;

		pixelData[i] = newRed;
		pixelData[i+1] = newGreen;
		pixelData[i+2] = newBlue;
	}
}
