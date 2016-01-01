"use strict"

Crafty.c('Core', {
    init: function(){
        this.attr({controlsBuffer: new Array(), fullLines: [], speed: 5, score: 0, paused: false});
        this.bind('KeyUp', this.keyboard);
        this.bind('KeyDown', this.keyboard);
        this.bind('EnterFrame', this.update);
        this.bind('fullLine', this.saveLine);
        this.bind('lose',function(){soundManager.stopAll();Crafty.scene('Lose');
                                   });
    },
    setSpeed: function(speed){
        this.speed = speed;
    },
    keyboard: function(e){
        if (e.key==Crafty.keys.LEFT_ARROW
            ||e.key==Crafty.keys.RIGHT_ARROW
            ||e.key==Crafty.keys.UP_ARROW
            ||e.key==Crafty.keys.DOWN_ARROW){
                if(e.type == "keydown") this.controlsBuffer.unshift(e.key);
                else this.controlsBuffer.splice(this.controlsBuffer.indexOf(e.key),1);
        }
        else if(e.key==Crafty.keys.SPACE&&e.type == "keydown"){
            Crafty.pause();
            if(this.paused) soundManager.unmuteAll();
            else{
                soundManager.muteAll();
            }
            this.paused = !this.paused;
        }
    },
    saveLine: function(e){
        this.fullLines.push(e);
    },
    update: function(e){
        var numFrame = e.frame;
        if(numFrame%Math.ceil(100/this.speed) == 0) Crafty.trigger('fall');
        if(numFrame%10==0){
            switch (this.controlsBuffer[0]){
                case Crafty.keys.LEFT_ARROW: Crafty.trigger('slide',-1);break;
                case Crafty.keys.RIGHT_ARROW: Crafty.trigger('slide',1); break;
                case Crafty.keys.DOWN_ARROW: Crafty.trigger('fall'); break;
                case Crafty.keys.UP_ARROW: Crafty.trigger('roll');
            }   
        }
        if(this.fullLines.length>0){
            this.fullLines.sort();
            this.fullLines.reverse();
            this.updateScore();
            Crafty.trigger('eraseLines',this.fullLines);
            this.fullLines = [];
        }
    },
    updateScore: function(){
        var gain = 50;
        for(var i=2; i<=this.fullLines.length; i++){
            gain *= i;
        }
        gain *= this.speed+1;
        this.score += gain;
        Crafty.trigger('displayScore', this.score);
        var ceil = 1;
        for(var i=2; i<=this.speed; i++) ceil += i;
        ceil *= 1000;
        if(this.score >= ceil){
            this.speed++;
            Crafty.trigger('speedUp',this.speed);
        }
    }
});

Crafty.c('Piece', {
    init: function(){
        this.attr({
            cells: [],
            position: undefined,
            witdh: undefined,
            height: undefined,
        });
    },
});


