"use strict"

Crafty.scene('Game',
	function(gameSpeed){
		Crafty.e("2D,Canvas,Text").text("Next").attr({x: (blockSize * 16.5), y: (blockSize * 1) + 5}).textAlign('center').textFont({size: "20px"});
		Crafty.e("2D,Canvas,Text").text("Score").attr({x: (blockSize * 16.5), y: (blockSize * 7) + 5}).textAlign('center').textFont({size: "20px"});
		Crafty.e('Counter').attr({x: (blockSize * 16.5), y: (blockSize * 8) + 5}).textAlign('center').value(0);
		Crafty.e("2D,Canvas,Text").text("Speed").attr({x: (blockSize * 16.5), y: (blockSize * 10) + 5}).textAlign('center').textFont({size: "20px"});
		Crafty.e('Counter').attr({x: (blockSize * 16.5), y: (blockSize * 11) + 5}).textAlign('center').value(gameSpeed).setLimits(1,15);
		Crafty.s("Game", {
			init: function() {
				this.lineCount = 0;
				this.musicChange = false;
				this.bind('musicEnd', this.playNext);
				this.bind("Land",function(e){
					var loop, line, blocks, fullLines = 0, gain = 0;
					for (line of e) {
						if (line < 0) {
							soundManager.stopAll();
							this.destroy();
							Crafty.scene("Lose");
							return 0;
						}
						blocks = Crafty.raycast({_x: (blockSize / 2)  + (blockSize * 2), _y: line}, {x: 1, y: 0}, blockSize * 9, "Fixed");
						if (blocks.length == 10) {
							fullLines++;
							blocks.forEach(function(block) {
								block.obj.destroy();
							});
						}
					}
					this.collapse();
					if (fullLines > 0)  {
						gain = 50;
						for (loop = 2; loop <= fullLines; loop++) {
							gain *= loop;
						}
						gain = gain * Crafty('Counter').get(1).value();
						Crafty("Counter").get(0).add(gain);
						soundManager.play("line_clear" + fullLines);
					}
					if (Crafty('Counter').get(1).value() < 15) {
						this.lineCount += fullLines;
						if (this.lineCount > 10) {
							this.lineCount = (this.lineCount + fullLines) % 10;
							Crafty('Counter').get(1).add(1);
							if ((Crafty('Counter').get(1).value()) % 2 ==0 || (Crafty('Counter').get(1).value() == 15)) {
								this.musicChange = true;
							}
						}
					}
					Crafty("Piece").get(0)
					.break()
					.attr({x: (blockSize * 5) + (blockSize * 2), y: -2 * blockSize})
					.copy(Crafty("Piece").get(1));
					Crafty("Piece").get(1)
					.construct(this.drawPiece())
					.center({x: blockSize * 16.5, y: blockSize * 3.5});
				});
				this.bind("EnterFrame",function(e){
					if (e.frame % Math.round(150 / (Crafty('Counter').get(1).value() + 10)) == 0) {
						Crafty("Piece").get(0).fall();
					}
				});
				console.log("play Tetris" + (Math.floor(Crafty('Counter').get(1).value() / 2)  + 1));
				soundManager.play('Tetris' + (Math.floor(Crafty('Counter').get(1).value() / 2) + Math.floor(Crafty('Counter').get(1).value() / 15) + 1));
				this.newRandGen();
				Crafty("Piece").get(1).construct(this.drawPiece())
				.center({x: blockSize * 16.5, y: blockSize * 3.});
			},
			playNext: function(){
				if (this.musicChange) {
					this.musicChange = false;
					soundManager.play('TetrisTransition');
				}
				else {
					soundManager.play('Tetris' + (Math.floor(Crafty('Counter').get(1).value() / 2) + Math.floor(Crafty('Counter').get(1).value() / 15) + 1));
				}
			},
			collapse: function() {
				var base, line, numLine;
				base = blockSize * 22.5;
				do {
					base -= blockSize;
					line = Crafty.raycast({_x: (blockSize / 2)  + (blockSize * 2), _y: base}, {x: 1, y: 0}, blockSize * 9, "Fixed");
					console.log(line);
				} while ((line.length > 0) && (base > 0));
				console.log(base);
				numLine = blockSize;
				while (base - numLine > 0) {
					line = Crafty.raycast({_x: (blockSize / 2)  + (blockSize * 2), _y: base - numLine}, {x: 1, y: 0}, blockSize * 9, "Fixed");
					console.log(line);
					if (line.length > 0) {
						line.forEach(function(block){
							block.obj.shift(0, numLine, 0, 0);
						});
						base -= blockSize;
						numLine -= blockSize;
					}
					numLine += blockSize;
				}
			},
			newRandGen: function() {
				var j, temp;
				this.randGen = [];
				for (let i = 0; i < 7; i++) {
					this.randGen[i] = i;
				}
				for (let i = 6; i > 0; i--) {
					j = Math.floor(Math.random() * (i + 1));
					temp = this.randGen[i];
					this.randGen[i] = this.randGen[j];
					this.randGen[j] = temp;
				}
			},
			drawPiece: function() {
				var piece = this.randGen.pop(), i, temp;
				if (this.randGen.length == 0) {
					this.newRandGen();
				}
				if (this.randGen[6] == piece) {
					i = Math.floor(Math.random() * 6);
					temp = this.randGen[i];
					this.randGen[i] = this.randGen[6];
					this.randGen[6] = temp;
				}
				return piece;
			}
		},
		{speed: gameSpeed}
		);
		Crafty.e('Piece, Inputs')
		.construct(6)
		.attr({x: (blockSize * 5)  + (blockSize * 2), y: -2 * blockSize})
		.setAction(Crafty.keys.LEFT_ARROW,Crafty("Piece").get(0).slide(-1).bind(Crafty("Piece").get(0)))
		.setAction(Crafty.keys.RIGHT_ARROW,Crafty("Piece").get(0).slide(1).bind(Crafty("Piece").get(0)))
		.setAction(Crafty.keys.UP_ARROW,Crafty("Piece").get(0).roll.bind(Crafty("Piece").get(0)))
		.setAction(Crafty.keys.DOWN_ARROW,Crafty("Piece").get(0).fall.bind(Crafty("Piece").get(0)))
        .setAction(Crafty.keys.SPACE,function(){
			var vol = 25;
			Crafty.pause();
			if (!Crafty.isPaused()) {
				vol *= 4;
			}
			soundManager.setVolume('Tetris' + (Math.floor(Crafty('Counter').get(1).value() / 2) + Math.floor(Crafty('Counter').get(1).value() / 15) + 1), vol);
		});
		Crafty.e('Piece')
		.attr({x: (blockSize * 15), y: blockSize * 2});
		Crafty.s('Game');
		Crafty.e('2D,Collision,Fixed')
		.attr({x: -blockSize  + (blockSize * 2), y: 0, w: blockSize, h: 22 * blockSize});
		Crafty.e('2D,Collision,Fixed')
		.attr({x: (10 * blockSize)  + (blockSize * 2), y: 0, w: blockSize, h: 22 * blockSize});
		Crafty.e('2D,Collision,Fixed')
		.attr({x: blockSize * 2, y: 22 * blockSize, w: 10 * blockSize, h: blockSize});
	},
	function() {
	}
);

