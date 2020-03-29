const StageWidth = $('#flowchartdiv').width();
var StageHeight = $('#flowchartdiv').height();
const blockSnapSize = 30;
var startarrow = false;
var drawingarrow = false;
var currentShape;
const ShapeWidth = blockSnapSize * 6;
const ShapeHeight = blockSnapSize * 2;
var ShapeStyle = {
	fill: '#efefef',
	stroke: 'black',
	strokeWidth: 0.5,
	shadowColor: 'black',
	shadowBlur: 10,
	shadowOffset: { x: 10, y: 10 },
	shadowOpacity: 0.5,
	opacity: 0.9
}
var ShapeText = {
	width: ShapeWidth,
	fontSize: 24,
	fontFamily: 'Calibri',
	fill: 'black',
	align: 'center',
	verticalAlign: "middle",
	padding: 5
}
const Decilength = 2 * (blockSnapSize / Math.sqrt(2));
var scrollerror = 0;
var shapecount = 0;
var arrP = 0;
var arr = [];
var vf = 0;

var stage = new Konva.Stage({
	container: 'flowchartdiv',
	width: StageWidth,
	height: StageHeight
});

var gridLayer = new Konva.Layer();
var layer = new Konva.Layer();

var placeX = 300 - ShapeWidth / 2;
var placeY = blockSnapSize;

function updateShapeC() {

	$("#shpN").text(arrP + vf + "/" + shapecount);
}

function makeTA(grp) {
	var shapenode = grp.getChildren()[0];
	var textnode = grp.getChildren()[1];

	textnode.hide();
	layer.draw();

	var textPosition = textnode.absolutePosition();
	// then lets find position of stage container on the page:
	var stageBox = stage.container().getBoundingClientRect();
	// so position of textarea will be the sum of positions above:
	var areaPosition = {
		x: stageBox.left + textPosition.x,
		y: stageBox.top + textPosition.y - scrollerror
	};
	// create textarea and style it
	var textarea = document.createElement('textarea');
	document.body.appendChild(textarea);

	textarea.value = textnode.text();
	textarea.style.position = 'absolute';
	textarea.style.top = areaPosition.y + 'px';
	textarea.style.left = areaPosition.x + 'px';
	textarea.style.width = textnode.width() - textnode.padding() + 5 + 'px';
	textarea.style.height = shapenode.height() - textnode.padding() + 5 + 'px';
	textarea.style.fontSize = textnode.fontSize() + 'px';
	textarea.style.border = 'solid 1px';
	textarea.style.padding = '5px';
	textarea.style.margin = '0px';
	textarea.style.overflow = 'hidden';
	textarea.style.background = 'none';
	textarea.style.outline = 'none';
	textarea.style.resize = 'none';
	textarea.style.lineHeight = textnode.lineHeight();
	textarea.style.fontFamily = textnode.fontFamily();
	textarea.style.transformOrigin = 'left top';
	textarea.style.textAlign = textnode.align();

	textarea.style.color = textnode.fill();
	rotation = textnode.rotation();
	var transform = '';
	if (rotation) {
		transform += 'rotateZ(' + rotation + 'deg)';
	}

	var px = 0;
	// also we need to slightly move textarea on firefox
	// because it jumps a bit
	var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
	if (isFirefox) {
		px += 2 + Math.round(textnode.fontSize() / 20);
	}
	transform += 'translateY(-' + px + 'px)';
	textarea.style.transform = transform;
	// reset height
	textarea.style.height = 'auto';
	// after browsers resized it we can set actual value
	textarea.style.height = textarea.scrollHeight + 3 + 'px';
	textarea.focus();

	function removeTextarea() {
		textarea.parentNode.removeChild(textarea);
		window.removeEventListener('click', handleOutsideClick);
		textnode.show();

		layer.draw();
	}

	function setTextareaWidth(newWidth) {
		if (!newWidth) {
			// set width for placeholder
			newWidth = textnode.placeholder.length * textnode.fontSize();
		}
		// some extra fixes on different browsers
		var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
		if (isSafari || isFirefox) {
			newWidth = Math.ceil(newWidth);
		}

		var isEdge = document.documentMode || /Edge/.test(navigator.userAgent);
		if (isEdge) {
			newWidth += 1;
		}
		textarea.style.width = newWidth + 'px';
	}

	textarea.addEventListener('keydown', function (e) {
		if (e.keyCode === 13 && !e.shiftKey) {
			textnode.text(textarea.value);
			removeTextarea();
		}
		// on esc do not set value back to node
		if (e.keyCode === 27) {
			removeTextarea();
		}
	});

	textarea.addEventListener('keydown', function (e) {
		scale = textnode.getAbsoluteScale().x;
		setTextareaWidth(textnode.width() * scale);
		textarea.style.width = 'auto';
	});

	function handleOutsideClick(e) {
		if (e.target !== textarea) {
			textnode.text(textarea.value);
			removeTextarea();
		}
	}
	setTimeout(() => {
		window.addEventListener('click', handleOutsideClick);
	});
}

