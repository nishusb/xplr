var c = document.getElementById("c"); //load the canvas
var d = c.getContext("2d");

var mouse = {x: 0, y: 0, down: false, dragging: false};

function getMouse(event) {
     mouse.x = event.clientX;
     mouse.y = event.clientY;
}
document.addEventListener("mousemove", getMouse);
document.addEventListener("mousedown", function() {mouse.down=true;});
document.addEventListener("mouseup", function() {mouse.down=false});

 //begin game variables

var game = {
     mode: 'editor',
     ship: '0'
}
var camera = {
     x: 0,
     y: 0
}
var ships = [{n: 'x1', x: 0, y: 0, parts: [{n: 'cockpit', x: 128, y: 0}, {n: 'armor', x: 64, y: 0}, {n: 'thruster', x: 0, y: 0}], speed: 0, vspeed: 0, hp: 0, weight: 0}]; //spaceships

var parts = [{n: 'cockpit', a: 99}, {n: 'armor', a: 99}, {n: 'thruster', a: 99},
{n: 'dcockpit', a: 99}, {n: 'rmarmor', a: 99}, {n: 'vthruster', a: 99}, {n: 'rmuarmor', a: 99}]; // parts available to use

var images = {};

images.cockpit = new Image(); images.cockpit.src = "images/cockpit.png"; //Load the textures
images.thruster = new Image(); images.thruster.src = "images/thruster.png";
images.armor = new Image(); images.armor.src = "images/armor.png";
images.rmarmor = new Image(); images.rmarmor.src = "images/rmarmor.png";
images.rmuarmor = new Image(); images.rmuarmor.src = "images/rmuarmor.png";
images.vthruster = new Image(); images.vthruster.src = "images/vthruster.png";
images.dcockpit = new Image(); images.dcockpit.src = "images/dcockpit.png";

function shipstats(ship) {
     var theweight = 0;
     var thespeed = 0;
     var thevspeed = 0;

     for (var pr in ship.parts) {
          theweight += 1;
          if (ship.parts[pr].n === 'thruster') {
               thespeed += 10;
          }
          if (ship.parts[pr].n === 'vthruster') {
               thevspeed += 10;
          }
     }

     return {s: Math.round(thespeed/(theweight/4)), w: theweight, vs: Math.round(thevspeed/(theweight/3))-4};
}

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
          d.fillStyle = "#aaa";
          d.fillRect(0, 0, 256, c.height);
          d.fillStyle = "#ddd";
          d.fillRect(0, 0, 256, 24);
          d.fillStyle = "#000";
          d.font = "25px Raleway"
          d.fillText("parts", 20, 20);
          for (var i in parts) {
               if (72*i+32+64 > c.height) {
                    d.drawImage(images[parts[i].n], 128, 72*(i-Math.round(c.height/72))+32); //row 2
               } else {
                    d.drawImage(images[parts[i].n], 16, 72*i+32); //Draw available parts in part menu (row 1)
                    d.fillStyle = "#fff";
                    d.fillText(parts[i].a, 24, 72*i+48);
               }
          }
          d.fillStyle = "#ddd"; // drawing the grid
          d.fillRect((c.width-256/2)-772, 20, 772, 500);
          d.fillStyle = "#ccc";
          for (var x=0; x<737; x+= 64) {
               for (var y = 0; y < 437; y+= 64) {
                    d.fillRect(x+(c.width-256/2)-768, 24+y, 60, 60);
               }
          }

           ships[game.ship].parts;
          for (var p in ships[game.ship].parts) {
               d.drawImage(images[ships[game.ship].parts[p].n], ships[game.ship].parts[p].x+(c.width-256/2)-772, ships[game.ship].parts[p].y+24);
          } //draw the ship
          d.fillStyle = '#333';
          d.fillText("speed: "+ships[game.ship].speed+", weight: "+ships[game.ship].weight+", hp: "+ships[game.ship].hp+", vspeed: "+ships[game.ship].vspeed, ((c.width-256/2)-772)+10, 500);
     } else if (game.mode === "flight") {
          for (var p in ships[game.ship].parts) {
               d.drawImage(images[ships[game.ship].parts[p].n], ships[game.ship].parts[p].x+camera.x+ships[game.ship].x, ships[game.ship].parts[p].y+camera.y-ships[game.ship].y);
          }
          camera.x = c.width/2; camera.y = c.height/2;
     } else if (game.mode === "crafting") {

     } else {

     }
}