Crafty.c('Modele', {
    init: function(){
        var tab = new Array(24);
        for(var i=0; i<24; i++){
            tab[i] = new Array(10);
            for(var j=0; j<10; j++) tab[i][j] = true;
        }
        this.attr({
            schemas: {
                0 : {
                    w: 4,
                    h: 2,
                    cells: [new Coordinate(0,1), new Coordinate(1,1), new Coordinate(2,1), new Coordinate(3,1)],
                    colour: "red"
                },
                1 : {
                    w: 2,
                    h: 2,
                    cells: [new Coordinate(0,0), new Coordinate(1,0), new Coordinate(0,1), new Coordinate(1,1)],
                    colour: "blue"
                },
                2: {
                    w: 3, 
                    h: 3,
                    cells: [new Coordinate(0,1), new Coordinate(1,1), new Coordinate(2,1), new Coordinate(1,2)],
                    colour: "brown"
                },
                3: {
                    w: 3, 
                    h: 3,
                    cells: [new Coordinate(0,1), new Coordinate(1,1), new Coordinate(2,1), new Coordinate(0,2)],
                    colour: "magenta"
                },
                4: {
                    w: 3, 
                    h: 3,
                    cells: [new Coordinate(0,1), new Coordinate(1,1), new Coordinate(2,1), new Coordinate(2,2)],
                    colour: "white"
                },
                5: {
                    w: 3, 
                    h: 2,
                    cells: [new Coordinate(1,0), new Coordinate(2,0), new Coordinate(0,1), new Coordinate(1,1)],
                    colour: "cyan"
                },
                6: {
                    w: 3, 
                    h: 2,
                    cells: [new Coordinate(0,0), new Coordinate(1,0), new Coordinate(1,1), new Coordinate(2,1)],
                    colour: "green"

                }
            },
            piece: Crafty.e('Piece'),
            random: new RNG(),
            nextPiece: 0,
            grid: {
                data: tab,
                free: function(coords,bool){
                    
                    if(coords.x>=0&&coords.x<this.data[0].length&&coords.y+2>=0&&coords.y+2<this.data.length){
                        if(bool===undefined){
                            return this.data[coords.y+2][coords.x];
                        }
                        else{
                            this.data[coords.y+2][coords.x]=bool;
                        }
                    }
                    else return false;
                },
                testLine: function(numLine, isEmpty){
                    var line = this.data[numLine+2];
                    if(line){
                        var boucle=0;
                        while(boucle<this.data[0].length&&line[boucle]==isEmpty) boucle++;
                        return boucle==this.data[0].length&&line[boucle-1]==isEmpty;
                    }
                    else return line==isEmpty;
                },
                debug: function(){
                    for(var i=0; i<this.data.length; i++){
                        var line = [];
                        if(this.data[i]){
                            for(var j=0; j<this.data[i].length; j++){
                                line.push(this.data[i][j]?' ':'X');
                            }
                        }
                        console.log(line);
                    }
                }
            }
        });
        this.bind('roll',this.roll);
        this.bind('fall',this.fall);
        this.bind('slide',this.slide);
        this.bind('eraseLines',this.eraseLines);
        this.random.newSeed(Math.ceil(Math.random()*1000));
        this.nextPiece = this.random.draw();
        Crafty.trigger('spawn', {schema: this.schemas[this.nextPiece]});
        this.spawn();
    },
    spawn: function(){
        var modified = [];
        for(var i=0; i<this.piece.cells.length; i++){
            var pos = this.piece.position.clone().add(this.piece.cells[i]);
            if(pos.y<0) Crafty.trigger('lose');
            this.grid.free(pos,false);
            if(modified.indexOf(pos.y)<0) modified.push(pos.y);
        }
        for(var i=0; i<modified.length; i++){
            if(this.grid.testLine(modified[i],false)) Crafty.trigger('fullLine',modified[i]);
        }
        this.piece.cells = [];
        var schema = this.schemas[this.nextPiece];
        for(var i=0; i<schema.cells.length; i++) this.piece.cells.push(schema.cells[i]);
        this.piece.width = schema.w;
        this.piece.height = schema.h;
        this.piece.position = new Coordinate(5-Math.floor(this.piece.width/2),-this.piece.height);
        this.nextPiece = this.random.draw();
        Crafty.trigger('spawn', {schema: this.schemas[this.nextPiece], pos: this.piece.position });
    },
    slide: function(dir){
        var boucle = 0;
        var free = true;
        while(boucle<this.piece.cells.length&free){
            free = this.grid.free(this.piece.position.clone().add(this.piece.cells[boucle].clone()).addX(dir));
            boucle++;
        }
        if(free){
            this.piece.position.addX(dir);
            Crafty.trigger('viewSlide',{x: dir*16, y:0});
        }
    },
    fall: function(){
        var boucle = 0;
        var free = true;
        while(boucle<this.piece.cells.length&free){
            free = this.grid.free(this.piece.position.clone().add(this.piece.cells[boucle].clone()).addY(1));
            boucle++;
        }
        if(free){
            this.piece.position.addY(1);
            Crafty.trigger('viewSlide',{x: 0, y: 16});
        }
        else{
            this.spawn();
            Crafty.trigger('debug');
            this.grid.debug();
        }
        
    },
    roll: function(){
        var boucle = 0;
        var free = true;
        var newCoords = [];
        var defMin = new Coordinate(0,0);
        var defMax = new Coordinate(0,0);
        while(boucle<this.piece.cells.length&free){
            var pos = this.piece.cells[boucle].clone().addX(-1).addY(-1);
            var coords = new Coordinate(-pos.y, pos.x);
            defMin.x = Math.max(defMin.x, -(coords.x+1));
            defMin.y = Math.max(defMin.y, -(coords.y+1));
            defMax.x = Math.min(defMax.x, this.piece.height-2 - coords.x);
            defMax.y = Math.min(defMax.y, this.piece.width-2 - coords.y);
            coords.addX(1).addY(1);
            newCoords.push(coords);
            free = this.grid.free(coords.clone().add(this.piece.position.clone()));
            boucle++;
        }
        if(free){
            var tmp = this.piece.height;
            this.piece.height = this.piece.width;
            this.piece.width= tmp;
            for(var i=0; i<newCoords.length; i++) this.piece.cells[i]=newCoords[i].add(defMax).add(defMin);
            Crafty.trigger('viewRoll', {defMin: defMin, defMax: defMax});
        }
    },
    eraseLines: function(e){
        var gap=1;
        var low=e[0]+2;
        var loop=low;
        for(var i=0; i<e.length; i++){
            this.grid.data[e[i]+2]=undefined;
            Crafty.trigger('eraseLine', e);
        }
        while(loop>=0&&!this.grid.testLine(loop,true)){
            var loop2 = loop-gap;
            if(!this.grid.data[loop]){
                while(loop2>=0&&!this.grid.data[loop2])loop2--;
                if(this.grid.data[loop2]){
                    this.grid.data[loop] = this.grid.data[loop2];
                    this.grid.data[loop2] = undefined
                    Crafty.trigger('moveLine',{from:loop2-2,to:loop-2});
                }
                gap = loop - loop2;
            }
            loop--;
        }
        for(var i=loop2; i<=loop; i++){
            var newLine = new Array(10);
            for(var j=0; j<10; j++) newLine[j] = true;
            this.grid.data[i]=newLine;
        }
    }
});

