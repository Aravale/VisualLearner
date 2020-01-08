var StageWidth = 650;
var StageHeight = $('#flowchartdiv').height();
var shadowOffset = 20;
var tween = null;
var blockSnapSize = 30;
var isPaint = false;
var drawarrow = false;
let currentShape;
var ShapeWidth = blockSnapSize * 6;
var ShapeHeight = blockSnapSize * 2;
var Decilength = blockSnapSize * 3;
//Global dec for init vars
var shadowR; var shadowRR; var shadowP; var shadowD; var shadowC;var shadowArr; var verticalBar;

var stage = new Konva.Stage({
	container: 'flowchartdiv',
	width: StageWidth,
	height: StageHeight
});

var gridLayer = new Konva.Layer();

var layer = new Konva.Layer();
var placeX = 300 - ShapeWidth / 2;
var placeY = 0;

stage.add(gridLayer);
stage.add(layer);

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
		y: stageBox.top + textPosition.y
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
	textarea.style.border = 'none';
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
	/*
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
	*/
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
		//scale = textnode.getAbsoluteScale().x;
		//setTextareaWidth(textnode.width() * scale);
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + textnode.fontSize() + 'px';
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

function newRectangle() {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		//dragBoundFunc: dragfunc,
		name: "SRgrp"
	});

	var box = new Konva.Rect({
		width: ShapeWidth,
		height: ShapeHeight,
		fill: '#efefef',
		stroke: 'black',
		strokeWidth: 0.5,
	});

	var txt = new Konva.Text({
		text: '\nint a',
		width: ShapeWidth,
		fontSize: blockSnapSize/2,
		fontFamily: 'Calibri',
		fill: 'black',
		align: 'center',
		verticalAlign: 'center',
		padding: 5
	});

	grp.add(box);
	grp.add(txt);

	layer.add(grp);
	addshadow();
	layer.draw();
}

function newRRectangle() {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		name: "SRRgrp"
	});

	var box = new Konva.Rect({
		width: ShapeWidth,
		height: ShapeHeight,
		fill: '#efefef',
		stroke: 'black',
		strokeWidth: 0.5,
		cornerRadius: 20
	});

	var txt = new Konva.Text({
		text: '\nStart/End',
		width: ShapeWidth,
		fontSize: blockSnapSize/2,
		fontFamily: 'Calibri',
		fill: 'black',
		align: 'center',
		verticalAlign: 'center',
		padding: 5
	});

	grp.add(box);
	grp.add(txt);

	layer.add(grp);
	addshadow();
	layer.draw();

}

function newCircle() {
	var circle = new Konva.Circle({
		x: placeX,
		y: placeY,
		radius: blockSnapSize / 2,
		fill: '#efefef',
		stroke: 'black',
		name: 'objC',
		strokeWidth: 0.5,
		draggable: true
	});

	layer.add(circle);
	addshadow();
	layer.draw();
}

function newDici() {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		name: 'SDgrp'
	});

	var box = new Konva.Rect({

		width: Decilength,
		height: Decilength,
		fill: '#efefef',
		stroke: 'black',
		strokeWidth: 0.5,
	});
	var txt = new Konva.Text({

		text: '\nif()',
		width: Decilength + 38,
		fontSize: blockSnapSize/2,
		fontFamily: 'Calibri',
		fill: 'black',
		align: 'center',
		verticalAlign: 'center',
		padding: 5
	});
	const degToRad = Math.PI / 180;
	const rotatePoint = ({ x, y }, deg) => {
		const rcos = Math.cos(deg * degToRad), rsin = Math.sin(deg * degToRad);
		return { x: x * rcos - y * rsin, y: y * rcos + x * rsin };
	};
	//current rotation origin (0, 0) relative to desired origin - center (box.width()/2, box.height()/2)
	const topLeft = { x: -box.width() / 2, y: -box.height() / 2 };
	const current = rotatePoint(topLeft, box.rotation());
	const rotated = rotatePoint(topLeft, 45);
	const dx = rotated.x - current.x, dy = rotated.y - current.y;
	box.rotation(45);
	txt.x(box.x() - 1.44 * dx);
	txt.y(box.y() - dy);

	grp.add(box);
	grp.add(txt);

	layer.add(grp);
	addshadow();
	layer.draw();
}

