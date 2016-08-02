// alapértelmezett értékek
var thickness = 5;
var tool = "brush"; 

// canvasokat tároló tömb
canvas_stack = [];
// canvas z-index változó
var canvas_z = 10;
// aktuális kiválasztott réteget jelző változó
layer_index = 0;

function initCanvas () {
	// alapértékek beállítása
	height = 600;
	width = 600;


	// canvas objektum létrehozása
	var c = $('<canvas>').attr({
		width: width,
		height: height
	});

	// hozzáadjuk az alap canvast. 
	$("#canvas_container").append(c.attr({class: 'canvas', id: canvas_z}).css({"z-index": 10}));
	// hozzáadjuk az alap canvas klónját, azaz egy temporary canvast. 
	$("#canvas_container").append(c.clone().attr({class: 'tmp'}).css({"z-index": 1000}));

	// = document.getElementyById
	canvas = $(".canvas").get(0);
	temp_canvas = $(".tmp").get(0);

	// betesszük a tömbbe az alapréteget
	canvas_stack.push(canvas);

	// kontextusok lekérése
	context = canvas.getContext("2d");
	tmp_ctx = temp_canvas.getContext("2d");
	imageData = context.getImageData(0, 0, width, height);

	wasLayer0Deleted = false;

	// más réteg kiválasztásakor... 
	$("ol.layers").on("click", "li", function() {

		$("ol.layers li").each(function() {
			$(this).removeClass('selected');
		});
		$(this).addClass('selected');

		// melyiket választottuk ki? 
		layer_index = $(this).index("ol.layers > li"); 

		// átírjuk a canvas változót a megfelelőre
		if(layer_index == 0 && !wasLayer0Deleted)	
			// ha a legalsó réteg, akkor így működik a tömb indexelés
			canvas = canvas_stack[0];
		else
			// egyébként így
			canvas = canvas_stack[layer_index][0];
		
		// contextus, imageData újbóli lekérése
		context = canvas.getContext("2d");
		imageData = context.getImageData(0, 0, width, height);
	});

	// dupla kattintás -> átnevezhető a réteg
	$("ol.layers").on("dblclick", "li", function() {
		oriVal = $(this).text();
		$(this).text("");
		$("<input type='text' maxlength='8' style='max-width:80px;'>").appendTo(this).focus();
	});

	// kikattintunk -> átnevezés vége
	$("ol.layers").on("focusout", "li > input", function() {
		var newVal = $(this).val() != "" ? $(this).val() : oriVal; // ha nem lett semmi se megadva, marad az eredeti
		$(this).parent()
				.append(
					$("<span>")
						.attr({class: "glyphicon glyphicon-move"})
					)
				.append(" " + newVal);

		$(this).remove();
	});

	// alapból disabled, mivel csak 1 réteg van
	$("#delete_layer").prop('disabled', true);

	// a rétegek száma alapján vagy tiltjuk, vagy engedélyezzük a törlés gombot
	var changeDelButton = function() {
		if (canvas_stack.length == 1)
			$("#delete_layer").prop('disabled', true);
		else
			$("#delete_layer").prop('disabled', false);
	}

	// új réteg létrehozása
	$("#new_layer").click(function() {
		// hozzáadjuk a kiválasztható rétegek közé
		canvas_z++;
		var l_index = canvas_z - 10;
		$("ol.layers").append(
			($("<li>").prop({"value": l_index})
				.append(
				$("<span>")
					.attr({class: "glyphicon glyphicon-move"})
				)
				.append(" Layer " + l_index)
			)
		)


		// obj létrehozása, hozzáadása a tömbhöz és a HTML DOM-hoz
		var newcanvas = c.clone().attr({class: 'canvas', id: canvas_z}).css({"z-index": canvas_z});

		canvas_stack.push(newcanvas);
		$("#canvas_container").append(newcanvas); 
		changeDelButton();
	});

	// réteg törlése gomb
	$("#delete_layer").click(function() {

		// lekérjük a mostani contextet
		var tmpcontext;
		// legelső alkalommal a legalsó réteget így kell címezni
		if (layer_index == 0 && !wasLayer0Deleted){
			wasLayer0Deleted = true;
			tmpcontext = canvas_stack[layer_index].getContext("2d");
		} else{
			// egyébként így
			tmpcontext = canvas_stack[layer_index][0].getContext("2d");
		}
		// töröljük a rétegen lévő dolgokat
		tmpcontext.clearRect(0, 0, width, height);

		// töröljük a listából a réteget
		$("ol.layers > li").eq(layer_index).remove();
		
		// kitöröljük a megfelelő canvas objektumot is a DOM-ból		
		$(".canvas").get(layer_index).remove();

		// töröljük a tömbből a réteget
		canvas_stack.splice(layer_index, 1);
		// letiltjuk a gombot, ha már csak 1 réteg van hátra
		changeDelButton();

		// újra beállítjuk az összes canvas z-indexét a listában
		$(".canvas").each(function() {
			// lekérjük az aktuális indexet a canvasok közül
			var i = $(this).index('.canvas');
			// beállítjuk arra, ami a canvashoz 
			$(this).css('z-index', $('ol.layers > li').get(i).value + 10);
		});

	});

	// letöltés képként
	$("#download").find("a").click(function() {

		// létrehozunk egy temp canvast
		var tmpcanvas = c.clone();
		var tmpcontext = tmpcanvas[0].getContext('2d');

		// ebben a tömbben tároljuk az összes canvast
		var arr = [];

		// betesszük a tömbbe a canvasokat és a megfelelő z-indexeket
		$(".canvas").each(function() {
			arr.push({
				canvas: $(this),
				zindex: parseInt($(this).css("z-index"))
			});
		});

		// z-index szerint rendezzük sorba
		arr.sort(function(a, b) {
			return (a.zindex - b.zindex);
		});

		// a megfelelő sorban végigmegyünk az összes canvason, és mindet rárajzoljuk a temp canvasra
		for (var i = 0; i < arr.length; i++) {
			tmpcontext.drawImage(arr[i]['canvas'][0], 0, 0);
		}

		// mentés
		$(this)[0].href = tmpcanvas[0].toDataURL();
		$(this)[0].download = 'canvas.png';
	});
	
	color = {r: 0, g: 0, b: 0}; // fekete a default szín
	color2 = {r: 255, g: 255, b: 255}; // fehér a második default szín

	showMoreThickness = function(){
		$("ul#size_select li").slice(4).removeClass('hiddenselectOption');
	}
	hideMoreThickness = function() {
		$("ul#size_select li").slice(4).addClass('hiddenselectOption');
	}
	
	// töröljük a canvast
	clearCanvas = function(){
		// teljesen kiürítünk mindent
		context.clearRect(0, 0, width, height);
		tmp_ctx.clearRect(0, 0, width, height);	
		context.putImageData(context.createImageData(width, height), 0, 0);	
		tmp_ctx.putImageData(context.createImageData(width, height), 0, 0);

		images = []; imageoffsets = []; imageID = 0;

		// hogy ne álljanak vissza az eredeti beállítások
		tmp_ctx.lineWidth = $("#thickness").val();
		tmp_ctx.strokeStyle = "rgb(" + color.r + ", " + color.g + ", " + color.b + ");";
		
		// alapértelmezett az ecset
		tool = "brush";
		$("#tools button").each(function() {
			$(this).removeClass('selected');
		});
		$("#tools button[name='brush']").addClass('selected');
		showMoreThickness();
	}
	// alapszín beállítása
	clearCanvas();
	
	// Eszköz kiválasztása
	$("#tools button").not("#clear").click(function(){
		tool = $(this).prop("name");

		$("#tools button").each(function() {
			$(this).removeClass('selected');
		});
		
		$(this).addClass("selected");
		if ($(this).prop("name") != "pencil"){
			showMoreThickness();
		}
		else{
			hideMoreThickness();
			thickness = 1;
		}
	});

	// ha nem kiválasztjuk a képet, akkor újrarajzoljuk keret nélkül
	$("#tools button").not("#img_select").click(function() {
		if (images[layer_index] != null)
			redrawImage(false);
	});

	// vonalvastagság állítása
	tmp_ctx.lineWidth = thickness;
	$("ul#size_select a").click(function() {
		thickness = $(this).attr("value");
	});

	// a vastagságválasztóba beillesztjük a vonalakat
	$("ul#size_select a").each(function() {
		var hr = $("<hr>").css({
			"border": "none",
			"height": $(this).attr("value"), // az érték lesz a vonal vastagsága itt is
			"color": "black",
			"background-color": "black"
		});
		$(this).append(hr);
	});
		

	$("#colorpicker").val("#000000");

	// szín kiválasztása
	$("#colorbuttons button").click(function() {
		tmp = $(this).prop("name");
		color.r = $c.name2rgb(tmp).R;
		color.g = $c.name2rgb(tmp).G;
		color.b = $c.name2rgb(tmp).B;

		// beállítjuk a vonalvastagságok színeit
		$("ul#size_select hr").css({
			"color": tmp,
			"background-color": tmp
		});

		// beállítjuk a kiválasztott színre a dobozt
		$("#colorpicker").val($c.name2hex(tmp));
	});

	// colorpicker-rel
	$("#colorpicker").change(function(){

		tmp = $(this).val();

		color.r = $c.hex2rgb(tmp).R;
		color.g = $c.hex2rgb(tmp).G;
		color.b = $c.hex2rgb(tmp).B;

		// beállítjuk a vonalvastagságok színeit
		$("ul#size_select hr").css({
			"color": tmp,
			"background-color": tmp
		});
	});

	// második szín colorpicker
	$("#colorpicker2").val("#ffffff");

	$("#colorpicker2").change(function () {
		tmp = $(this).val();

		color2.r = $c.hex2rgb(tmp).R;
		color2.g = $c.hex2rgb(tmp).G;
		color2.b = $c.hex2rgb(tmp).B;
	});

	// színek felcserélése
	$("button#reversecolors").click(function(){
		var tmp = color;
		color = color2;
		color2 = tmp; 

		var tmp = $("#colorpicker").val();
		$("#colorpicker").val($("#colorpicker2").val());
		$("#colorpicker2").val(tmp);
		
		tmp = $("#colorpicker").val();
		// beállítjuk a vonalvastagságok színeit
		$("ul#size_select hr").css({
			"color": tmp,
			"background-color": tmp
		});
	});

	// színválasztó négyzetek beszínezése
	$("#colorbuttons button").each(function(){
		$(this).css({"background-color": $(this).prop("name")});
	});

	// törlés
	$("#clear").click(function() {
		clearCanvas();
	});

	// Undo-redo
	// állapotokat tartalmazó tömb
	var undoArray = new Array();
	// visszalépések állapot
	var undoStep = -1;

	// melyik rétegekre rajzoltunk már
	var writtenLayers = [];

	// új kép elmentése a tömbbe
	var pushUndo = function() {
		undoStep++;
		
		// ha nem elég nagy a méret, akkor növeljük
		if (undoStep < undoArray.length)
			undoArray.length = undoStep;

		undoArray.push({uri: canvas.toDataURL(), ctx: context, index: layer_index});
	};

	// Undo gomb
	$("button#undo").click(function() {
		 if (undoStep >= 0){
			undoStep--;
			var prev_canvas = new Image();

			prev_canvas.src = undoArray[undoStep].uri;

			undoArray[undoStep].ctx.clearRect(0, 0, width, height);
			undoArray[undoStep].ctx.drawImage(prev_canvas, 0, 0);
		}
	});

	// Redo gomb
	$("button#redo").click(function() {
		if (undoStep < undoArray.length - 1){
			// előre megyünk egyet
			undoStep++;
			var prev_canvas = new Image();
			prev_canvas.src = undoArray[undoStep].uri;

			undoArray[undoStep].ctx.clearRect(0, 0, width, height);
			undoArray[undoStep].ctx.drawImage(prev_canvas, 0, 0);
		}
	});

	// lekerekített vonalhúzás
	tmp_ctx.lineJoin = 'round';
	tmp_ctx.lineCap = 'round';

	// ----------------------------------
	// Rajzolás
	prevpos = {x: 0, y: 0}; // ceruzához kell 
	pos = {x: 0, y: 0}; // akutális pozíció
	points = []; // rajzolt pontok tömbje
	startpos = {x: 0, y: 0}; // vonalrajzoláshoz kell 

	var isDown = false;

	// ha bárhol mozgatjuk az egeret.. 
	$(document).mousemove(function(e){
		prevpos = pos;
		// elmenti az aktuális pozícióba
		pos = getMousePos(temp_canvas, e);
	});

	$("canvas").mousemove(function(e) {
		if (images[layer_index] != undefined && tool == "img_select"){

			pos = getMousePos(canvas, e);
			if (hitAnchor(pos.x, pos.y) > -1){
				switch(hitAnchor(pos.x, pos.y)){
					case 0: 
					case 2:
						$(this).css({"cursor": "nwse-resize"});
						break;
					case 1:
					case 3:
						$(this).css({"cursor": "nesw-resize"});
						break;	
				}
			}
			else if (hitImage()){
				$(this).css({"cursor": "move"});
			}
			else {
				$(this).css({"cursor": "crosshair"});
			}
		}
	});

	// gombnyomás
	$("canvas").mousedown(function(e){
		// Ha még nincs ilyen, ez a kezdeti lépés, el kell menteni mielőtt rajzolunk
		if (undoArray[undoStep] == undefined)
			pushUndo();
		
		// ha még erre a rétegre nem rajzoltunk, akkor azt is el kell külön menteni
		if (jQuery.inArray(layer_index, writtenLayers) == -1){
			writtenLayers.push(layer_index);
			pushUndo();
		}
		switch(tool){
			case "pencil": {
				$(document).mousemove(onPencilPaint); // egérmozgásra rajzoljon
				onPencilPaint(e); // kis pöttyöt rajzoljon
				break;
			}
			case "brush": {
				$(document).mousemove(onBrushPaint); // beregisztráljuk a függvényt
				pos = getMousePos(temp_canvas, e);

				points.push({x: pos.x, y: pos.y}); // elmentjük az aktuális pontot a tömbbe
				onBrushPaint(e); //rajzolás: egy pötty
				break;
			}
			case "paint-bucket": {
				pos = getMousePos(canvas, e);
				onFill(e);
				break;
			}
			case "line": {
				$(document).mousemove(drawLine);
				startpos = getMousePos(temp_canvas, e); // kezdőpontot lekérjük
				drawLine(e);
				break;
			}
			case "rectangle": {
				$(document).on("mousemove", {filled: false}, drawRectangle);
				startpos= getMousePos(temp_canvas, e);
				break;
			}
			case "filledrectangle": {
				$(document).on("mousemove", {filled: true}, drawRectangle);
				startpos= getMousePos(temp_canvas, e);
				break;
			}
			case "circle": {
				$(document).on("mousemove", {filled: false}, drawCircle);
				startpos = getMousePos(temp_canvas, e);
				break;
			}
			case "filledcircle": {
				$(document).on("mousemove", {filled: true}, drawCircle);
				startpos = getMousePos(temp_canvas, e);
				break;
			}
			case "ellipse": {
				$(document).on("mousemove", {filled: false}, drawEllipse);
				startpos= getMousePos(temp_canvas, e);
				break;
			}
			case "filledellipse": {
				$(document).on("mousemove", {filled: true}, drawEllipse);
				startpos = getMousePos(temp_canvas, e);
				break;
			}
			case "spray": {
				$(document).mousemove(onSpray);
				pos = getMousePos(temp_canvas, e);
				onSpray(e);
				sprayIntervalID = setInterval(onSpray(e), 50);
				break;
			}
			case "img_select": {
				// csak akkor, ha már van kép a rétegen
				if (images[layer_index] != undefined){

					startpos = getMousePos(canvas, e);

					// ha nem képre és nem anchor-ra kattintottunk..
					if (hitAnchor(startpos.x, startpos.y) == -1 && !hitImage()) {
						// kirajzoljuk kiválasztás nélkül, majd kilépünk
						redrawImage(false);
						break;
					}
					redrawImage(true);					
					// ha szélére kattintottunk, akkor átméretezés lesz
					var isResize = hitAnchor(startpos.x, startpos.y);
					$(document).on("mousemove", {resize: isResize}, onImageMove);
				}
				break;
			}
			case "red_eye": {
				$(document).on("mousemove", onRedEyeRemoveSelect);
				startpos = getMousePos(canvas, e);
				break;
			}
		} 
		isDown = true;
	});

	$("canvas").on("contextmenu", function () {
		return false;
	});

	// ha felengedjük az egeret.. 
	$(document).mouseup(function(e){
		switch(tool){
			case "pencil": 
				$(document).off("mousemove", onPencilPaint); // már nem kell a mozgásra függvény
				break;
			case "brush": 
				$(document).off("mousemove", onBrushPaint); // már nem kell a mozgásra függvény
				break;
			case "line":
				$(document).off("mousemove", drawLine);
				break;
			case "rectangle":
			case "filledrectangle":  
				$(document).off("mousemove", drawRectangle);
				break;
			case "circle":
			case "filledcircle":
				$(document).off("mousemove", drawCircle);
				break;
			case "ellipse":
			case "filledellipse":
				$(document).off("mousemove", drawEllipse);
				break;
			case "spray": 
				$(document).off("mousemove", onSpray);
								
				try{
					clearInterval(sprayIntervalID);
				} catch(err){}
				break;
			case "img_select":
				$(document).off("mousemove", onImageMove);
				break;
			case "red_eye":
				var rect = onRedEyeRemoveSelect();
				$(document).off("mousemove", onRedEyeRemoveSelect);

				if (images[layer_index] == undefined){
					tmp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);
					return;	
				}
				var ix = imageoffsets[layer_index].x, iy = imageoffsets[layer_index].y, iw = imagewidths[layer_index], ih = imageheights[layer_index];
				// ha bármelyik sarka nem a képen belül van, akkor invalid, kilépünk
				if (rect.x < ix || rect.x > ix + iw ||
					rect.x + rect.width < ix || rect.x + rect.width > ix + iw ||
					rect.y < iy || rect.y > iy + ih || 
					rect.y + rect.height < iy || rect.y + rect.height > iy + ih){

					tmp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height);
					return;	
				}
				// egyébként elvégezzük a vörösszem eltávolítást
				ReduceRedEye(rect);
				break;
		}
		if (tool != "red_eye"){ // vörösszem esetén a temp téglalapot nem kell rámásolni a képre
			context.drawImage(temp_canvas, 0, 0); // rámásoljuk az ideiglenes canvasról a rajzot az eredeti canvasra
		}

		// ha rajzoltunk a képre, akkor el kell menteni a változtatásokat!!!
		if (images[layer_index] != null && tool != "img_select" ){
			
			// egy nagy temp canvasra elmentjük az egész canvast
			var tmpcanvas = c.clone().attr({class: 'canvas', width: width, height: height});
			var tmpcontext = tmpcanvas.get(0).getContext("2d");

			tmpcontext.drawImage(canvas, 
								imageoffsets[layer_index].x, imageoffsets[layer_index].y, 
								imagewidths[layer_index], imageheights[layer_index], 
								imageoffsets[layer_index].x, imageoffsets[layer_index].y, 
								imagewidths[layer_index], imageheights[layer_index]);
			
			// egy képre kimentjük a nagy temp canvast
			var tmpimage = new Image();
			tmpimage.src = tmpcanvas.get(0).toDataURL();


			// ha kész a kimentés
			tmpimage.onload = function(){

				// egy kisebb canvasra kivágjuk a nagy kép részét
				var tmpcanvas2 = c.clone().attr({width: imagewidths[layer_index], height: imageheights[layer_index]});
				var tmpcontext2 = tmpcanvas2.get(0).getContext("2d");

				tmpcontext2.drawImage(tmpimage,
								imageoffsets[layer_index].x, imageoffsets[layer_index].y, 
								imagewidths[layer_index], imageheights[layer_index], 
								0, 0, 
								imagewidths[layer_index], imageheights[layer_index]);

				// egy kisebb képre kimentjük a kisebb canvas tartalmát
				var tmpimage2 = new Image();
				tmpimage2.src = tmpcanvas2.get(0).toDataURL();

				// ha kész a kimentés
				tmpimage2.onload = function(){
					// elmentjük a helyzetet (reset-elődik az server változatásakor)
					tmpoffsets[layer_index] = imageoffsets[layer_index];
					images[layer_index].src = tmpimage2.src; // felülírjuk az eredeti képet az új, kis kivágott képpel
					//redrawImage(false); // újrarajzoljuk a képet
				}
			}
		}
		
		tmp_ctx.clearRect(0, 0, temp_canvas.width, temp_canvas.height); // töröljük az ideiglenest
		points = []; // töröljük a pontok tömbjét
		imageData = context.getImageData(0, 0, width, height); // újra lekérjük a színtömböt
		if(isDown){
			pushUndo();
			isDown = false;
		}
	});
	
	// képfeltöltés
	$(document).on("change", "input#imageLoader", function(e) {
		var reader = new FileReader();

		reader.onload = function(event) {
			onReaderLoad(event);
		}
		reader.readAsDataURL(e.target.files[0]);

	});

	// jquery sortable init
  	$("ol.layers").sortable({
  		handle: "span.glyphicon-move",
  		onDragStart: function($item, container, _super) {
  			_super($item, container);
  		},

  		onDrop: function(item, targetContainer, _super) {
  			// végigmegyünk az összes listaelement
  			$('ol.layers > li').each(function(index, el) {
  				// a megfelelő index a listaelem értéke lesz
  				var ind = 10 + parseInt($(this).val());
  				// kiválasztjuk a megfelelő indexű canvast és beállítjuk annyira a z-indexét, ahányadik a listaelem volt a sorban 
  				$('.canvas[id='+ind+']').css("z-index", index+10);
  			});
  			_super(item);
  		}
  	})
	

}
// az egér aktuális pozícióját visszaadó függvény
function getMousePos(canvas, e) {
    var rect = canvas.getBoundingClientRect(); // a canvas határoló doboza
    // (a doboz bal felső sarka lesz (0,0))
    return {
      x: parseInt(e.clientX - rect.left), // aktuális x pozíció - doboz bal oldalának x pozíciója = dobozhoz számított relatív x 
      y: parseInt(e.clientY - rect.top)  // akutális y pozíció - doboz tetejének y pozíciója = dobozhoz számított relatív y 
    };
}