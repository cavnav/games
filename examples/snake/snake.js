/*
Игра Змейка. Тестировалась под Chrome.
Управление - с помощью стрелок клавиатуры.
Если змейка замкнется на себе или столкнется со стенками, то игра закончится.
Каждую минуту скорость движения змейки увеличивается.
*/
var Game = {};

Game.init = function(){
    var t = this;
    t.canvas = document.getElementsByTagName('canvas');
    t.paint = t.canvas[0].getContext('2d');
    t.canvasWidth = 400;
    t.canvasHeight = 400;
    
    // очищаем поле
    t.paint.fillStyle = "#FFFFFF";
    t.paint.fillRect(0, 0, t.canvasWidth, t.canvasHeight);
    t.paint.fillStyle = "#000000";
    
    t.snake = {
        startLength:    3, // начальная длина        
        width:          10, // ширина одной части тела
        height:         10, // длина одной части тела
        head_x:         30, // координата Х головы
        head_y:         40, // координата У головы
        tail_x:         30, // координата Х хвоста
        tail_y:         40, // координата У хвоста
        direction:      39, // начальное направление движения - вправо
        isElongation:   false // удлинение змейки происходит после съедания пищи при последующем движении
    };

    // размерность матрицы, хранящей координаты перемещения головы змейки
    t.rangeX = t.canvasWidth / t.snake.width;
    t.rangeY = t.canvasHeight / t.snake.height; 
  
    // координата пищи
    t.food = {X: 0, Y: 0};
    
    // подготовка матрицы, хранящей координаты перемещения головы змейки
    t.field = [];
    for (var j = 0; j < t.rangeX; j++ ){
        t.field[j] = [];
        for (var jj = 0; jj < t.rangeY; jj++ ){
            t.field[j][jj] = [];
        }
    }
    t.speed = 110; // начальная скорость змейки 
    t.clearSpeed; // контроллер скорости змейки
    t.timeIntervalForSpeed = 60000; // 1 мин
    t.clearTimeInterval; // контроллер ускорения змейки
    t.pointsStep = 10; // шаг начисления очков
    t.stopGame = false; // флаг остановки игры
    
    // размещение пищи
    //---------------------------------------------------------------------------
    t.setFood = function(){
        t.food.X = Math.floor(Math.random() * t.rangeX);
        t.food.Y = Math.floor(Math.random() * t.rangeY);        
    
        while (t.field[t.food.X][t.food.Y].length) { 
            t.food.X = Math.floor(Math.random() * t.rangeX);
            t.food.Y = Math.floor(Math.random() * t.rangeY);
        }
        
        t.food.X *= t.snake.width;
        t.food.Y *= t.snake.height;
        t.paintFood(t.food.X, t.food.Y);
    };
    
    // отображение пищи
    //---------------------------------------------------------------------------    
    t.paintFood = function(p_X, p_Y){
        t.paint.fillStyle="#FF0000";
        t.paint.fillRect(p_X, p_Y, t.snake.width, t.snake.height);    
    };
    
    // перемещение змейки
    //---------------------------------------------------------------------------    
    t.snake.move = function(p_X, p_Y){
        var Snake = this;
        
        // рисуем новое положение головы
        t.paint.fillStyle="#000000";
        t.paint.fillRect(p_X, p_Y, Snake.width, Snake.height);
    
        // стираем кончик хвоста, если нет удлинения
        if (!Snake.isElongation){
            t.paint.fillStyle="#FFFFFF";
            t.paint.fillRect(Snake.tail_x, Snake.tail_y, Snake.width, Snake.height);
            
            var nextSegment = t.field.getNextSegment(Snake.tail_x, Snake.tail_y);
            Snake.tail_x = nextSegment[0]; // X
            Snake.tail_y = nextSegment[1]; // Y
        }
        
        // съедание пищи
        Snake.isElongation = false;
        if (p_X == t.food.X && p_Y == t.food.Y) {
            // удлинение змейки
            Snake.isElongation = true;

            // выводим очки
            t.score();
            
            // размещаем новую пищу
            t.setFood();
        }
    };
    
    // проверка возможности двигаться в заданном направлении
    //---------------------------------------------------------------------------
    t.snake.checkDirection = function(p_direction){
        var Snake = this;
        // ползла влево и не поворачивает вправо
        if (Snake.direction == 37 && p_direction != 39) {
            return true;
        }
        // ползла вверх и не поворачивает вниз    
        if (Snake.direction == 38 && p_direction != 40) {
            return true;
        }
        // ползла вправо и не поворачивает влево    
        if (Snake.direction == 39 && p_direction != 37) {
            return true;
        }
        // ползла вниз и не поворачивает вверх
        if (Snake.direction == 40 && p_direction != 38) {
            return true;
        }
        return false;
    };

    // запоминаем координаты следующей части тела
    //---------------------------------------------------------------------------    
    t.field.setNextSegment= function(p_nextSegment){
        var Field = this;
        var Snake = t.snake;
        var col = Snake.head_x / Snake.width;
        var row = Snake.head_y / Snake.height;
        
        // если нет препятствий, то запомнить новые координаты головы
        if (!t.collision(p_nextSegment)){
            Field[col][row] = p_nextSegment;
        }
    };
    
    // запрашиваем координаты следующей части тела. 
    // удаляем полученные координаты.
    //---------------------------------------------------------------------------
    t.field.getNextSegment = function(p_X, p_Y){
        var Field = this;
        var col = p_X / t.snake.width;
        var row = p_Y / t.snake.height;
        var nextSegment = Field[col][row];
        
        Field[col][row] = [];
        return nextSegment;
    };

    // проверки столкновения змейки со стенкой и замыкания на самой себе.
    // Если проверки пройдены, то голове змейки назначаются новые координаты.
    //---------------------------------------------------------------------------
    t.collision = function(p_nextSegment){
        var Field = this.field;
        var Snake = t.snake;
        var col = p_nextSegment[0] / Snake.width;
        var row = p_nextSegment[1] / Snake.height;
        var X = p_nextSegment[0];
        var Y = p_nextSegment[1];
        
        if (!Field[col] || !Field[col][row] || // столкнулась со стенкой
            Field[col][row].length) { // замкнулась на самой себе

            t.gameOver();

            return true;
        }
        
        Snake.head_x = X;
        Snake.head_y = Y;
        
        return false;
    };
    t.speedTimer = function(){
        if (t.speed){
            t.speed -= 10;
        }
        t.clearTimeInterval = setTimeout(function() {t.speedTimer();}, t.timeIntervalForSpeed);
    };
    t.score = function(p_init){
        if (p_init) {
            t.record.text(localStorage['record'] || 0 );
            t.points.text(0);
            return;
        }
        t.points.text(+t.points.text() + 10);
    };
    t.gameOver = function(){
        t.stopGame = true;
        t.newRecord();
        t.paint.fillStyle = "#F78181";
        t.paint.font = "40px Arial";
        t.paint.fillText("Игра окончена", 65, t.canvasHeight / 2 - 20);        
    };
    t.newRecord = function(){
        if ( +t.record.text() < +t.points.text() ){
            t.record.text(t.points.text());
            localStorage['record'] =  t.record.text();
        }
    };
    document.onkeydown = function(event){  
        if (t.stopGame){
            return;
        } 
        var Snake = t.snake;
        var last_head_x = Snake.head_x;
        var last_head_y = Snake.head_y;
        
        // если нельзя ползти в заданном направлении
        if (!Snake.checkDirection(event.which)){
            return;
        }
        
        //2. ползти вправо, вниз, влево, вверх.
        switch (event.which) {
            // влево
            case 37:
                t.field.setNextSegment([Snake.head_x - Snake.width, Snake.head_y]);
                break;     
                
            // вверх        
            case 38:
                t.field.setNextSegment([Snake.head_x, Snake.head_y - Snake.height]);
                break;                  

            // вправо
            case 39:
                t.field.setNextSegment([Snake.head_x + Snake.width, Snake.head_y]);
                break;
            // вниз
            case 40:
                t.field.setNextSegment([Snake.head_x, Snake.head_y + Snake.height]);
                break;
        }
        if (last_head_x != Snake.head_x || last_head_y != Snake.head_y) {
            Snake.direction = event.which;
            Snake.move(Snake.head_x, Snake.head_y);
        }
    };
    
    // вывести рекорд и обнулить текущие очки
    t.score("init");
    
    // первая пища
    t.setFood();
    
    // вначале змейка вырастает до заданного размера
    for (var j = 1; j < t.snake.startLength; j++){
        t.snake.isElongation = true;
        document.onkeydown({which: this.snake.direction});
    }
};

Game.start = function() {
    // отменяем предыдущие запуски при рестарте игры
    if (this.clearSpeed){
        clearTimeout(this.clearSpeed);// перемещение змейки
    }
    if (this.clearTimeInterval){
        clearTimeout(this.clearTimeInterval); // ускорение змейки
    }
    
    this.step();
    this.speedTimer();
};

Game.step = function() {
    var t = this;
    
    if (!t.stopGame){
        t.custom_step();
        t.clearSpeed = setTimeout(
            function() {
                t.step();
            },
            t.speed
        );
    }
};
Game.custom_step = function() {
    document.onkeydown({which: this.snake.direction});
};