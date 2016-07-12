var c = document.getElementById("c"); //load the canvas
var d = c.getContext("2d");

var mouse = {x: 0, y: 0, down: false, dragging: false};

function getMouse(event) {
     mouse.x = event.clientX;
     mouse.y = event.clientY;
}

var keys = [];

document.addEventListener("mousemove", getMouse);
document.addEventListener("mousedown", function() {mouse.down=true;});
document.addEventListener("mouseup", function() {mouse.down=false});
document.addEventListener("keydown", function(e) {keys[e.keyCode] = true; console.log(e.keyCode)});
document.addEventListener("keyup", function(e) {keys[e.keyCode] = false; keyClick = e.keyCode});

 //begin game variables

var game = {
     mode: 'editor',
     ship: '0'
}
var camera = {
     x: 0,
     y: 500,
     xv: 0,
     yv: 0,
     rt: function() {
          return 0;
     }
}
var ships = [
     {n: 'x1', x: 0, y: 256, xv: 0, yv: 0, parts: [], speed: 0, vspeed: 0, hp: 0, weight: 0, width: 0, height: 0, vpower: 0, fpower: 0, iy: 256, og: false}
]; //spaceships

var parts = [
     {n: 'cockpit', a: 99}, {n: 'armor', a: 99}, {n: 'rmarmor', a: 99}, {n: 'thruster', a: 99}, {n: 'vthruster', a: 99}
]; // parts available to use

var keyClick = false;

var images = {};

images.cockpit = new Image(); images.cockpit.src = "images/cockpit.png"; //Load the textures
images.thruster = new Image(); images.thruster.src = "images/thruster.png";
images.armor = new Image(); images.armor.src = "images/armor.png";
images.rmarmor = new Image(); images.rmarmor.src = "images/rmarmor.png";
images.vthruster = new Image(); images.vthruster.src = "images/vthruster.png";

function rotatedImage(image, x, y, degrees) {
     var radians = degrees * (Math.PI/180);
     d.save();
     d.translate(x+32, y+32);
     d.rotate(radians);
     d.drawImage(image, -32, -32);
     d.restore();
}

