var app = angular.module('wireworld', []);

app.controller("EditorController", function () {
  this.world = {10: {3:"head", 4:"tail",5:"wire"},
             11: {2:"wire",6:"wire"},
             12: {3:"wire",4:"wire",5:"wire"}};

  this.pixelsPerCell = 10;
  this.screenX = -30;
  this.screenY = -20;
  this.canvas = $("#c")[0];
  this.ctx = this.canvas.getContext("2d");

  this.selecting = false;
  this.selectStartX = 0;
  this.selectStartY = 0;
  this.selectEndX = 0;
  this.selectEndY = 0;

  this.colors = {"head": "rgb(255,0,0)",
                "tail": "rgb(0,0,255)",
                "wire": "rgb(200,200,100)"};

  this.mode = "view";
  this.stepTime = 100;

  var that = this;

  this.drawCell = function(x, y, cellType) {
    if (cellType) {
      var startX = (x - screenX) * this.pixelsPerCell;
      var startY = (y - screenY) * this.pixelsPerCell;
      this.ctx.fillStyle = this.colors[cellType];
      this.ctx.fillRect(startX, startY, this.pixelsPerCell, this.pixelsPerCell);
    }
  }

  this.drawWorld = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (var y in this.world) {
      if (this.world.hasOwnProperty(y)) {
        for (var x in this.world[y]) {
          if (this.world[y].hasOwnProperty(x)) {
            this.drawCell(x, y, this.world[y][x]);
          }
        }
      }
    }

    if (! this.playing) {
      this.ctx.fillStyle = "rgba(100, 100, 200, 0.2)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.selecting) {
      debugger;
      ctx.strokeStyle = "rgba(100, 100, 200, 0.2)";
      var pos = getMousePos();
      ctx.strokeRect(selectStartX, selectStartY, pos.x, pos.y);
    }
  }

  this.evolve = function () {
    var newWorld = {};

    for (var y in this.world) {
      if (this.world.hasOwnProperty(y)) {
        y = parseInt(y);
        newWorld[y] = {}
        for (var x in this.world[y]) {
          if (this.world[y].hasOwnProperty(x)) {
            x = parseInt(x);
            var cell = this.world[y][x];

            if (cell == "tail") {
              newWorld[y][x] = "wire";
            } else if (cell == "head") {
              newWorld[y][x] = "tail"
            } else if (cell == "wire") {
              var count = 0;
              for (var dx = -1; dx <= 1; dx++) {
                for (var dy = -1; dy <= 1; dy++) {
                  if (this.world[y+dy] && this.world[y+dy][x+dx] == "head") {
                    count++;
                  }
                };
              };

              if (count == 1 || count == 2) {
                newWorld[y][x] = "head";
              } else {
                newWorld[y][x] = "wire";
              }
            }
          }
        }
      }
    }
    this.world = newWorld;
    this.drawWorld();
  };

  this.play = function () {
    if (!this.playing) {
      this.playing = true;
      this.evolve();
      setTimeout(this.step, this.stepTime);
    }
  };



  this.step = function () {
    if (that.playing) {
      that.evolve();
      setTimeout(that.step, that.stepTime);
    }
  };

  this.pause = function () {
    this.playing = false;
    this.drawWorld();
  };

  this.getMousePos = function (canvas, evt) {
    var rect = this.ctx.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
  }

  this.getMouseCell = function (canvas, evt) {
    var pos = this.getMousePos(canvas, evt);
    return {x: Math.floor(pos["x"] / this.pixelsPerCell + screenX),
            y: Math.floor(pos["y"] / this.pixelsPerCell + screenY)};
  }

  this.mousePressed = false;

  this.handleClick = function(e) {
    that.mousePressed = true;
    if (that.mode=="view") {
      var pos = that.getMousePos(that.canvas, e);
      that.dragX = pos.x;
      that.dragY = pos.y;
    } else if (that.mode == "draw") {
      var cell = that.getMouseCell(that.canvas, e);
      if (!that.world[cell.y]) {
        that.world[cell.y] = {};
      }
      if (!that.world[cell.y][cell.x])
        that.world[cell.y][cell.x] = "wire";
      else if (that.world[cell.y][cell.x] == "wire")
        that.world[cell.y][cell.x] = "head";
      else if (that.world[cell.y][cell.x] == "head")
        that.world[cell.y][cell.x] = "tail";
      else if (that.world[cell.y][cell.x] == "tail")
        that.world[cell.y][cell.x] = undefined;

      that.drawWorld();
    } else if (that.mode == "select") {
      var pos = getMousePos(canvas, e);
      that.selecting = true;
      selectStartX = pos.x;
      selectStartY = pos.y;
    }
    e.preventDefault();
  };

  this.handleUnclick = function(e) {
    that.mousePressed = false;
    that.selecting = false;
    that.drawWorld();
  }

  this.handleDrag = function(e) {
    var cell = that.getMouseCell(that.canvas, e);

    $("#coords").html(cell.x + "," + cell.y)
    if (that.mode=="view" && that.mousePressed) {
      var pos = that.getMousePos(that.canvas, e);
      screenX += (that.dragX - pos.x)/that.pixelsPerCell;
      screenY += (that.dragY - pos.y)/that.pixelsPerCell;
      that.dragX = pos.x;
      that.dragY = pos.y;
      that.drawWorld();
    } else if (that.mode=="draw" && that.mousePressed) {
      if (!that.world[cell.y] || !that.world[cell.y][cell.x]) {
        var count = 0;
        var x = cell.x;
        var y = cell.y;
        for (var dx = -1; dx <= 1; dx++) {
          for (var dy = -1; dy <= 1; dy++) {
            if (that.world[y+dy] && that.world[y+dy][x+dx] == "wire") {
              count++;
            }
          };
        };

        if (count == 1 || count == 0) {
          if (!that.world[cell["y"]]) {
            that.world[cell["y"]] = {};
          }
          if (!that.world[cell["y"]][cell["x"]]) {
            that.world[cell["y"]][cell["x"]] = "wire";
            that.drawWorld();
          }
        }
      }
    } else if (that.mode=="select" && that.mousePressed) {
      console.log(that.selecting);
      drawWorld();
    }
  }

  this.drawWorld();
  this.step();

  $("#c").on("mousedown", this.handleClick);
  $("#c").on("mouseup", this.handleUnclick);
  $("#c").mousemove(this.handleDrag);

  this.zoomIn = function() {
    that.pixelsPerCell *= 1.5;
    that.drawWorld();
  };

  this.zoomOut = function() {
    that.pixelsPerCell /= 1.5;
    that.drawWorld();
  };


  this.clear = function () {
    this.world = {};
    this.drawWorld();
  };

  $("#speed-controller").on("input", function () {
    var newSpeed = parseInt($("#speed-controller").val());
    that.stepTime = 150 - newSpeed*1.4;
  })

  window.onload = function() {

    var viewportWidth = window.innerWidth;
    var viewportHeight = window.innerHeight;

    var canvasWidth = viewportWidth;
    var canvasHeight = viewportHeight;
    that.canvas.setAttribute("width", canvasWidth);
    that.canvas.setAttribute("height", canvasHeight);
    that.canvas.style.top = (viewportHeight - canvasHeight) / 2;
    that.canvas.style.left = (viewportWidth - canvasWidth) / 2;
    that.canvas.visibility = 'normal';
  };

  window.onresize = function () {
    window.onload();
    that.drawWorld();
  };


  this.play();
});
