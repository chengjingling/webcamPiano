var noteSize = 40;
var notePitchArray = ["C3", "D3", "E3", "G3", "A4", "C4", "D4", "E4", "G4", "A5", "C5", "D5", "E5", "G5", "A6", "C6"];
var monoSynth = new p5.MonoSynth();

// Grid class to create grid of notes
class Grid {
  constructor(_w, _h) {
    this.gridWidth = _w;
    this.gridHeight = _h;
    this.notes = [];

    // initialize grid structure and state
    for (var x = 0; x < _w; x += noteSize) {
      var noteColumn = [];
        
      for (var y = 0; y < _h; y += noteSize) {
        var notePos = createVector(x + noteSize / 2, y + noteSize / 2);
        var noteState = 0;
          
        // assign a note of the pentatonic scale to each column in the grid
        var notePitch = notePitchArray[x / noteSize];
          
        // create note object
        var note = new Note(noteSize, notePos, noteState, notePitch);
          
        noteColumn.push(note);
      }
        
      // append notes into main array in columns e.g. [[column 1], [column 2]...]
      this.notes.push(noteColumn);
    }
  }
  
  run(img) {
    img.loadPixels();
    this.findActiveNotes(img);
    this.drawActiveNotes(img);
  }
  
  drawActiveNotes(img) {
    fill(255);
    noStroke();
      
    for (var i = 0; i < this.notes.length; i++) {
      for (var j = 0; j < this.notes[i].length; j++) {
        var x = this.notes[i][j].notePos.x;
        var y = this.notes[i][j].notePos.y;
          
        if (this.notes[i][j].noteState > 0) { // note is activated
          // opacity increases over time
          var alpha = 255 - this.notes[i][j].noteState * 100;
          var c1 = color(23, 190, 187, alpha);
          var c2 = color(228, 70, 30, alpha);
          // colour changes from orange to blue over time
          var mix = lerpColor(c1, c2, this.notes[i][j].noteState);
          fill(mix);
          ellipse(x, y, noteSize * this.notes[i][j].noteState, noteSize * this.notes[i][j].noteState);
            
          // play note when it is first activated
          if (this.notes[i][j].noteState == 1) {
            userStartAudio();
            monoSynth.play(this.notes[i][j].notePitch);
          }
        }
          
        // gradually reduce note state until it reaches 0
        this.notes[i][j].noteState -= 0.05;
        this.notes[i][j].noteState = constrain(this.notes[i][j].noteState, 0, 1);
      }
    }
  }
  
  findActiveNotes(img) {
    for (var x = 0; x < img.width; x++) {
      for (var y = 0; y < img.height; y++) {
        var index = (x + (y * img.width)) * 4;
        var state = img.pixels[index + 0];
          
        if (state == 0) { // motion is detected
          // find active note and set note state to 1
          var screenX = map(x, 0, img.width, 0, this.gridWidth);
          var screenY = map(y, 0, img.height, 0, this.gridHeight);
          var i = int(screenX / noteSize);
          var j = int(screenY / noteSize);
          this.notes[i][j].noteState = 1;
        }
      }
    }
  }
}