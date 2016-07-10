// kiszínezi az adott pixelt az aktuális színnel
function colorPixel(pixelPos, c){
	imageData.data[pixelPos] = c.r;
	imageData.data[pixelPos + 1] = c.g;
	imageData.data[pixelPos + 2] = c.b;
	imageData.data[pixelPos + 3] = 255;
}

// --------------------------------------
// ---------------PENCIL--------------- 
// --------------------------------------

// rekurzívan kitölti a környező pixeleket is a megadott vonalvastagsággal
function colorPixelDepth(pixelPos, color, depth){
	// eddig megy a rekurzió
	while(depth >= 0){
		// ha benne vagyunk még a canvasban.. 
		if (insideCanvas(depth)){
			colorPixel(pixelPos + depth * 4, color); // +1 jobbra
			colorPixel(pixelPos - depth * 4, color); // +1 balra
			colorPixel(pixelPos + depth * canvas.width * 4, color); // +1 le
			colorPixel(pixelPos - depth * canvas.width * 4, color); // +1 fel
		}
		// megyünk még egy kört
		colorPixelDepth(pixelPos, color, --depth);
	}	
}

// Bresenham vonal algoritmus 
// http://www.tagwith.com/question_950984_complete-solution-for-drawing-1-pixel-line-on-html5-canvas
function bline(x0, y0, x1, y1, event) {
    var dx = Math.abs(x1 - x0),
        sx = x0 < x1 ? 1 : -1;
    var dy = Math.abs(y1 - y0),
        sy = y0 < y1 ? 1 : -1;
    var err = (dx > dy ? dx : -dy) / 2;
    
    while (true) {
    	var n = (y0 * canvas.width + x0) * 4; // alap pixel
    	switch(event.which){
    		case 1: {colorPixelDepth(n, color, thickness-1); break;}
    		case 3: {colorPixelDepth(n, color2, thickness-1); break;}
    	}

        if (x0 === x1 && y0 === y1) break;
        var e2 = err;
        if (e2 > -dx) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dy) {
            err += dx;
            y0 += sy;
        }
    }
}

function onPencilPaint(event){
	// ha a canvason belül vagyunk...
	if (pos.x >= 0 && pos.x <= width && pos.y >= 0 && pos.y <= height){
		// rajzolunk egy Bresenham vonalat az előző és mostani pozíciók között
		bline(prevpos.x, prevpos.y, pos.x, pos.y, event);
		context.putImageData(imageData, 0, 0); // rámásoljuk az imagedatát a contextre
	}
}

// --------------------------------------
// ---------------BRUSH--------------- 
// --------------------------------------

// a rajzolást megvalósító függvény 
function onBrushPaint(event) {
	// akutális hely elmentése
	points.push({x: pos.x, y: pos.y});

	// reset
	temp_canvas.width = temp_canvas.width;
		
		// rajz paraméterek
	tmp_ctx.lineWidth = thickness; // ha ceruza, mindig 1
	
	// gombnyomástól függ a szín
	switch(event.which){
		case 1: { tmp_ctx.strokeStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")"; break;}
		case 3: { tmp_ctx.strokeStyle = "rgb(" + color2.r + ", " + color2.g + ", " + color2.b + ")"; break;}
	}
	
	tmp_ctx.fillStyle = tmp_ctx.strokeStyle;
	tmp_ctx.lineJoin = 'round';
	tmp_ctx.lineCap = 'round';

	// ha még nincs meg a 3 pont, nem tudunk kvadratikus görbét húzni
	// (gyakorlatilag két kör egymás után)
	if (points.length < 3){
		var b = points[0];
		tmp_ctx.beginPath();

		// egy kört rajzolunk a kezdeti pontban, aminek a sugara a vonalvastagság fele 
		tmp_ctx.arc(b.x, b.y, tmp_ctx.lineWidth / 2, 0, Math.PI * 2); 
		
		tmp_ctx.fill(); // kitöltjük a kört 
		tmp_ctx.closePath();

		return;
	}

	// ha már van több pontunk, akkor tudunk kvadratikus görbét rajzolni
	tmp_ctx.beginPath();

	tmp_ctx.moveTo(points[0].x, points[0].y); //kezdőpontból indulunk

	// végigmegyünk az első n-2 ponton
	for (var i = 1; i < points.length - 2; i++){

		var c = (points[i].x + points[i+1].x) / 2; // aktuális és köv. x-ek átlaga
		var d = (points[i].y + points[i+1].y) / 2; // akutális és köv. y-ok átlaga

		// a kezdőponttól húzunk egy görbét olyan kontrollponttal, ami az aktuális pont a 
		// ciklusban, egészen a leátlagolt pontig 
		tmp_ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
	}

	// utolsó két pont között behúzzuk a görbét 
	tmp_ctx.quadraticCurveTo(
		points[i].x,
		points[i].y,
		points[i+1].x,
		points[i+1].y
	);

	// meghúzzuk a vonalat
	tmp_ctx.stroke();
}

// --------------------------------------
// ---------------FILL--------------- 
// --------------------------------------

