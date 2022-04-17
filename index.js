// RENDER MAP
function renderMap() {
	var shpURL = "assets/tadlak_lake.shp";
	var dbfURL = "assets/tadlak_lake.dbf";
	var shpFile;
	var dbfFile;
	var shpLoader = new BinaryAjax(shpURL, onShpComplete, onShpFail);
	var dbfLoader = new BinaryAjax(dbfURL, onDbfComplete, onDbfFail);
	function onShpFail() {
		alert("failed to load " + shpURL);
	}
	function onDbfFail() {
		alert("failed to load " + dbfURL);
	}
	function onShpComplete(oHTTP) {
		var binFile = oHTTP.binaryResponse;
		if (window.console && window.console.log) shpFile = new ShpFile(binFile);
		if (
			shpFile.header.shapeType != ShpType.SHAPE_POLYGON &&
			shpFile.header.shapeType != ShpType.SHAPE_POLYLINE
		) {
			alert(
				"Shapefile does not contain Polygon records (found type: " +
					shpFile.header.shapeType +
					")",
			);
		}
		if (dbfFile) {
			render(shpFile.records, dbfFile.records);
		}
	}
	function onDbfComplete(oHTTP) {
		var binFile = oHTTP.binaryResponse;
		if (window.console && window.console.log) dbfFile = new DbfFile(binFile);
		if (shpFile) {
			render(shpFile.records, dbfFile.records);
		}
	}

	function render(records, data) {
		if (window.console && window.console.log)
			var canvas = document.getElementById("map");
		if (window.G_vmlCanvasManager) {
			G_vmlCanvasManager.initElement(canvas);
		}
		var t1 = new Date().getTime();
		if (window.console && window.console.log) var box;
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (
				record.shapeType == ShpType.SHAPE_POLYGON ||
				record.shapeType == ShpType.SHAPE_POLYLINE
			) {
				var shp = record.shape;
				for (var j = 0; j < shp.rings.length; j++) {
					var ring = shp.rings[j];
					for (var k = 0; k < ring.length; k++) {
						if (!box) {
							box = { x: ring[k].x, y: ring[k].y, width: 0, height: 0 };
						} else {
							var l = Math.min(box.x, ring[k].x);
							var t = Math.min(box.y, ring[k].y);
							var r = Math.max(box.x + box.width, ring[k].x);
							var b = Math.max(box.y + box.height, ring[k].y);
							box.x = l;
							box.y = t;
							box.width = r - l;
							box.height = b - t;
						}
					}
				}
			}
		}
		var t2 = new Date().getTime();
		if (window.console && window.console.log) t1 = new Date().getTime();
		if (window.console && window.console.log) var ctx = canvas.getContext("2d");
		var sc = Math.min(400 / box.width, 400 / box.height);
		ctx.fillStyle = "transparent";
		ctx.fillRect(0, 0, 400, 400);
		// ctx.lineWidth = 0.5;
		ctx.strokeStyle = "#ffffff";
		for (var i = 0; i < records.length; i++) {
			var record = records[i];
			if (
				record.shapeType == ShpType.SHAPE_POLYGON ||
				record.shapeType == ShpType.SHAPE_POLYLINE
			) {
				var shp = record.shape;
				for (var j = 0; j < shp.rings.length; j++) {
					var ring = shp.rings[j];
					if (ring.length < 1) continue;
					var my_gradient;
					if (ring.length == 23) {
						my_gradient = ctx.createRadialGradient(25, 220, 220, 1, 200, 1);
						my_gradient.addColorStop(0, "#ffb3b3");
						// my_gradient.addColorStop(0, "green");
						my_gradient.addColorStop(0.5, "#ff6666");
						// my_gradient.addColorStop(0.5, "yellow");
						my_gradient.addColorStop(0.8, "#ff0000");
						my_gradient.addColorStop(1, "#660000");
					}
					if (ring.length == 17) {
						my_gradient = ctx.createRadialGradient(330, 100, 220, 330, 1, 1);
						my_gradient.addColorStop(0, "#ffb3b3");
						// my_gradient.addColorStop(0, "green");
						my_gradient.addColorStop(0.5, "#ff6666");
						// my_gradient.addColorStop(0.5, "yellow");
						my_gradient.addColorStop(0.8, "#ff0000");
						my_gradient.addColorStop(1, "#660000");
					}
					if (ring.length == 21) {
						my_gradient = ctx.createRadialGradient(330, 350, 220, 320, 350, 1);
						my_gradient.addColorStop(0, "#ffb3b3");
						// my_gradient.addColorStop(0, "green");
						my_gradient.addColorStop(0.5, "#ff6666");
						// my_gradient.addColorStop(0.5, "yellow");
						my_gradient.addColorStop(0.8, "#ff0000");
						my_gradient.addColorStop(1, "#660000");
					}

					ctx.fillStyle = "#fff";
					ctx.font = "18px arial";
					ctx.fillText("Sensor 1", 25, 220);

					ctx.fillStyle = "#fff";
					ctx.font = "18px arial";
					ctx.fillText("Sensor 2 ", 250, 30);

					ctx.globalCompositeOperation = "destination-over";
					ctx.fillStyle = "#fff";
					ctx.font = "18px arial";
					ctx.fillText("Sensor 3", 220, 350);

					ctx.fillStyle = my_gradient;
					// ctx.fillStyle = getFillRecord(data[i], i);
					ctx.beginPath();
					ctx.moveTo((ring[0].x - box.x) * sc, 400 - (ring[0].y - box.y) * sc);
					for (var k = 1; k < ring.length; k++) {
						ctx.lineTo(
							(ring[k].x - box.x) * sc,
							400 - (ring[k].y - box.y) * sc,
						);
					}
					ctx.fill();
					ctx.stroke();
				}
			}
		}
		t2 = new Date().getTime();
	}
	function getFillRecord(record) {
		var colors = [
			"#F1EEF6",
			"#D4B9DA",
			"#C994C7",
			"#DF65B0",
			"#DD1C77",
			"#980043",
		];
		var popn = parseInt(record.values["POP2005"]);
		if (!isNaN(popn)) {
			popn = Math.max(0, Math.min(100000000, popn));
			var colorIndex = parseInt(((colors.length - 1) * popn) / 100000000);
			var color = colors[colorIndex];
			//if (window.console && window.console.log) console.log('popn: ' + popn + ' color: ' + color);
			return color;
		}
		return "rgba(102, 102, 102, .5)";
	}
}
renderMap();
