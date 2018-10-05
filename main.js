//SOURCES:
//http://www.cs.bath.ac.uk/~mdv/courses/CM30082/projects.bho/2007-8/Buckley-BP-dissertation-2007-8.pdf
//http://www.csc.kth.se/utbildning/kth/kurser/DD143X/dkand13/Group9Petter/report/Martin.Barksten.David.Rydberg.report.pdf
//https://p5js.org/examples/simulate-flocking.html
//https://www.red3d.com/cwr/boids/
//https://team.inria.fr/imagine/files/2014/10/flocks-hers-and-schools.pdf


var flock;
var dogX, dogY;
var height, width;
var cohDist = 150;
var sepDist = 30;
var aliDist = 150;
var cohWeight = 1.0;
var alignWeight = 1.0;
var seperateWeight = 1.5;
var dogFlockSize = 200;
var closeToAvg = 400;

var lines =[

  //line(x1, y1, x2, y2)
  [100, 100, 100, 800],
  [1340, 100, 1340, 1340],
  [100, 100, 1340, 100],
  [100, 800, 1340, 800],
];

function setup() {
  height = screen.height;
  width = screen.width;
  createCanvas(width, height);

  var setupBoidAmount = 15;

  flock = new Flock();
  var theDog = new Dog(width/4, height/4);
  flock.addDog(theDog);
  for (var i = 0; i < setupBoidAmount; i++) {
    var boid = new Boid(width/2, height/2);
    flock.addBoid(boid);
  }

}

function draw() {
  background('rgb(188, 204, 229)');
  flock.run();
  //console.log("MouseX: ", mouseX, " mouseY: ", mouseY);
}

function Flock(){
  this.boids = [];
  this.dog;
}

// add boid to array
Flock.prototype.addBoid = function(boid) {
  this.boids.push(boid);
}
Flock.prototype.addDog = function(newDog) {
  this.dog = newDog;
}

Flock.prototype.run = function() {
  for (var i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
  this.dog.run(this.boids);
}

function Dog(x,y) {
  this.acceleration = createVector(0,0);
  this.velocity  = createVector(random(-0.3,0.3), random(-0.3,0.3));
  this.position = createVector(x,y);
  this.maxSpeed = 1;
  this.maxForce = 0.05
  this.r = 5;
  this.sepWeight = 1.0;
  this.cohWeight = 1.0;
}

Dog.prototype.run = function(boids){
  this.herdSheep(boids);
  this.update();
  this.border();
  this.render();
}

Dog.prototype.applyForce = function(force){
  this.acceleration.add(force);
}

Dog.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed);
  this.position.add(this.velocity);
  dogX = this.position.x;
  dogY = this.position.y;
  this.acceleration.mult(0);
}

Dog.prototype.render = function(){
  fill(34, 134, 200);
  ellipse(this.position.x, this.position.y, this.r*6, this.r*6);
}
Dog.prototype.getPos = function(){
  return this.position;
}

Dog.prototype.herdSheep = function(boids){
  var averagePos = this.averageSheepPos(boids);
  var badSheep = this.furthestSheep(boids, averagePos);
  var distance = p5.Vector.dist(averagePos, badSheep.position);
  
  if( distance > dogFlockSize)
  {
    //this will change.
    var seekSheep = this.seekSheep(badSheep.position);
    seekSheep.mult(this.cohWeight);
    this.applyForce(seekSheep);
  }
  else
  {
    if(p5.Vector.dist(this.position, averagePos) > closeToAvg)
    {
      
      //this will be the same, probably.
      var seekSheep = this.seekSheep(badSheep.position);
      seekSheep.mult(this.cohWeight);
      var seperateDog = this.flyAwayFromSheep(averagePos);
      seperateDog.mult(this.sepWeight);
      this.applyForce(seperateDog * 0.8);
      this.applyForce(seekSheep);
    }
    else
    {
      var seperateDog = this.flyAwayFromSheep(averagePos);
      seperateDog.mult(this.sepWeight);
      this.applyForce(seperateDog);
    }
  }
  
}

Dog.prototype.seekSheep = function(target){
  var desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxSpeed);
  var steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce);
  return steer;
}

Dog.prototype.averageSheepPos = function(boids)
{
  var result = createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    result.add(boids[i].position);
    count++;
  }
  result = result.div(count);
  return result;
}

