localStorage.setItem("level",1);
localStorage.setItem("bossSpeed",0.3);
var level = localStorage.getItem("level");
var acceleration = localStorage.getItem("bossSpeed");
console.log(level,acceleration);
localStorage.setItem("check",true);
function play(){
    window.location.href ="../HTML/game.html";
}