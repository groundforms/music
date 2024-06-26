/**
 *  Example: Fractal Music
 *  Generate a fractal pattern of music using L-Systems. 
 *  We begin with an initial sequence of tokens, and use a programmer-
 *  defined set of rules to generate new tokens. Here, we apply the rules:
 *  + > + -
 *  - > +
 *  to each token in existing sequences to generate new sequences. The 
 *  tokens used here are "+","-" which steer the melody's pitch upward or 
 *  downward. Note durations are selected randomly.
 */

var rules = {
  "A":["C","F","E"],
  "C":["G","E"],
  "E":["C","G"],
  "F":["A","C"],
  "G":["E","F","C"]
};
var seqIndex = 0;
var noteIndex = -1;
let initSeq = ["C"];
let newTokens = [];
let generatingTokenColor;
let newTokenColor;
let sequences = [initSeq, []];
let fontSize = 15;
let maxNumSequences = 8;
let maxSequenceLength = 30;

function setup() {
  createCanvas(800, 500);
  textAlign(CENTER, CENTER);
  textFont('typewriter');
  textSize(15);
  generatingTokenColor = color(200,250,255);
  newTokenColor  = color(240);
  synth = new p5.PolySynth();
  sloop = new p5.SoundLoop(soundLoop, 0.7);
  stepButton = createButton("Step");
  stepButton.position(2*stepButton.size().width, height - 2*stepButton.size().height);
  stepButton.mousePressed(stepSoundLoop)
  playPauseButton = createButton('Play/Pause');
  playPauseButton.position(width - 2*playPauseButton.size().width, height - 2*playPauseButton.size().height);
  playPauseButton.keypressed(togglePlayPause);
}

function soundLoop(cycleStartTime) {
  noteIndex++;
  if (noteIndex >= min(sequences[seqIndex].length, maxSequenceLength)) {
    nextSequence();
  }
  var token = sequences[seqIndex][noteIndex];

  var pitch = token + "4";
  var velocity = 0.8;
  var beatSeconds = 0.5; // Define 1 beat as half a second
  var duration = random([beatSeconds, beatSeconds/2, beatSeconds/2, beatSeconds/4]);
  this.interval = duration;
  synth.play(pitch, velocity, cycleStartTime, duration);

  newTokens = rules[token];
  sequences[seqIndex+1] = sequences[seqIndex+1].concat(newTokens);
  // If the sequence overruns maxSequenceLength, truncate it and proceed to next sequence
  if (sequences[seqIndex+1].length >= maxSequenceLength) {
    sequences[seqIndex+1] = sequences[seqIndex+1].slice(0, maxSequenceLength);
    nextSequence();
  }
}

function draw() {
  background(0, 255, 255);

  highlightNote(seqIndex, noteIndex, generatingTokenColor);
  for (var i=0; i<newTokens.length; i++) {
    highlightNote(seqIndex + 1, sequences[seqIndex + 1].length - 1 - i, newTokenColor);
  }

  textAlign(CENTER, CENTER);
  noStroke();
  for (var i=0; i<sequences.length; i++) {
    fill(255 - 195 * (i+1) / sequences.length);
    if (i == sequences.length - 1) {
      fill(0, 150, 255); // Generated tokens text
    }
    var seq = sequences[i];
    var lineHeight = fontSize + 10;
    text(seq.join(" "), width/2, height*2/3 - lineHeight * (sequences.length - i - 1));
  }
}

function togglePlayPause() {
  // Play/pause
  if (sloop.isPlaying) {
    sloop.pause();
  } else {
    sloop.maxIterations = Infinity;
    sloop.start();
  }
}

function stepSoundLoop() {
  sloop.stop();
  soundLoop(0);
}

function nextSequence() {
  noteIndex = 0;
  seqIndex++;
  sequences.push([]); // Add a new empty sequence
  // If the number of sequences overruns maxNumSequences, remove oldest
  if (sequences.length > maxNumSequences) {
    seqIndex--;
    sequences.shift(); // Removes first element from array
  }
}

function highlightNote(seqInd, noteInd, highlightColor) {
  if (noteInd < 0) return; // Skip if we haven't started
  var seqWidth = (fontSize+4) * sequences[seqInd].length;
  var xOffset = width/2 - seqWidth/2;
  var x = xOffset + seqWidth * noteInd / sequences[seqInd].length;
  var lineHeight = fontSize + 10;
  var y = fontSize + height * 2 / 3 - lineHeight * (sequences.length - seqInd - 0);
  var highlightWidth = fontSize;
  var highlightHeight = fontSize;
  strokeWeight(1);
  stroke(150);
  fill(highlightColor);
  rect(x, y, highlightWidth, highlightHeight);
}