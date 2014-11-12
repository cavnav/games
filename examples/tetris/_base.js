var Game = {};

Game.init = function() {
    var t = this;
    this.flagStop = false;
    this.width = 10;
    this.height = 48;
    this.blockSize = 20;
    this.speed = 200;
    this.fieldColor = "#ffffff";
    this.mainColor = "#000000";
    this.repaintColor = "#06ea20";
    this.projectColor = "#ff7b7b";
    var html = "";
    html += '<canvas id="myCanvas" width="200" height="960" style="border:1px solid black;"></canvas>';
    html += '<div class="keys noselect"><div>';
    html += '<div class="left">&lt;</div>';
    html += '<div class="right">&gt;</div>';
    html += '<div class="up">^</div>';
    html += '<div class="quicklyDown">V</div>';
    html += '<div id="restart">Начать заново</div>';
    html += '</div></div>';
    $(html).appendTo($("body"));
    this.canvas = document.getElementById("myCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.ctx.moveTo(0, 4 * this.blockSize - 1);
    this.ctx.lineTo(this.width * this.blockSize, 4 * this.blockSize - 1);
    //	this.ctx.stroke();

    this.custom_init();
    this.key = "";
    this.glass = [];
    for (var ii = 0; ii < this.height; ii++) {
        this.glass.push([]);
        for (var jj = 0; jj < this.width; jj++) {
            this.glass[ii].push(0);
        }
    }

    $(".keys .left").bind("click", function(e) {
        t.set_key(e, "left");
    });
    $(".keys .right").bind("click", function(e) {
        t.set_key(e, "right");
    });
    $(".keys .up").bind("click", function(e) {
        t.set_key(e, "up");
    });
    $(".keys .quicklyDown").bind("click", function(e) {
        t.set_key(e, "quicklyDown");
    });
}

Game.set_key = function(e, name) {
    this.key = name;
    $(".keys div div").removeClass("A");
    $(".keys div div." + name).addClass("A");
    this.control();
    e.preventDefault();
}
Game.set_block = function(y, x, color) {
    if (color) this.ctx.fillStyle = color;
    this.ctx.fillRect(x * this.blockSize, y * this.blockSize, this.blockSize, this.blockSize);
}
Game.custom_init = function() {

}

Game.start = function() {
    this.step();
}

Game.step = function() {
    var t = this;
    $(".keys div div").removeClass("A");
    this.custom_step();
    setTimeout(

    function() {
        t.step();
    },
    this.speed);
}
Game.custom_step = function() {
    this.set_block(Math.floor(Math.random() * this.width), Math.floor(Math.random() * this.height), "#000000");
}