function newParallelo() {
	var grp = new Konva.Group({
		x: placeX,
		y: placeY,
		draggable: true,
		name: 'SPgrp'
	});

	var box = new Konva.Rect({
		width: ShapeWidth + blockSnapSize,
		height: ShapeHeight,
		fill: '#efefef',
		stroke: 'black',
		strokeWidth: 0.5,
		skewX: -0.5
	});

	var txt = new Konva.Text({
		text: '\nInput X',
		width: ShapeWidth,
		fontSize: blockSnapSize/2,
		fontFamily: 'Calibri',
		fill: 'black',
		align: 'center',
		verticalAlign: 'center',
		padding: 5
	});

	grp.add(box);
	grp.add(txt);

	layer.add(grp);
	addshadow();
	layer.draw();
}

function clBoard() {
	if (confirm("Are you sure?")) {
		layer.destroyChildren();
		layer.draw();
	}
}

function saveBoard() {
	document.getElementById('stagestate').value = stage.toJSON();
}

function loadBoard(stagestate, codestate, pcodestate) {
	stage = Konva.Node.create(stagestate, 'flowchartdiv');

	layer = stage.getChildren(function (node) {
		return node.getClassName() === 'Layer';
	})[1];
	gridLayer = stage.getChildren(function (node) {
		return node.getClassName() === 'Layer';
	})[0];
	stageinit(gridLayer, layer, stage);
	/*layer.on('dblclick', function (e) {
		// prevent default behavior
		e.evt.preventDefault();
		if (e.target === layer) {
			// if we are on empty place of the stage we will do nothing

			return;
		}

		currentShape = e.target;
		// show menuK
		//Konva.grp
		//currentShape.on('dblclick', ()=>{
		makeTA(currentShape.getParent());
		//});
	});*/
	//document.getElementById('codeDivTA').value = codestate;
	//document.getElementById('psuedoDivTA').value = pcodestate;
	//document.getElementById('subTopicName').value = name;
}

function newArrow() {
	isPaint = true;
}

function getConnectorPoints(from, to) {
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	let angle = Math.atan2(-dy, dx);

	const radius = 50;

	return [
		from.x + -radius * Math.cos(angle + Math.PI),
		from.y + radius * Math.sin(angle + Math.PI),
		to.x + -radius * Math.cos(angle),
		to.y + radius * Math.sin(angle)
	];
}

function initShadows() {

	 shadowArr = new Konva.Arrow({
		x: 0,
		y: 0,
		points: [0, 0, 0, 0],
		pointerLength: 10,
		pointerWidth: 10,
		fill: '#dfdfdf',
		opacity: 0.6,
		stroke: '#CF6412',
		strokeWidth: 2,
		dash: [20, 2],
		name: 'shadowRect'
	});
	shadowArr.hide();
	gridLayer.add(shadowArr);

	shadowR = new Konva.Rect({
		x: 0,
		y: 0,
		width: ShapeWidth,
		height: ShapeHeight,
		fill: '#dfdfdf',
		strokeWidth: 2,
		opacity: 0.6,
		stroke: '#CF6412',
		dash: [20, 2],
		name: 'shadowRect'
	});

	shadowR.hide();
	gridLayer.add(shadowR);

	shadowRR = new Konva.Rect({
		x: 0,
		y: 0,
		width: ShapeWidth,
		height: ShapeHeight,
		fill: '#dfdfdf',
		strokeWidth: 2,
		opacity: 0.6,
		stroke: '#CF6412',
		dash: [20, 2],
		name: 'shadowRect',
		cornerRadius: 20
	});

	shadowRR.hide();
	gridLayer.add(shadowRR);

	shadowP = new Konva.Rect({
		x: 0,
		y: 0,
		width: ShapeWidth + blockSnapSize,
		height: ShapeHeight,
		fill: '#dfdfdf',
		strokeWidth: 2,
		opacity: 0.6,
		stroke: '#CF6412',
		dash: [20, 2],
		name: 'shadowRect',
		skewX: -0.5
	});

	shadowP.hide();
	gridLayer.add(shadowP);

	shadowD = new Konva.Rect({
		x: 0,
		y: 0,
		width: Decilength,
		height: Decilength,
		fill: '#dfdfdf',
		strokeWidth: 2,
		opacity: 0.6,
		stroke: '#CF6412',
		dash: [20, 2],
		name: 'shadowRect',
		rotation: 45
	});

	shadowD.hide();
	gridLayer.add(shadowD);

	shadowC = new Konva.Circle({
		x: 0,
		y: 0,
		radius: blockSnapSize / 2,
		fill: '#dfdfdf',
		strokeWidth: 2,
		opacity: 0.6,
		stroke: '#CF6412',
		dash: [20, 2],
		name: 'shadowRect',
	});

	shadowC.hide();
	gridLayer.add(shadowC);
}

