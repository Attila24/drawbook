// képeket tároló tömb
images = [];
// egyes képek helyzeteit tároló tömb
imageoffsets = [];
// képek szélességét tároló tömb
imagewidths = [];
// képek magasságát tároló tömb
imageheights = [];
// ideiglenes, rajzolás utáni helyzetek
tmpoffsets = [];

var anchorRadius = 4 ;

// kép betöltése, adatok elmentése a tömbökbe
function onReaderLoad(event){
	var img = new Image();

	// a kép forrása az, amit feltöltöttünk
	img.src = event.target.result;

	img.onload = function() {

		// kirajzolás
		context.drawImage(img, 0, 0);

		// ha már volt kép a rétegen, akkor azt töröljük
		if (images[layer_index] != null)
			context.clearRect(0, 0, width, height);

		// adatok elmentése a tömbökbe
		images[layer_index] = img;
		imageoffsets[layer_index] = {x: 0, y: 0};
		imagewidths[layer_index] = img.width;
		imageheights[layer_index] = img.height;
		
		redrawImage(false);
	}
}

// kép újrarajzolása
function redrawImage (isSelected) {
	context.clearRect(0, 0, width, height);

	// jobb szél, alsó szél pozíciójának számolása	
	imageRight = imageoffsets[layer_index].x + imagewidths[layer_index];
	imageBottom = imageoffsets[layer_index].y + imageheights[layer_index];

	// ha már rajzoltunk a képre..
	if (tmpoffsets[layer_index] != undefined)
		imageoffsets[layer_index] = tmpoffsets[layer_index]; // kivesszük az ideiglenesből a helyzetet
	
	// kirajzoljuk a képet a megfelelő helyen a megfelelő méretben 
	context.drawImage(images[layer_index], 0, 0, 
					  images[layer_index].width, images[layer_index].height, 
					  imageoffsets[layer_index].x, imageoffsets[layer_index].y, 
					  imagewidths[layer_index], imageheights[layer_index]);
	
	if (isSelected){
		// anchor-ok rajzolása
		drawDragAnchor(imageoffsets[layer_index].x, imageoffsets[layer_index].y);	// bal felső sarok
		drawDragAnchor(imageRight, imageoffsets[layer_index].y); 					// jobb felső sarok
		drawDragAnchor(imageRight, imageBottom);									// jobb alsó sarok
		drawDragAnchor(imageoffsets[layer_index].x, imageBottom);					// bal alsó sarok
		
		// keret rajzolása
		context.beginPath();
		context.moveTo(imageoffsets[layer_index].x, imageoffsets[layer_index].y);
		context.lineTo(imageRight, imageoffsets[layer_index].y);
		context.lineTo(imageRight, imageBottom);
		context.lineTo(imageoffsets[layer_index].x, imageBottom);
		context.closePath();
		context.strokeStyle = 'black';	
		context.stroke();
	}
}

// egy anchor kirajzolása
function drawDragAnchor(x, y){
	context.beginPath();
	context.arc(x, y, anchorRadius, 0, 2 * Math.PI, false);
	context.closePath();
	context.fillStyle = '#333';
	context.fill();
}

// anchor-ra kattintottunk-e? 
function hitAnchor(x, y){

	// sugár négyzet a kör egyenletéhez
	var rr = anchorRadius * anchorRadius; 
	var dx, dy;

	// bal felső
	dx = x - imageoffsets[layer_index].x; // x távolság a bal felső saroktól
	dy = y - imageoffsets[layer_index].y; // y távolság a bal felső saroktól
	if (dx * dx + dy * dy <= rr) // ha még a körön belül van..
		return 0; 

	// jobb felső
	dx = x - imageRight;
	dy = y - imageoffsets[layer_index].y;
	if (dx * dx + dy * dy <= rr)
		return 1;

	// jobb alsó
	dx = x - imageRight;
	dy = y - imageBottom;
	if (dx * dx + dy * dy <= rr)
		return 2;

	// bal alsó
	dx = x - imageoffsets[layer_index].x;
	dy = y - imageBottom;
	if (dx * dx + dy * dy <= rr)
		return 3;

	return -1;	
}

