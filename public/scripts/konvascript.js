var StageWidth = $('#flowchartdiv').width();
var StageHeight = $('#flowchartdiv').height();
const blockSize = 40;
const rowSize = blockSize * 3;
var startarrow = false;
var drawingarrow = false;
var currentShape;
const ShapeWidth = blockSize * 6;
const ShapeHeight = blockSize * 2;
var ShapeStyle = {
	fill: '#DCDCDC',
	stroke: 'black',
	strokeWidth: 0.5,
	shadowColor: 'black',
	shadowBlur: 15,
	shadowOffset: { x: 5, y: 5 },
	shadowOpacity: 0.4,
	opacity: 0.98
}
var ShapeText = {
	width: ShapeWidth,
	fontSize: 30,
	fontFamily: 'Calibri',
	fill: 'black',
	align: 'center',
	verticalAlign: "middle",
	padding: 5
}
var arrP = 0;
var VShapesArray = [];
var vf = 0;
subid = null;
topid = null;
$(document).ready(function () {
	stage = new Konva.Stage({
		container: 'flowchartdiv',
		width: StageWidth,
		height: StageHeight
	});

	gridLayer = new Konva.Layer();
	layer = new Konva.Layer();
	stageinit(gridLayer, layer);
	$('.t1').click();
	$('.t2').click();
	$('.t3').click();
	$('.t4').click();
	$('.t5').click();
	$('.t2').click();
});
var placeX = (((StageWidth / 2) - (ShapeWidth / 2)) * blockSize) / blockSize;
var placeY = blockSize;

