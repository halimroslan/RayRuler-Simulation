/*******************************************
 * ARROW and LINE DECLARATIONS
 *******************************************/
// Two arrows (with arrowheads):
let arrow1 = { // Objek/Object arrow (blue)
  drawingMode: false,
  finished: false,
  clickCount: 0,
  start: null,
  end: null,
  draggingStart: false,
  draggingEnd: false,
  draggingWhole: false,
  col: null
};
let arrow2 = { // Imej/Image arrow (red)
  drawingMode: false,
  finished: false,
  clickCount: 0,
  start: null,
  end: null,
  draggingStart: false,
  draggingEnd: false,
  draggingWhole: false,
  col: null
};

// Three lines (without arrowheads):
let line1 = { // Garis TiPu
  drawingMode: false,
  finished: false,
  clickCount: 0,
  start: null,
  end: null,
  draggingStart: false,
  draggingEnd: false,
  draggingWhole: false,
  col: null
};
let line2 = { // Garis TiSe
  drawingMode: false,
  finished: false,
  clickCount: 0,
  start: null,
  end: null,
  draggingStart: false,
  draggingEnd: false,
  draggingWhole: false,
  col: null
};
let line3 = { // Garis F
  drawingMode: false,
  finished: false,
  clickCount: 0,
  start: null,
  end: null,
  draggingStart: false,
  draggingEnd: false,
  draggingWhole: false,
  col: null
};

/*******************************************
 * OTHER GLOBAL VARIABLES
 *******************************************/
const firstArmLength = 650;
const secondArmLength = 700;
const thirdArmLength = 600;

let img1, img2, img3;
let bgImages = [];
let bgIndex = 0;

let points = {}; // Points for the simulation (rulers)
let t3 = 0.5;

// Whole-arm dragging flags (for simulation)
let draggingWhole1 = false;
let draggingWhole2 = false;
let draggingWhole3 = false;

let leftButton, rightButton;
let objectButton, imageButton;
let line1Button, line2Button, line3Button;
let stopDrawingButton;

// We'll store a reference to our canvas for cursor toggling:
let canvas;

/*******************************************
 * preload()
 *******************************************/
function preload() {
  // Load ruler images
  img1 = loadImage('ruler1.png'); // First arm image
  img2 = loadImage('ruler2.png'); // Second arm image
  img3 = loadImage('ruler3.png'); // Third arm image
  
  // Load background images (adjust filenames as needed)
  bgImages[0] = loadImage('bg1.jpg');
  bgImages[1] = loadImage('bg2.jpg');
  bgImages[2] = loadImage('bg3.jpg');
  bgImages[3] = loadImage('bg4.jpg');
}

/*******************************************
 * setup()
 *******************************************/
