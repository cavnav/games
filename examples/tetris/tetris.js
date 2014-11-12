/*
Игра тетрис. Тестировалась под Chrome.

-Без отображения последующей фигуры.
-Управление - с помощью нажатия мышью клавиш на экране и с помощью стрелок клавиатуры.
-Очки начисляются за каждую новую фигурку.

*/
Game.custom_init = function() {
    var t = this;
    $("#restart").click(function() {
        t.restartGame();
    });
    this.immob = 0;
    this.record = $('.score #record');
    this.record.text( localStorage['record'] || 0 );
    this.points = $('.score #points');
    this.points.text(10);
    this.oldX = 0;
    this.oldY = 0;
    this.startXfigure = 3;
    this.figure = {
        num: 6,
        X: this.startXfigure,
        Y: 0,
        oldX: 0,
        oldY: 0,
        projectY: 0,
        oldProjectY: 0
    }
    this.flagRotation = false;
    this.rotation = 0;
    
    // матрица фигурок и их возможные положения. Виды: прямая, квадрат, буква Т, ступенька левая, ступенька правая, буква Г, зеркальная буква Г.
    this.figures = [
    // прямая
    [
    // возможные положения
    [
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
        [
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0]
        ],
        null],
        
    // квадрат
    [
    // возможные положения
    [
        [1, 1, 0, 0],
        [1, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
    null],
    
    // ступенька левая
    [
    // возможные положения
    [
        [0, 1, 0, 0],
        [1, 1, 0, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0]
    ],
        [
            [1, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        null],
        
    // ступенька правая
    [
    // возможные положения
    [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0]
    ],
        [
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        null],
        
    // зеркальная буква Г 
    [
    // возможные положения
    [
        [1, 1, 1, 0],
        [1, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
        [
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 0, 1, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        null],
        
    // буква Г
    [
    // возможные положения
    [
        [1, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [1, 1, 0, 0],
            [1, 0, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        null],
        
    // буква Т
    [
    // возможные положения
    [
        [1, 1, 1, 0],
        [0, 1, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ],
        [
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0]
        ],
        [
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0]

        ],
        [
            [1, 0, 0, 0],
            [1, 1, 0, 0],
            [1, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        null]]
}
// Отрисовка фигурки
//------------------------------------------------------------------------------
Game.paintFigure = function(v_X, v_Y, color) {
    var
    row,
    rowIndex = 0,
        col = 0

    while (rowIndex < 4) {
        row = this.figures[this.figure.num][this.rotation][rowIndex];
        while (col < 4) {
            if (row[col]) {
                this.set_block(v_Y + rowIndex, v_X + col, color);
            }
            col++;
        }
        col = 0;
        rowIndex++;
    }
    
    // верхняя черта в стакане
    this.ctx.moveTo(0, 4 * this.blockSize - 1);
    this.ctx.lineTo(this.width * this.blockSize, 4 * this.blockSize - 1);
    this.ctx.stroke(); 
}
// Перед отрисовкой фигурки
//------------------------------------------------------------------------------
Game.prepaintFigure = function(v_X, v_Y, v_projectY, v_color) {
    color = v_color || this.mainColor;
    // стираем падающую фигурку
    this.paintFigure(this.figure.oldX, this.figure.oldY, this.fieldColor);
    // стираем проекцию фигурки
    this.paintFigure(this.figure.oldX, this.figure.oldProjectY, this.fieldColor);
    if (this.flagRotation) {
        this.flagRotation = false;
        this.turnFigure("clockwise");
    }

    // рисуем проекцию фигурки
    this.paintFigure(v_X, v_projectY, this.projectColor);
    // рисуем фигурку
    this.paintFigure(v_X, v_Y, color);

    this.figure.oldX = v_X;
    this.figure.oldY = v_Y;
    this.figure.oldProjectY = v_projectY;
}
// Остановка фигурки
//------------------------------------------------------------------------------
Game.immobilizFigure = function() {
    var
    rowIndex,
    col;
    //закрепить фигурку
    rowIndex = 0;
    while (rowIndex < 4) {
        row = this.figures[this.figure.num][this.rotation][rowIndex];
        col = 0;
        while (col < 4) {
            if (row[col]) {
                this.glass[this.figure.Y + rowIndex][this.figure.X + col] = 1;
            }
            col++;
        }
        rowIndex++;
    }
    //сгорание сплошных линий
    this.combustionRow();
}
// Новая игра
//------------------------------------------------------------------------------
Game.restartGame = function() {
    this.initGlass();
    this.clearGlass();
    this.newFigure();
    this.key = "none";
    this.flagStop = false;
    this.record.text( localStorage['record'] || 0 );
    this.points.text(0);
}
// Создание матрицы стакана
//------------------------------------------------------------------------------
Game.initGlass = function() {
    for (var ii = 0; ii < this.height; ii++) {
        for (var jj = 0; jj < this.width; jj++) {
            this.glass[ii][jj] = 0;
        }
    }
}
// Создание новой фигурки
//------------------------------------------------------------------------------
Game.newFigure = function() {
    this.figure.num = Math.floor(Math.random() * 7);
    this.figure.oldX = 0;
    this.figure.oldY = 0;
    this.figure.oldProjectY = 0;
    this.figure.projectY = 0;
    this.figure.X = this.startXfigure;
    this.figure.Y = 0;
    numRotation = this.figures[this.figure.num].length - 1;
    this.turnFigure(Math.floor(Math.random() * numRotation));
    
    //очки
    this.points.text( +this.points.text() + 10 );
}
// Стирание содержимого стакана
//------------------------------------------------------------------------------
Game.clearGlass = function() {
    var
    row,
    col;

    row = 0;
    while (row < this.height) {
        col = 0;
        while (col < this.width) {
            this.set_block(row, col, this.fieldColor);
            col++;
        }
        row++;
    }
}
// Удаление сплошной линии из стакана
//------------------------------------------------------------------------------
Game.deleteSolidLine = function(v_Y) {
    var
    row = v_Y,
        col;

    //(снизу - вверх)
    while (row > 0) {
        col = 0;
        while (col < this.width) {
            this.glass[row][col] = this.glass[row - 1][col];
            col++;
        }
        row--;
    }
    col = 0;
    while (col < this.width) {
        this.glass[0][col] = 0;
        col++;
    }
    this.figure.Y++;
}
// Сгорание сплошной линии
//------------------------------------------------------------------------------
Game.combustionRow = function() {
    var
    row,
    col,
    figure = this.figures[this.figure.num][this.rotation],
        lowestPoint_Y,
        flag,
        color;

    //найти нижнюю точку фигурки (снизу - вверх)
    row = 3;
    while (row >= 0) {
        col = 0;
        while (col < 4) {
            if (figure[row][col]) {
                lowestPoint_Y = this.figure.Y + row;
                row = 0;
                break;
            }
            col++
        }
        row--;
    }
    //поиск сплошных линий (снизу - вверх)
    flag = false;
    row = lowestPoint_Y;
    while (row >= this.figure.Y) {
        col = 0;
        while (col < this.width) {
            if (this.glass[row][col] == 0) {
                break;
            }
            col++;
        }
        if (col == this.width) {
            flag = true;
            this.deleteSolidLine(row);
            continue;
        }
        row--;
    }
    //если хотя бы одна сплошная линия удалилась, отрисовать стакан
    if (flag) {
        row = 0;
        while (row < this.height) {
            col = 0;
            while (col < this.width) {
                color = this.fieldColor;
                if (this.glass[row][col] == 1) {
                    color = this.repaintColor;
                }
                this.set_block(row, col, color);
                col++;
            }
            row++;
        }
    }
}
// Вращение фигурки
//------------------------------------------------------------------------------
Game.turnFigure = function(v_mode) {
    switch (v_mode) {
    case "clockwise":
        if (!this.figures[this.figure.num][this.rotation + 1]) {
            this.rotation = 0;
        }
        else {
            this.rotation++;
        }
        break;
    case "cClockwise":
        if (this.rotation - 1 < 0) {
            this.rotation = this.figures[this.figure.num].length - 2;
        }
        else {
            this.rotation--;
        }
        break;
    default:
        this.rotation = v_mode;
    }
}
// Проверка на препятствия при движении и вращении фигурки
//------------------------------------------------------------------------------
Game.collision = function(v_X, v_Y) {
    //v_Y, v_X - координаты будущего положения фигурки.
    //проверяем, что ни одна точка будущей фигурки не является препятствием
    //если преграда встретилась на 4 строке, то игра заканчивается 
    var
    row,
    rowIndex = 0,
        col = 0,
        val;

    while (rowIndex < 4) {
        row = this.figures[this.figure.num][this.rotation][rowIndex];
        col = 0;
        while (col < 4) {
            if (!row[col]) {
                col++;
                continue;
            }
            val = this.glass[v_Y + rowIndex];
            if (val === undefined || val[v_X + col] === undefined || val[v_X + col] == 1) {
                return true;
            }
            col++;
        }
        rowIndex++;
    }

    return false;
}
$(document).ready(function() {
    $(".up, .right, .quicklyDown, .left").click(function() {
        Game.control()
    });
});
$(document).keydown(function(event) {
    Game.control(event);
});
// Перемещение фигуры
//------------------------------------------------------------------------------
Game.moveFigure = function(v_command){
    var 
    	downCollision;
    switch (v_command) {
	    case 38:
	    case "up":
	        flagTurn = true;
	
	        // вращаем, чтобы проверить на возможную преграду в этом случае	
	        Game.turnFigure("clockwise");
	
	        if (Game.collision(Game.figure.X, Game.figure.Y)) {
	            Game.flagRotation = false;
		        //повернуть в исходное положение
		        this.turnFigure("cClockwise");
	        }
	        else {
	            Game.flagRotation = true;
	        }
	
	        break;
	    case 39:
	    case "right":
	        if (!Game.collision(Game.figure.X + 1, Game.figure.Y)) {
	            Game.figure.X++;
	        }
	        break;
	    case "down":
	        if (!(downCollision = Game.collision(Game.figure.X, Game.figure.Y + 1))) {
	            Game.figure.Y++;
	        }
	        break;
	    case 40:
	    case "quicklyDown":
	        downCollision = true;
	        Game.immob = 1;
	        break;
	    case 37:
	    case "left":
	        if (!Game.collision(Game.figure.X - 1, Game.figure.Y)) {
	            Game.figure.X--;
	        }
	        break;
    }
    Game.key = "";
    return downCollision;
}
// Обработка управляющих сигналов
//------------------------------------------------------------------------------
Game.control = function(event) {
    var
    	downCollision = Game.moveFigure(Game.key || event.which);

    Game.figure.projectY = Game.figure.Y;
    while (1 > 0) {
        if ( !Game.collision(Game.figure.X, Game.figure.projectY + 1) ) {
            Game.figure.projectY++;
            continue;
        }
        break;
    }
    if (Game.flagRotation){
        //повернуть в исходное положение
        this.turnFigure("cClockwise");
    }
    if (downCollision) {
        this.figure.Y = this.figure.projectY;
    }

    Game.prepaintFigure(Game.figure.X, Game.figure.Y, Game.figure.projectY);    
    
    if (downCollision) {
        if (Game.figure.Y == Game.figure.projectY) {
            if (Game.figure.projectY <= 3) {
                Game.ctx.fillStyle = "#FF0000";
                Game.ctx.font = "29px Arial";
                Game.ctx.fillText("Игра окончена", 2, (Game.height / 2 - 1) * Game.blockSize);
                Game.checkRecord();
                Game.flagStop = true;
            }
            else {
				// Game.immob - флаг позволяет пользователю в течение одного тика изменить ситуацию на игровом поле.
                Game.immob++;
                if (Game.immob > 1){
                    Game.immob = 0;
                    Game.stopFigure();
                }                
            }
        }
    }
}
Game.custom_step = function() {
    Game.key = "down";
    Game.control();
}
Game.checkRecord = function(){
    if ( +this.record.text() < +this.points.text() ){
        this.record.text(this.points.text());
        localStorage['record'] = this.points.text();
    }
}
// Остановка фигуры
//------------------------------------------------------------------------------
Game.stopFigure = function(){
        //фигурка рисуется зеленым цветом
        Game.prepaintFigure(Game.figure.X, Game.figure.Y, Game.figure.projectY, Game.repaintColor);        
        Game.immobilizFigure();
        Game.newFigure();
}