function newProcess(placeX, placeY, txty, anchors) {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		//dragBoundFunc: dragfunc,
		name: "SRgrp"
	});

	var box = new Konva.Rect(ShapeStyle);

	box.width(ShapeWidth);
	box.height(ShapeHeight);

	var txt = new Konva.Text(ShapeText);
	txt.width(ShapeWidth);
	txt.height(ShapeHeight);
	txt.text('int a')
	if (txty != null) {
		txt.text(txty);
	}
	grp.add(box);
	grp.add(txt);
	grp.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
		box.strokeWidth(2);
		layer.draw();
	});
	grp.on('mouseout', function () {
		document.body.style.cursor = 'default';
		box.strokeWidth(0.5);
		layer.draw();
	});
	grp.on('dragend', () => {
		setshapepos();
	});
	grp.on('dragmove', () => {
		grp.position({
			x: snap(grp.x()),
			y: snap(grp.y())
		});
		layer.batchDraw();
	});

	grp.on('dblclick', function (e) {
		makeTA(grp);
	});

	newAnchor(ShapeWidth / 2, 0, grp);//top
	newAnchor(0, ShapeHeight / 2, grp);//left
	newAnchor(ShapeWidth / 2, ShapeHeight, grp);//bot
	newAnchor(ShapeWidth, ShapeHeight / 2, grp);//right


	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}

	layer.add(grp);
	layer.draw();
	shapecount++;
	updateShapeC();
}

function newTerminal(placeX, placeY, txty, anchors) {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		name: "SRRgrp"
	});

	var box = new Konva.Rect(ShapeStyle);

	box.cornerRadius(20);
	box.width(ShapeWidth);
	box.height(ShapeHeight);
	var txt = new Konva.Text(ShapeText);
	txt.width(ShapeWidth);
	txt.height(ShapeHeight);
	txt.text('Start/End');
	if (txty != null) {
		txt.text(txty);
	}
	grp.add(box);
	grp.add(txt);
	grp.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
		box.strokeWidth(2);
		layer.draw();
	});
	grp.on('mouseout', function () {
		document.body.style.cursor = 'default';
		box.strokeWidth(0.5);
		layer.draw();
	});

	grp.on('dragend', () => {
		setshapepos();
	});
	grp.on('dragmove', () => {
		grp.position({
			x: snap(grp.x()),
			y: snap(grp.y())
		});
		layer.batchDraw();
	});

	grp.on('dblclick', function (e) {
		makeTA(grp);
	});

	newAnchor(ShapeWidth / 2, 0, grp);//top
	newAnchor(0, ShapeHeight / 2, grp);//left
	newAnchor(ShapeWidth / 2, ShapeHeight, grp);//bot
	newAnchor(ShapeWidth, ShapeHeight / 2, grp);//right

	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}
	layer.add(grp);
	layer.draw();

	shapecount++;
	updateShapeC();
}

function newConnector(placeX, placeY) {
	var circle = new Konva.Circle(ShapeStyle);
	circle.name("objC");
	circle.x(placeX);
	circle.y(placeY);
	circle.radius(blockSnapSize / 2);
	circle.draggable(true);
	layer.add(circle);
	circle.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
	});
	circle.on('mouseout', function () {
		document.body.style.cursor = 'default';
	});

	circle.on('dragend', () => {
		setshapepos();
	});
	circle.on('dragmove', () => {
		circle.position({
			x: snap(circle.x()),
			y: snap(circle.y())
		});
		layer.batchDraw();
	});

	layer.draw();

	shapecount++;
	updateShapeC();
}