Crafty.scene('SpeedSelect', function(){
	Crafty.background("url('" + loc + "assets/graphics/block.png') top left/" + blockSize + "px " + blockSize + "px repeat lightgray");
	Crafty.e('2D,Canvas,Color,Persist')
		.color("white")
		.attr({x: blockSize * 2, y: 0, w: blockSize * 10, h: blockSize * 22});
	Crafty.e('2D,Canvas,Color,Persist')
		.color("white")
		.attr({x: blockSize * 14, y: blockSize, w: blockSize * 5, h: blockSize * 5});
	Crafty.e('2D,Canvas,Color,Persist')
		.color("white")
		.attr({x: blockSize * 14, y: blockSize * 7, w: blockSize * 5, h: blockSize * 2});
	Crafty.e('2D,Canvas,Color,Persist')
		.color("white")
		.attr({x: blockSize * 14, y: blockSize * 10, w: blockSize * 5, h: blockSize * 2});
	var count = Crafty.e("Counter").value(5).setLimits(1,15);
	var label = Crafty.e("2D, Text, Canvas")
		.text("Choose speed")
		.textAlign("center")
		.textFont("size", "20px")
		.attr({y: -25});
	var selector = Crafty.e("2D, Inputs");
	selector.setAction(Crafty.keys.LEFT_ARROW, function(){
			console.log(this);
			this.counter.add(-1);
		}.bind(selector))
		.setAction(Crafty.keys.RIGHT_ARROW, function(){
			this.counter.add(1);
		}.bind(selector))
		.setAction(Crafty.keys.SPACE, function(){
			Crafty.scene('Game', this.counter.value());
		}.bind(selector))
		.setAction(Crafty.keys.ENTER, function(){
			Crafty.scene('Game', this.counter.value());
		}.bind(selector))
		.createButton("left", "arrow", -45, 0, true, false, function() {
			this.counter.add(-1);
		}.bind(selector))
		.createButton("right", "arrow", 45, 0, false, false, function() {
			this.counter.add(1);
		}.bind(selector))
		.attr({
			counter: count,
		})
		.attach(label)
		.attach(count)
		.attr({
			x: blockSize * 7,
			y: blockSize * 11
		});
});

