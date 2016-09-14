G.Builder = (function (Vectors, range, UI, GamePlay, Math, Width, Height, wrap) {
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
        return this.stage.createRectangle(filled).setColor(UI.WHITE).setPosition(xFn, yFn).setWidth(widthFn)
            .setHeight(heightFn).setLineWidth(wrap(2));
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
        wallLeft.justWidthScale = true;

        var wallRight = this.__createWall(rightX, Height.HALF, getWidth_tile, Height.FULL, true);
        wallRight.justWidthScale = true;

        var wallTop = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, GamePlay.TILE / 2), getWidth_full,
            Height.get(UI.HEIGHT, GamePlay.TILE), true);
        wallTop.justHeightScale = true;

        var wallBottom = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, UI.HEIGHT - GamePlay.TILE / 2),
            getWidth_full, Height.get(UI.HEIGHT, GamePlay.TILE));
        wallBottom.justHeightScale = true;

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

    Builder.prototype.createPlayer = function () {
        var player = this.__createPlayer(UI.WHITE).setPosition(Width.HALF, Height.get(6, 5));

        if (UI.PLAYER_SHADOW)
            player.shadows = [
                this.__createPlayer('grey', 1, 2),
                this.__createPlayer('grey', 0.8, 2),
                this.__createPlayer('grey', 0.6, 2),
                this.__createPlayer('grey', 0.4, 2),
                this.__createPlayer('grey', 0.2, 2)
            ];

        player.lastX = player.x;
        player.lastY = player.y;
        player.forceX = 0;
        player.forceY = 0;

        return player;
    };

    Builder.prototype.__createFrameOfPlayer = function (player, y, lineWidth, alpha) {
        var dep = [player];
        return this.stage.createRectangle(false)
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
    };

    Builder.prototype.reset = function (player) {
        player.y = this.currentHeight - 4 * this.tileHeight;

        var diff = player.y - player.lastY;
        var distance = Math.floor(diff / 4);
        var yPos1 = player.lastY + distance;
        var yPos2 = yPos1 + distance;
        var yPos3 = yPos2 + distance;

        var frame1 = this.__createFrameOfPlayer(player, yPos1, 2, 0.5);
        var frame2 = this.__createFrameOfPlayer(player, yPos2, 3, 0.6);
        var frame3 = this.__createFrameOfPlayer(player, yPos3, 4, 0.7);

        this.timer.doLater(function () {
            frame1.remove();
        }, 2);
        this.timer.doLater(function () {
            frame2.remove();
        }, 4);
        this.timer.doLater(function () {
            frame3.remove();
        }, 6);

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
        });
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
        });
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
        });
    };

    Builder.prototype.createBall = function (point, direction) {

        //noinspection JSUnusedLocalSymbols
        function tileWidth(width, height) {
            return Math.floor(height / UI.HEIGHT * GamePlay.TILE);
        }

        var ball = this.__createBall(UI.WHITE)
            .setPosition(function (width, height) {
                var one = height / UI.HEIGHT;
                return Math.floor(width / 2 - UI.WIDTH / 2 * one + one * point.x);
            }, Height.get(UI.HEIGHT, point.y));

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

    return Builder;
})(H5.Vectors, H5.range, G.UI, G.GamePlay, Math, H5.Width, H5.Height, H5.wrap);