function setup() {
  // Create the canvas and store its reference
  canvas = createCanvas(1200, 600);

  // Insert a CSS rule to define the pencil-cursor class
  // (Adjust the hot-spot offset if needed: 0 16 moves the tip for better alignment)
  let styleEl = createElement('style', `
    .drawing-cursor {
      cursor: url('pencil-cursor.png') 0 16, auto;
    }
  `);
  styleEl.parent(document.head || document.documentElement);

  // Assign colors
  arrow1.col = color(0, 0, 255);    // Blue arrow
  arrow2.col = color(255, 0, 0);    // Red arrow
  line1.col  = color(0, 200, 0);    // Green line
  line2.col  = color(255, 165, 0);  // Orange line
  line3.col  = color(160, 32, 240); // Purple line

  // Center the simulation: second arm centered at (600,300)
  let centerX = width / 2;
  let centerY = height / 2;
  points.red = {
    pos: createVector(centerX - secondArmLength / 2, centerY),
    dragging: false
  };
  points.orange = {
    pos: createVector(centerX + secondArmLength / 2, centerY),
    dragging: false
  };
  
  // For the first arm, we want it rotated about 10° relative to the horizontal.
  // Instead of placing green collinearly with red, we offset it:
  points.green = {
    pos: createVector(
      points.red.pos.x - firstArmLength * cos(radians(200)),
      centerY - firstArmLength * sin(radians(200))
    ),
    dragging: false
  };
  
  // Yellow pivot along red→orange (initially at t3 = 0.5)
  points.yellow = {
    pos: p5.Vector.lerp(points.red.pos, points.orange.pos, t3),
    dragging: false
  };
  // Third arm: purple to the right of yellow (horizontal)
  points.purple = {
    pos: createVector(points.yellow.pos.x + thirdArmLength, centerY),
    dragging: false
  };

  // New button positioning: all buttons on the right, vertically centered
  let buttonX = width - 150;         // Place buttons 150px from the right edge
  let buttonSpacing = 40;            // Vertical spacing for each button
  let totalButtons = 8;              // Total number of buttons
  let totalGroupHeight = totalButtons * buttonSpacing - 10; // Total height of button group
  let startY = height / 2 - totalGroupHeight / 2; // Center the group vertically

  // Create drawing mode buttons:
  objectButton = createButton('Objek/ Object');
  objectButton.position(buttonX, startY);
  objectButton.style('background-color', '#ADD8E6'); // light blue
  objectButton.mousePressed(() => {
    disableAllModes();
    arrow1.drawingMode = true;
    arrow1.finished = false;
    arrow1.clickCount = 0;
    arrow1.start = null;
    arrow1.end = null;
    setDrawingCursor(true); // Use the pencil cursor
  });

  imageButton = createButton('Imej/ Image');
  imageButton.position(buttonX, startY + buttonSpacing);
  imageButton.style('background-color', '#F08080'); // light red
  imageButton.mousePressed(() => {
    disableAllModes();
    arrow2.drawingMode = true;
    arrow2.finished = false;
    arrow2.clickCount = 0;
    arrow2.start = null;
    arrow2.end = null;
    setDrawingCursor(true); // Use the pencil cursor
  });

  line1Button = createButton('Garis TiPu');
  line1Button.position(buttonX, startY + 2 * buttonSpacing);
  line1Button.style('background-color', '#A0FFA0'); 
  line1Button.mousePressed(() => {
    disableAllModes();
    line1.drawingMode = true;
    line1.finished = false;
    line1.clickCount = 0;
    line1.start = null;
    line1.end = null;
    setDrawingCursor(true); // Use the pencil cursor
  });

  line2Button = createButton('Garis TiSe');
  line2Button.position(buttonX, startY + 3 * buttonSpacing);
  line2Button.style('background-color', '#FFD580');
  line2Button.mousePressed(() => {
    disableAllModes();
    line2.drawingMode = true;
    line2.finished = false;
    line2.clickCount = 0;
    line2.start = null;
    line2.end = null;
    setDrawingCursor(true); // Use the pencil cursor
  });

  line3Button = createButton('Garis F');
  line3Button.position(buttonX, startY + 4 * buttonSpacing);
  line3Button.style('background-color', '#E6CCFF');
  line3Button.mousePressed(() => {
    disableAllModes();
    line3.drawingMode = true;
    line3.finished = false;
    line3.clickCount = 0;
    line3.start = null;
    line3.end = null;
    setDrawingCursor(true); // Use the pencil cursor
  });

  stopDrawingButton = createButton('Berhenti melukis/ Stop drawing');
  stopDrawingButton.position(buttonX, startY + 5 * buttonSpacing);
  stopDrawingButton.style('background-color', '#CCCCCC');
  stopDrawingButton.mousePressed(() => {
    disableAllModes();
  });

  // Create background navigation buttons:
  leftButton = createButton('◀');
  leftButton.position(buttonX, startY + 6 * buttonSpacing);
  leftButton.mousePressed(() => {
    bgIndex = (bgIndex - 1 + bgImages.length) % bgImages.length;
  });

  rightButton = createButton('▶');
  rightButton.position(buttonX, startY + 7 * buttonSpacing);
  rightButton.mousePressed(() => {
    bgIndex = (bgIndex + 1) % bgImages.length;
  });
}

/*******************************************
 * Helper to toggle the pencil cursor
 *******************************************/
