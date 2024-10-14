localStorage.setItem("level",1);
localStorage.setItem("bossSpeed",0.25);
var level = localStorage.getItem("level",1);
var acceleration = localStorage.getItem("bossSpeed",0.2);
console.log(level,acceleration);
localStorage.setItem("check",true);
console.log()
function play(){
    window.location.href ="../HTML/game.html";
    
}