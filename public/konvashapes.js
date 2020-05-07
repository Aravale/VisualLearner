function makeGroup(placeX, placeY, GrpName,GrpWidth) {
	var NewGroup = new Konva.Group({
		x: (GrpName == "ConnectorGrp" || GrpName == "DecisionGrp") ? placeX + (blockSnapSize * 3) : placeX,
		y: (GrpName == "ConnectorGrp") ? placeY + blockSnapSize : placeY,
		draggable: true,
		name: GrpName
	});

	if (GrpName == "ConnectorGrp") { var shape = new Konva.Circle(ShapeStyle) }
	else if (GrpName == "DecisionGrp") { var shape = new Konva.Shape(ShapeStyle) }
	else { var shape = new Konva.Rect(ShapeStyle); }


	NewGroup.on('mouseover', () => {
		document.body.style.cursor = 'pointer';
		NewGroup.getChildren()[0].strokeWidth(1);
		layer.batchDraw();
	});
	NewGroup.on('mouseout', () => {
		document.body.style.cursor = 'default';
		NewGroup.getChildren()[0].strokeWidth(0.5);
		layer.draw();
	});
	NewGroup.on('dragmove', () => {
		NewGroup.position({
			x: snap(NewGroup.x()),
			y: snap(NewGroup.y())
		});
		layer.batchDraw();
	});
	NewGroup.on('dragend', setshapepos);
	NewGroup.add(shape);
	if (GrpName != "ConnectorGrp") {
		GrpWidth?shape.width(GrpWidth):shape.width(ShapeWidth);
		shape.height(ShapeHeight);
		var txt = new Konva.Text(ShapeText);
		GrpWidth?txt.width(GrpWidth):txt.width(ShapeWidth);
		txt.height(ShapeHeight);
		NewGroup.add(txt);
		NewGroup.on('dblclick', makeTextInput);
	}
	return NewGroup;
}

function newProcess(placeX, placeY, txty, anchors,shapeW) {
	var grp = makeGroup(placeX, placeY, "ProcessGrp",shapeW);
	var shape = grp.getChildren()[0];
	var txt = grp.getChildren()[1];
	txty ? txt.text(txty) : txt.text('int a');
	newAnchor(shape.width() / 2, 0, grp);//top
	newAnchor(0, ShapeHeight / 2, grp);//left
	newAnchor(shape.width() / 2, ShapeHeight, grp);//bot
	newAnchor(shape.width(), ShapeHeight / 2, grp);//right
	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}

	layer.add(grp);
	layer.draw();
}

function newTerminal(placeX, placeY, txty, anchors) {
	var grp = makeGroup(placeX, placeY, "TerminalGrp");
	var shape = grp.getChildren()[0];
	var txt = grp.getChildren()[1];
	txt.text(txty ? txty : 'Start/Stop');
	shape.cornerRadius(20);

	newAnchor(ShapeWidth / 2, 0, grp);//top
	newAnchor(0, ShapeHeight / 2, grp);//left
	newAnchor(ShapeWidth / 2, ShapeHeight, grp);//bot
	newAnchor(ShapeWidth, ShapeHeight / 2, grp);//right

	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}
	layer.add(grp);
	layer.draw();



}