// startColor: a pixel színe, ahol kezdjük a kitöltést
// meghatározza, hogy az adott pont színe megegyezik-e a kiinduló színnel
function matchStartColor(pixelPos, startR, startG, startB) {
	var r = imageData.data[pixelPos];
	var g = imageData.data[pixelPos + 1];
	var b = imageData.data[pixelPos + 2];
	
	if(r == startR && g == startG && b == startB) return true;
	else return false;
}

// megnézzük, hogy nem léptünk-e ki a canvasból a ceruzával rajzolással...
function insideCanvas(depth) {
	if (pos.x + depth + 1 >= width || 
		prevpos.x + depth + 1 >= width ||
		pos.x - depth - 1 <= 0 ||
		prevpos.x - depth - 1 <= 0
		)
		return false;
	else 
		return true;
}

// kitöltést megvalósító függvényevent
function onFill(event) {

	// kezdőpont vizsgálata
	// pixel pozíciója a tömbben = szélesség * y (lefelé) + x (jobbra)
	// azért kell az egészet 4-gyel szorozni, mert minden pixelhez 4 db érték tartozik: r, g, b, a
	var startpixelPos = (pos.y * width + pos.x) * 4,
		startR = imageData.data[startpixelPos],
		startG = imageData.data[startpixelPos+1],
		startB = imageData.data[startpixelPos+2],
		startA = imageData.data[startpixelPos+3]
	

	// ha ugyanaz a szín, ami a kiválasztott, akkor nem lépünk tovább
	switch(event.which){
		case 1: { // bal klikk: első színnel színezünk
			if (startR == color.r && startG == color.g && startB == color.b)
				return;	
			break;
		}
		case 3: { // jobb klikk: második színnel
			if (startR == color2.r && startG == color2.g && startB == color2.b)
				return;
			break;
		}
	}

	// ebben fogjuk tárolni a szükséges kitöltendő pixeleket
	var pixelStack = [[pos.x, pos.y]];
	var reachLeft, reachRight; // elértük-e már a bal szélt, jobb szélt? 
	var pixelPos;

	while(pixelStack.length){

		// kiveszünk egy új pontot a stackből
		newPos = pixelStack.pop();
		x = newPos[0];
		y = newPos[1];

		pixelPos = (y * width + x) * 4; // a pozíciója a tömbben

		// felfelé megyünk addig a ponttól, amíg ütközést nem találunk! 
		while(--y >= 0 && matchStartColor(pixelPos, startR, startG, startB))
			pixelPos -= width * 4;

		// megvan a fölső határ, innentől elindulunk lefelé, és megvizsgáljuk oldalirányban is a pixeleket
		pixelPos += width * 4;
		y++;
		reachRight = false; reachLeft = false;

		// lefelé megyünk addig, amíg nincs ütközés 
		while(++y < height - 1 && matchStartColor(pixelPos, startR, startG, startB)){
			
			// kiszínezzük a pixelt
			switch(event.which){
				case 1: {colorPixel(pixelPos, color); break;}
				case 3: {colorPixel(pixelPos, color2); break;}
			}

			// ha még nem értük el a bal szélt.. 
			if (x > 0){
				// és a balra lévő pixel még nem ütközés .. 
				if (matchStartColor(pixelPos - 4, startR, startG, startB) ){
					// és nincs bebillentve a bal szél..
					if (!reachLeft){
						pixelStack.push([x - 1, y]); // hozzáadjuk a bal pontot a stackhez
						reachLeft = true;
					}
				} else if (reachLeft){
					reachLeft = false;
				}
			}

			// ha még nem értük el a jobb szélt, ugyanez.. 
			if (x < width - 1){
				if (matchStartColor(pixelPos + 4, startR, startG, startB) ){
					if(!reachRight){
						pixelStack.push([x + 1, y]);
						reachRight = true;
					}
				} else if (reachRight){
					reachRight = false;
				}
			}

			// továbblépünk a következő pixelre. 
			pixelPos += width * 4;
		}
	}
	// rámásoljuk az új képet a contextre
	context.putImageData(imageData, 0, 0);
}

// alakzatok eszközeinek előkészítése
function initTool(event){
	// törlés
	tmp_ctx.clearRect(0, 0, width, height);
	// vastagság
	tmp_ctx.lineWidth = thickness;

	// színek átalakítása
	var c1 = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
	var c2 = "rgb(" + color2.r + ", " + color2.g + ", " + color2.b + ")";
	// elsődleges szín = szél
	// másodlagos szín = kitöltés
	switch(event.which){
		case 1: { 
			tmp_ctx.strokeStyle = c1;
			tmp_ctx.fillStyle = c2;
			break;
		}
		case 3: {
			tmp_ctx.strokeStyle = c2;
			tmp_ctx.fillStyle = c1;
			break;
		}
	}

	// lekerekített színek
	tmp_ctx.lineJoin = 'round';
	tmp_ctx.lineCap = 'round';	
}

// --------------------------------------
// ---------------LINE--------------- 
// --------------------------------------

