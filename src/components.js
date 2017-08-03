"use strict"

Crafty.c('Piece', {
    init: function(){
		this.requires("2D,Inputs");
		this.setAction(Crafty.keys.LEFT_ARROW,this.slide(-1).bind(this));
		this.setAction(Crafty.keys.RIGHT_ARROW,this.slide(1).bind(this));
		this.setAction(Crafty.keys.UP_ARROW,this.roll.bind(this));
		this.setAction(Crafty.keys.DOWN_ARROW,this.fall.bind(this));
		this.models = [
			{
				width: 4,
				height: 2,
				blocks: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}],
				colour: "red"
			},
			{
				width: 2,
				height: 2,
				blocks: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
				colour: "blue"
			},
			{
				width: 3, 
				height: 3,
				blocks: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}],
				colour: "brown"
			},
			{
				width: 3, 
				height: 3,
				blocks: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 0, y: 2}],
				colour: "magenta"
			},
			{
				width: 3, 
				height: 3,
				blocks: [{x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 2, y: 2}],
				colour: "white"
			},
			{
				width: 3, 
				height: 3,
				blocks: [{x: 1, y: 0}, {x: 2, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}],
				colour: "cyan"
			},
			{
				width: 3, 
				height: 3,
				blocks: [{x: 0, y: 0}, {x: 1, y: 0}, {x: 1, y: 1}, {x: 2, y: 1}],
				colour: "green"
			}
		]
    },
	construct: function(num_model) {
		var block, model;
		model = this.models[num_model];
		this.wheel = Crafty.e("2D")
						.attr({
							x: this._x,
							y: this._y,
							w: model.width * 16,
							h: model.height * 16
						})
						.origin("middle");
		this.rollHitbox = Crafty.e("2D")
						.attr({
							x: this._x,
							y: this._y,
							w: model.width * 16,
							h: model.height * 16
						})
						.origin("middle");
		this.attach(this.wheel);
		this.attach(this.rollHitbox);
		for (block of model.blocks) {
			this.wheel.attach(Crafty.e("2D,Canvas," + model.colour).attr({x: this._x + (block.x * 16), y: this._y + (block.y * 16)}));
			this.rollHitbox.attach(Crafty.e("2D,Collision,Canvas,SolidHitbox").attr({x: this._x + (block.x * 16), y: this._y + (block.y * 16), w: 16, h: 16}));
		}
		this.rollHitbox.rotation += 90;
		return this;
	},
	slide: function(direction){
		return function() {
			var block, canMove = true;
			for (block of this.wheel._children) {
				console.log(block.mbr()._x + 8, block.mbr()._y + 8);
				canMove = canMove && (Crafty.raycast({_x: block.mbr()._x + 8, _y: block.mbr()._y + 8}, {x: direction, y: 0}, 16, "Fixed").length == 0);
			}
			if (canMove) {
				this.shift(16 * direction,0,0,0);
				soundManager.play('slide');
			}
			else {
				console.log('blocked');
			}
		}
	},
	roll: function(){
		var block, canMove = true;
		for (block of this.rollHitbox._children) {
			console.log(block);
			canMove = canMove && !block.hit("Fixed");
		}
		if (canMove) {
			this.wheel.rotation += 90;
			this.rollHitbox.rotation += 90;
			soundManager.play('roll');
		}
		else {
			console.log('blocked');
		}
	},
	fall: function(){
		var block, canMove = true;
		for (block of this.wheel._children) {
			canMove = canMove && (Crafty.raycast({_x: block.mbr()._x + 8, _y: block.mbr()._y + 8}, {x: 0, y: 1}, 16, "Fixed").length == 0);
		}
		if (canMove) {
			this.shift(0,16,0,0);
		}
		else {
			var modifiedLines = [];
			console.log('blocked');
			this.detach(this.wheel);
			this.detach(this.rollHitbox);
			this.rollHitbox.destroy();
			for (block of this.wheel._children) {
				block.addComponent('Fixed,Collision');
			if (!modifiedLines.includes(block.mbr()._y + 8))
				modifiedLines.push(block.mbr()._y + 8);
			}
			Crafty.trigger("Land",modifiedLines);
		}
	},
});

Crafty.c("Inputs", {
	init: function() {
		this.requires("2D, Keyboard"),
		this.attr({
			rate: 10,
			inputs: {},
			actions: {owner: this},
		});
		
	},
	events: {
		"KeyDown": function(e) {
			if (e.key in this.actions) {
				this.actions[e.key]();
			}
			this.registerInput(e.key);
		},
		"KeyUp": function(e) {
			delete this.inputs[e.key]
		},
		"EnterFrame": function(e){
			var input;
			for (input in this.inputs) {
				if(((e.frame - this.inputs[input]) % this.rate == 0) && (e.frame != this.inputs[input])) {
					this.actions[input]();
				}
			}
		}
	},
	setAction: function(key, action) {
		this.actions[key] = action;
		return this;
	},
	createButton: function(name, sprite, posX, posY, flipH, flipV, action) {
		var ent = Crafty.e("2D, Canvas, Mouse, " + sprite)
						.attr({
							label: name
						})
						.bind("MouseDown", function() {
							this._parent.actions[this.label]();
							this._parent.registerInput(this.label);
						})
						.bind("MouseUp", function() {
							delete this._parent.inputs[this.label];
						})
						.bind("MouseOut", function() {
							delete this._parent.inputs[this.label];
						});
		this.setAction(name, action);
		this.attach(ent);
		ent.shift(posX,posY,0,0);
		if (flipH) {
			ent.flip("X");
		}
		if (flipV) {
			ent.flip("Y");
		}
		return this;
	},
	registerInput: function(input) {
		this.inputs[input] = Crafty.frame();
	}
});

Crafty.c("Counter", {
	init: function() {
		this.requires("2D,Canvas,Text");
		this.attr({
			_value: 0,
			_min: undefined,
			_max: undefined
		})
		.textFont({size: '20px'})
		.textAlign('center')
		.text(this._value);
	},
	value: function(number) {
		if (number) {
			if ((!this._min || (number >= this._min)) && (!this._max || (number <= this._max))) {
				this._value = number;
				this.text(this._value);
				return this;
			}
		}
		else {
			return this._value;
		}
	},
	add: function(number) {
		this.value(this.value() + number);
	},
	setLimits: function(min, max) {
		this._min = min;
		this._max = max;
		return this;
	}
});