function newAnchor(placeX, placeY, grp) {
	var anchor = new Konva.Circle({
		x: placeX,
		y: placeY,
		radius: 5,
		fill: '#efefef',
		stroke: 'black',
		name: 'anc',
		strokeWidth: 2,
		opacity: 0.6
	});
	grp.add(anchor);
	var pos = {
		x: 0,
		y: 0,
	};
	anchor.id("anc" + anchor._id);

	//Drag arrow with shape anchor
	grp.on('dragmove', (e) => {
		var nmarr = anchor.name().split(' ');
		if (nmarr[0] == "arrstart") {
			var arrow = layer.findOne("#" + nmarr[1]);
			arrow.points([grp.x() + anchor.x(), grp.y() + anchor.y(), arrow.points()[2], arrow.points()[3]]);
			arrow.moveToTop();
			node.setAttr('hitStrokeWidth', 8);
			layer.draw();
		}
		else if (nmarr[0] == "arrend") {
			var arrow = layer.findOne("#" + nmarr[1]);
			arrow.points([arrow.points()[0], arrow.points()[1], grp.x() + anchor.x(), grp.y() + anchor.y()]);
			arrow.moveToTop();
			layer.draw();
		}
	});

	anchor.on('mouseover', function () {
		anchor.opacity(1);
		anchor.strokeWidth(3);
		layer.draw();
	});
	anchor.on('mouseout', function () {
		anchor.opacity(0.6);
		anchor.strokeWidth(2);
		layer.draw();
	});

	anchor.on('click', function () {
		startarrow = true;
		pos.x = anchor.x() + grp.x();
		pos.y = anchor.y() + grp.y();
		stage.container().style.cursor = 'crosshair';
		anchor.name("arrstart");
		if (startarrow && drawingarrow) {
			drawingarrow = false;
			startarrow = false;
			stage.container().style.cursor = 'default';
			anchor.name("arrend");
			var node = layer.getChildren().toArray().length - 1;
			var arrow = layer.getChildren()[node];
			anchor.addName("arr" + arrow._id);
			arrow.addName("anc" + anchor._id);
			arrow.points([arrow.points()[0], arrow.points()[1], pos.x, pos.y]);
			layer.draw();
		}
		if (startarrow && !drawingarrow) {
			var arrow = new Konva.Arrow({
				points: [snap(pos.x), snap(pos.y), snap(pos.x), snap(pos.y)],
				pointerLength: 10,
				pointerWidth: 10,
				fill: 'black',
				stroke: 'black',
				strokeWidth: 4,
				name: 'objArr',
				hitStrokeWidth: 0,
			});
			arrow.id("arr" + arrow._id);
			arrow.name("anc" + anchor._id);
			layer.add(arrow);
			anchor.addName("arr" + arrow._id);
			arrow.points([pos.x, pos.y, pos.x, pos.y]);
			layer.draw();
			drawingarrow = true;
		}
	});
	layer.draw();
}

function newDecision(placeX, placeY, txty, anchors) {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		name: 'SDgrp'
	});

	var box = new Konva.Rect(ShapeStyle);

	box.width(Decilength);
	box.height(Decilength);

	var txt = new Konva.Text(ShapeText);
	box.rotation(45);
	txt.x(box.x() - (Decilength / Math.sqrt(2)));
	txt.y(box.y());
	txt.text('if()');
	txt.width(Decilength * Math.sqrt(2));
	txt.height(Decilength * Math.sqrt(2));
	if (txty != null) {
		txt.text(txty);
	}
	grp.add(box);
	grp.add(txt);

	grp.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
		box.strokeWidth(2);
		layer.draw();
	});
	grp.on('mouseout', function () {
		document.body.style.cursor = 'default';
		box.strokeWidth(0.5);
		layer.draw();
	});
	grp.on('dragend', () => {
		setshapepos();
	});
	grp.on('dragmove', () => {
		grp.position({
			x: snap(grp.x()),
			y: snap(grp.y())
		});
		layer.batchDraw();
	});
	grp.on('dblclick', function (e) {
		makeTA(grp);
	});
	newAnchor(0, 0, grp);//top
	newAnchor(-(Decilength / Math.sqrt(2)), Decilength / Math.sqrt(2), grp);//left
	newAnchor(0, Decilength * Math.sqrt(2), grp);//bot
	newAnchor(Decilength / Math.sqrt(2), Decilength / Math.sqrt(2), grp);//right

	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}
	layer.add(grp);
	layer.draw();

	shapecount++;
	updateShapeC();
}