Crafty.c('View', {
    init: function(){
        this.attr({
            lines: new Array (22),
            piece: undefined,
            preview: undefined,
            speed: Crafty.e('2D, DOM, Text')
                .attr({x: 170, y: 75, w: 119, h: 30})
                .text('0')
                .textFont({size: '20px'}).text('1'),
            score: Crafty.e('2D, DOM, Text')
                .attr({x: 170, y: 105, w: 119, h: 30})
                .text('0')
                .textFont({size: '20px'})
            
        })
        Crafty.e('2D, DOM, Text')
            .attr({x: 170, y: 75, w: 50, h: 30})
            .textFont({size: '20px'})
            .text('Speed:');
        for(var i=0; i<22; i++) this.lines[i] = Crafty.e('2D');
        this.bind('spawn',this.displayPiece);
        this.bind('displayScore', this.displayScore);
        this.bind('speedUp', this.displaySpeed);
        this.bind('viewSlide',this.slide);
        this.bind('viewRoll',this.roll);
        this.bind('eraseLine', this.eraseLine);
        this.bind('moveLine', this.moveLine);
        this.bind('debug', function(){console.log(this.lines)});
        Crafty.e('2D, Canvas, Image').image('assets/graphics/frame.png');
    },
    
    displayPiece: function(e){
        if(this.piece){
            for(var i=this.piece._children.length-1; i>=0; i--){
                var line=this.piece._children[i].y/16;
                line-=(this.piece._children[i].rotation/90==2|this.piece._children[i].rotation/90==3)?1:0;
                if(!this.lines[line]) this.lines[line] = Crafty.e('2D');
                this.lines[line].attach(this.piece._children[i]);
                //console.log('add cell to', line);
            }
        }
        if(this.preview){
            this.piece = this.preview;
            this.preview = undefined;
            this.piece.origin(24,24);
            this.piece.attr({x: e.pos.x * 16, y: (e.pos.y) * 16});
        }
        this.preview = Crafty.e('2D').attr({x: 170 + ((120-(16 * e.schema.w))/2), y: ((60-(16 * e.schema.h))/2)});
        for(var i=0; i<e.schema.cells.length; i++)
            this.preview.attach(new Crafty.e('2D,Canvas,'+e.schema.colour).attr({x: this.preview.x + (e.schema.cells[i].x*16), y: this.preview.y + (e.schema.cells[i].y*16)}));
        
    },
    
    slide: function(e){
        this.piece.x += e.x;
        this.piece.y += e.y;
    },
    
    roll: function(e){
        this.piece.rotation += 90;
        this.piece._cascade({_x: this.piece.x-(e.defMin.x+e.defMax.x)*16, _y: this.piece.y-(e.defMin.y+e.defMax.y)*16});
    },
    
    eraseLine: function(e){
        for(var i=0; i<e.length; i++){
            var line = this.lines[e[i]];
            if(line){
                for(var j=0; j<line.length; j++){
                    line._children[j].destroy();
                }
                this.lines[e[i]] = undefined;
                line.destroy();
            }
            else console.log('shadow line');
        }
    },
       
    moveLine: function(e){
        this.lines[e.to] = this.lines[e.from];
        this.lines[e.from] = Crafty.e('2D');
        this.lines[e.to].y += (e.to-e.from) * 16;
    },
    
    displayScore: function(e){
        this.score.text(e);
    },
    
    displaySpeed: function(e){
        this.speed.text(e);
    }
});