function shipstats(ship) {
     var theweight = 0;
     var thespeed = 0;
     var thevspeed = 0;
     var thewidth = 0;
     var theheight = 0;

     var minx = 800;
     var maxx = 0;

     var miny = 800;
     var maxy = 0;

     if (ship.parts[0]) {
          for (var pr in ship.parts) {
               theweight += 1;

               if (ship.parts[pr].x < minx) {
                    minx = ship.parts[pr].x;
               }
               if (ship.parts[pr].y < miny) {
                    miny = ship.parts[pr].y;
               }
               if (ship.parts[pr].x > maxx) {
                    maxx = ship.parts[pr].x;
               }
               if (ship.parts[pr].y > maxy) {
                    maxy = ship.parts[pr].y;
               }

               if (ship.parts[pr].n === 'armor') {
                    theweight += 1;
               }
               if (ship.parts[pr].n === 'thruster') {
                    thespeed += 10;
               }
               if (ship.parts[pr].n === 'vthruster') {
                    thevspeed += 10;
               }
          }
     }

     return {
          s: Math.round(thespeed/(theweight/4)),
          w: theweight,
          vs: Math.round(thevspeed/(theweight/2))*2,
          tw: maxx-minx+64,
          th: maxy-miny+64,
          mx: minx,
          my: miny
     };
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
                    d.fillStyle = "rgba(0, 0, 0, 0.5)";
                    d.fillRect(24, 72*i+32, 32, 24);
                    d.fillStyle = "#fff";
                    d.fillText(parts[i].a, 24, 72*i+48);
               }
          }
          d.fillStyle = "#ccc"; // drawing the grid
          d.fillRect((c.width-256/2)-772, 20, 772, 500);
          d.fillStyle = "#bbb";
          for (var x=0; x<737; x+= 64) {
               for (var y = 0; y < 437; y+= 64) {
                    d.fillRect(x+(c.width-256/2)-768, 24+y, 60, 60);
               }
          }

          for (var p in ships[game.ship].parts) {
               rotatedImage(images[ships[game.ship].parts[p].n], ships[game.ship].parts[p].x+(c.width-256/2)-772, ships[game.ship].parts[p].y+24, ships[game.ship].parts[p].r);
          } //draw the ship
          d.fillStyle = '#333';
          d.fillText("speed: "+ships[game.ship].speed+", weight: "+ships[game.ship].weight+", hp: "+ships[game.ship].hp+", vspeed: "+ships[game.ship].vspeed+", width: "+ships[game.ship].width+", height: "+ships[game.ship].height, ((c.width-256/2)-772)+10, 540);
          d.fillRect((c.width-256/2)-772+500, 480, 200, 40);
          d.fillStyle = '#aaa';
          d.fillText("CLOSE EDITOR",(c.width-256/2)-772+510,510);
     } else if (game.mode === "flight") {
          d.fillStyle = "#2bf";
          d.fillRect(0, 0, c.width, c.height);
          for (var p in ships[game.ship].parts) {
               rotatedImage(images[ships[game.ship].parts[p].n], ships[game.ship].parts[p].x-camera.x+ships[game.ship].x, ships[game.ship].parts[p].y+camera.y-ships[game.ship].y, ships[game.ship].parts[p].r);
               if (ships[game.ship].fpower > 0) {
                    if (ships[game.ship].parts[p].n === 'thruster') {
                         d.fillStyle = "#0af";
                         d.fillRect(ships[game.ship].parts[p].x-camera.x+ships[game.ship].x, ships[game.ship].parts[p].y+camera.y-ships[game.ship].y+20, -ships[game.ship].fpower*2*(Math.random()/2), 24);
                    }
               }
               if (ships[game.ship].vpower > 0) {
                    if (ships[game.ship].parts[p].n === 'vthruster') {
                         d.fillStyle = "#fa0";
                         d.fillRect(ships[game.ship].parts[p].x-camera.x+ships[game.ship].x+20, ships[game.ship].parts[p].y+camera.y-ships[game.ship].y+52, 24, ships[game.ship].vpower*2*(Math.random()/2));
                    }
               }
          }
          d.fillStyle = "#333";
          d.fillRect(0, 0, 120, 40);
          d.fillStyle = "#aaa";
          d.fillText("EDITOR", 10, 30);

          d.fillStyle = "#3f7";
          d.fillRect(0, camera.y, c.width, c.height-camera.y);
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
                              ships[game.ship].parts.push({n: parts[i].n, x: 0, y: 0, d: true, r: 0});
                              mouse.dragging = true;
                              console.log('down');
                              parts[i].a -= 1;
                         }
                    } // if the mouse is hovering over button
               } else {
                    if (mouse.x >= 16 && mouse.y >= 72*i+32 && mouse.x <= 16+64 && mouse.y <= 72*i+32+64 && parts[i].a > 0) {
                         document.body.style.cursor = "pointer"; //same thing, but for row 1
                         if (mouse.down && !mouse.dragging) { //init dragging
                              ships[game.ship].parts.push({n: parts[i].n, x: 0, y: 0, d: true, r: 0});
                              mouse.dragging = true;
                              console.log('down');
                              parts[i].a -= 1;
                         }
                    }
               }
          }
          if (mouse.dragging) {
               for (var p in ships[game.ship].parts) {
                    if (ships[game.ship].parts[p].d) {
                         ships[game.ship].parts[p].x = mouse.x-((c.width-256/2)-772)-32;
                         ships[game.ship].parts[p].y = mouse.y-20-32;
                         if (ships[game.ship].parts[p].n !== 'thruster' && ships[game.ship].parts[p].n !== 'vthruster') {
                              if (keys[65]) {
                                   ships[game.ship].parts[p].r -= 5;
                              } else if (keys[68]) {
                                   ships[game.ship].parts[p].r += 5;
                              }
                         }
                         if (!mouse.down) {
                              document.body.style.cursor = "default";
                              ships[game.ship].parts[p].d = false;
                              mouse.dragging = false;
                              ships[game.ship].parts[p].x = Math.round(ships[game.ship].parts[p].x/64)*64;
                              ships[game.ship].parts[p].y = Math.round(ships[game.ship].parts[p].y/64)*64;
                              ships[game.ship].parts[p].r = Math.round(ships[game.ship].parts[p].r/90)*90;
                              if (ships[game.ship].parts[p].x < 0 || ships[game.ship].parts[p].x > 709 || ships[game.ship].parts[p].y > 500) {
                                   console.log('deleted! '+p)
                                   ships[game.ship].parts.splice(p, 1);
                              }
                              console.log('up, '+ships[game.ship].parts[p].x+', '+ships[game.ship].parts[p].y+', '+ships[game.ship].parts[p].n);
                              var ss = shipstats(ships[game.ship]);
                              ships[game.ship].speed = ss.s;
                              ships[game.ship].weight = ss.w;
                              ships[game.ship].vspeed = ss.vs;
                              ships[game.ship].height = ss.th;
                              ships[game.ship].width = ss.tw;
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
          if (mouse.x >= (c.width-256/2)-772+500 && mouse.y >= 480 && mouse.x <= (c.width-256/2)-772+500+200 && mouse.y <= 520) {
               document.body.style.cursor = 'pointer';
               if (mouse.down && !mouse.dragging) {
                    var ss = shipstats(ships[game.ship]);
                    ships[game.ship].speed = ss.s;
                    ships[game.ship].weight = ss.w;
                    ships[game.ship].vspeed = ss.vs;
                    ships[game.ship].height = ss.th;
                    ships[game.ship].width = ss.tw;
                    for (var p in ships[game.ship].parts) {
                         ships[game.ship].parts[p].x -= ss.mx;
                         ships[game.ship].parts[p].y -= ss.my;

                         console.log(ships[game.ship].parts[p].x);
                         console.log(ships[game.ship].parts[p].y);
                    }
                    game.mode = "flight";
               }
          }
     } else if (game.mode === "flight") {
          ships[game.ship].og = false;
          ships[game.ship].vpower = 0;
          ships[game.ship].fpower = 0;

          if (mouse.x >= 0 && mouse.y >= 0 && mouse.x <= 120 && mouse.y <= 40) {
               document.body.style.cursor = "pointer";
               if (mouse.down) {
                    game.mode = 'editor';
               }
          }

          if (keys[38]) {
               camera.yv += 2;
          } if (keys[40]) {
               camera.yv -= 2;
          } if (keys[37]) {
               camera.xv -= 2;
          } if (keys[39]) {
               camera.xv += 2;
          }
          camera.xv *= 0.9;
          camera.yv *= 0.9;
          camera.x += camera.xv;
          camera.y += camera.yv;

          if (keys[65]) {
               ships[game.ship].fpower = -100;
          }
          if (keys[68]) {
               ships[game.ship].fpower = 100;
          }
          if (keys[87]) {
               ships[game.ship].iy += ships[game.ship].vspeed;
          }
          if (keys[83]) {
               ships[game.ship].iy -= ships[game.ship].vspeed;
          }

          if (ships[game.ship].y < ships[game.ship].iy-100) {
               ships[game.ship].vpower = 100;
          } else if (ships[game.ship].y < ships[game.ship].iy) {
               ships[game.ship].vpower = ships[game.ship].iy-ships[game.ship].y;
          }

          ships[game.ship].yv += (ships[game.ship].vspeed/100)*ships[game.ship].vpower;
          ships[game.ship].xv += (ships[game.ship].speed/100)*ships[game.ship].fpower;

          if (ships[game.ship].y <= ships[game.ship].height && !keys[87]) {
               ships[game.ship].og = true;
               ships[game.ship].yv = 0;
               ships[game.ship].y = ships[game.ship].height;
               ships[game.ship].iy = ships[game.ship].height;
               console.log(ships[game.ship].height);
          }

          if (!ships[game.ship].og) {
               ships[game.ship].yv -= 2;
          }

          ships[game.ship].yv *= 0.9;
          ships[game.ship].xv *= 0.8;

          ships[game.ship].x += ships[game.ship].xv;
          ships[game.ship].y += ships[game.ship].yv;

     } else if (game.mode === "crafting") {

     } else {

     }
     keyClick = false;
     draw(); // after game has updated, draw.
}

setInterval(update, 20);