function newIO(placeX, placeY, txty, anchors) {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		name: 'SPgrp'
	});

	var box = new Konva.Rect(ShapeStyle);
	box.skewX(-0.5);
	box.width(ShapeWidth + blockSnapSize);
	box.height(ShapeHeight);
	var txt = new Konva.Text(ShapeText);
	txt.width(ShapeWidth);
	txt.height(ShapeHeight);
	txt.text('Input X');

	if (txty != null) {
		txt.text(txty);
	}
	grp.add(box);
	grp.add(txt);
	grp.on('mouseover', function () {
		document.body.style.cursor = 'pointer';
		box.strokeWidth(2);
		layer.draw();
	});
	grp.on('mouseout', function () {
		document.body.style.cursor = 'default';
		box.strokeWidth(0.5);
		layer.draw();
	});
	grp.on('dragend', () => {
		setshapepos();
	});
	grp.on('dragmove', () => {
		grp.position({
			x: snap(grp.x()),
			y: snap(grp.y())
		});
		layer.batchDraw();
	});
	grp.on('dblclick', function (e) {
		makeTA(grp);
	});
	newAnchor(ShapeWidth / 2, 0, grp);//top
	newAnchor(0 - (blockSnapSize / 2), ShapeHeight / 2, grp);//left
	newAnchor(ShapeWidth / 2, ShapeHeight, grp);//bot
	newAnchor(ShapeWidth + (blockSnapSize / 2), ShapeHeight / 2, grp);//right

	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}
	layer.add(grp);
	layer.draw();
	shapecount++;
	updateShapeC();
}

function clBoard() {
	if (confirm("Are you sure?")) {
		shapecount = 0;
		arrP = 0;
		placeY = 0
		updateShapeC();
		layer.destroyChildren();
		layer.draw();

	}
}

function saveBoard() {

	var Shapes = [];
	var codearr = [];
	var psuedoarr = [];
	//Saving Stage
	layer.getChildren().forEach(function (node) {

		if (node.getClassName() === "Group") {
			var anchorsArr = []
			node.getChildren().forEach((subnode, index) => { if (index > 1 && index < 6) { anchorsArr.push([subnode.name(), subnode.id()]) } });
			var shape = {
				SName: node.name(),
				x: node.x(),
				y: node.y(),
				shapeText: node.getChildren()[1].text(),
				anchors: anchorsArr
			}
			Shapes.push(shape);
		}
		else if (node.getClassName() === "Arrow") {
			var shape = {
				AName: [node.name(), node.id()],
				points: node.points()
			}
			Shapes.push(shape);
		}
		else {
			var shape = {
				SName: node.name(),
				x: node.x(),
				y: node.y()
			}
			Shapes.push(shape);
		}
	});

	//Saving code column
	$(".codetexty").map(function () {
		codearr.push($(this).text());
	});

	//Saving psuedocode column
	$(".psuedotexty").map(function () {
		psuedoarr.push($(this).text());
	});

	var topic = document.getElementById('dropdown').value;
	var sbtopic = document.getElementById('sbtopic').value;

	$.ajax({
		type: 'POST',
		url: '/newsubtopic',
		data: { Shapes: Shapes, StageHeight: StageHeight, topic: topic, sbtopic: sbtopic, codearr: codearr, psuedoarr: psuedoarr }
	})
		.done(function (data) {
			var newLi = document.createElement("li");
			newLi.id = data.subtopicid;
			var newA = document.createElement("a");
			newA.onclick = loadBoard(newA);
			$(newA).addClass("nav-link");
			newLi.appendChild(newA);
			var newContent = document.createTextNode(sbtopic);
			newA.appendChild(newContent);
			var newButton = document.createElement("button");
			$(newButton).addClass("btn btn-sm btn-outline-light");
			newButton.onclick = loadBoard(newButton);
			newLi.appendChild(newButton);
			var newI = document.createElement("i");
			$(newI).addClass("fa fa-trash-alt text-warning");
			newButton.appendChild(newI);
			//alert(newLi);
			$('#subtopicslist').append(newLi);
		});
}

