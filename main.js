//SOURCES:
//http://www.cs.bath.ac.uk/~mdv/courses/CM30082/projects.bho/2007-8/Buckley-BP-dissertation-2007-8.pdf
//http://www.csc.kth.se/utbildning/kth/kurser/DD143X/dkand13/Group9Petter/report/Martin.Barksten.David.Rydberg.report.pdf
//https://p5js.org/examples/simulate-flocking.html
//https://www.red3d.com/cwr/boids/
//https://team.inria.fr/imagine/files/2014/10/flocks-hers-and-schools.pdf
//https://gamedevelopment.tutsplus.com/tutorials/understanding-steering-behaviors-collision-avoidance--gamedev-7777

var cohWeightSlider, alignWeightSlider, sepWeightSlider, cohDistSlider, alignDistSlider, seperationDistSlider
, dogWeightSlider;
var flock;
var dogX, dogY;
var height, width;
var cohDist = 150;
var sepDist = 30;
var aliDist = 150;
var cohWeight = 0.14;
var alignWeight = 0.1;
var awayDogWeight = 0.02;
var seperateWeight = 0.11;
var toMouseWeight = 0.04;
var dogFlockSize = 130;
var closeToAvg = 200;
var boidDogRadius = 110;
var center;
var hage;

var lines = [

  //line(x1, y1, x2, y2)
  [300, 100, 300, 800],
  [1400, 100, 1400, 800],
  [300, 100, 1400, 100],
  [300, 800, 1400, 800],
  [1100, 100, 1100, 650],
];

function setup() {
  // create sliders
  cohWeightSlider = createSlider(0, 2*cohWeight*100, cohWeight*100);
  cohWeightSlider.position(20, 20);
  alignWeightSlider = createSlider(0, 2*alignWeight*100, alignWeight*100);
  alignWeightSlider.position(20, 80);
  sepWeightSlider = createSlider(0, 2*seperateWeight*100, seperateWeight*100);
  sepWeightSlider.position(20, 140);
  toMouseSlider = createSlider(0, 2*toMouseWeight*100, toMouseWeight*100);
  toMouseSlider.position(20, 200);

  cohDistSlider = createSlider(0, 2*cohDist, cohDist);
  cohDistSlider.position(20, 260);
  alignDistSlider = createSlider(0, 2*aliDist, aliDist);
  alignDistSlider.position(20, 320);
  seperationDistSlider = createSlider(0, 2*sepDist, sepDist);
  seperationDistSlider.position(20, 380);

  dogWeightSlider = createSlider(0, 2*dogWeightSlider * 100, dogWeightSlider*100);
  dogWeightSlider.position(20, 440);

  height = screen.height;
  width = screen.width;
  createCanvas(width, height);
  //center = createVector(600, 400);
  center = createVector(width/2, height/2);
  hage = createVector(1100, 730);
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
  fill(125);
  text("cohesion weight", cohWeightSlider.x * 2 + cohWeightSlider.width, 35);
  text("alignment weight", alignWeightSlider.x * 2 + alignWeightSlider.width, 95);
  text("seperation weight", sepWeightSlider.x * 2 + sepWeightSlider.width, 155);
  text("seperate mouse weight", toMouseSlider.x * 2 + toMouseSlider.width, 205);
  text("cohesion distance", cohDistSlider.x * 2 + cohDistSlider.width, 265);
  text("alignment distance", alignDistSlider.x * 2 + alignDistSlider.width, 325);
  text("seperation distance", seperationDistSlider.x * 2 + seperationDistSlider.width, 385);  
  text("dog scare weight", seperationDistSlider.x * 2 + seperationDistSlider.width, 445);  
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
  this.maxSpeed = 1.00;
  this.maxForce = 0.05;
  this.r = 3;
  this.sepWeight = seperateWeight;
  this.cohWeight = cohWeight;
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
  fill(139,69,19);
  ellipse(this.position.x, this.position.y, this.r*6, this.r*6);
}
Dog.prototype.getPos = function(){
  return this.position;
}

Dog.prototype.checkBoidsHage = function(boids) {
  for(var i = 0; i < boids.length; ++i)
  {
    if(boids[i].position.x <= hage.x)
    {
      return false;
    }
  }
  return true;
}

