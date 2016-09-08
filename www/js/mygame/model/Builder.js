G.Builder = (function (Vectors, range, UI, Math, Width, Height, wrap) {
    "use strict";

    function Builder(stage, device, scenery, balls, obstacles) {
        this.stage = stage;

        this.scenery = scenery;
        this.balls = balls;
        this.obstacles = obstacles;

        this.resize(device);
    }

    Builder.prototype.resize = function (event) {
        this.magnitude = Math.floor(event.height / UI.HEIGHT * UI.MAGNITUDE);
        this.currentHeight = event.height;
        this.tileHeight = Math.floor(event.height / UI.HEIGHT * UI.TILE);
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
            return Math.floor(getOne(height) * UI.TILE);
        }

        //noinspection JSUnusedLocalSymbols
        function getWidth_full(width, height) {
            return Math.floor(getOne(height) * UI.WIDTH);
        }

        var wallLeft = this.__createWall(leftX, Height.HALF, getWidth_tile, Height.FULL, true);

        var wallRight = this.__createWall(rightX, Height.HALF, getWidth_tile, Height.FULL, true);

        var wallTop = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, UI.TILE / 2), getWidth_full,
            Height.get(UI.HEIGHT, UI.TILE), true);

        var wallBottom = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, UI.HEIGHT - UI.TILE / 2), getWidth_full,
            Height.get(UI.HEIGHT, UI.TILE));

        this.scenery.push(wallTop, wallLeft, wallRight);
        this.obstacles.push(wallBottom);
    };

    Builder.prototype.createPlayer = function () {
        var drawable = this.stage.createRectangle(true)
            .setColor(UI.WHITE)
            .setPosition(Width.HALF, Height.get(6, 5))
            .setWidth(function (width, height) {
                return Math.floor(height / UI.HEIGHT * UI.TILE * 12);
            })
            .setHeight(Height.get(UI.HEIGHT, UI.TILE * 2));

        drawable.lastX = drawable.x;
        drawable.lastY = drawable.y;
        drawable.forceX = 0;
        drawable.forceY = 0;

        return drawable;
    };

    Builder.prototype.reset = function (player) {
        player.y = this.currentHeight - 4 * this.tileHeight;
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
            return Math.floor(height / UI.HEIGHT * UI.TILE);
        }

        var ball = this.stage.createRectangle(true)
            .setColor(UI.WHITE)
            .setWidth(tileWidth)
            .setHeight(Height.get(UI.HEIGHT, UI.TILE))
            .setPosition(function (width, height) {
                var one = height / UI.HEIGHT;
                return Math.floor(width / 2 - UI.WIDTH / 2 * one + one * point.x);
            }, Height.get(UI.HEIGHT, point.y));

        ball.lastX = ball.x;
        ball.lastY = ball.y;

        this.balls.push(ball);

        ball.forceX = direction.x;
        ball.forceY = direction.y;
    };

    return Builder;
})(H5.Vectors, H5.range, G.UI, Math, H5.Width, H5.Height, H5.wrap);