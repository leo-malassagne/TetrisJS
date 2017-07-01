"use strict"

Crafty.scene('Game',
	function(gameSpeed){
		Crafty.e('Counter').attr({x: 150, y: 10}).textAlign('right').value(0);
		Crafty.e('Counter').attr({x: 150, y: 30}).textAlign('right').value(gameSpeed);
		Crafty.s("Game", {
			init: function() {
				this.lineCount = 0;
				this.playlist = [];
				this.track = -1;
				this.deleteCurrent = false;
				this.bind('musicEnd', this.playNext);
				this.bind("Land",function(e){
					var loop, line, blocks, fullLines = 0, gain = 0;
					for (line of e) {
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
					}
				});
				this.bind("EnterFrame",function(e){
					if (e.frame % Math.round(50 / Crafty('Counter').get(1).value()) == 0) {
						Crafty("Piece").get(0).fall();
					}
				});
				/*this.playlist.push('level'+Math.ceil(gameSpeed/5));
				this.playlist.push('transition');
				soundManager.play('intro');*/
				soundManager.play('level1',);
				this.newRandGen();
			},
			playNext: function(){
				soundManager.stop(this.playlist[this.track]);
				if(this.track>=0&&(this.deleteCurrent||this.playlist[this.track].match(/transition/)!=null)){
					console.log('delete track',this.deleteCurrent,this.playlist[this.track].match(/transition/)!=null);
					this.removeTrack(this.track);
					this.deleteCurrent = false;
					console.log(this.playlist, this.playlist[this.track]);
				}
				else this.track = (this.track+1)%this.playlist.length;
				soundManager.play(this.playlist[this.track]);
			},
			collapse: function() {
				var base, line, numLine;
				base = 360;
				do {
					base -= 16;
					line = Crafty.raycast({_x: 8, _y: base}, {x: 1, y: 0}, 144, "Fixed");
				} while ((line.length > 0) && (base > 0));
				console.log(base);
				if (base < 0) {
					Crafty.scene("Lose");
				}
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
					j = Math.floor(Math.random() * i);
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
				if (this.randGen[7] == piece) {
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
		Crafty.s('Game').destroy();
	}
);

Crafty.scene('SpeedSelect', function(){
	var count = Crafty.e("Counter").value(5);
	var selector = Crafty.e('2D, Canvas, Text, Inputs,');
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
		.createButton("left", "arrow", -45, 0, function() {
			this.counter.add(-1);
		}.bind(selector))
		.createButton("right", "arrow", 45, 0, function() {
			this.counter.add(1);
		}.bind(selector))
		.attr({
			counter: count,
		})
		.attach(count)
		.attr({
			x: 80,
			y: 176
		});
});

Crafty.scene('Lose', function() {
    Crafty.e('2D, DOM, Text')
    .attr({ x: 0, y: 290/2 - 24, w: 352 })
    .text('Perdu!')
    .textFont({size: '20px'})
 
    // Give'em a round of applause!
    Crafty.audio.play('applause');
 
    // After a short delay, watch for the player to press a key, then restart
    // the game when a key is pressed
    var delay = true;
    setTimeout(function() { delay = false; }, 5000);
    this.restart_game = function() {
        if (!delay) {
            Crafty.scene('Game');
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
    Crafty.e('2D, DOM, Text')
    .attr({ x: 90, y: 290/2 - 24, w: 130 })
    .text('Loading\nPlease wait...')
    .textFont({size: '20px'})
	.textAlign('center')
    Crafty.paths({images: "assets/graphics/", sprites: "assets/graphics/"});
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
    var musics = ['intro','part1','part2','part3','transition1','transition2','transition3','pont','level1','transition'];
    var sounds = ['fall','roll','slide','touch_down','line_clear1','line_clear2','line_clear3','line_clear4'];
    var tab = [];
    var cnt = 0;
    for(var i=0; i<musics.length; i++){
        var music = musics[i];
        tab.push(music);
        soundManager.createSound({
            id: music,
            url: 'assets/audio/music/'+music+'.ogg',
            onload: function(){ loadNext();},
            onfinish: function(){soundManager.play(this.id);}
        });
    };
    for(var i=0; i<sounds.length; i++){
        var sound = sounds[i];
        tab.push(sound);
        soundManager.createSound({
            id: sound,
            url: 'assets/audio/sounds/'+sound+'.ogg',
            onload: function(){ loadNext();},
            onfinish: function(){ soundManager.stop(this.id)}
        });
    };
    var loadNext = function(){
        if(cnt === tab.length) Crafty.load(graphics,
            function(){
                Crafty.scene('SpeedSelect');
            }
        );
        else{
            soundManager.load(tab[cnt]);
            cnt++;
        }
    }
    loadNext();
});