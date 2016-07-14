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

function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

 //begin game variables

var game = {
     mode: 'eva',
     ship: 0
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
var player = {
     x: 256,
     y: 512,
     xv: 0,
     yv: 0,
     og: false,
     jetpack: true
}
var ships = [
     {n: 'x1', x: 0, y: 512, xv: 0, yv: 0,
     parts: [{n: 'cockpit', x:128 , y:0 , r: 0}, {n: 'armor', x:64 , y:0 , r: 0}, {n: 'thruster', x:0 , y:0 , r: 0}, {n: 'vthruster', x: 128, y: 64, r: 0}],
     speed: 0, vspeed: 0, hp: 0, weight: 0, width: 0, height: 0, vpower: 0, fpower: 0, iy: 256, og: false},

     {n: 'x1', x: 256, y: 512, xv: 0, yv: 0,
     parts: [{n: 'cockpit', x:128 , y:0 , r: 0}, {n: 'armor', x:64 , y:0 , r: 0}, {n: 'thruster', x:0 , y:0 , r: 0}, {n: 'vthruster', x: 128, y: 64, r: 0}],
     speed: 0, vspeed: 0, hp: 0, weight: 0, width: 0, height: 0, vpower: 0, fpower: 0, iy: 256, og: false}
]; //spaceships

var parts = [
     {n: 'cockpit', a: 99}, {n: 'armor', a: 99}, {n: 'rmarmor', a: 99}, {n: 'thruster', a: 99}, {n: 'vthruster', a: 99}
]; // parts available to use

var terrain = [];
for (var x = 0; x < 100; x++) {
     var rs = random(-1, 1);
     var h = 0;
     if (x !== 0) {
          if (random(0, 3) == 0) {
               var rs = random(-4, 4);
               h = terrain[x-1].y;
               h += rs*64;
          } else {
               h = terrain[x-1].y;
               h += rs*16;
          }
          if (h <= -100) {
               h += 100
          }
          if (h >= 100) {
               h -= 100
          }
          terrain.push({x: (x-50)*64, y: h});
     } else {
          terrain.push({x: (x-50)*64, y: h});
     }
}

var keyClick = false;

var images = {};

images.cockpit = new Image(); images.cockpit.src = "images/cockpit.png"; //Load the textures
images.thruster = new Image(); images.thruster.src = "images/thruster.png";
images.armor = new Image(); images.armor.src = "images/armor.png";
images.rmarmor = new Image(); images.rmarmor.src = "images/rmarmor.png";
images.vthruster = new Image(); images.vthruster.src = "images/vthruster.png";
images.astronaut = new Image(); images.astronaut.src = "images/astronaut.png";
images.fastronaut = new Image(); images.fastronaut.src = "images/fastronaut.png";
images.jetpack = new Image(); images.jetpack.src = "images/jetpack.png";

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

for (var ship in ships) {
     var ss = shipstats(ships[ship]);
     ships[ship].speed = ss.s;
     ships[ship].weight = ss.w;
     ships[ship].vspeed = ss.vs;
     ships[ship].height = ss.th;
     ships[ship].width = ss.tw;
     for (var p in ships[ship].parts) {
          ships[ship].parts[p].x -= ss.mx;
          ships[ship].parts[p].y -= ss.my;

          console.log(ships[ship].parts[p].x);
          console.log(ships[ship].parts[p].y);
     }
}

function drawShips() {
     for (var ship in ships) {
          for (var p in ships[ship].parts) {
               if (ships[ship].parts[p].n !== 'vthruster') {
                    rotatedImage(images[ships[ship].parts[p].n],
                    ships[ship].parts[p].x-camera.x+ships[ship].x,
                    ships[ship].parts[p].y+camera.y-ships[ship].y,
                    ships[ship].parts[p].r);
               } else {
                    if (ships[ship].fpower >= 0) {
                         rotatedImage(images[ships[ship].parts[p].n],
                         ships[ship].parts[p].x-camera.x+ships[ship].x,
                         ships[ship].parts[p].y+camera.y-ships[ship].y,
                         0);
                    } else {
                         rotatedImage(images[ships[ship].parts[p].n],
                         ships[ship].parts[p].x-camera.x+ships[ship].x,
                         ships[ship].parts[p].y+camera.y-ships[ship].y,
                         -10)
                    }
               }
               if (ships[ship].fpower > 0) {
                    if (ships[ship].parts[p].n === 'thruster') {
                         d.fillStyle = "#0af";
                         d.fillRect(ships[ship].parts[p].x-camera.x+ships[ship].x+12, ships[ship].parts[p].y+camera.y-ships[ship].y+20, -ships[ship].fpower-(Math.random()*20), 24);
                    }
               }
               if (ships[ship].vpower > 0) {
                    if (ships[ship].parts[p].n === 'vthruster') {
                         if (ships[ship].fpower >= 0) {
                              d.fillStyle = "#fa0";
                              d.fillRect(ships[ship].parts[p].x-camera.x+ships[ship].x+20, ships[ship].parts[p].y+camera.y-ships[ship].y+52, 24, ships[ship].vpower-(Math.random()*20));
                         } else {
                              d.fillStyle = "#fa0";
                              d.save();
                              d.translate(ships[ship].parts[p].x-camera.x+ships[ship].x, ships[ship].parts[p].y+camera.y-ships[ship].y);
                              var radians = -10 * (Math.PI/180);
                              d.rotate(radians);
                              d.fillRect(14, 58, 24, ships[ship].vpower-(Math.random()*20));
                              d.restore();
                         }
                    }
               }
          }
     }
}
function drawTerrain() {
     for (var bl in terrain) {
          d.fillStyle = "#a50";
          d.fillRect(terrain[bl].x-camera.x, terrain[bl].y+camera.y, 64, 64);
          d.fillStyle = "#4f4";
          d.fillRect(terrain[bl].x-camera.x, terrain[bl].y+camera.y, 64, 8);
          d.fillStyle = "#555";
          d.fillRect(terrain[bl].x-camera.x, terrain[bl].y+camera.y+64, 65, c.height);
     }
}
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
          d.font = "25px Raleway";
          d.fillStyle = "#2bf";
          d.fillRect(0, 0, c.width, c.height);

          /*var radians = (Math.PI/180);
          d.save();
          d.translate(-camera.x+ships[game.ship].x-ships[game.ship].width/2, camera.y-ships[game.ship].y-ships[game.ship].height/2);
          d.rotate(ships[game.ship].r*radians);
          for (var p in ships[game.ship].parts) {
               rotatedImage(images[ships[game.ship].parts[p].n], ships[game.ship].parts[p].x, ships[game.ship].parts[p].y, ships[game.ship].parts[p].r);
               if (ships[game.ship].fpower > 0) {
                    if (ships[game.ship].parts[p].n === 'thruster') {
                         d.fillStyle = "#0af";
                         d.fillRect(ships[game.ship].parts[p].x+12, ships[game.ship].parts[p].y+20, -ships[game.ship].fpower*2*(Math.random()/2), 24);
                    }
               }
               if (ships[game.ship].vpower > 0) {
                    if (ships[game.ship].parts[p].n === 'vthruster') {
                         d.fillStyle = "#fa0";
                         d.fillRect(ships[game.ship].parts[p].x+20, ships[game.ship].parts[p].y+52, 24, ships[game.ship].vpower*2*(Math.random()/2));
                    }
               }
          }
          d.restore();*/
          drawShips();

          drawTerrain();

          d.fillStyle = "#333";
          d.fillRect(0, 0, 120, 40);
          d.fillStyle = "#aaa";
          d.fillText("EDITOR", 10, 30);
          d.fillStyle = "#333";
          d.fillRect(140, 0, 50, 40);
          d.fillStyle = "#aaa";
          d.fillText("EVA", 140, 30);
          d.fillText("x: "+Math.round(ships[game.ship].x)+", y: "+Math.round(ships[game.ship].y), 200, 30);

          //d.fillStyle = "#3f7";
          //d.fillRect(0, camera.y, c.width, c.height-camera.y);
     } else if (game.mode === "crafting") {

     } else if (game.mode === "eva") {
          d.font = "25px Raleway";
          d.fillStyle = "#2bf";

          d.fillStyle = "#2bf";
          d.fillRect(0, 0, c.width, c.height);

          camera.x = player.x-c.width/2+32;//-(ships[game.ship].width/2);
          camera.y = player.y+c.height/2-64;//-(ships[game.ship].height/2);

          drawShips();
          drawTerrain();

          if (player.jetpack) {
               d.drawImage(images.jetpack, player.x-camera.x-4, camera.y-player.y+16);
          }

          if (keys[68]) {
               d.drawImage(images.astronaut, player.x-camera.x, camera.y-player.y);
          } else if (keys[65]) {
               d.drawImage(images.fastronaut, player.x-camera.x-4, camera.y-player.y);
          } else {
               d.drawImage(images.astronaut, player.x-camera.x, camera.y-player.y);
          }
          d.fillRect(240, 0, 110, 40);
          d.fillStyle = "#aaa";
          d.fillText("EXIT EVA", 240, 30);
          d.fillText("x: "+Math.round(player.x)+", y: "+Math.round(player.y)+", xv: "+player.xv+", yv: "+player.yv, 360, 30);
     } else {

     }
}