function makeTextInput() {
	var grp = this;
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
		y: stageBox.top + textPosition.y + $("body,html").scrollTop()
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

	function setTextNodeWidth(nW) {
		if (grp.name() != "ConnectorGrp") {
			grp.width(nW);
			shapenode.width(nW);
			textnode.width(nW);
			//repositioning anchors
			grp.getChildren()[2].x(grp.width() / 2);
			grp.getChildren()[4].x(grp.width() / 2);
			(grp.name() == "IOGrp") ? grp.getChildren()[5].x(grp.width() - (blockSize / 2)) : grp.getChildren()[5].x(grp.width());
		}
	}
	textarea.addEventListener('keydown', function (e) {
		if (e.keyCode === 13 && !e.shiftKey) {
			textnode.text(textarea.value);
			removeTextarea();
		}
		// on esc do not set value back to node
		else if (e.keyCode === 27) {
			removeTextarea();
		}
		else {
			var txtlen = textarea.value.length;
			var blockadder;
			if (txtlen > 15) {
				blockadder = Math.min(parseInt((txtlen - 14) / 3) * 30, 90);
				setTextareaWidth(ShapeWidth + blockadder);
				setTextNodeWidth(ShapeWidth + blockadder);
				layer.draw();
			}
			if (txtlen > 40) {
				shapenode.stroke("#DC143C");
				shapenode.strokeWidth(2);
				layer.draw();
			}
			if (txtlen < 40) {
				shapenode.stroke("black");
				shapenode.strokeWidth(0.5);
				layer.draw();
			}
		}

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

	textarea.focus();

}

function clBoard() {
	Swal.fire({
		title: 'Are you sure?',
		text: "All shapes on board will be cleared!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Clear!'
	}).then((result) => {
		if (result.value) {
			placeY = blockSize;
			layer.destroyChildren();
			layer.draw();
		}
	});
}

function saveBoard(formdata) {

	var Shapes = [];
	var codearr = [];
	var psuedoarr = [];
	//Saving Stage
	layer.getChildren().forEach(function (node) {

		if (node.getClassName() === "Group") {
			var anchorsArr = [];
			if (node.name() == "ConnectorGrp") {
				anchorsArr.push([node.getChildren()[1].name(), node.getChildren()[1].id()]);
				var shape = {
					SName: node.name(),
					x: node.x(),
					y: node.y(),
					anchors: anchorsArr
				}
			}
			else {
				node.getChildren().forEach((subnode, index) => { if (index > 1 && index < 6) { anchorsArr.push([subnode.name(), subnode.id()]) } });
				var shape = {
					SName: node.name(),
					x: node.x(),
					y: node.y(),
					shapeText: node.getChildren()[1].text(),
					shapeW: node.width(),
					anchors: anchorsArr
				}
			}

			Shapes.push(shape);
		}
		else if (node.getClassName() === "Arrow") {
			var shape = {
				AName: [node.name(), node.id()],
				stroke: node.stroke(),
				points: node.points()
			}
			Shapes.push(shape);
		}
	});
	var description = $("#Description").text();
	//Saving code column
	$(".codetexty").map(function () {
		codearr.push($(this).text());
	});

	//Saving psuedocode column
	$(".psuedotexty").map(function () {
		psuedoarr.push($(this).text());
	});

	var fc = {
		shapes: Shapes,
		StageH: StageHeight
	}
	//Save
	if (formdata[2]) {
		var topicid = formdata[0];
		var NewSubtopicName = formdata[2];
		return ({ fc, codearr, psuedoarr, topicid, NewSubtopicName, description });
	}
	else {
		//Update
		let UpTopNm = formdata[0];
		let UpSubNm = formdata[1];
		return ({ fc, codearr, psuedoarr, UpTopNm, UpSubNm, description });
	}
}

function loadBoard(data) {
	layer.destroyChildren();
	$('#codeUL').empty();
	$('#psuedoUL').empty();
	data.subtop.code.forEach(coderow => {
		$('#codeUL').append(addtexty("codetexty", coderow));
	});
	data.subtop.psuedocode.forEach(pcoderow => {
		$('#psuedoUL').append(addtexty("psuedotexty", pcoderow));
	});
	var title = data.topictitle + " > " + data.subtop.name;
	$("#subTopicName").text(title);
	$("#Description").text(data.subtop.description);
	StageHeight = data.subtop.flowchart.StageH;
	drawStage();
	setrowsIndex();
	data.subtop.flowchart.shapes.forEach(node => {
		if (node.AName.length == 0) {
			switch (node.SName) {
				case "ProcessGrp":
					newProcess(node.x, node.y, node.shapeText, node.anchors, node.shapeW);
					break;
				case "TerminalGrp":
					newTerminal(node.x, node.y, node.shapeText, node.anchors);
					break;
				case "DecisionGrp":
					newDecision(node.x, node.y, node.shapeText, node.anchors, node.shapeW);
					break;
				case "IOGrp":
					newIO(node.x, node.y, node.shapeText, node.anchors, node.shapeW);
					break;
				case "ConnectorGrp":
					newConnector(node.x, node.y, node.anchors);
					break;
				default:
					break;
			}
		}
		else {
			var arrow = new Konva.Arrow({
				points: node.points,
				pointerLength: 10,
				pointerWidth: 10,
				fill: node.stroke,
				stroke: node.stroke,
				strokeWidth: 4,
				name: node.AName[0],
				id: node.AName[1],
				hitStrokeWidth: 4,
			});
			layer.add(arrow);
		}
	});
}

function deletesub(item) {
	let delsubid = $(item).parent().attr('id');
	let deltopid = $(item).parent().parent().parent().attr('id');
	deleteSubtopic(delsubid, deltopid, item);
}

function snap(num) {
	return (Math.round(num / blockSize) * blockSize);
}

function stageinit(gridLayer, layer) {
	stage.add(gridLayer);
	stage.add(layer);
	drawStage();
	setrowsIndex();
	stage.on('contentMousemove', function () {
		if (drawingarrow) {
			var node = layer.getChildren().toArray().length - 1;
			var arrow = layer.getChildren()[node];
			pos = stage.getPointerPosition();
			arrow.points([arrow.points()[0], arrow.points()[1], pos.x, pos.y]);
			layer.batchDraw();
		}
	});

	var menuNode = document.getElementById('menu');
	$('#delete-button').on('click', () => {
		if (currentShape.getClassName() == "Arrow") {
			deleteNode(currentShape);
		}
		else {
			deleteNode(currentShape.getParent());
		}
	});

	$('#mvfrnt-button').on('click', () => {

		if (currentShape.getClassName() === 'Arrow') { currentShape.moveToTop(); }
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
	$('#trArr-button').on('click', () => {
		if (currentShape.getClassName() === 'Arrow') { currentShape.stroke("#00CC00"); currentShape.fill("#00CC00"); }
		layer.draw();
	});
	$('#flArr-button').on('click', () => {
		if (currentShape.getClassName() === 'Arrow') { currentShape.stroke("#FF0000"); currentShape.fill("#FF0000"); }
		layer.draw();
	});

	window.addEventListener('click', () => {
		// hide menu 
		menuNode.style.display = 'none';
	})

	stage.on('contextmenu', function (e) {
		// prevent default behavior
		e.evt.preventDefault();
		if (e.target === stage || e.target.getParent() == gridLayer) {
			if (startarrow && drawingarrow) {
				startarrow = false;
				drawingarrow = false;
				document.body.style.cursor = 'default';
				var node = layer.getChildren().toArray().length - 1;
				var arrow = layer.getChildren()[node];
				var anc = layer.findOne("#" + arrow.name());
				anc.name("anc")
				arrow.destroy();
				layer.draw();
			}
			return;
		}
	});
	layer.on('contextmenu', function (e) {
		e.evt.preventDefault();
		currentShape = e.target;
		// show menu
		if (e.target.getClassName() != "Arrow") {
			$("#trArr-button").hide();
			$("#flArr-button").hide();
		} else {
			$("#trArr-button").show();
			$("#flArr-button").show();
		}
		menuNode.style.display = 'initial';
		var containerRect = stage.container().getBoundingClientRect();

		menuNode.style.top = containerRect.top + stage.getPointerPosition().y + 4+ $("body,html").scrollTop() + 'px';
		menuNode.style.left = containerRect.left + stage.getPointerPosition().x + 4 + 'px';
	});
	$("#viewmode").click(() => {
		//View ON
		if (vf == 0) {
			viewOn();
		}
		//View OFF
		else {
			viewOff()
		}


	});

	$("#nxt").click(() => {
		if (arrP < VShapesArray.length - 1) {
			VShapesArray[arrP].getChildren()[0].fill("#DCDCDC");
			var textpointer = ((VShapesArray[arrP].y() + blockSize * 2) / rowSize) - 1;
			$(".codetexty:eq(" + textpointer + ")").css("background", "#DCDCDC");
			$(".psuedotexty:eq(" + textpointer + ")").css("background", "#DCDCDC");
			arrP++;
			VShapesArray[arrP].getChildren()[0].fill("#1496BB");
			textpointer = ((VShapesArray[arrP].y() + blockSize * 2) / rowSize) - 1;
			$(".codetexty:eq(" + textpointer + ")").css("background", "#1496BB");
			$(".psuedotexty:eq(" + textpointer + ")").css("background", "#1496BB");
			$('body,html').animate({ scrollTop: textpointer * rowSize }, 300);
			layer.draw();
		}
	});

	$("#prv").click(() => {
		if (arrP > 0) {
			textpointer = ((VShapesArray[arrP].y() + blockSize * 2) / rowSize) - 1;
			VShapesArray[arrP].getChildren()[0].fill("#DCDCDC");
			$(".codetexty:eq(" + textpointer + ")").css("background", "#DCDCDC");
			$(".psuedotexty:eq(" + textpointer + ")").css("background", "#DCDCDC");
			arrP--;
			VShapesArray[arrP].getChildren()[0].fill("#1496BB");
			textpointer = ((VShapesArray[arrP].y() + blockSize * 2) / rowSize) - 1;
			$(".codetexty:eq(" + textpointer + ")").css("background", "#1496BB");
			$(".psuedotexty:eq(" + textpointer + ")").css("background", "#1496BB");
			$('body,html').animate({ scrollTop: textpointer * rowSize }, 300);
			layer.draw();
		}
	});

	$('#saveBrd').click(function () {
		saveBoard();
	});
	$('.Terminal').click(function () {
		newTerminal(placeX, placeY); nextNodeY();
	});
	$('.Process').click(function () {
		newProcess(placeX, placeY); nextNodeY();
	});
	$('.IO').click(function () {
		newIO(placeX, placeY); nextNodeY();
	});
	$('.Decision').click(function () {
		newDecision(placeX + rowSize, placeY); nextNodeY();
	});
	$('.Connector').click(function () {
		newConnector(placeX + rowSize, placeY + (blockSize)); nextNodeY();
	});
}
function viewOff() {
	vf = 0;
	$("#viewmode").html("View Mode");
	if(VShapesArray.length!=0)
	{VShapesArray[arrP].getChildren()[0].fill("#DCDCDC");
	var textpointer = ((VShapesArray[arrP].y() + blockSize * 2) / rowSize) - 1;
	$(".codetexty:eq(" + textpointer + ")").css("background", "#DCDCDC");
	$(".psuedotexty:eq(" + textpointer + ")").css("background", "#DCDCDC");}
	$(".rowboxdel").show();
	layer.draw();
	VShapesArray.length = 0;
	$("#nxt").addClass("d-none");
	$("#prv").addClass("d-none");
	$("#fcToolbox").show();
	$("#clearFC").show();
	$("#addrowdiv").show();
	$("#topicToggler").show();
	arrP = 0;
}

function viewOn() {
	//View ON
	vf = 1;
	$("#viewmode").html("Edit Mode");
	$("#nxt").removeClass("d-none");
	$("#prv").removeClass("d-none");
	$(".rowboxdel").hide();
	$("#fcToolbox").hide();
	$("#clearFC").hide();
	$("#addrowdiv").hide();
	$("#topicToggler").hide();
	arrP = 0;
	var startnode = null;
	let startcount = 0;
	layer.getChildren().forEach((node) => {
		if (node.name() == "TerminalGrp") {
			var txt = node.getChildren()[1];
			if (txt.text() == "Start" || txt.text() == "start") {
				if (startcount == 1) {
					Swal.fire({
						title: 'Please have only one Start terminal!',
						icon: 'error',
						showConfirmButton: false,
						timer: 1000
					});
					viewOff();
					return
				}
				startcount++;
				VShapesArray.push(node);
				startnode = node;
			}
		}
	});

	if (startnode == null) {
		Swal.fire({
			title: 'No Start terminal found!',
			icon: 'error',
			showConfirmButton: false,
			timer: 1000
		});
		viewOff();
		return
	}
	else {
		NextNode(startnode);
	}
	$(".codetexty:eq(" + arrP + ")").css("background", "#1496BB");
	$(".psuedotexty:eq(" + arrP + ")").css("background", "#1496BB");
	VShapesArray[arrP].getChildren()[0].fill("#1496BB");
	layer.draw();

}

function NextNode(node) {
	var looped = 0;
	node.getChildren().forEach((subnode) => {
		var nmarr = subnode.name().split(' ');
		if (subnode.name().includes("loopend")) { return }
		if (subnode.name().includes("arrstart")) {
			var ArrPoint = layer.findOne("#" + nmarr[1]);
			var nmarr2 = ArrPoint.name().split(' ');
			var nextNodeAnc = layer.findOne("#" + nmarr2[1]);
			if (nextNodeAnc.name().includes("ConAnc")) {
				if (nextNodeAnc.name().includes("Astart")) {
					var ConAncNameArr = nextNodeAnc.name().split(' ');
					NextArrowID = ConAncNameArr[ConAncNameArr.indexOf("Astart") + 1];
					ArrPoint = layer.findOne("#" + NextArrowID);
					nmarr2 = ArrPoint.name().split(' ');
					nextNodeAnc = layer.findOne("#" + nmarr2[1]);
				}
			}
			VShapesArray.forEach((node) => {
				if (nextNodeAnc.getParent() == node) {
					subnode.addName("loopend");
				}
			});
			if (looped == 0) {
				VShapesArray.push(nextNodeAnc.getParent());
				NextNode(nextNodeAnc.getParent());
			}
		}
	});
}

function deletestagerow(rowNumber) {
	let stagestart = rowNumber * rowSize;
	let stageend = stagestart + rowSize;
	let deletenode=[];
	layer.getChildren().forEach((node) => {
		if (node.getClassName()!="Arrow" && (node.y() >= stagestart && node.y() < stageend)) {
			deletenode.push(node);
		}
	});
	deletenode.forEach((node) => {
		deleteNode(node);
	});
	layer.getChildren().forEach((node) => {
		if (node.getClassName() != "Arrow") {
			if (node.y() >= stageend) {
				node.move({
					y: -rowSize
				});
			}
		}
	});
	layer.getChildren().forEach((node) => {
		if (node.getClassName() != "Arrow") {
			node.fire('dragmove');
		}
	});
	StageHeight = StageHeight - rowSize;
	drawStage();
	return true
}

function drawStage() {
	stage.height(StageHeight);
	stage.width(StageWidth);
	gridLayer.destroyChildren();
	for (let i = 0; i < StageWidth / blockSize; i++) {
		gridLayer.add(new Konva.Line({
			points: [Math.round(i * blockSize) + 0.5, 0, Math.round(i * blockSize) + 0.5, StageHeight],
			stroke: '#6b6b6b',
			strokeWidth: 1,
		}));
	}

	for (let j = 0; j < StageHeight / blockSize; j++) {
		if (j % 3 == 0) {
			/* gridLayer.add(new Konva.Text({
				x: 0,
				y: blockSize * j,
				text: j == 0 ? "0" : j / 3,
				width: blockSize,
				height: blockSize,
				fontSize: 20,
				fontFamily: 'Calibri',
				fill: 'black',
				align: 'center',
				verticalAlign: "middle",
				padding: 5
			})); */
			gridLayer.add(new Konva.Rect({
				x: 0,
				y: blockSize * j,
				width: StageWidth,
				height: blockSize,
				fill: '#4c555e',
				opacity: 0.5
			}));
		}
		gridLayer.add(new Konva.Line({
			points: [0, j * blockSize, StageWidth, j * blockSize],
			stroke: '#6b6b6b',
			strokeWidth: 0.5,
		}));
	}
	stage.batchDraw();
}

function nextNodeY() {
	let testY = 0;
	if (layer.getChildren().length > 0) {
		let testnode;
		layer.getChildren().forEach((node) => {
			testnode = node;
			testY = Math.max(node.y(), testY);
		});
		if (testnode.name() == "ConnectorGrp") { testY = testY - blockSize; }
	}
	placeY = testY + rowSize;
	if (placeY >= StageHeight) {
		$('#addRow').click();
	}
}

function addtexty(whichcol, text) {
	text = text ? text : "";
	if (whichcol == "codetexty") {
		return `<li class="list-group-item p-0">
						<div class="row-box"></div>
						<div class="invisibile-texty codetexty" contenteditable="true">${text}</div>
					</li>`
	}
	else {
		return `<li class="list-group-item p-0">
		<div class="row-box"></div>
		<div class="invisibile-texty ${whichcol}" contenteditable="true">${text}</div>
		<div class="rowboxdel">
			<button type="button" class="btn btn-sm btn-outline-light btn-dark" onclick="deleteRow(this)">
				<i class="fa fa-trash-alt"></i>
			</button>
		</div>
	</li>`
	}

}

function AncInUse(anchor) {
	anchor.stroke("red");
	layer.draw();
	setTimeout(() => {
		anchor.stroke("black");
		layer.draw();
	}, 1000);
}

function deleteNode(node) {
	if (node.getClassName() === 'Arrow') {
		var nmarr = node.name().split(' ');
		var anc1 = layer.findOne("#" + nmarr[0]);
		var anc2 = layer.findOne("#" + nmarr[1]);
		if (anc1.getParent().name() == "ConnectorGrp") {
			let AncNameArr = anc1.name().split(' ');
			AncNameArr.splice(0, 1);
			if (AncNameArr.includes("Astart")) {
				let IndexDel = AncNameArr.indexOf("Astart");
				AncNameArr.splice(IndexDel, 2);
				anc1.name("ConAnc");
				AncNameArr.forEach(
					(nm) => {
						anc1.addName(nm);
					});
			}
		}
		else {
			anc1.name("anc");
		}

		if (anc2.getParent().name() == "ConnectorGrp") {
			let AncNameArr = anc2.name().split(' ');
			AncNameArr.splice(0, 1);
			if (AncNameArr.includes("Aend")) {
				let IndexDel = AncNameArr.indexOf(node.name());
				AncNameArr.splice(IndexDel, 1);
				if (AncNameArr.length == 1) {
					let IndexDel2 = AncNameArr.indexOf("Aend");
					AncNameArr.splice(IndexDel2, 1);
				}
				anc2.name("ConAnc");
				AncNameArr.forEach(
					(nm) => {
						anc2.addName(nm);
					});
			}
		}
		else {
			anc2.name("anc");
		}
		node.destroy();

	}
	else {
		if (node.name() === 'ConnectorGrp') {
			let AncNameArr = node.getChildren()[1].name().split(' ');
			AncNameArr.splice(0, 1);
			if (AncNameArr.includes("Astart")) {
				let Index = AncNameArr.indexOf("Astart");
				let ArrowTo = layer.findOne("#" + AncNameArr[Index + 1]);
				deleteNode(ArrowTo);
				AncNameArr.splice(Index, 2);
			}
			if (AncNameArr.includes("Aend")) {
				let Index = AncNameArr.indexOf("Aend");
				AncNameArr.splice(Index, 1);
				AncNameArr.forEach(
					(PrevArrNm) => {
						let ArrowFrom = layer.findOne("#" + PrevArrNm);
						deleteNode(ArrowFrom);
					});
			}
		}
		else {
			node.getChildren().forEach((subnode, index) => {
				if (index >= 2 && index <= 5) {
					let nmarr = subnode.name().split(' ');
					if (nmarr[0] == "arrend" || nmarr[0] == "arrstart") {
						let Arrow = layer.findOne("#" + nmarr[1]);
						deleteNode(Arrow);
					}
				}
			});
		}
		node.destroy();
	}
	layer.draw();
}




