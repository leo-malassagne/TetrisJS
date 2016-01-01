"use strict"

Crafty.scene('Game', function(speed) {
    Crafty.e('View');
    Crafty.e('Modele');
    Crafty.e('Audio').start(speed);
    Crafty.e('Delay').delay(function(){
        this.C = Crafty
        .e('Core')
        .setSpeed(speed)}
    ,3000);
},
function() {
});

Crafty.scene('SpeedSelect', function(){
    Crafty.e('2D, DOM, Text')
        .attr({ x: 0, y: 352/2 - 24, w: 290 })
        .text('Choose speed:')
        .textFont({size: '20px'});
    Crafty.e('Selector')
        .attr({ x: 0, y: 352/2 - 24, w: 290,  h: 50});
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
    var musics = ['intro','part1','part2','part3','transition1','transition2','transition3','pont'];
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
            onfinish: function(){ Crafty.trigger('musicEnd')}
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