function loadBoard(item) {
	subid = $(item).parent().attr('id');
	topid = $(item).parent().parent().parent().attr('id');

	$.ajax({
		type: 'GET',
		url: '/getsubtopic',
		data: { topicID: topid, sbtopicID: subid }
	})
		.done(function (data) {
			layer.destroyChildren();
			$('#codeDiv').empty();
			$('#psuedoDiv').empty();
			data.subtop.code.forEach(coderow => {
				$('#codeDiv').append(`<li class="list-group-item p-0" onfocusin="rowfocus(this)">
				<div class="form-control invisibile-texty codetexty" rows="2" contenteditable="true">${coderow}</div>
				<div class="row-box"></div>								
				  <div class="rowboxdel">
					<button type="button" class="btn btn-sm btn-outline-light btn-dark" onclick="delrowbox(this)">
						<i class="fa fa-trash-alt"></i>
					</button>
				</div>
			</li>`);
			});
			data.subtop.psuedocode.forEach(pcoderow => {
				$('#psuedoDiv').append(`<li class="list-group-item p-0" onfocusin="rowfocus(this)">
				<div class="form-control invisibile-texty psuedotexty" rows="2" contenteditable="true">${pcoderow}</div>
				<div class="row-box"></div>								
				  <div class="rowboxdel">
					<button type="button" class="btn btn-sm btn-outline-light btn-dark" onclick="delrowbox(this)">
						<i class="fa fa-trash-alt"></i>
					</button>
				</div>
			</li>`);
			});
			var title = data.topictitle + "\\: " + data.subtop.name;
			$("#subTopicName").text(title);
			StageHeight = data.subtop.flowchart.StageH;
			stage.height(StageHeight);
			setstageheight();
			data.subtop.flowchart.shapes.forEach(node => {
				switch (node.SName) {
					case "SRgrp":
						newProcess(node.x, node.y, node.shapeText, node.anchors);
						break;
					case "SRRgrp":
						newTerminal(node.x, node.y, node.shapeText, node.anchors);
						break;
					case "SDgrp":
						newDecision(node.x, node.y, node.shapeText, node.anchors);
						break;
					case "SPgrp":
						newIO(node.x, node.y, node.shapeText, node.anchors);
						break;
					case "objC":
						newConnector(node.x, node.y);
						break;
					default:
						break;
				}
				if (node.AName != null) {
					var arrow = new Konva.Arrow({
						points: node.points,
						pointerLength: 10,
						pointerWidth: 10,
						fill: 'black',
						stroke: 'black',
						strokeWidth: 4,
						name: node.AName[0],
						id: node.AName[1],
						hitStrokeWidth: 6,
						draggable: true
					});
					layer.add(arrow);
				}
			});
		});

}

function deletesub(item) {
	subid = $(item).parent().attr('id');
	topid = $(item).parent().parent().parent().attr('id');
	$.ajax({
		method: 'POST',
		url: '/delsubtopic',
		data: { subtopicID: subid, topicID: topid }
	})
		.done(function (data) {
			alert("done del");
			$(item).parent().remove();

		});
}

function deletetopic(item) {
	topid = $(item).parent().attr('id');
	$.ajax({
		method: 'POST',
		url: '/deltopic',
		data: { topicID: topid }
	})
		.done(function (data) {
			alert("done del");
			$(item).parent().remove();
		});
}

function snap(num) {
	return (Math.round(num / blockSnapSize) * blockSnapSize);
}

