"use strict"

Crafty.scene('Game',
	function(gameSpeed){
		Crafty.e('Counter').attr({x: 150, y: 10}).textAlign('right').value(0);
		Crafty.e('Counter').attr({x: 150, y: 30}).textAlign('right').value(gameSpeed).setLimits(1,15);
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
						blocks = Crafty.raycast({_x: 8, _y: line}, {x: 1, y: 0}, 144, "Fixed");
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
					this.lineCount += fullLines;
					if (this.lineCount > 10) {
						this.lineCount = (this.lineCount + fullLines) % 10;
						Crafty('Counter').get(1).add(1);
						if ((Crafty('Counter').get(1).value()) % 2 ==0 || (Crafty('Counter').get(1).value() == 15)) {
							this.musicChange = true;
						}
					}
					Crafty("Piece").get(0).construct(this.drawPiece());
					Crafty("Piece").get(0).attr({x: 80, y: -32});
				});
				this.bind("EnterFrame",function(e){
					if (e.frame % Math.round(150 / (Crafty('Counter').get(1).value() + 5)) == 0) {
						Crafty("Piece").get(0).fall();
					}
				});
				console.log("play Tetris" + (Math.floor(Crafty('Counter').get(1).value() / 2)  + 1));
				soundManager.play('Tetris' + (Math.floor(Crafty('Counter').get(1).value() / 2) + Math.floor(Crafty('Counter').get(1).value() / 15) + 1));
				this.newRandGen();
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
				base = 360;
				do {
					base -= 16;
					line = Crafty.raycast({_x: 8, _y: base}, {x: 1, y: 0}, 144, "Fixed");
				} while ((line.length > 0) && (base > 0));
				console.log(base);
				numLine = 16;
				while (base - numLine > 0) {
					line = Crafty.raycast({_x: 8, _y: base - numLine}, {x: 1, y: 0}, 144, "Fixed");
					if (line.length > 0) {
						line.forEach(function(block){
							block.obj.shift(0, numLine, 0, 0);
						});
						base -=16;
						numLine -= 16;
					}
					numLine += 16;
				}
			},
			newRandGen: function() {
				console.log(this);
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
		Crafty.s('Game');
		Crafty.e('Piece')
		.construct(6)
		.attr({x: 80, y: -32});
		Crafty.e('2D,Collision,Fixed')
		.attr({x: -16, y: 0, w: 16, h: 352});
		Crafty.e('2D,Collision,Fixed')
		.attr({x: 160, y: 0, w: 16, h: 352});
		Crafty.e('2D,Collision,Fixed')
		.attr({x: 0, y: 352, w: 160, h: 16});
	},
	function() {
	}
);

Crafty.scene('SpeedSelect', function(){
	Crafty.e('2D, DOM').attr({x: 5, y: 5, w: Crafty.viewport.width - 10, h: Crafty.viewport.height - 10}).css({"border": "1px solid", "border-radius": "3px"});
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
			x: 80,
			y: 176
		});
});

Crafty.scene('Lose', function() {
    Crafty.e('2D, DOM, Text')
    .attr({ x: 0, y: 145, w: 160})
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
    Crafty.e('2D, Canvas, Text')
    .attr({ x: 80, y: 145, w: 80})
    .text('Loading\nPlease wait...')
    .textFont({size: '20px'})
	.textAlign('center')
    Crafty.paths({images: location + "assets/graphics/", sprites: location + "assets/graphics/"});
	Crafty.imageWhitelist.push("png");
    var graphics = {
        "sprites" : {
            'sprites.png' : {
                "tile" : 16,
                "tileh" : 16,
                "map" : { "red": [0,0], "blue": [1, 0], "brown": [2,0], "magenta": [3,0],
                         "white": [0, 1], "cyan": [1, 1], "green": [2,1], "arrow": [3,1]} 
            }
        },
        "images": ['frame.png']
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
            url: location + 'assets/audio/music/' + music + '.ogg',
            onload: function(){ loadNext();},
            onfinish: function(){Crafty.trigger("musicEnd");}
        });
    };
    for(var i=0; i < sounds.length; i++){
        var sound = sounds[i];
        tab.push(sound);
        soundManager.createSound({
            id: sound,
            url: location + 'assets/audio/sounds/' + sound + '.ogg',
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