function shipPhysics() {
     for (var ship in ships) {
          if (ships[ship].y < ships[ship].iy-100) {
               ships[ship].vpower = 100;
          } else if (ships[ship].y < ships[ship].iy) {
               ships[ship].vpower = ships[ship].iy-ships[ship].y;
          }

          ships[ship].yv += (ships[ship].vspeed/100)*ships[ship].vpower;
          ships[ship].xv += (ships[ship].speed/100)*ships[ship].fpower;

          for (var bl in terrain) {
               if (terrain[bl].x <= ships[ship].x+ships[ship].width && terrain[bl].x >= ships[ship].x-64) {
                    if (ships[ship].y <= ships[ship].height-terrain[bl].y && ships[ship].y > ships[ship].height-terrain[bl].y-16) {
                         ships[ship].og = true;
                         if (!keys[87]) {
                              ships[ship].yv = 0;
                              ships[ship].y = ships[ship].height-terrain[bl].y;
                              ships[ship].iy = ships[ship].height-terrain[bl].y;
                         }
                    } else if (ships[ship].y < ships[ship].height-terrain[bl].y-16) {
                         if (ships[ship].x+ships[ship].width > terrain[bl].x && ships[ship].x+ships[ship].width < terrain[bl].x+32) {
                              ships[ship].x = terrain[bl].x-ships[ship].width;
                              ships[ship].xv = 0;
                              console.log('collision');
                         } else if (ships[ship].x < terrain[bl].x+64 && ships[ship].x > terrain[bl].x+32) {
                              ships[ship].x = terrain[bl].x+64;
                              ships[ship].xv = 0;
                              console.log('collision');
                         }
                    }
               }
          }

          if (terrain[terrain.length-1].x-camera.x < c.width) {
               var rs = random(-1, 1);
               if (random(0, 3) == 0) {
                    var rs = random(-4, 4);
                    var h = terrain[terrain.length-1].y;
                    h += rs*64;
               } else {
                    var h = terrain[terrain.length-1].y;
                    h += rs*16;
               }
               if (h <= -100) {
                    h += 100
               }
               if (h >= 100) {
                    h -= 100
               }

               terrain.push({x: terrain[terrain.length-1].x+64, y: h});
          }

          if (terrain[0].x-camera.x > 0) {
               var rs = random(-1, 1);
               if (random(0, 3) == 0) {
                    var rs = random(-4, 4);
                    var h = terrain[0].y;
                    h += rs*64;
               } else {
                    var h = terrain[0].y;
                    h += rs*16;
               }
               if (h <= -100) {
                    h += 100
               }
               if (h >= 100) {
                    h -= 100
               }

               terrain.unshift({x: terrain[0].x-64, y: h});
          }

          //if (ships[game.ship].y <= ships[game.ship].height && !keys[87]) {
          //     ships[game.ship].og = true;
          //     ships[game.ship].yv = 0;
          //     ships[game.ship].y = ships[game.ship].height;
          //     ships[game.ship].iy = ships[game.ship].height;
          //     console.log(ships[game.ship].height);
          //}
          //if (ships[game.ship].y < ships[game.ship].height && keys[87]) {
          //     ships[game.ship].y = ships[game.ship].height;
          //}

          if (!ships[ship].og) {
               ships[ship].yv -= 3;
          }

          ships[ship].yv *= 0.9;
          ships[ship].xv *= 0.8;
          if (ships[ship].og) {
               ships[ship].xv *= 0;
          }

          ships[ship].x += ships[ship].xv;
          ships[ship].y += ships[ship].yv;
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
                                   console.log('deleted! '+p);
                                   for (var a in parts) {
                                        if (parts[a].n === ships[game.ship].parts[p].n) {
                                             parts[a].a ++;
                                        }
                                   }
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
          ships[game.ship].r = 0;

          if (mouse.x >= 0 && mouse.y >= 0 && mouse.x <= 120 && mouse.y <= 40) {
               document.body.style.cursor = "pointer";
               if (mouse.down) {
                    game.mode = 'editor';
               }
          }
          if (mouse.x >= 140 && mouse.y >= 0 && mouse.x <= 190 && mouse.y <= 40) {
               document.body.style.cursor = "pointer";
               if (mouse.down) {
                    game.mode = 'eva';
                    player.x = ships[game.ship].x + ships[game.ship].width+64;
                    player.y = ships[game.ship].y;
               }
          }

          /*if (keys[38]) {
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
          camera.y += camera.yv;*/

          camera.x = ships[game.ship].x-c.width/2+ships[game.ship].width/2;//-(ships[game.ship].width/2);
          camera.y = ships[game.ship].y+c.height/2-ships[game.ship].height/2;//-(ships[game.ship].height/2);

          if (keys[65]) {
               ships[game.ship].fpower -= 20;
               ships[game.ship].r = -20;
          }
          if (keys[68]) {
               ships[game.ship].fpower += 100;
          }
          if (keys[87]) {
               ships[game.ship].iy += ships[game.ship].vspeed;
          }
          if (keys[83]) {
               ships[game.ship].iy -= 10;
          }

          shipPhysics();

     } else if (game.mode === "crafting") {

     } else if (game.mode === "eva") {
          ships[game.ship].og = false;
          ships[game.ship].vpower = 0;
          ships[game.ship].fpower = 0;
          ships[game.ship].r = 0;
          player.og = false;

          if (mouse.x >= 240 && mouse.y >= 0 && mouse.x <= 350 && mouse.y <= 40) {
               for (var ship in ships) {
                    if ( player.x+32 >= ships[ship].x && player.y-64 <= ships[ship].y && player.x <= ships[ship].x+ships[ship].width && player.y >= ships[ship].y-ships[game.ship].height) {
                         document.body.style.cursor = "pointer";
                         if (mouse.down) {
                              game.mode = 'flight';
                              game.ship = ship;
                         }
                    }
               }
          }

          if (player.yv < -14) {
               player.yv = -14;
          }

          if (!player.og) {
               player.yv -= 2;
          }

          if (keys[65]) {
               player.xv -= 3;
          }
          if (keys[68]) {
               player.xv += 3;
          }
          if (keys[87] && player.jetpack) {
               player.yv += 2.5;
          }

          for (var bl in terrain) {
               if (terrain[bl].x <= player.x+32 && terrain[bl].x >= player.x-64) {
                    if (player.y <= 64-terrain[bl].y && player.y > 64-terrain[bl].y-16) {
                         player.og = true;
                         player.yv = 0;
                         player.y = 64-terrain[bl].y;
                         if (keys[87] && !player.jetpack) {
                              player.yv += 20;
                         } else if (keys[87]) {
                              player.yv = 1;
                         }
                    } else if (player.y <= 64-terrain[bl].y-16) {
                         if (player.x+32 > terrain[bl].x && player.x+32 < terrain[bl].x+32) {
                              player.x = terrain[bl].x-32;
                              player.xv = 0;
                              console.log('collision');
                         } else if (player.x < terrain[bl].x+64 && player.x > terrain[bl].x+32) {
                              player.x = terrain[bl].x+64;
                              player.xv = 0;
                              console.log('collision');
                         }
                    }
               }
          }

          if (player.og) {
               player.xv *= 0.7;
          } else {
               player.xv *= 0.87;
          }

          player.y += player.yv;
          player.x += player.xv;

          shipPhysics();
     } else {

     }
     keyClick = false;
     draw(); // after game has updated, draw.
}

setInterval(update, 20);