function stageinit(gridLayer, layer) {
	stage.add(gridLayer);
	stage.add(layer);
	setstageheight();

	stage.on('contentMousemove', function () {
		if (drawingarrow) {
			var node = layer.getChildren().toArray().length - 1;
			var arrow = layer.getChildren()[node];
			pos = stage.getPointerPosition();
			arrow.points([arrow.points()[0], arrow.points()[1], pos.x, pos.y]);
			layer.draw();
		}
	});

	var menuNode = document.getElementById('menu');
	$('#delete-button').on('click', () => {
		if (currentShape.getClassName() === 'Circle') { currentShape.destroy(); }
		else if (currentShape.getClassName() === 'Arrow') {
			if (currentShape.name() != "objArr") {
				var nmarr = currentShape.name().split(' ');
				var anc1 = layer.findOne("#" + nmarr[0]);
				var anc2 = layer.findOne("#" + nmarr[1]);
				anc1.name("anc"); anc2.name("anc");
			}
			currentShape.destroy();
		}
		else {
			currentShape.getParent().getChildren().forEach((subnode, index) => {
				if (index > 1 && index < 6) {
					var nmarr = subnode.name().split(' ');
					if (nmarr[0] == "arrend" || nmarr[0] == "arrstart") {
						var arr = layer.findOne("#" + nmarr[1]);
						var nmarr2 = arr.name().split(' ');
						var anc1 = layer.findOne("#" + nmarr2[0]);
						var anc2 = layer.findOne("#" + nmarr2[1]);
						anc1.name("anc"); anc2.name("anc");
						arr.destroy();
					}
				}
			});
			currentShape.getParent().destroy();
		}
		layer.draw();
		shapecount--;
		updateShapeC();
		placeY = oldplaceY;
	});

	$('#mvfrnt-button').on('click', () => {

		if (currentShape.getClassName() === 'Circle') { currentShape.moveToTop(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.moveToTop(); }
		else { currentShape.getParent().moveToTop(); }
		layer.draw();

	});

	$('#mvbck-button').on('click', () => {
		if (currentShape.getClassName() === 'Circle') { currentShape.moveToBottom(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.moveToBottom(); }
		else { currentShape.getParent().moveToBottom(); }
		layer.draw();
	});

	$('#mvup-button').on('click', () => {
		if (currentShape.getClassName() === 'Circle') { currentShape.moveUp(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.moveUp(); }
		else { currentShape.getParent().moveUp(); }
		layer.draw();
	});

	$('#mvdwn-button').on('click', () => {
		if (currentShape.getClassName() === 'Circle') { currentShape.moveDown(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.moveDown(); }
		else { currentShape.getParent().moveDown(); }
		layer.draw();
	});

	window.addEventListener('click', () => {
		// hide menu 
		menuNode.style.display = 'none';
	})

	stage.on('contextmenu', function (e) {
		// prevent default behavior
		e.evt.preventDefault();
		if (e.target === stage) {
			// if we are on empty place of the stage we will do nothing
			return;
		}
		currentShape = e.target;
		// show menu
		menuNode.style.display = 'initial';
		var containerRect = stage.container().getBoundingClientRect();
		menuNode.style.top = containerRect.top + stage.getPointerPosition().y + 4 + 'px';
		menuNode.style.left = containerRect.left + stage.getPointerPosition().x + 4 + 'px';
	});

	$("#viewmode").click(() => {
		if (vf == 0) {
			vf = 1;
			$('#nxt').prop('disabled', false);
			$('#prv').prop('disabled', false);
			$(".rowboxdel").hide();
			//Fullscreen on
			if ((document.fullScreenElement && document.fullScreenElement !== null) ||
				(!document.mozFullScreen && !document.webkitIsFullScreen)) {
				if (document.documentElement.requestFullScreen) {
					document.documentElement.requestFullScreen();
				} else if (document.documentElement.mozRequestFullScreen) {
					document.documentElement.mozRequestFullScreen();
				} else if (document.documentElement.webkitRequestFullScreen) {
					document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
				}
			}
			arrP = 0;
			layer.getChildren().forEach((node) => {
				if (node.name() == "SRRgrp") {
					var txt = node.getChildren()[1];
					if (txt.text() == "Start") {
						arr.push(node);
						NextNode(node);
					}
				}
			});
			$(".codetexty:eq(" + arrP + ")").css("background", "#a2c1f2");
			$(".psuedotexty:eq(" + arrP + ")").css("background", "#a2c1f2");

			arr[arrP].getChildren()[0].fill("#a2c1f2");
			layer.draw();
			updateShapeC();

		}
		else {
			vf = 0;
			if (document.cancelFullScreen) {
				document.cancelFullScreen();
			} else if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen();
			} else if (document.webkitCancelFullScreen) {
				document.webkitCancelFullScreen();
			}
			arr[arrP].getChildren()[0].fill("#efefef");
			$(".codetexty:eq(" + arrP + ")").css("background", "#efefef");
			$(".psuedotexty:eq(" + arrP + ")").css("background", "#efefef");
			$(".rowboxdel").show();
			layer.draw();
			arr = [];
			$('#nxt').prop('disabled', true);
			$('#prv').prop('disabled', true);
			arrP = 0;
			updateShapeC();
		}


	});

	$("#nxt").click(() => {
		if (arrP < arr.length - 1) {
			arr[arrP].getChildren()[0].fill("#efefef");
			$(".codetexty:eq(" + arrP % shapecount + ")").css("background", "#efefef");
			$(".psuedotexty:eq(" + arrP % shapecount + ")").css("background", "#efefef");
			arrP++;
			arr[arrP].getChildren()[0].fill("#a2c1f2");
			$(".codetexty:eq(" + arrP % shapecount + ")").css("background", "#a2c1f2");
			$(".psuedotexty:eq(" + arrP % shapecount + ")").css("background", "#a2c1f2");
			layer.draw();
			updateShapeC();
		}
	});

	$("#prv").click(() => {
		if (arrP > 0) {
			arr[arrP].getChildren()[0].fill("#efefef");
			$(".codetexty:eq(" + arrP + ")").css("background", "#efefef");
			$(".psuedotexty:eq(" + arrP + ")").css("background", "#efefef");
			arrP--;
			arr[arrP].getChildren()[0].fill("#a2c1f2");
			$(".codetexty:eq(" + arrP + ")").css("background", "#a2c1f2");
			$(".psuedotexty:eq(" + arrP + ")").css("background", "#a2c1f2");
			layer.draw();
			updateShapeC();

		}
	});

	$('#saveBrd').click(function () {
		saveBoard();
	});
	$('.rrectangle').click(function () {
		newTerminal(placeX, placeY);
		setshapepos();
	});
	$('.rectangle').click(function () {
		newProcess(placeX, placeY);
		setshapepos();
	});
	$('.parallelogram').click(function () {
		newIO(placeX, placeY);
		setshapepos();
	});
	$('.dici').click(function () {
		newDecision(placeX + ShapeWidth / 2, placeY);
		setshapepos();
	});
	$('.circle').click(function () {
		newConnector(placeX, placeY);
		setshapepos();
	});

	$("#flowchartdiv").scroll(function () {
		scrollerror = $("#flowchartdiv").scrollTop();
	});
}

function NextNode(node) {
	var looped = 0;
	node.getChildren().forEach((subnode) => {
		var nmarr = subnode.name().split(' ');
		if (subnode.name().includes("loopend")) { return }
		if (nmarr[0] == "arrstart") {
			var arr1 = layer.findOne("#" + nmarr[1]);
			var nmarr2 = arr1.name().split(' ');
			var nextNodeAnc = layer.findOne("#" + nmarr2[1]);

			console.log(looped);
			arr.forEach((node) => {
				if (nextNodeAnc.getParent() == node) {
					subnode.addName("loopend");
				}
			});
			if (looped == 0) {
				arr.push(nextNodeAnc.getParent());
				NextNode(nextNodeAnc.getParent());
			}

		}
	});
}

function setstageheight() {

	stage.height(StageHeight);
	gridLayer.destroyChildren();
	for (var i = 0; i < StageWidth / blockSnapSize; i++) {
		gridLayer.add(new Konva.Line({
			points: [Math.round(i * blockSnapSize) + 0.5, 0, Math.round(i * blockSnapSize) + 0.5, StageHeight],
			stroke: '#6b6b6b',
			strokeWidth: 1,
		}));
	}

	for (var j = 0; j < StageHeight / blockSnapSize; j++) {
		gridLayer.add(new Konva.Line({
			points: [0, j * blockSnapSize, StageWidth, j * blockSnapSize],
			stroke: '#6b6b6b',
			strokeWidth: 0.5,
		}));
	}
	/*for (var j = 0; j < StageHeight / (blockSnapSize*2.5); j++) {
		let rowstart=j*(blockSnapSize*2.5);
		gridLayer.add(new Konva.Rect({
			x: 0,
			y: rowstart,
			width: StageWidth,
			height: blockSnapSize/2,
			fill: '#6b6b6b',
		}));
		let linestart=rowstart+(blockSnapSize*1.5);
		gridLayer.add(new Konva.Line({
			points: [0,linestart, StageWidth, linestart],
			stroke: '#6b6b6b',
			strokeWidth: 0.5,
		}));
	}*/

	/*for (var j = 0; j < StageHeight / blockSnapSize; j=j+2) {
		
	}*/

	stage.batchDraw();
}

function setshapepos() {
	oldplaceY = placeY;
	node = layer.getChildren()[layer.getChildren().length - 1];
	if (node.name() == "SXgrp") {
		placeX = node.x() - ShapeWidth / 2;
		placeY = node.y() + blockSnapSize * 6;
	}
	else {
		placeX = Math.round(node.x() / blockSnapSize) * blockSnapSize;
		placeY = node.y() + blockSnapSize * 3;
		placeY = Math.round(placeY / blockSnapSize) * blockSnapSize;
	}
}

stageinit(gridLayer, layer);
newTerminal(placeX, placeY, "Start");
setshapepos();