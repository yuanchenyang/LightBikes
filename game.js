
var stage = new createjs.Stage("main_canvas");
var Hexes = [];

var p1 = null;
var p2 = null;
var p3 = null;
var p4 = null;

function Player(_x, _y) {
    this.x = _x;
    this.y = _y;
}

Player.prototype.getCurrentHex = function() {
    return Hexes[this.y][this.x];
}

function setAnimationInterval(interval) {

    createjs.Ticker.addEventListener('tick', function() {
        console.log("Tick");

        stage.update();
    });

    createjs.Ticker.setInterval(interval);
}


/* radius passed in is the radius of the hex polygon */
function drawGrid(radius) {

    var id = 0;
    var side_offset = 2;

    var y = side_offset;

    var h_rad = 0.5*radius;
    var hex_halfheight = Math.sqrt(radius*radius - h_rad*h_rad);

    while (y < (stage.canvas.height - 2*radius)) {

        var x = side_offset
        var idx = Hexes.push([]) - 1;

        //even rows are drawn inwards
        if (idx % 2 === 1) {
            x += 1.5*radius;
        }

        while (x < (stage.canvas.width - 2*radius)) {
            var hex = drawHex(x + radius, y + radius, radius, 1);
            hex.myprops.id = id;
            id++;
            Hexes[idx].push(hex);

            x += 3*radius;
        }

        y += hex_halfheight;
    }
}

function drawHex(x, y, radius, thickness) {

    var hex = new createjs.Shape();
    hex.graphics
        .setStrokeStyle(thickness)
        .beginStroke("#000")
        .drawPolyStar(0, 0, radius, 6, 0, 0);
    hex.x = x;
    hex.y = y;
    stage.addChild(hex);

    hex.myprops = {};
    hex.myprops.radius = radius;
    hex.myprops.thickness = thickness;

    return hex;
}

function changeHexColor(hex, color) {
    if (!(hex.myprops && hex.myprops.radius && hex.myprops.thickness)) {
        return;
    }
    var r = hex.myprops.radius;
    hex.graphics.clear()
       .beginFill(color)
       .drawPolyStar(0, 0, r, 6, 0, 0);

    return hex;
}

/* each player starts out at one corner of the board
 * and has a name so we know who they are. if there
 * are fewer than 4 players for a round, we just pass
 * in null for that player */
function placePlayers(a, b, c, d) {

    if (a) {
        p1 = new Player(0, 0);
        p1.name = a;
    }

    if (b) {
        p2 = new Player(0, Hexes.length-1);
        p2.name = b;
    }

    if (c) {
        p3 = new Player(Hexes[0].length-1, 0);
        p3.name = c;
    }

    if (d) {
        p4 = new Player(Hexes[Hexes.length-1].length-1, Hexes.length-1);
        p4.name = d;
    }
}

function init() {
    setAnimationInterval(100);
    drawGrid(15);
    placePlayers("Alpha", "Beta", "Gamma", "Delta");
}

init();