function setDrawingCursor(enabled) {
  if (enabled) {
    canvas.addClass('drawing-cursor');
  } else {
    canvas.removeClass('drawing-cursor');
  }
}

/*******************************************
 * disableAllModes()
 *******************************************/
function disableAllModes() {
  arrow1.drawingMode = false;
  arrow2.drawingMode = false;
  line1.drawingMode = false;
  line2.drawingMode = false;
  line3.drawingMode = false;

  // Turn off pencil cursor
  setDrawingCursor(false);
}

/*******************************************
 * draw()
 *******************************************/
function draw() {
  background(255);
  
  // Draw background at 2/3 of canvas, centered.
  let bgW = width / 1.5;
  let bgH = height / 1.5;
  let bgX = (width - bgW) / 2;
  let bgY = (height - bgH) / 2;
  image(bgImages[bgIndex], bgX, bgY, bgW, bgH);
  
  // Update simulation endpoints:
  let angle1 = atan2(points.red.pos.y - points.green.pos.y, points.red.pos.x - points.green.pos.x);
  points.red.pos = p5.Vector.add(points.green.pos, createVector(firstArmLength * cos(angle1), firstArmLength * sin(angle1)));
  
  let angle2 = atan2(points.orange.pos.y - points.red.pos.y, points.orange.pos.x - points.red.pos.x);
  points.orange.pos = p5.Vector.add(points.red.pos, createVector(secondArmLength * cos(angle2), secondArmLength * sin(angle2)));
  
  points.yellow.pos = p5.Vector.lerp(points.red.pos, points.orange.pos, t3);
  
  let angle3 = atan2(points.purple.pos.y - points.yellow.pos.y, points.purple.pos.x - points.yellow.pos.x);
  points.purple.pos = p5.Vector.add(points.yellow.pos, createVector(thirdArmLength * cos(angle3), thirdArmLength * sin(angle3)));
  
  // Draw simulation rulers:
  drawRuler(img1, points.green.pos, firstArmLength, angle1, 38);
  drawRuler(img2, points.red.pos, secondArmLength, angle2, 25);
  drawRuler(img3, points.yellow.pos, thirdArmLength, angle3, 30);
  
  drawDots();
  
  // Draw arrows with arrowheads if they exist
  if (arrow1.start && arrow1.end) {
    drawArrow(arrow1.start, p5.Vector.sub(arrow1.end, arrow1.start), arrow1.col);
  }
  if (arrow2.start && arrow2.end) {
    drawArrow(arrow2.start, p5.Vector.sub(arrow2.end, arrow2.start), arrow2.col);
  }
  
  // Draw lines (without arrowheads):
  if (line1.start && line1.end) {
    drawLine(line1.start, p5.Vector.sub(line1.end, line1.start), line1.col);
  }
  if (line2.start && line2.end) {
    drawLine(line2.start, p5.Vector.sub(line2.end, line2.start), line2.col);
  }
  if (line3.start && line3.end) {
    drawLine(line3.start, p5.Vector.sub(line3.end, line3.start), line3.col);
  }
}

/*******************************************
 * drawRuler()
 *******************************************/
function drawRuler(img, start, length, angle, thickness) {
  push();
  translate(start.x, start.y);
  rotate(angle);
  imageMode(CENTER);
  tint(255, 220); // slight transparency
  image(img, length / 2, 0, length, thickness);
  noTint();
  pop();
}

/*******************************************
 * drawDots()
 *******************************************/
function drawDots() {
  drawCircle(points.green.pos, 'green');
  drawCircle(points.red.pos, 'red');
  drawCircle(points.orange.pos, 'orange');
  drawCircle(points.yellow.pos, 'yellow');
  drawCircle(points.purple.pos, 'purple');
}

function drawCircle(pos, col) {
  fill(col);
  noStroke();
  ellipse(pos.x, pos.y, 10, 10);
}

/*******************************************
 * drawArrow()
 * Draws a line with an arrowhead.
 *******************************************/
