var c = document.getElementById("c"); //load the canvas
var d = c.getContext("2d");

 //begin game variables

var game = {
     mode: 'editor',
     ship: 'x1',
}
var ships = [{n: 'x1', x: 0, y: 100, parts: []}]; //spaceships
var inventory = [{n: 'thruster'}, {n: 'armor'}, {n: 'cockpit'}];

 //end game variables

function resize() {
     c.width = document.body.clientWidth; //make the canvas width full
     c.height = document.body.clientHeight; //make the canvas height full
}

resize(); //make canvas fullscreen automatically when the page loads
window.onresize = resize; //resize whenever screen size changes.

function draw() { //draw the graphics
     d.clearRect(0, 0, c.width, c.height);
     if (game.mode === 'editor') {
          d.fillStyle = "#AAA";
          d.fillRect(0, 0, 256, c.height);
     } else {

     }
}
function update() { //update the game
     if (game.mode === 'editor') {
          d.fillStyle = "#AAA";
          d.fillRect(0, 0, 256, c.height);
     } else {

     }
     draw();
}

setInterval(update, 20);
