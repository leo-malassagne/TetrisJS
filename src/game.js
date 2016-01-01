"use strict"

function Coordinate(x,y){
    this.x = x;
    this.y = y;
    this.add = function(coords){
        this.x += coords.x;
        this.y += coords.y;
        return this;
    };
    this.addX = function(_x){
        this.x += _x;
        return this;
    };
    this.addY = function(_y){
        this.y += _y;
        return this;
    };
    this.multiply = function(facX,facY){
        this.x *= facX;
        this.y *= facY;
        return this;
    };
    this.clone = function(){
        return new Coordinate(this.x,this.y);
    };
    this.invert = function(){
        return new Coordinate(-this.x,-this.y);
    };
};

function RNG(){
    this.seed = 0;
    this.newSeed = function(seed){
        this.seed = seed;
        if ((this.seed%2) == 0) this.seed -= 1;
        this.a = 219;
        this.m = 32749; 
        this.q = Math.ceil(this.m/this.a);
        this.r = this.m%this.a;
    }
    this.draw = function(){
        this.seed = this.a*(this.seed%this.q) - this.r*Math.ceil(this.seed/this.q);
        if(this.seed<0) this.seed+=this.m;
        return Math.ceil(this.seed/(this.m/7))%7;
    } 
};

var Game = {

    speed: 5,

    start: function() {
        Crafty.init(290,352);
        Crafty.background('white');
        Crafty.scene('Loading');
    },
    
    
};
