(function(){
    var w = window.innerWidth;
    var h = window.innerHeight;
    document.getElementById("mainContainer").style.width = w+"px";
    document.getElementById("mainContainer").style.height = h+"px";

    document.getElementById("city").style.height = h*.3+"px";
    document.getElementById("city").style.width = w+"px";

    var c = document.getElementById("myCanvas");
    c.height = h;
    c.width = w;

    var ctx = c.getContext("2d");
    var level;
    var acceleration;

    function loadGame(){
        "use strict";

        var check = localStorage.getItem("check");
        level = Number(localStorage.getItem("level"));
        acceleration = Number(localStorage.getItem("bossSpeed"));
        console.log(typeof(level),typeof(acceleration));
        console.log(level,acceleration);

        var roadWidth = 4*w/36;
        var roadTop = h-h*0.7;
        var roadLeft = (w-roadWidth)/2;
        var roadConstant = roadLeft/(h-roadTop);

        var rso = [];
        var ratio = 0.8;
        var totalRso = 20;
        var maxHF = h*(1-ratio)/(2.25*(1-Math.pow(ratio,totalRso)));
        var maxH = maxHF;
        console.log(maxH);
        var totalHeight = 0.7*h;
        var minWidth = 1;
        var maxWidth = 26;
        var dif = maxWidth - minWidth;
        var changedHeight = totalHeight-maxH*ratio;
        var cnst1 = Math.pow(ratio,totalRso)/(1-ratio);
        console.log(cnst1);
        var stp = h-totalHeight;
        var tMaxH = h*20/36;
        var treeCnst = tMaxH/roadLeft;

        var gameDifficulty = 100;
        setInterval(()=>{
            gameDifficulty += 100;
        },3000)
        
        function TreeBuilder(src,src2,start,left){
            this.src = treeSrc[src];
            this.src2 = treeSrc[src2];
            this.y = start;
            this.x = 0;
            this.h = 0;
            this.w = 0;
            this.dy = 0.01;
            this.r = 1.009;
            this.left = left;
        }

        TreeBuilder.prototype.draw = function(){
            this.y += this.dy;
            this.dy *= this.r;
            this.x = (h-this.y)*roadConstant - this.w - this.w*this.left;
            this.h = (roadLeft-this.x-this.w*this.left)*treeCnst;
            this.w = this.h*2/3;

            ctx.drawImage(this.src,this.x,this.y-this.h,this.w,this.h);
            ctx.drawImage(this.src2,w-this.x-this.w,this.y-this.h,this.w,this.h);

            if(this.y >= h){
                this.y = stp;
                this.h = 0;
                this.w = 0;
                this.left = Math.random()*4;
                this.dy = 0.5;
            }
        }

        function _i(x){
            return document.getElementById(x);
        }
        var treeSrc = [_i("t1"),_i("t2"),_i("t3"),_i("t4")];

        var trees = [];
        for(var n = 0; n < ((h*0.7)/50-2); n++){
            trees.push(new TreeBuilder(Math.floor(Math.random()*4),Math.floor(Math.random()*4),stp+n*50,4));
        }


        var carWCnst = roadLeft*2/totalHeight;
        var carW = (w > 560) ? 120 : 90;
        var carH = carW*2/3;

        function CarBuilder(src,start,lane){
            this.src = carSrc[src];
            this.y = start;
            this.x = 0;
            this.h = 0;
            this.w = 0;
            this.dy = 0.5;
            this.lane = lane;
        }

        CarBuilder.prototype.draw = function(){
            this.dy *= 1.01;
            this.y += this.dy;
            this.x = (carWCnst/2)*(h-this.y)+(w-(carWCnst*(h-this.y)))*this.lane/8;
            this.w = carW-carW*carWCnst*(h-this.y)/w;
            this.h = 1.7*this.w/3;

            ctx.drawImage(this.src,this.x,this.y-this.h,this.w,this.h);
            if(this.y >= h-60){
                console.log("i am in");
                if(Math.abs(this.x-cx) <= carH && Math.abs(this.y-h+carH) <= carH){
                    clearInterval(intv);
                    setTimeout(function(){
                        endGame();
                    },10);
                }
            }
            if(this.y >= h+100){
                this.y = stp;
                this.h = 0;
                this.w = 0;
                this.left = Math.random()*3;
                this.dy = 0.5;
                this.lane = Math.floor(Math.random() * 4) + 4;
            }
        }  

        var carSrc = [_i("f1"),_i("f2"),_i("f3")];

        var cars = [];
        for(var n = 0; n < ((h*0.7+100)/gameDifficulty); n++){
            cars.push(new CarBuilder(Math.floor(Math.random()*3),stp+n*gameDifficulty,Math.floor(Math.random() * 4) + 4));
        }

        function OppositeCar(src, start, lane) {
            this.src = oppCar[src];
            this.y = start;
            this.x = 0;
            this.h = 0;
            this.w = 0;
            this.dy = 0.5;
            this.lane = lane;
            this.targetLane = lane; 
            this.laneChangeSpeed = 0.1;
            this.safeDistance = 50;
        }
        
        OppositeCar.prototype.draw = function() {
            this.y += this.dy;
            for (let otherCar of oppositeCars) {
                if (otherCar !== this && this.isColliding(otherCar)) {
                    if (this.lane === otherCar.lane) {
                        this.changeLane();
                    }
                }
            }

            if(this.y >= h-60){
                if(Math.abs(this.x-cx) <= carH && Math.abs(this.y-h+carH) <= carH){
                    clearInterval(intv);
                    setTimeout(function(){
                        endGame();
                    },10);
                }
            }
        
            if (this.lane !== this.targetLane) {
                this.lane = this.lane < this.targetLane ? 
                            Math.min(this.lane + this.laneChangeSpeed, this.targetLane) : 
                            Math.max(this.lane - this.laneChangeSpeed, this.targetLane);
            }
        
            this.x = (carWCnst / 2) * (h - this.y) + (w - (carWCnst * (h - this.y))) * this.lane / 8;
            this.w = carW - carW * carWCnst * (h - this.y) / w;
            this.h = 1.7 * this.w / 2;
        
            ctx.drawImage(this.src, this.x, this.y - this.h, this.w, this.h);
        
            if (this.y >= h + 100) {
                this.y = stp;
                this.targetLane = Math.floor(Math.random() * 4); 
                this.dy = 0.5 + Math.random() * 0.5;
            }
        };
        
        OppositeCar.prototype.isColliding = function(otherCar) {
            const yCollision = Math.abs(this.y - otherCar.y) < this.safeDistance;
            const xCollision = Math.abs(this.x - otherCar.x) < (this.w + otherCar.w) / 2;
            return yCollision && xCollision;
        };
        
        OppositeCar.prototype.changeLane = function() {
            let newLane = this.lane;
            const preferredLane = this.lane;
        
            if (preferredLane > 0 && this.checkLaneAvailability(preferredLane - 1)) {
                newLane = preferredLane - 1; 
            }
            else if (preferredLane < 3 && this.checkLaneAvailability(preferredLane + 1)) {
                newLane = preferredLane + 1;
            } else if (preferredLane > 1 && this.checkLaneAvailability(preferredLane - 2)) {
                newLane = preferredLane - 2;
            } else if (preferredLane < 2 && this.checkLaneAvailability(preferredLane + 2)) {
                newLane = preferredLane + 2; 
            }
        
            this.targetLane = newLane; 
        };
        
        OppositeCar.prototype.checkLaneAvailability = function(lane) {
            let count = 0;
            for (let otherCar of oppositeCars) {
                if (otherCar.lane === lane && Math.abs(otherCar.y - this.y) < this.safeDistance) {
                    count++;
                }
            }
            return count < 1; 
        };
        
        
        var oppCar = [_i("c2"), _i("c2"), _i("c3")];
        var oppositeCars = [];
        for (var n = 0; n < ((h * 0.7 + 100) / gameDifficulty); n++) {
            oppositeCars.push(new OppositeCar(Math.floor(Math.random() * 3), stp + n * 100, Math.floor(Math.random() * 4)));
        }

        function levelCar(src, start, lane) {
            this.src = levelCars[src];
            this.y = start;
            this.x = 0;
            this.h = 0;
            this.w = 0;
            this.dy = acceleration;
            this.lane = lane;
            this.targetLane = lane; 
            this.laneChangeSpeed = 0.1; 
        }
    
        function levelCar(src, start, lane) {
            this.src = levelCars[src];
            this.y = start;
            this.x = 0;
            this.h = 0;
            this.w = 0;
            this.dy = acceleration;
            this.lane = lane;
        }
        
        levelCar.prototype.draw = function() {
            this.y += this.dy; 
            this.updatePosition(); 
            this.renderCar();
        
            this.checkCollisions();
        
            this.checkGameOver();

            this.resetPositionIfNeeded();
        };
        
        levelCar.prototype.updatePosition = function() {
            this.x = (carWCnst / 2) * (h - this.y) + (w - (carWCnst * (h - this.y))) * this.lane / 8;
            this.w = carW - carW * carWCnst * (h - this.y) / w;
            this.h = 1.7 * this.w / 2;
        };
        
        levelCar.prototype.renderCar = function() {
            ctx.drawImage(this.src, this.x, this.y - this.h, this.w, this.h);
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(this.x + this.w / 2, this.y + this.h / 4, this.w / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "black";
            ctx.font = `${this.w / 6}px Arial`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("enemy", this.x + this.w / 2, this.y + this.h / 4);
        };
        
        levelCar.prototype.checkCollisions = function() {
            for (let car of [...cars, ...oppositeCars]) {
                if (this.isColliding(car)) {
                    this.changeLane();
                    break;
                }
            }
        };
        
        levelCar.prototype.isColliding = function(otherCar) {
            return (
                this.y < otherCar.y + otherCar.h &&
                this.y + this.h > otherCar.y &&
                this.x < otherCar.x + otherCar.w &&
                this.x + this.w > otherCar.x
            );
        };
        
        levelCar.prototype.changeLane = function() {
            const preferredLane = this.lane; 
        
            const potentialLanes = [
                preferredLane - 1, 
                preferredLane + 1, 
                preferredLane - 2, 
                preferredLane + 2  
            ];
        
            for (let lane of potentialLanes) {
                if (this.checkLaneAvailability(lane)) {
                    this.lane = lane; 
                    return; 
                }
            }
        };
        
        levelCar.prototype.checkLaneAvailability = function(lane) {
            if (lane < 0 || lane > 7) return false;
        
            return ![...cars, ...oppositeCars].some(car => car.lane === lane && car.y < h);
        };
        
        
        levelCar.prototype.checkLaneAvailability = function(lane) {
            if (lane < 0 || lane > 7) return false; 
            return ![...cars, ...oppositeCars].some(car => car.lane === lane && car.y < h);
        };
        
        levelCar.prototype.checkGameOver = function() {
            if (this.y >= h - 20 && Math.abs(this.x - cx) <= carH) {
                clearInterval(intv);
                setTimeout(function() {
                    endGame();
                }, 10);
            }
        };
        
        levelCar.prototype.resetPositionIfNeeded = function() {
            if (this.y >= h + 100) {
                this.y = stp;
                this.h = 0;
                this.w = 0;
                this.lane = Math.floor(Math.random() * 7) + 1; 
                this.dy = 0.5;
                levelIncrease();
                if (level === 3) {
                    endGame();
                }
            }
        };
        
        

        var levelCars = [_i("l1"), _i("l2"), _i("l3")];
        var levelOfCar =[];
        for( var n = 0;n<3;n++){
            levelOfCar.push(new levelCar(level-1, stp, Math.floor(Math.random() * 7)));
        }

        function rectPoints(n){
            n = totalRso-n-1;
            var y1 = stp+maxH*cnst1*(Math.pow(1/ratio,n)-1);
            var x1 = roadLeft-roadConstant*(y1-stp);
            var y2 = y1;
            var x2 = x1 + minWidth+(y1-stp)*dif/totalHeight;
            var y3 = y1 + maxH*cnst1*(Math.pow(1/ratio,n+1)-1);
            var x3 = roadLeft-roadConstant*(y3-stp);
            var y4 = y3;
            var x4 = x3 + minWidth+(y3-stp)*dif/totalHeight;
            return [x1,y1,x2,y2,x4,y4,x3,y3];
        }

        for(var n = 0; n < totalRso; n++){
            rso.push(rectPoints(n,h));
            rso[n][8] = (n%2!=0) ? "#000" : "#fff";
        }

        function draw(){
            ctx.beginPath();
            ctx.moveTo((w-roadWidth)/2,stp);
            ctx.lineTo((w-roadWidth)/2+roadWidth,stp);
            ctx.lineTo(w,h);
            ctx.lineTo(0,h);
            ctx.fillStyle="#555";
            ctx.fill();
            ctx.closePath();
            for(var n = 0; n < totalRso; n++){
                ctx.beginPath();
                ctx.moveTo(rso[n][0],rso[n][1]);
                ctx.lineTo(rso[n][2],rso[n][3]);
                ctx.lineTo(rso[n][4],rso[n][5]);
                ctx.lineTo(rso[n][6],rso[n][7]);
                ctx.lineTo(rso[n][0],rso[n][1]);
                ctx.lineWidth = 2;
                ctx.fillStyle = rso[n][8];
                ctx.fill();
                ctx.closePath();
                ctx.beginPath();
                ctx.moveTo(w-rso[n][0],rso[n][1]);
                ctx.lineTo(w-rso[n][2],rso[n][3]);
                ctx.lineTo(w-rso[n][4],rso[n][5]);
                ctx.lineTo(w-rso[n][6],rso[n][7]);
                ctx.lineTo(w-rso[n][0],rso[n][1]);
                ctx.lineWidth = 2;
                ctx.fillStyle = rso[n][8];
                ctx.fill();
                ctx.closePath();
            }
        }

        draw();

        var cx = (w-carW)/2;
        var cl = false, cr = false;
        var car = _i("m1");
        var ms = 3*w/560;
        function drawCar(){
            if(cl) if(cx+carW+50 < w) cx+=ms;
            if(cr) if(cx-50 > 0) cx-=ms;
            ctx.drawImage(car,cx,h-carH,carW,carH);
        }

        function getKey(e){
            e.preventDefault();
            var ty = e.keyCode;
            if(ty===39){
                cr = false;
                cl = true;
            }
            else if(ty===37){
                cl = false;
                cr = true;
            }
        }
        function getKeyEnd(e){
            var ty = e.keyCode;
            if(ty === 39) cl = false;
            else if(ty === 37) cr = false;
        }

        document.body.removeEventListener("keydown",getKey);
        document.body.removeEventListener("keyup",getKeyEnd);
        document.body.addEventListener("keydown",getKey);
        document.body.addEventListener("keyup",getKeyEnd);

        var m = 0;

        var speed = parseInt(localStorage.getItem("speed")) || 20;
        const minSpeed = 0; 
        const maxSpeed = 20; 
        var intv;

        document.querySelector(".carspeed").innerHTML = speed;

        function startInterval() {
            clearInterval(intv);
            intv = setInterval(function() {
                try {
                    ctx.clearRect(0, 0, w, h);
                    maxH += 0.5;
                    changedHeight = maxH * cnst1 * (Math.pow(1 / ratio, totalRso - 1) - 1);
                    
                    if (changedHeight >= totalHeight) {
                        maxH = maxHF;
                        m++;
                    }

                    for (var n = 0; n < totalRso; n++) {
                        rso[n] = rectPoints(n, h - totalHeight + changedHeight);
                        rso[n][8] = (m % 2 === 0) ? (n % 2 === 0 ? "#000" : "#fff") : (n % 2 === 1 ? "#000" : "#fff");
                    }
                    
                    draw();

                    for (var n = 0; n < trees.length; n++) {
                        trees[n].draw();
                    }

                    for (var n = 0; n < oppositeCars.length; n++) {
                        oppositeCars[n].draw();
                    }

                    for (var n = 0; n < cars.length; n++) {
                        cars[n].draw();
                    }

                    levelOfCar[level-1].draw();

                    drawCar();
                } catch (err) {
                    console.error("Animation error:", err);
                }
            }, speed);
        }

        startInterval();

        document.addEventListener('keydown', function(event) {
            if (event.key === 'a') { 
                speed = Math.min(speed + 2, maxSpeed);
            } else if (event.key === 'd') { 
                speed = Math.max(speed - 2, minSpeed);
            }
            
            localStorage.setItem("speed", speed);
            console.log("Current speed:", speed);
            document.querySelector(".carspeed").innerHTML = speed;
            startInterval();
        });

        if(window.DeviceMotionEvent){
            window.removeEventListener("devicemotion",driveCar)
            window.addEventListener("devicemotion",driveCar,false)
        }
    }
    loadGame();
})();

function endGame() {
    speed = 10;
    console.log("Game Over. All cleared, level reset to 1.");
    window.location.href = '../HTML/result.html';
}

function levelIncrease(){
    window.location.href = '../HTML/level.html';
}