Crafty.c('Audio',{
    init: function(){
        this.attr({
            playlist: [],
            track: -1,
            deleteCurrent: false
        });
        this.bind('musicEnd', this.playNext);
        this.bind('speedUp', this.musicProgress);
        this.bind('roll',this.soundEffect('roll'));
        this.bind('slide',this.soundEffect('slide'));
        this.bind('eraseLines',this.soundEffect('eraseLine'));
    },
    start: function(speed){
        this.playlist.push('part'+Math.ceil(speed/5));
        this.playlist.push('pont');
        soundManager.play('intro');
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
    musicProgress: function(e){
        if((Math.floor(e/5) - Math.floor((e-1)/5))>0 && e<15){
            if(this.playlist[this.track] == 'pont'){
                console.log('remove', this.playlist[(this.track+1)%this.playlist.length], 'add transition3');
                this.removeTrack((this.track+1)%this.playlist.length);
                this.playlist.push('transition3');
                this.playlist.push('part'+(Math.ceil(e/5)+1));
                console.log(this.playlist, this.playlist[this.track]);
            }
            else{
                console.log('remove', this.playlist[this.track], 'add transition'+Math.ceil(e/5));
                this.deleteCurrent = true;
                this.playlist.splice(this.track+1,0,'transition'+Math.ceil(e/5));
                this.playlist.splice(this.track+2,0,'part'+(Math.ceil(e/5)+1));
                console.log(this.playlist, this.playlist[this.track]);
            }
            
        }
    },
    removeTrack: function(track){
        this.playlist.splice(track,1);
        if(track < this.track) this.track--;
    },
    soundEffect: function(event){
        var res = undefined;
        if(event == 'eraseLine') res = function(e){soundManager.play('line_clear'+e.length);};
        else res = function(){soundManager.play(event);};
        return res;
    }
});

Crafty.c('Selector', {
    init: function(){
        this.requires('2D');
        var mouse = {left: {click: false, hold: false}, right: {click: false, hold: false}};
        this.attr({
            value:5,
            controls: {
                left: false,
                rigth: false,
                mouse: mouse
            },
            lArrow: Crafty.e('2D, Canvas, Mouse, arrow')
                .attr({ x: 50, y: 352/2, mouse: mouse.left})
                .flip("X")
                .bind('Click',function(){this.mouse.click=true})
                .bind('MouseDown',function(){this.mouse.hold=true})
                .bind('MouseUp',function(){this.mouse.hold=false}),
            rArrow: Crafty.e('2D, Canvas, Mouse, arrow')
                .attr({ x: 226, y: 352/2, mouse: mouse.right})
                .bind('Click',function(){this.mouse.click=true})
                .bind('MouseDown',function(){this.mouse.hold=true})
                .bind('MouseUp',function(){this.mouse.hold=false}),
            figure: Crafty.e('2D, Canvas, Text')
                .attr({x: 0, y: 352/2, w: 290})
                .text('5')
                .textFont({size: '20px'})
        });
        this.bind('KeyDown',this.keyControl);
        this.bind('KeyUp',this.keyControl);
        this.bind('EnterFrame', this.update);
    },
    keyControl: function(e){
        var stat = e.type==='keydown';
        if(e.key==Crafty.keys.RIGHT_ARROW) this.controls.right = stat;
        if(e.key==Crafty.keys.LEFT_ARROW) this.controls.left = stat;
        if(e.key==Crafty.keys.ENTER) Crafty.scene('Game',this.value);
    },
    mouseControl: function(e){
        console.log('click');
       
    },
    changeValue: function(down,up){
        var change = 0;
        if(down) change--;
        if(up) change++;
        if(change!=0){
            if(this.value+change>0&&this.value+change<16){
                this.value += change;
                this.figure.text(this.value);
                soundManager.play('slide');
            }
            else soundManager.play('touch_down');
        }
    },
    update: function(e){
        if(e.frame%10==0){
            this.changeValue(this.controls.left||this.controls.mouse.left.click||this.controls.mouse.left.hold,
                             this.controls.right||this.controls.mouse.right.click||this.controls.mouse.right.hold);
            this.controls.mouse.left.click = false;
            this.controls.mouse.right.click = false;
        }
    }
});