function update() { //update the game
     document.body.style.cursor = "default"; //reset mouse cursor
     if (game.mode === 'editor') {
          for (var i in parts) { //managing available parts
               if (72*i+32+64 > c.height) {
                    if (mouse.x >= 128 && mouse.y >= 72*(i-Math.round(c.height/72))+32 && mouse.x <= 128+64 && mouse.y <= 72*(i-Math.round(c.height/72))+32+64 && parts[i].a > 0) {
                         document.body.style.cursor = "pointer"; //make the mouse turn into a grab
                         if (mouse.down && !mouse.dragging) { //init dragging
                              ships[game.ship].parts.push({n: parts[i].n, x: 0, y: 0, d: true});
                              mouse.dragging = true;
                              console.log('down');
                              parts[i].a -= 1;
                         }
                    } // if the mouse is hovering over button
               } else {
                    if (mouse.x >= 16 && mouse.y >= 72*i+32 && mouse.x <= 16+64 && mouse.y <= 72*i+32+64 && parts[i].a > 0) {
                         document.body.style.cursor = "pointer"; //same thing, but for row 1
                         if (mouse.down && !mouse.dragging) { //init dragging
                              ships[game.ship].parts.push({n: parts[i].n, x: 0, y: 0, d: true});
                              mouse.dragging = true;
                              console.log('down');
                              parts[i].a -= 1;
                         }
                    }
               }
          }
           ships[game.ship].parts;
          if (mouse.dragging) {
               for (var p in ships[game.ship].parts) {
                    if (ships[game.ship].parts[p].d) {
                         ships[game.ship].parts[p].x = mouse.x-((c.width-256/2)-772)-32;
                         ships[game.ship].parts[p].y = mouse.y-20-32;
                         if (!mouse.down) {
                              document.body.style.cursor = "default";
                              ships[game.ship].parts[p].d = false;
                              mouse.dragging = false;
                              ships[game.ship].parts[p].x = Math.round(ships[game.ship].parts[p].x/64)*64;
                              ships[game.ship].parts[p].y = Math.round(ships[game.ship].parts[p].y/64)*64;
                              if (ships[game.ship].parts[p].x < 0 || ships[game.ship].parts[p].x > 709 || ships[game.ship].parts[p].y > 500) {
                                   //parts[s] // need to think of a way to return blocks
                                   var inx = ships[game.ship].parts.indexOf(p);
                                   ships[game.ship].parts.splice(inx);
                              }
                              console.log('up, '+ships[game.ship].parts[p].x+', '+ships[game.ship].parts[p].y+', '+ships[game.ship].parts[p].n);
                              var ss = shipstats(ships[game.ship]);
                              ships[game.ship].speed = ss.s;
                              ships[game.ship].weight = ss.w;
                              ships[game.ship].vspeed = ss.vs;
                         }
                    }
               }
          }
          for (var p in ships[game.ship].parts) {
               if (mouse.x-((c.width-256/2)-772) >= ships[game.ship].parts[p].x && mouse.y-20 >= ships[game.ship].parts[p].y && mouse.x-((c.width-256/2)-772) <= ships[game.ship].parts[p].x+64 && mouse.y-20 <= ships[game.ship].parts[p].y+64) { //init dragging
                    document.body.style.cursor = "pointer";
                    if (mouse.down && !mouse.dragging) {
                         ships[game.ship].parts[p].d = true;
                         mouse.dragging = true;
                         console.log('down');
                    }
               }
          }
     } else if (game.mode === "flight") {
          //ships[game.ship].y -= 4;
     } else if (game.mode === "crafting") {

     } else {

     }
     draw(); // after game has updated, draw.
}

setInterval(update, 20);