function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  line(base.x, base.y, base.x + vec.x, base.y + vec.y);
  let arrowSize = 10;
  let ang = atan2(vec.y, vec.x);
  push();
  translate(base.x + vec.x, base.y + vec.y);
  rotate(ang);
  line(0, 0, -arrowSize * cos(PI/6), -arrowSize * sin(PI/6));
  line(0, 0, -arrowSize * cos(-PI/6), -arrowSize * sin(-PI/6));
  pop();
  pop();
}

/*******************************************
 * drawLine()
 * Draws a simple line (no arrowhead).
 *******************************************/
function drawLine(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  line(base.x, base.y, base.x + vec.x, base.y + vec.y);
  pop();
}

/*******************************************
 * distToSegment()
 *******************************************/
function distToSegment(p, a, b) {
  let ab = p5.Vector.sub(b, a);
  let ap = p5.Vector.sub(p, a);
  let t = constrain(ap.dot(ab) / ab.dot(ab), 0, 1);
  let closest = p5.Vector.add(a, ab.mult(t));
  return p5.Vector.dist(p, closest);
}

/*******************************************
 * mousePressed()
 *******************************************/
function mousePressed() {
  // Check drawing modes first:
  if (arrow1.drawingMode) {
    handleLineOrArrowPress(arrow1, true);
    return;
  }
  if (arrow2.drawingMode) {
    handleLineOrArrowPress(arrow2, true);
    return;
  }
  if (line1.drawingMode) {
    handleLineOrArrowPress(line1, false);
    return;
  }
  if (line2.drawingMode) {
    handleLineOrArrowPress(line2, false);
    return;
  }
  if (line3.drawingMode) {
    handleLineOrArrowPress(line3, false);
    return;
  }
  
  // Otherwise, simulation dragging:
  for (let key in points) {
    if (points[key].dragging !== undefined && dist(mouseX, mouseY, points[key].pos.x, points[key].pos.y) < 10) {
      points[key].dragging = true;
      return;
    }
  }
  let mouseVec = createVector(mouseX, mouseY);
  if (distToSegment(mouseVec, points.green.pos, points.red.pos) < 10) {
    draggingWhole1 = true;
    return;
  }
  if (distToSegment(mouseVec, points.red.pos, points.orange.pos) < 10) {
    draggingWhole2 = true;
    return;
  }
  if (distToSegment(mouseVec, points.yellow.pos, points.purple.pos) < 10) {
    draggingWhole3 = true;
    return;
  }
  if (dist(mouseX, mouseY, points.yellow.pos.x, points.yellow.pos.y) < 10) {
    points.yellow.dragging = true;
  }
}

/*******************************************
 * mouseDragged()
 *******************************************/
function mouseDragged() {
  // For drawing objects:
  if (arrow1.drawingMode && arrow1.start !== null) {
    handleLineOrArrowDrag(arrow1);
    return;
  }
  if (arrow2.drawingMode && arrow2.start !== null) {
    handleLineOrArrowDrag(arrow2);
    return;
  }
  if (line1.drawingMode && line1.start !== null) {
    handleLineOrArrowDrag(line1);
    return;
  }
  if (line2.drawingMode && line2.start !== null) {
    handleLineOrArrowDrag(line2);
    return;
  }
  if (line3.drawingMode && line3.start !== null) {
    handleLineOrArrowDrag(line3);
    return;
  }
  
  // Otherwise, simulation dragging:
  let dx = mouseX - pmouseX;
  let dy = mouseY - pmouseY;
  if (draggingWhole1) {
    points.green.pos.add(dx, dy);
    points.red.pos.add(dx, dy);
  } else if (draggingWhole2) {
    points.red.pos.add(dx, dy);
    points.orange.pos.add(dx, dy);
  } else if (draggingWhole3) {
    points.yellow.pos.add(dx, dy);
    points.purple.pos.add(dx, dy);
  } else {
    for (let key in points) {
      if (points[key].dragging) {
        if (key === 'yellow') {
          let dx = points.orange.pos.x - points.red.pos.x;
          let dy = points.orange.pos.y - points.red.pos.y;
          let mag2 = dx * dx + dy * dy;
          let t = ((mouseX - points.red.pos.x) * dx + (mouseY - points.red.pos.y) * dy) / mag2;
          t3 = constrain(t, 0, 1);
        } else {
          points[key].pos.set(mouseX, mouseY);
        }
      }
    }
  }
}