Dog.prototype.furthestSheep = function(boids, averagePosition){
  var furthestAway = -1000;
  var res;
  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(averagePosition, boids[i].position);
    if(d > furthestAway)
    {
      furthestAway = d;
      res = boids[i];
    }
  }
  return res;
}

Dog.prototype.flyAwayFromSheep = function(bipc) {
  
    var steer = createVector(0,0);
    var d =  p5.Vector.dist(this.position, bipc);
    var diff = p5.Vector.sub(this.position, bipc);
    diff.normalize();
    diff.div(d);
    steer.add(diff);
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.velocity);
    steer.limit(this.maxForce);
    return steer;
 
}

Dog.prototype.border = function(){

}

function Boid(x,y) {
  this.acceleration = createVector(0,0);
  this.velocity  = createVector(random(-0.3,0.3), random(-0.3,0.3));
  this.position = createVector(x,y);
  this.maxSpeed = 1;
  this.maxForce = 0.05
  this.r = random(2,3);
  this.cohesionDist = cohDist;
  this.seperationDist = sepDist;
  this.alignmentDist = aliDist;
  this.cohesionWeight = cohWeight;
  this.seperationWeight = seperateWeight;
  this.alignmentWeight = alignWeight;
  this.fearLevel = random(0.5,1);
}

Boid.prototype.run = function(boids){
  this.flock(boids);
  this.update();
  this.border();
  this.render();
}

Boid.prototype.applyForce = function(force){
  this.acceleration.add(force);
}

// update location
Boid.prototype.update = function(){
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxSpeed);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
}

Boid.prototype.seek = function(target){
  var desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxSpeed);
  var steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxForce);
  return steer;
}

Boid.prototype.render = function(){
  var theta = this.velocity.heading() + radians(90);
  fill(255);
  stroke(0);
  // Lines
  for (var i = 0; i < lines.length; i++) {
    line(lines[i][0], lines[i][1], lines[i][2], lines[i][3]);
  }
  //sheeps
  stroke(200);
  ellipse(this.position.x, this.position.y, this.r*6, this.r*6);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0,-this.r*2);
  vertex(-this.r ,this.r*2);
  vertex(this.r ,this.r*2);
  endShape(CLOSE);
  pop();
}

Boid.prototype.border = function(){
  /*if (this.position.x <= 20){
    this.velocity.x = -this.velocity.x;
    this.acceleration.x = -this.acceleration.x;
  }          //this.position.x = width + this.r;
  if (this.position.y <= 150){
    this.velocity.y = -this.velocity.y;
    this.acceleration.y = -this.acceleration.y;
  }//this.position.y = height + this.r;
  if (this.position.x >= (width-4*this.r)){
    this.velocity.x = -this.velocity.x;
    this.acceleration.x = -this.acceleration.x;
  }     //this.position.x = -this.r;
  if (this.position.y >= (height - 3*this.r)){
    this.velocity.y = -this.velocity.y;
    this.acceleration.y = -this.acceleration.y;
  } //this.position.y = -this.r;
*/
  // colision with lines 
  for (var i = 0; i < lines.length; i++) {
    if (linePoint( lines[i][0],  lines[i][1],  lines[i][2], lines[i][3],  this.position.x,  this.position.y)) {

      var awayFromWall = this.avoidWall(this.position.x+Math.sign(this.velocity.x)*30 , this.position.y+Math.sign(this.velocity.y)*30 );
      this.velocity = createVector(0, 0);
      this.acceleration = createVector(0, 0);
      this.force = createVector(0,0);
      this.applyForce(awayFromWall);
      for (let index = 0; index < flock.boids.length; index++) {
          if (p5.Vector.dist(flock.boids[index].position, this.position) < 30 ) {
            flock.boids[index].force = createVector(0,0)
            flock.boids[index].applyForce(awayFromWall);
          }

        /*if (p5.Vector.dist(flock.boids[index], this.position) < 20)
        flock.boids[index].applyForce(awayFromWall);*/
        
      }

    }
  }
}

Boid.prototype.avoidWall = function(x,y) {
  var bipc = createVector(x, y);
  var d = p5.Vector.dist(bipc, this.position);
  var desRadius = 150;
  var s = 200;
  var scaleParameter = 2000;

  ratioX = scaleParameter * (s / (this.position.x * this.position.x));
  ratioY = scaleParameter * (s / (this.position.y * this.position.y));

    var v = (p5.Vector.sub(this.position, bipc)).normalize();
    var resVec = createVector(v.x*ratioX, v.y*ratioY);
    return resVec;
}