Dog.prototype.herdSheep = function(boids){
  var boidChecker = this.checkBoidsHage(boids);
  var dogToHage = (p5.Vector.sub(hage, this.position)).normalize();
  if(boidChecker)
  {
    this.applyForce(dogToHage);
    awayDogWeight = 80.0;
  }
  else
  {
    var averagePos = this.averageSheepPos(boids);
    var badSheep = this.furthestSheep(boids, averagePos);
    var distance = p5.Vector.dist(averagePos, badSheep.position);
    var randVal = random(0,5);
    if(distance > dogFlockSize && badSheep.position.x <= hage.x) // some sheep is not in flock
    {

      var sheepAvgRelation = p5.Vector.sub(badSheep.position, averagePos);
      var away = createVector(
        badSheep.position.x+(sheepAvgRelation.normalize().x)*70,
        badSheep.position.y+(sheepAvgRelation.normalize().y)*70
       );
      var goToBadSheep = this.seekSheep(away);
      if(p5.Vector.dist(this.position, badSheep.position) < boidDogRadius-randVal) //when close enough, do herding.
      {
        var seperateDog = this.flyAwayFromSheep(averagePos);
        seperateDog.mult(this.sepWeight);
        this.applyForce(seperateDog);
        var goTo = averagePos.sub(averagePos, badSheep.position);
        var alignVec = badSheep.align(boids);
               
        badSheep.applyForce(alignVec);
        badSheep.applyForce(goTo);
        this.applyForce(goToBadSheep);
      }
      else // do not want to be too close to sheep
      {

        //this will be the same, probably.
        var seekSheep = this.seekSheep(badSheep.position);
        seekSheep.mult(this.cohWeight);
        var seperateDog = this.flyAwayFromSheep(averagePos);
        seperateDog.mult(this.sepWeight);
        this.applyForce(seperateDog * 0.8);
        this.applyForce(goToBadSheep);
      }
    }
    else
    {
      
      if(p5.Vector.dist(this.position, averagePos) > boidDogRadius-randVal && p5.Vector.dist(this.position, hage)>p5.Vector.dist(hage, averagePos)) //go closer to sheep
      {
        // linjer från hagen
        var angleScale = 25;
        var angle1 = cos(PI / angleScale);
        var angle2 = sin(PI / angleScale);
        var angle1Neg = cos(-PI / angleScale);
        var angle2Neg = sin(-PI / angleScale);
        var angle1Pos = createVector( averagePos.x * angle1 - averagePos.y*angle2 , averagePos.y * angle2 + averagePos.y*angle1);
        var angle2Pos = createVector(averagePos.x * angle1Neg - averagePos.y*angle2Neg , averagePos.y * angle2Neg + averagePos.y*angle1Neg);

        var dogSheepRelation = p5.Vector.sub(averagePos, this.position);
        var hageSheepRelation = p5.Vector.sub(averagePos, hage);
        var away = createVector(
           averagePos.x+(hageSheepRelation.normalize().x)*70 ,
           averagePos.y+(hageSheepRelation.normalize().y)*70
          );
        stroke(255);
        line(averagePos.x, averagePos.y, averagePos.x + hageSheepRelation.normalize().x*70, averagePos.y + hageSheepRelation.normalize().y*70);
        line(hage.x, hage.y, averagePos.x * angle1 - averagePos.y*angle2 , averagePos.y * angle2 + averagePos.y*angle1);
        line(hage.x, hage.y, averagePos.x * angle1Neg - averagePos.y*angle2Neg , averagePos.y * angle2Neg + averagePos.y*angle1Neg);



        var seekSheeps = this.seekSheep(away); // gå till position bakom får
        var seekAngle1Vec = this.seekSheep(angle1Pos); // gå till linje 1 
        var seekAngle2Vec = this.seekSheep(angle2Pos); // gå till linje 2 
        seekSheeps.mult(1.0);
        seekAngle1Vec.mult( (5 / p5.Vector.dist(angle1Pos, averagePos)) );
        seekAngle2Vec.mult( (5 / p5.Vector.dist(angle2Pos, averagePos)) );
        this.applyForce(seekAngle1Vec);
        this.applyForce(seekAngle2Vec);
        this.applyForce(seekSheeps);
      }
      else
      {
        stroke(255);
        fill(255,0,0,0.0);
        ellipse(averagePos.x,averagePos.y, boidDogRadius*1.5, boidDogRadius*1.5);
        var hageSheepRelation = p5.Vector.sub(averagePos, hage);

        var ahead = createVector(this.position.x + this.velocity.normalize().x*boidDogRadius,
        this.position.y + this.velocity.normalize().y*boidDogRadius,
        );
        var avoidance_force = (p5.Vector.sub(ahead, averagePos)).normalize();

        
        var away = createVector(
          averagePos.x+(hageSheepRelation.normalize().x)*70 ,
          averagePos.y+(hageSheepRelation.normalize().y)*70
         );
         var seekSheeps = this.seekSheep(away);
         this.applyForce(seekSheeps);
         if (p5.Vector.dist(this.position, averagePos) <= boidDogRadius) {
          
          var seperateDog = this.flyAwayFromSheep(averagePos);
          //seperateDog.mult(this.sepWeight);
          //this.applyForce(seperateDog);'
          
          this.applyForce(avoidance_force);
          stroke(255);
          line(this.position.x, this.position.y, this.position.x + avoidance_force.x*30,this.position.y + avoidance_force.y*30 )
         }
        
        
      }
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
    if(boids[i].position.x <= hage.x)
    {
      result.add(boids[i].position);
      count++;
    }
  }
  if(count > 0)
  {
    result = result.div(count);
    return result;
  }
  else
  {
    return createVector(hage.x, hage.y);
  }
  
}

Dog.prototype.furthestSheep = function(boids, averagePosition){
  var furthestAway = -1000;
  var res;
  var checkLoop = false;
  for (var i = 0; i < boids.length; i++) {
    var d =  p5.Vector.dist(averagePosition, boids[i].position);
    if(d > furthestAway && boids[i].position.x <= hage.x)
    {
      furthestAway = d;
      res = boids[i];
      checkLoop = true;
    }
  }
  if(checkLoop)
  {
    return res;
  }
  else
  {
    return createVector(hage.x, hage.y);
  }
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
  var forwPosVec = createVector(this.position.x+Math.sign(this.velocity.x)*2 , this.position.y+Math.sign(this.velocity.y)*2 );
  for (var i = 0; i < lines.length; i++) {
    if (linePoint( lines[i][0],  lines[i][1],  lines[i][2], lines[i][3],  forwPosVec.x,  forwPosVec.y)) {

      var awayFromWall = this.avoidWall(forwPosVec.x , forwPosVec.y, i);
      //this.velocity = createVector(0, 0);
      //this.acceleration = createVector(0, 0);
      //this.force = createVector(0,0);
      this.applyForce(awayFromWall);


    }
  }
}

Dog.prototype.avoidWall = function(x,y, i) {
  var bipc = createVector(x, y);
  var d = p5.Vector.dist(bipc, this.position);
  var s = 10;
  var v;

  ratioX =  (s / (d + 1));
  ratioY =  (s / (d + 1));
  
    if(i == (lines.length - 1) && this.position.x > hage.x)
    {
      var newCenter = createVector(1250, 450);
      v = (p5.Vector.sub(newCenter, bipc)).normalize();
    }
    else
    {
      v = (p5.Vector.sub(center, bipc)).normalize();
    }
    var resVec = createVector(v.x*ratioX, v.y*ratioY);
    return resVec;
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
  var forwPosVec = createVector(this.position.x+Math.sign(this.velocity.x)*3 , this.position.y+Math.sign(this.velocity.y)*3 );
  for (var i = 0; i < lines.length; i++) {
    if (linePoint( lines[i][0],  lines[i][1],  lines[i][2], lines[i][3],  forwPosVec.x, forwPosVec.y)) {
      
      var awayFromWall = this.avoidWall(forwPosVec.x , forwPosVec.y, i);
      this.applyForce(awayFromWall);
    }
  }
}

Boid.prototype.avoidWall = function(x,y, i) {
  var bipc = createVector(x, y);
  var d = p5.Vector.dist(bipc, this.position);
  var s = 10;
  var v;

  ratioX =  (s / (d + 1));
  ratioY =  (s / (d + 1));
  
    if(i == (lines.length - 1) && this.position.x > hage.x)
    {
      var newCenter = createVector(1250, 450);
      v = (p5.Vector.sub(newCenter, bipc)).normalize();
    }
    else
    {
      v = (p5.Vector.sub(center, bipc)).normalize();
    }
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
  ratioX = 1;
  ratioY = 1;

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
  var s = 10;
  var scaleParameter = 1 * this.fearLevel;

  ratioX = scaleParameter * (s / (d + 1));
  ratioY = scaleParameter * (s / (d + 1));


  if(d < boidDogRadius)
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

  if(this.position.x > hage.x)
  {
    
    if(this.maxSpeed > 0.75)
    {
      this.maxSpeed = this.maxSpeed - 0.001;
    }

  }
  else
  {   
    if(this.maxSpeed < 1)
    {
      this.maxSpeed = this.maxSpeed + 0.001;
    }
    
  }
  
  this.cohesionDist = cohDistSlider.value();
  this.seperationDist = seperationDistSlider.value();
  this.alignmentDist = alignDistSlider.value();

  var separate = this.separate(boids);
  var align = this.align(boids);
  var cohesion = this.cohesion(boids);
  var awayFromMouse = this.flyAwayFromMouse(mouseX, mouseY);
  var awayFromDog = this.flyAwayFromDog(dogX, dogY);



  this.cohesionWeight = cohWeightSlider.value() / 100;
  this.alignmentWeight = alignWeightSlider.value() / 100;
  this.seperationWeight = sepWeightSlider.value() / 100;
  toMouseWeight = toMouseSlider.value() / 100;
  awayDogWeight = dogWeightSlider.value() / 100;
  separate.mult(this.seperationWeight);
  align.mult(this.alignmentWeight);
  cohesion.mult(this.cohesionWeight);
  awayFromMouse.mult(toMouseWeight);
  awayFromDog.mult(awayDogWeight);
  
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

  var buffer = 0.1;    // higher # = less accurate

  // if the two distances are equal to the line's
  // length, the point is on the line!
  // note we use the buffer here to give a range,
  // rather than one #
  if (d1+d2 >= lineLen-buffer && d1+d2 <= lineLen+buffer) {
    return true;
  }
  return false;
}