// képre kattintottunk-e? 
function hitImage(){
	// ha a képen belül van az akutális pozíció..
	if (pos.x > imageoffsets[layer_index].x && 
		pos.x < imageoffsets[layer_index].x + imagewidths[layer_index] &&
		pos.y > imageoffsets[layer_index].y && 
		pos.y < imageoffsets[layer_index].y + imageheights[layer_index])
		return true;
	else
		return false;
}

// egér mozgatásakor használt függvény
function onImageMove (event) {
	// aktuális pozíciót le kell kérni
	pos = getMousePos(canvas, event);

	// átméretezés
	if (event.data.resize > -1){
		isSelected = true;
		// melyik irányba kell átméretezni
		//refreshImgData();
		switch(event.data.resize){

			case 0:
				// bal felső
				imageoffsets[layer_index].x = pos.x;
				imageoffsets[layer_index].y = pos.y;

				imagewidths[layer_index] = imageRight - pos.x;
				imageheights[layer_index] = imageBottom - pos.y;
				break;
			case 1:
				// jobb felső
				imageoffsets[layer_index].y = pos.y;

				imagewidths[layer_index] = pos.x - imageoffsets[layer_index].x;
				imageheights[layer_index] = imageBottom - pos.y;
				break;
			case 2:
				// jobb alsó
				imagewidths[layer_index] = pos.x - imageoffsets[layer_index].x;
				imageheights[layer_index] = pos.y - imageoffsets[layer_index].y;
				break;
			case 3:
				// bal alsó
				imageoffsets[layer_index].x = pos.x;

				imagewidths[layer_index] = imageRight - pos.x;
				imageheights[layer_index] = pos.y - imageoffsets[layer_index].y;
				break;


		}
		// ne lehessen 25 px-nél kisebbre átméretezni
		if (imagewidths[layer_index] < 25) imagewidths[layer_index] = 25;
		if (imageheights[layer_index] < 25) imageheights[layer_index] = 25; 

		// pozíciók újból beállítása
		imageRight = pos.x + imagewidths[layer_index];
		imageBottom = pos.y + imageheights[layer_index];
	}

	// mozgatás
	else {
		// ha nem képre kattintottunk, akkor return
		if (!hitImage()){
			return;
		}
		// mennyit mozgattunk x, y irányba..
		var dx = pos.x - startpos.x;
		var dy = pos.y - startpos.y;

		// pozíciók átállítása
		imageoffsets[layer_index].x += dx;
		imageoffsets[layer_index].y += dy;	
		startpos = pos;
	}
	// kép újrajzolása
	redrawImage(true);
}

function onRedEyeRemoveSelect(){

	tmp_ctx.clearRect(0, 0, width, height);

	// helyek, méretek kiszámítása 
	var x = Math.min(pos.x, startpos.x); // mindig a kisebb a kezdeti és a jelenlegi helyzetek közül
	var y = Math.min(pos.y, startpos.y);
	var rectwidth = Math.abs(pos.x - startpos.x); // mindig pozitív
	var rectheight = Math.abs(pos.y - startpos.y);

	tmp_ctx.strokeStyle = "black";
	tmp_ctx.lineWidth = "1";
	tmp_ctx.strokeRect(x, y, rectwidth, rectheight);

	return {x: x, y: y, width: rectwidth, height: rectheight};
}

function ReduceRedEye(rect){
	for (var i = rect.x; i <= rect.x + rect.width; i++){
		for (var j = rect.y; j <= rect.y + rect.height; j++){
			var n = (j * width + i) * 4;
			var R = imageData.data[n];
			var G = imageData.data[n + 1];
			var B = imageData.data[n + 2]

			//http://stackoverflow.com/questions/133675/red-eye-reduction-algorithm
			var redIntensity = (R / ((G + B) / 2));
			if (redIntensity > 1.5){
				var R2 = (G + B) / 2;
				colorPixel(n, {r: R2, g: G, b: B});
			}
		}
	}
	context.putImageData(imageData, 0, 0);
}