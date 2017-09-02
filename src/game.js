"use strict"

var Game = {
    start: function(blockSize) {
        Crafty.init(blockSize * 20, blockSize * 22);
        Crafty.background('white');
        Crafty.scene('Loading');
    },
};