Crafty.scene('Lose', function() {
    Crafty.e('2D, DOM, Text')
    .attr({x: blockSize * 7, y: blockSize * 11})
    .text('Perdu!')
    .textFont({size: '20px'})
	.textAlign('center');

    // After a short delay, watch for the player to press a key, then restart
    // the game when a key is pressed
    var delay = true;
    setTimeout(function() { delay = false; }, 2000);
    this.restart_game = function() {
        if (!delay) {
            Crafty.scene('SpeedSelect');
        }
    };
    Crafty.bind('KeyDown', this.restart_game);
},
function() {
    // Remove our event binding from above so that we don't
    // end up having multiple redundant event watchers after
    // multiple restarts of the game
    this.unbind('KeyDown', this.restart_game);
});

// Loading scene
// -------------
// Handles the loading of binary assets such as images and audio files
Crafty.scene('Loading', function(){
	Crafty.background("url('" + loc + "assets/graphics/block.png') top left/" + blockSize + "px " + blockSize + "px repeat #555555");
    Crafty.e('2D, Canvas, Text')
    .attr({ x: Crafty.viewport.width / 2 , y: (Crafty.viewport.width / 2) - 10})
    .text('Loading')
    .textFont({size: '20px'})
	.textColor("white")
	.textAlign('center');
	Crafty.e('2D, Canvas, Text')
    .attr({ x: Crafty.viewport.width / 2 , y: (Crafty.viewport.width / 2) + 10})
    .text('Please wait...')
    .textFont({size: '20px'})
	.textColor("white")
	.textAlign('center');
    Crafty.paths({images: loc + "assets/graphics/"});
	Crafty.imageWhitelist.push("png");
    var graphics = {
        "sprites" : {
            'arrow.png' : {
                "tile" : 32,
                "tileh" : 32,
                "map" : {"arrow": [0, 0]}
            },
			'block.png' : {
                "tile" : 32,
                "tileh" : 32,
                "map" : { "block": [0, 0]}
            }
        }
    };
    var musics = ['Tetris1','Tetris2','Tetris3','Tetris4','Tetris5','Tetris6','Tetris7','Tetris8','Tetris9','TetrisTransition'];
    var sounds = ['fall','roll','slide','touch_down','line_clear1','line_clear2','line_clear3','line_clear4'];
    var tab = [];
    var cnt = 0;
    for(var i=0; i < musics.length; i++){
        var music = musics[i];
        tab.push(music);
        soundManager.createSound({
            id: music,
            url: loc + 'assets/audio/music/' + music + '.ogg',
            onload: function(){ loadNext();},
            onfinish: function(){Crafty.trigger("musicEnd");}
        });
    };
    for(var i=0; i < sounds.length; i++){
        var sound = sounds[i];
        tab.push(sound);
        soundManager.createSound({
            id: sound,
            url: loc + 'assets/audio/sounds/' + sound + '.ogg',
            onload: function(){ loadNext();},
            onfinish: function(){ soundManager.stop(this.id)}
        });
    };
    var loadNext = function(){
        if(cnt === tab.length){
			Crafty.load(graphics,
            function(){
                Crafty.scene('SpeedSelect');
            });
		}
        else{
            soundManager.load(tab[cnt]);
            cnt++;
        }
    }
    loadNext();
});
