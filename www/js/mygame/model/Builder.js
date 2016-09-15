G.Builder = (function (Vectors, range, UI, GamePlay, Math, Width, Height, wrap, Transition) {
    "use strict";

    function Builder(services, scenery, balls, obstacles) {
        this.stage = services.stage;
        this.timer = services.timer;

        this.scenery = scenery;
        this.balls = balls;
        this.obstacles = obstacles;

        this.resize(services.device);
    }

    Builder.prototype.resize = function (event) {
        this.magnitude = Math.floor(event.height / UI.HEIGHT * GamePlay.MAGNITUDE);
        this.currentHeight = event.height;
        this.tileHeight = Math.floor(event.height / UI.HEIGHT * GamePlay.TILE);
    };

    Builder.prototype.__createWall = function (xFn, yFn, widthFn, heightFn, filled) {
        var wall = this.stage.createRectangle(filled).setColor(UI.WHITE).setPosition(xFn, yFn).setWidth(widthFn)
            .setHeight(heightFn).setLineWidth(wrap(2));
        wall.show = false;
        wall.drawable = this.stage.createRectangle(filled).setColor(UI.WHITE).setPosition(xFn, yFn).setWidth(widthFn)
            .setHeight(heightFn).setLineWidth(wrap(2));
        return wall;
    };

    Builder.prototype.createDefaultWalls = function () {

        function getOne(height) {
            return height / UI.HEIGHT;
        }

        function leftX(width, height) {
            return Math.floor(width / 2 - (UI.WIDTH / 2 * getOne(height)));
        }

        function rightX(width, height) {
            return Math.floor(width / 2 + (UI.WIDTH / 2 * getOne(height)));
        }

        //noinspection JSUnusedLocalSymbols
        function getWidth_tile(width, height) {
            return Math.floor(getOne(height) * GamePlay.TILE);
        }

        //noinspection JSUnusedLocalSymbols
        function getWidth_full(width, height) {
            return Math.floor(getOne(height) * UI.WIDTH);
        }

        var wallLeft = this.__createWall(leftX, Height.HALF, getWidth_tile, Height.FULL, true);
        wallLeft.drawable.justWidthScale = true;

        var wallRight = this.__createWall(rightX, Height.HALF, getWidth_tile, Height.FULL, true);
        wallRight.drawable.justWidthScale = true;

        var wallTop = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, GamePlay.TILE / 2), getWidth_full,
            Height.get(UI.HEIGHT, GamePlay.TILE), true);
        wallTop.drawable.justHeightScale = true;

        var wallBottom = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, UI.HEIGHT - GamePlay.TILE / 2),
            getWidth_full, Height.get(UI.HEIGHT, GamePlay.TILE));
        wallBottom.drawable.justHeightScale = true;

        this.scenery.push(wallTop, wallLeft, wallRight);
        this.obstacles.push(wallBottom);
    };

    Builder.prototype.__createPlayer = function (color, alpha, zIndex) {
        var drawable = this.stage.createRectangle(true)
            .setColor(color)
            .setWidth(function (width, height) {
                return Math.floor(height / UI.HEIGHT * GamePlay.TILE * 12);
            })
            .setHeight(Height.get(UI.HEIGHT, GamePlay.TILE * 2));

        if (alpha)
            drawable.setAlpha(alpha);

        if (zIndex)
            drawable.setZIndex(zIndex);

        return drawable;
    };

    Builder.prototype.__createPlayerEntity = function () {
        var player = this.__createPlayer(UI.WHITE).setPosition(Width.HALF, Height.get(6, 5));
        player.show = false;
        player.drawable = this.__createPlayer(UI.WHITE).setPosition(Width.HALF, Height.get(6, 5));
        return player;
    };

    Builder.prototype.__createShadow = function (color, alpha, zIndex) {
        var shadow = this.__createPlayer(color, alpha, zIndex);
        shadow.show = false;
        shadow.drawable = this.__createPlayer(color, alpha, zIndex);
        return shadow;
    };

    Builder.prototype.createPlayer = function () {
        var player = this.__createPlayerEntity();

        if (UI.PLAYER_SHADOW)
            player.shadows = [
                this.__createShadow('grey', 1, 2),
                this.__createShadow('grey', 0.8, 2),
                this.__createShadow('grey', 0.6, 2),
                this.__createShadow('grey', 0.4, 2),
                this.__createShadow('grey', 0.2, 2)
            ];

        player.lastX = player.x;
        player.lastY = player.y;
        player.forceX = 0;
        player.forceY = 0;

        return player;
    };

    Builder.prototype.__createFrameOfPlayer = function (player, y, lineWidth, alpha) {
        var dep = [player];
        var frame = this.stage.createRectangle(false)
            .setColor(UI.WHITE)
            .setPosition(wrap(player, 'x'), wrap(y), dep)
            .setWidth(player.getWidth.bind(player), dep)
            .setHeight(player.getHeight.bind(player), dep)
            .setLineWidth(function (width, height) {
                var number = Math.floor(height / UI.HEIGHT * lineWidth);
                if (lineWidth > number)
                    return lineWidth;
                return number;
            })
            .setAlpha(alpha);

        frame.show = false;
        frame.drawable = this.stage.createRectangle(false)
            .setColor(UI.WHITE)
            .setPosition(wrap(player, 'x'), wrap(y), dep)
            .setWidth(player.getWidth.bind(player), dep)
            .setHeight(player.getHeight.bind(player), dep)
            .setLineWidth(function (width, height) {
                var number = Math.floor(height / UI.HEIGHT * lineWidth);
                if (lineWidth > number)
                    return lineWidth;
                return number;
            })
            .setAlpha(alpha);

        return frame;
    };

    Builder.prototype.reset = function (player) {
        player.y = this.currentHeight - 4 * this.tileHeight;

        var diff = player.y - player.lastY;

        var framesCount = Math.floor(diff / (UI.HEIGHT / 20));
        var frames = [];
        var distance = Math.floor(diff / (framesCount + 1));
        for (var i = 1; i <= framesCount; i++) {
            var yPos = player.y - distance * i;
            frames.push(this.__createFrameOfPlayer(player, yPos, 2, 1 - i * 0.1));
        }

        frames.reverse().forEach(function (frame, index) {
            this.timer.doLater(function () {
                frame.remove();
                frame.drawable.remove();
            }, index * 2 + 1);
        }, this);

        this.timer.doLater(function () {
            delete player.frames;
        }, frames.length * 2 + 1);

        player.frames = frames;

        player.lastX = player.x;
        player.lastY = player.y;
    };

    Builder.prototype.createStartBall = function () {
        var randomDegrees = range(50, 60);
        var angle = Vectors.toRadians(randomDegrees);
        this.createBall({
            x: 300,
            y: 100
        }, {
            x: Vectors.getX(0, this.magnitude, angle),
            y: Vectors.getY(0, this.magnitude, angle)
        }, angle);
    };

    Builder.prototype.create2ndBall = function () {
        var randomDegrees = range(0, 1) ? range(260, 265) : range(275, 280);
        var angle = Vectors.toRadians(randomDegrees);
        this.createBall({
            x: 300,
            y: 100
        }, {
            x: Vectors.getX(0, this.magnitude, angle),
            y: Vectors.getY(0, this.magnitude, angle)
        }, angle);
    };

    Builder.prototype.createRandomBall = function () {
        if (this.balls.length == 0) {
            this.createStartBall();
            return;
        }
        if (this.balls.length == 1) {
            this.create2ndBall();
            return;
        }

        var randomDegrees = range(0, 1) ? range(15, 80) : range(100, 165);
        var angle = Vectors.toRadians(randomDegrees);
        this.createBall({
            x: 300,
            y: 100
        }, {
            x: Vectors.getX(0, this.magnitude, angle),
            y: Vectors.getY(0, this.magnitude, angle)
        }, angle);
    };

    Builder.prototype.createBall = function (point, direction, angle) {

        //noinspection JSUnusedLocalSymbols
        function tileWidth(width, height) {
            return Math.floor(height / UI.HEIGHT * GamePlay.TILE);
        }

        var ball = this.__createBall(UI.WHITE)
            .setPosition(function (width, height) {
                var one = height / UI.HEIGHT;
                return Math.floor(width / 2 - UI.WIDTH / 2 * one + one * point.x);
            }, Height.get(UI.HEIGHT, point.y));

        if (UI.BALL_ROTATION && angle !== undefined)
            ball.drawable.setRotation(angle);

        if (UI.BALL_SHADOW)
            ball.shadows = [
                this.__createBall('grey', 1, 2),
                this.__createBall('grey', 0.9, 2),
                this.__createBall('grey', 0.8, 2),
                this.__createBall('grey', 0.7, 2),
                this.__createBall('grey', 0.6, 2),
                this.__createBall('grey', 0.5, 2),
                this.__createBall('grey', 0.4, 2),
                this.__createBall('grey', 0.3, 2),
                this.__createBall('grey', 0.2, 2),
                this.__createBall('grey', 0.1, 2)
            ];

        ball.lastX = ball.x;
        ball.lastY = ball.y;

        this.balls.push(ball);

        ball.forceX = direction.x;
        ball.forceY = direction.y;
    };

    Builder.prototype.__createBall = function (color, alpha, zIndex) {
        var ball = this.__createBallDrawable(color, alpha, zIndex);
        ball.show = false;
        ball.drawable = this.__createBallDrawable(color, alpha, zIndex);
        return ball;
    };

    Builder.prototype.__createBallDrawable = function (color, alpha, zIndex) {
        //noinspection JSUnusedLocalSymbols
        function tileWidth(width, height) {
            return Math.floor(height / UI.HEIGHT * GamePlay.TILE);
        }

        var ball = this.stage.createRectangle(true)
            .setColor(color)
            .setWidth(tileWidth)
            .setHeight(Height.get(UI.HEIGHT, GamePlay.TILE));

        if (zIndex !== undefined)
            ball.setZIndex(zIndex);

        if (alpha !== undefined)
            ball.setAlpha(alpha);

        return ball;
    };

    Builder.prototype.hitBall = function (ball) {
        ball.drawable.setScale(2);
        ball.drawable.scaleTo(1).setDuration(10).setSpacing(Transition.EASE_OUT_SIN);
        if (UI.BALL_ROTATION)
            ball.drawable.setRotation(Vectors.getAngle(ball.forceX, ball.forceY));
    };

    Builder.prototype.hitWall = function (wall) {
        wall.drawable.setScale(2);
        wall.drawable.scaleTo(1).setDuration(30).setSpacing(Transition.EASE_OUT_ELASTIC);
    };

    return Builder;
})(H5.Vectors, H5.range, G.UI, G.GamePlay, Math, H5.Width, H5.Height, H5.wrap, H5.Transition);