function stageinit(gridLayer, layer, stage) {
	for (var i = 0; i < StageWidth / blockSnapSize; i++) {
		gridLayer.add(new Konva.Line({
			points: [Math.round(i * blockSnapSize) + 0.5, 0, Math.round(i * blockSnapSize) + 0.5, StageHeight],
			stroke: '#6b6b6b',
			strokeWidth: 1,
		}));
	}

	gridLayer.add(new Konva.Line({ points: [0, 0, 10, 10] }));
	for (var j = 0; j < StageHeight / blockSnapSize; j++) {
		gridLayer.add(new Konva.Line({
			points: [0, Math.round(j * blockSnapSize), StageWidth, Math.round(j * blockSnapSize)],
			stroke: '#6b6b6b',
			strokeWidth: 0.5,
		}));
	}

	gridLayer.batchDraw();

	layer.on('dblclick', function (e) {
		// prevent default behavior
		e.evt.preventDefault();
		if (e.target === layer) {
			// if we are on empty place of the stage we will do nothing
			return;
		}

		currentShape = e.target;
		if (!(currentShape.getClassName() === 'Circle')) {
			makeTA(currentShape.getParent());
		}
	});

	var menuNode = document.getElementById('menu');
	document.getElementById('delete-button').addEventListener('click', () => {
		if (currentShape.getClassName() === 'Circle') { currentShape.destroy(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.destroy(); }
		else { currentShape.getParent().destroy(); }
		layer.draw();
	});

	document.getElementById('mvfrnt-button').addEventListener('click', () => {
				
		if (currentShape.getClassName() === 'Circle') { currentShape.moveToTop(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.moveToTop(); }
		else { currentShape.getParent().moveToTop(); }
		layer.draw();
	
	});
	
	document.getElementById('mvbck-button').addEventListener('click', () => {
		if (currentShape.getClassName() === 'Circle') { currentShape.moveToBottom(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.moveToBottom(); }
		else { currentShape.getParent().moveToBottom(); }
		layer.draw();
	});
	
	document.getElementById('mvup-button').addEventListener('click', () => {
		if (currentShape.getClassName() === 'Circle') { currentShape.moveUp(); }
		else if (currentShape.getClassName() === 'Arrow') { currentShape.moveUp(); }
		else { currentShape.getParent().moveUp(); }
		layer.draw();
	});
	
	document.getElementById('mvdwn-button').addEventListener('click', () => {
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

	stage.on('contentMousedown', function (e) {
		if (isPaint) {
			var pos = stage.getPointerPosition();
			var arrow = new Konva.Arrow({
				points: [pos.x, pos.y, pos.x, pos.y],
				pointerLength: 10,
				pointerWidth: 10,
				fill: 'black',
				stroke: 'black',
				strokeWidth: 4,
				name:'objArr',
				hitStrokeWidth:6,
				draggable: true
			});
			layer.add(arrow);
			drawarrow = true;
		}
	});

	stage.on('contentMouseup', function () {
		if (isPaint && drawarrow) {
			var node = layer.getChildren().toArray().length - 1;
			var arrow = layer.getChildren()[node];
			if (arrow.points()[0] === arrow.points()[2] && arrow.points()[1] === arrow.points()[3]) { arrow.destroy(); }
			addshadow();
		}
		isPaint = false;
		drawarrow = false;
		layer.getChildren().each(function (node) { node.draggable = (true); });
		layer.draw();
	});

	// and core function - drawing
	stage.on('contentMousemove', function () {

		if (!isPaint) {
			return;
		}
		if (drawarrow) {
			var node = layer.getChildren().toArray().length - 1;
			var arrow = layer.getChildren()[node];
			var pos = stage.getPointerPosition();
			var oldPoints = arrow.points();
			//arrow.points([oldPoints[0], oldPoints[1], pos.x, pos.y])
			arrow.points([Math.round(oldPoints[0] / blockSnapSize) * blockSnapSize, Math.round(oldPoints[1] / blockSnapSize) * blockSnapSize, Math.round(pos.x / blockSnapSize) * blockSnapSize, Math.round(pos.y / blockSnapSize) * blockSnapSize])
			layer.draw();
		}
	});

	initShadows();
	addshadow();
}

function addshadow() {
	layer.find('.SRgrp').each(function (grp, n) {
		grp.on('dragstart', (e) => {
			shadowR.show();
			shadowR.moveToTop();
			grp.moveToTop();
		});
		grp.on('dragend', (e) => {
			grp.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
			shadowR.hide();
		});
		grp.on('dragmove', (e) => {
			shadowR.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
		});
	});

	layer.find('.SRRgrp').each(function (grp, n) {
		grp.on('dragstart', (e) => {
			shadowRR.show();
			shadowRR.moveToTop();
			grp.moveToTop();
		});
		grp.on('dragend', (e) => {
			grp.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
			shadowRR.hide();
		});
		grp.on('dragmove', (e) => {
			shadowRR.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
		});
	});

	layer.find('.SPgrp').each(function (grp, n) {
		grp.on('dragstart', (e) => {
			shadowP.show();
			shadowP.moveToTop();
			grp.moveToTop();
		});
		grp.on('dragend', (e) => {
			grp.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
			shadowP.hide();
		});
		grp.on('dragmove', (e) => {
			shadowP.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
		});
	});

	layer.find('.SDgrp').each(function (grp, n) {
		grp.on('dragstart', (e) => {
			shadowD.show();
			shadowD.moveToTop();
			grp.moveToTop();
		});
		grp.on('dragend', (e) => {
			grp.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
			shadowD.hide();
		});
		grp.on('dragmove', (e) => {
			shadowD.position({
				x: Math.round(grp.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(grp.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
		});
	});

	layer.find('.objC').each(function (circle, n) {
		circle.on('dragstart', (e) => {
			shadowC.show();
			shadowC.moveToTop();
			circle.moveToTop();
		});
		circle.on('dragend', (e) => {
			circle.position({
				x: Math.round(circle.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(circle.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
			shadowC.hide();
		});
		circle.on('dragmove', (e) => {
			shadowC.position({
				x: Math.round(circle.x() / blockSnapSize) * blockSnapSize,
				y: Math.round(circle.y() / blockSnapSize) * blockSnapSize
			});
			stage.batchDraw();
		});
	});

	layer.find('.objArr').each(function (arrow, n) {
		shadowArr.points(arrow.points());
			arrow.on('dragstart', (e) => {
				shadowArr.show();
				shadowArr.moveToTop();
				arrow.moveToTop();
			});
			arrow.on('dragend', (e) => {
				arrow.position({
					x: Math.round(arrow.x() / blockSnapSize) * blockSnapSize,
					y: Math.round(arrow.y() / blockSnapSize) * blockSnapSize
				});
				stage.batchDraw();
				shadowArr.hide();
			});
			arrow.on('dragmove', (e) => {
				shadowArr.position({
					x: Math.round(arrow.x() / blockSnapSize) * blockSnapSize,
					y: Math.round(arrow.y() / blockSnapSize) * blockSnapSize
				});
				stage.batchDraw();
			});
		});
}

function addstageheight() {
	StageHeight = StageHeight + ShapeHeight * 2;
	stage.height(StageHeight);
	gridLayer.getChildren().each(function(node){if (node.getClassName==='Line'){
		node.destroy();
	}});
	stageinit(layer, stage, gridLayer);
}
/*
function dragfunc(pos) {
	var thisRect = {x: this.x(), y: this.y(), width: this.width(), height: this.height()};
// copy the boundary rect into a testRect which defines the extent of the dragbounds 
// without accounting for the width and height of dragging rectangle.
// This is changed below depending on rotation.
var testRect={
  left: boundary.x, 
  top: boundary.y, 
  right: boundary.x + boundary.width,
  bottom: boundary.y + boundary.height
};
	testRect.right = testRect.right - thisRect.width;
    testRect.bottom = testRect.bottom - thisRect.height;
	var newX = (pos.x < testRect.left ? testRect.left : pos.x);

// right edge check
newX = (newX > testRect.right ? testRect.right : newX);

// top edge check
var newY = (pos.y < testRect.top ? testRect.top : pos.y);

// bottom edge check
newY = (newY > testRect.bottom ? testRect.bottom : newY);

// return the point we calculated
return {
    x: newX,
    y: newY
  }}*/
stageinit(gridLayer, layer, stage);