Boid.prototype.separate = function(boids){

  var steer = createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < this.seperationDist) {
      var diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);
      steer.add(diff);
      count++;
    }
  }

  if (count > 0) {
    steer.div(count);
  }

  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxSpeed);
    steer.sub(this.velocity);
    steer.limit(this.maxForce);
  }

  return steer;
}

Boid.prototype.align = function (boids) {

  var sum = createVector(0,0);
  var count = 0;

  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < this.alignmentDist) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0 ) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxSpeed);
    var steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxForce);

    return steer;
    //return createVector(mouseX, mouseY);

  }
  else {
    return createVector(0,0);
  }
}

Boid.prototype.flyToMouse = function() {
  var bipc = createVector(mouseX, mouseY);
  var d = p5.Vector.dist(bipc, this.position);
  var desRadius = 150;
  var v = p5.Vector.sub(bipc, this.position);
  v.div(100);
  if(d < desRadius)
  {
    return v;
  }
  else
  {
    return createVector(0, 0);
  }

}

Boid.prototype.flyAwayFromMouse = function(x,y) {
  var bipc = createVector(x, y);
  var d = p5.Vector.dist(bipc, this.position);
  var desRadius = 150;
  var s = 200;
  var scaleParameter = 1000 * this.fearLevel;

  ratioX = scaleParameter * (s / (this.position.x * this.position.x));
  ratioY = scaleParameter * (s / (this.position.y * this.position.y));

  if(d < desRadius)
  {
    var v = (p5.Vector.sub(this.position, bipc)).normalize();
    var resVec = createVector(v.x*ratioX, v.y*ratioY);
    return resVec;
  }
  else
  {
    return createVector(0, 0);
  }
}

Boid.prototype.flyAwayFromDog = function(x,y) {
  var bipc = createVector(x, y);
  var d = p5.Vector.dist(bipc, this.position);
  var desRadius = 60;
  var s = 200;
  var scaleParameter = 1000 * this.fearLevel;

  ratioX = scaleParameter * (s / (this.position.x * this.position.x));
  ratioY = scaleParameter * (s / (this.position.y * this.position.y));

  if(d < desRadius)
  {
    var v = (p5.Vector.sub(this.position, bipc)).normalize();
    var resVec = createVector(v.x*ratioX, v.y*ratioY);
    return resVec;
  }
  else
  {
    return createVector(0, 0);
  }
}


Boid.prototype.cohesion = function(boids){
  var sum = createVector(0,0);
  var count = 0;

  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < this.cohesionDist) {
      sum.add(boids[i].position);
      count++;
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum);
    }
    else {
      return createVector(0,0);
    }
  }
}

Boid.prototype.avgPos = function(boids){
  var sum = createVector(0,0);
  var count = 0;

  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < this.cohesionDist) {
      sum.add(boids[i].position);
      count++;
    }
    if (count > 0) {
      sum.div(count);
      return sum;
    }
    else {
      return createVector(0,0);
    }
  }
}


Boid.prototype.flock = function(boids){
  var separate = this.separate(boids);
  var align = this.align(boids);
  var cohesion = this.cohesion(boids);
  var awayFromMouse = this.flyAwayFromMouse(mouseX, mouseY);
  var awayFromDog = this.flyAwayFromDog(dogX, dogY);


  separate.mult(this.seperationWeight);
  align.mult(this.alignmentWeight);
  cohesion.mult(this.cohesionWeight);
  awayFromMouse.mult(0.7);
  awayFromDog.mult(0.7);
  
  this.applyForce(separate);
  this.applyForce(align);
  this.applyForce(cohesion);
  this.applyForce(awayFromMouse);
  this.applyForce(awayFromDog);
}

function linePoint( x1,  y1,  x2,  y2,  px,  py) {

  // get distance from the point to the two ends of the line
  var d1 = dist(px,py, x1,y1);
  var d2 = dist(px,py, x2,y2);

  // get the length of the line
  var lineLen = dist(x1,y1, x2,y2);

  var buffer = 1;    // higher # = less accurate

  // if the two distances are equal to the line's
  // length, the point is on the line!
  // note we use the buffer here to give a range,
  // rather than one #
  if (d1+d2 >= lineLen-buffer && d1+d2 <= lineLen+buffer) {
    return true;
  }
  return false;
}
