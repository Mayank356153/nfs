
localStorage.setItem("level",1);
localStorage.setItem("bossSpeed",0.3);
var level = localStorage.getItem("level");
var acceleration = localStorage.getItem("bossSpeed");
console.log(level,acceleration);
localStorage.setItem("check",true);
console.log()
document.addEventListener('keypress',function (event){
    if(event.key=='Enter')
    window.location.href ="../HTML/start.html";
});