function newConnector(placeX, placeY, anchors) {
	var grp = makeGroup(placeX, placeY, "ConnectorGrp");
	var shape = grp.getChildren()[0];
	shape.radius(blockSnapSize / 2);

	newAnchor(0, 0, grp);

	if (anchors != null) {
		grp.getChildren()[1].name(anchors[index - 2][0]);
		grp.getChildren()[1].id(anchors[index - 2][1]);
	}

	layer.add(grp);
	layer.draw();
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
	if (grp.name() == "ConnectorGrp") {
		anchor.name("ConAnc");
	}
	//Drag arrow with shape anchor
	grp.on('dragmove', (e) => {
		var nmarr = anchor.name().split(' ');
		if (nmarr[0] == "arrstart") {
			var arrow = layer.findOne("#" + nmarr[1]);
			arrow.points([grp.x() + anchor.x(), grp.y() + anchor.y(), arrow.points()[2], arrow.points()[3]]);
			arrow.moveToTop();
			layer.batchDraw();
		}
		else if (nmarr[0] == "arrend") {
			var arrow = layer.findOne("#" + nmarr[1]);
			arrow.points([arrow.points()[0], arrow.points()[1], grp.x() + anchor.x(), grp.y() + anchor.y()]);
			arrow.moveToTop();
			layer.batchDraw();
		}
		else if (nmarr[0] == "ConAnc") {
			nmarr.forEach((ArrPoint, index) => {
				if (ArrPoint.substring(0, 5) == "Arrow") {
					if (nmarr[index - 1] == "Astart") {
						var arrow = layer.findOne("#" + ArrPoint);
						arrow.points([snap(grp.x()), snap(grp.y()), arrow.points()[2], arrow.points()[3]]);
						arrow.moveToTop();
						layer.batchDraw();
					}
					else {
						var arrow = layer.findOne("#" + ArrPoint);
						arrow.points([arrow.points()[0], arrow.points()[1], snap(grp.x()), snap(grp.y())]);
						arrow.moveToTop();
						layer.batchDraw();
					}
				}
			})
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

		//If anchor already has arrow on it prevent another
		if (anchor.name().includes("arrstart") || anchor.name().includes("arrend")) {
			AncInUse(anchor);
			return;
		}

		startarrow = true;
		pos.x = anchor.x() + grp.x();
		pos.y = anchor.y() + grp.y();

		if (startarrow && drawingarrow) {
			drawingarrow = false;
			startarrow = false;
			document.body.style.cursor = 'default';
			var node = layer.getChildren().toArray().length - 1;
			var arrow = layer.getChildren()[node];
			(anchor.name().includes("ConAnc")) ? anchor.addName("Aend") : anchor.name("arrend");
			anchor.addName("Arrow" + arrow._id);
			arrow.addName("anc" + anchor._id);
			arrow.points([arrow.points()[0], arrow.points()[1], pos.x, pos.y]);
			layer.draw();
			arrow.hitStrokeWidth(4);
		}

		if (startarrow && !drawingarrow) {
			if (anchor.name().includes("Astart")) {
				AncInUse(anchor);
				return;
			}
			(anchor.name().includes("ConAnc")) ? anchor.addName("Astart") : anchor.name("arrstart");
			document.body.style.cursor = 'crosshair';
			var arrow = new Konva.Arrow({
				points: [snap(pos.x), snap(pos.y), snap(pos.x), snap(pos.y)],
				pointerLength: 10,
				pointerWidth: 15,
				fill: 'black',
				stroke: 'black',
				strokeWidth: 2,
				name: 'objArr',
				hitStrokeWidth: 0,
			});
			arrow.id("Arrow" + arrow._id);
			arrow.name("anc" + anchor._id);
			layer.add(arrow);
			anchor.addName("Arrow" + arrow._id);
			arrow.points([pos.x, pos.y, pos.x, pos.y]);
			layer.draw();
			drawingarrow = true;
		}
	});
	layer.draw();
}

function newDecision(placeX, placeY, txty, anchors,shapeW) {
	var grp = makeGroup(placeX, placeY, "DecisionGrp",shapeW);
	var shape = grp.getChildren()[0];
	var txt = grp.getChildren()[1];
	txt.fontSize(20);
	txty ? txt.text(txty) : txt.text('if()');

	shape.sceneFunc(function (context, shape) {
		context.beginPath();
		//context.lineTo(0, 0);
		context.lineTo(shape.width() / 2, shape.height() / 2);
		context.lineTo(0, shape.height());
		context.lineTo(-shape.width() / 2, shape.height() / 2);
		context.lineTo(0, 0);
		context.closePath();

		// (!) Konva specific method, it is very important
		context.fillStrokeShape(shape);
	});
	txt.x(-shape.width() / 2);

	newAnchor(0, 0, grp);//top
	newAnchor(-(shape.width() / 2), shape.height() / 2, grp);//left
	newAnchor(0, shape.height(), grp);//bot
	newAnchor(shape.width() / 2, shape.height() / 2, grp);//right

	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}
	layer.add(grp);
	layer.draw();



}

function newIO(placeX, placeY, txty, anchors,shapeW) {
	var grp = makeGroup(placeX, placeY, "IOGrp",shapeW);
	var shape = grp.getChildren()[0];
	var txt = grp.getChildren()[1];
	shape.skewX(-0.5);
	txty ? txt.text(txty) : txt.text('Input X');
	txt.x(-blockSnapSize / 2);

	newAnchor(shape.width() / 2, 0, grp);//top
	newAnchor(0 - (blockSnapSize / 2), ShapeHeight / 2, grp);//left
	newAnchor(shape.width() / 2, ShapeHeight, grp);//bot
	newAnchor(shape.width() - (blockSnapSize / 2), ShapeHeight / 2, grp);//right

	if (anchors != null) {
		grp.getChildren().forEach((subnode, index) => { if (index > 1) { subnode.name(anchors[index - 2][0]); subnode.id(anchors[index - 2][1]); } });
	}
	layer.add(grp);
	layer.draw();


}


newTerminal(placeX, placeY, "Start"); setshapepos();
newProcess(placeX, placeY); setshapepos();
newIO(placeX, placeY); setshapepos();
newDecision(placeX, placeY); setshapepos();
newConnector(placeX, placeY); setshapepos();
newTerminal(placeX, placeY);