/*******************************************
 * mouseReleased()
 *******************************************/
function mouseReleased() {
  // Reset simulation dragging flags:
  for (let key in points) {
    if (points[key].dragging !== undefined) {
      points[key].dragging = false;
    }
  }
  draggingWhole1 = false;
  draggingWhole2 = false;
  draggingWhole3 = false;
  
  // Reset drawing object dragging flags:
  arrow1.draggingStart = false;
  arrow1.draggingEnd = false;
  arrow1.draggingWhole = false;
  
  arrow2.draggingStart = false;
  arrow2.draggingEnd = false;
  arrow2.draggingWhole = false;
  
  line1.draggingStart = false;
  line1.draggingEnd = false;
  line1.draggingWhole = false;
  
  line2.draggingStart = false;
  line2.draggingEnd = false;
  line2.draggingWhole = false;
  
  line3.draggingStart = false;
  line3.draggingEnd = false;
  line3.draggingWhole = false;
}

/*******************************************
 * handleLineOrArrowPress(obj, isArrow)
 * isArrow = true for arrows (draw with arrowhead), false for lines.
 * Implements the 3-click behavior:
 *   - 1st click: ignored (to start drawing, do nothing)
 *   - 2nd click: sets the start point
 *   - 3rd click: sets the endpoint and finishes drawing
 *******************************************/
function handleLineOrArrowPress(obj, isArrow) {
  if (obj.clickCount === undefined) {
    obj.clickCount = 0;
  }
  
  obj.clickCount++;
  
  if (obj.clickCount === 1) {
    // First click: do nothing.
    return;
  } else if (obj.clickCount === 2) {
    // Second click: set the start point.
    obj.start = createVector(mouseX, mouseY);
    obj.end = createVector(mouseX, mouseY);
    return;
  } else if (obj.clickCount === 3) {
    // Third click: set the endpoint and finish drawing.
    obj.end = createVector(mouseX, mouseY);
    obj.finished = true;
    obj.clickCount = 3; // Remain at 3 to indicate finished
    return;
  }
  
  // If already finished, enable dragging if clicked near endpoints or line.
  let dStart = dist(mouseX, mouseY, obj.start.x, obj.start.y);
  let dEnd = dist(mouseX, mouseY, obj.end.x, obj.end.y);
  let dLine = (obj.start && obj.end) ? distToSegment(createVector(mouseX, mouseY), obj.start, obj.end) : 1000;
  if (dStart < 10) {
    obj.draggingStart = true;
  } else if (dEnd < 10) {
    obj.draggingEnd = true;
  } else if (dLine < 10) {
    obj.draggingWhole = true;
  }
}

/*******************************************
 * handleLineOrArrowDrag(obj)
 *******************************************/
function handleLineOrArrowDrag(obj) {
  if (obj.draggingStart) {
    obj.start.set(mouseX, mouseY);
  } else if (obj.draggingEnd) {
    obj.end.set(mouseX, mouseY);
  } else if (obj.draggingWhole) {
    let dx = mouseX - pmouseX;
    let dy = mouseY - pmouseY;
    obj.start.add(dx, dy);
    obj.end.add(dx, dy);
  } else {
    // If not finished, continue updating the end point while dragging
    if (!obj.finished) {
      obj.end.set(mouseX, mouseY);
    }
  }
}

/*******************************************
 * distToSegment()
 *******************************************/
function distToSegment(p, a, b) {
  let ab = p5.Vector.sub(b, a);
  let ap = p5.Vector.sub(p, a);
  let t = constrain(ap.dot(ab) / ab.dot(ab), 0, 1);
  let closest = p5.Vector.add(a, ab.mult(t));
  return p5.Vector.dist(p, closest);
}
