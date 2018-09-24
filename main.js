var flock;
var height, width;
function setup() {
  height = screen.height;
  width = screen.width;
  createCanvas(width, height);

  var setupBoidAmount = 10;

  flock = new Flock();

  for (var i = 0; i < setupBoidAmount; i++) {
    var boid = new Boid(width/2, height/2);
    flock.addBoid(boid);
  }

}

function draw() {
  background('rgba(0,255,0, 0.3)');
  flock.run();
}

function Flock(){
  this.boids = [];
}

// add boid to array
Flock.prototype.addBoid = function(boid) {
  this.boids.push(boid);
}

Flock.prototype.run = function() {
  for (var i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
}

function Boid(x,y) {
  this.acceleration = createVector(0,0);
  this.velocity  = createVector(random(-1,1), random(-1,1));
  this.position = createVector(x,y);
  this.maxSpeed = 2;
  this.maxForce = 0.05
  this.r = random(1,3);
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
  if (this.position.x <= -this.r/1.1){
    this.velocity.x = -this.velocity.x;
    this.acceleration.x = -this.acceleration.x;
  }          //this.position.x = width + this.r;
  if (this.position.y <= -this.r/1.1){
    this.velocity.y = -this.velocity.y;
    this.acceleration.y = -this.acceleration.y;
  }//this.position.y = height + this.r;
  if (this.position.x >= (width+this.r)/1.1){
    this.velocity.x = -this.velocity.x;
    this.acceleration.x = -this.acceleration.x;
  }     //this.position.x = -this.r;
  if (this.position.y >= (height + this.r)/1.1){
    this.velocity.y = -this.velocity.y;
    this.acceleration.y = -this.acceleration.y;
  } //this.position.y = -this.r;
}

Boid.prototype.separate = function(boids){
  var desiredSeparation = 25.0;
  var steer = createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < desiredSeparation) {
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
  var naiberDist = 50;
  var sum = createVector(0,0);
  var count = 0;

  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < naiberDist) {
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
  }
  else {
    return createVector(0,0);
  }
}


Boid.prototype.cohesion = function(boids){
  var naiberDist = 50;
  var sum = createVector(0,0);
  var count = 0;

  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(this.position, boids[i].position);
    if (d > 0 && d < naiberDist) {
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


Boid.prototype.flock = function(boids){
  var separate = this.separate(boids);
  var align = this.align(boids);
  var cohesion = this.cohesion(boids);

  separate.mult(1.5);
  align.mult(1.0);
  cohesion.mult(1.0);

  this.applyForce(separate);
  this.applyForce(align);
  this.applyForce(cohesion);

}