function drawLine(event){
	initTool(event);

	// elmozgatás értéke
	var trans = (thickness % 2) / 2;
	
	// rajz
	tmp_ctx.beginPath();
	// elmozgatjuk, hogy egészek legyenek a pixelek
	tmp_ctx.translate(trans, 0);
	// kurzor mozgatása, rajzolás...
	tmp_ctx.moveTo(startpos.x, startpos.y);
	tmp_ctx.lineTo(pos.x, pos.y);
	tmp_ctx.stroke();
	// visszamozgatjuk
	tmp_ctx.translate(-trans, 0);
	tmp_ctx.closePath();
}

// ----------------------------------------
// ---------------RECTANGLE--------------- 
// ----------------------------------------

function drawRectangle (event) {
	initTool(event);

	// helyek, méretek kiszámítása 
	var x = Math.min(pos.x, startpos.x); // mindig a kisebb a kezdeti és a jelenlegi helyzetek közül
	var y = Math.min(pos.y, startpos.y);
	var rectwidth = Math.abs(pos.x - startpos.x); // mindig pozitív
	var rectheight = Math.abs(pos.y - startpos.y);
	
	// ha kitöltöttet választottuk ki...
	if (event.data.filled){
		// útvonal szerinti téglalap rajzolás, majd kitöltés
		tmp_ctx.beginPath();
		tmp_ctx.rect(x, y, rectwidth, rectheight);
		tmp_ctx.fill();
		tmp_ctx.stroke();
		tmp_ctx.closePath();
	}
	// egyébként, csak egyszerű téglalap
	else
		tmp_ctx.strokeRect(x, y, rectwidth, rectheight);
}

// --------------------------------------
// ---------------CIRCLE--------------- 
// --------------------------------------

function drawCircle (event) {
	initTool(event);

	// középpont kiszámítása
	var x = (pos.x + startpos.x) / 2;
	var y = (pos.y + startpos.y) / 2;

	// sugár = mindig pozitív távolságok közül a nagyobb (= átmérő), osztva 2-vel
	var radius = Math.max(Math.abs(pos.x - startpos.x),	Math.abs(pos.y - startpos.y)) / 2;

	// kör rajzolása függvény alapján
	tmp_ctx.beginPath();
	tmp_ctx.arc(x, y, radius, Math.PI * 2, false);
	
	// ha kitöltöttet választottunk ki, kitöltjük
	if(event.data.filled){
		tmp_ctx.fill();
	}

	tmp_ctx.stroke();
	tmp_ctx.closePath();
}

// --------------------------------------
// ---------------ELLIPSE--------------- 
// --------------------------------------

function drawEllipse (event) {
	initTool(event);

	// középpont koordinátái
	var x = Math.min(pos.x, startpos.x);
	var y = Math.min(pos.y, startpos.y);

	// szélesség, magasság kiszámítása
	var w = Math.abs(pos.x - startpos.x);
	var h = Math.abs(pos.y - startpos.y);

	// http://stackoverflow.com/a/2173084
	var kappa = 0.5522848,
		ox = (w / 2) * kappa, // offset horizontal control point
		oy = (h / 2) * kappa, // offset vertical control point
		xe = x + w,
		ye = y + h,
		xm = x + w / 2,
		ym = y + h / 2;

	tmp_ctx.beginPath();
	tmp_ctx.moveTo(x, ym);
	tmp_ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
	tmp_ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
	tmp_ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
	tmp_ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

	if (event.data.filled){
		tmp_ctx.fill();
	}
	tmp_ctx.closePath();
	tmp_ctx.stroke();
}

// --------------------------------------
// ---------------SPRAY--------------- 
// --------------------------------------

function onSpray (event) {

	switch(event.which){
		case 1: { tmp_ctx.fillStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ")"; break;}
		case 3: { tmp_ctx.fillStyle = "rgb(" + color2.r + ", " + color2.g + ", " + color2.b + ")"; break;}
	}

	tmp_ctx.strokeStyle = tmp_ctx.fillStyle;

	// sűrűség, függ a kiválasztott vastagságtól
	var density = thickness * 8;

	// keresünk egy random offset pontot a kiindulótól a spray sugarán belül
	var getRandomOffset = function(radius) {
		// random szög, bármelyik irányban
		var random_angle = Math.random() * (2 * Math.PI);
		// random sugár, a kiválasztott sugáron belül
		var random_radius = Math.random() * radius;

		// x tengely: cosinus
		// y tengely: sinus
		return {
			x: Math.cos(random_angle) * random_radius,
			y: Math.sin(random_angle) * random_radius
		};
	};

	// sűrűségig random pontokat szórunk a sugáron belül
	for (var i = 0; i < density; i++) {
		// sugár a vastagságtól függ
		var offset = getRandomOffset(thickness * 2.5);

		var x = pos.x + offset.x;
		var y = pos.y + offset.y;

		// valójában kis 1 pixeles négyzetek 
		tmp_ctx.fillRect(x, y, 1, 1); 
	}
}