G.World = (function (Math, Object, Vectors, UI) {
    "use strict";

    function World(device, player, scenery, balls, obstacles, paddleHitFn, gameOverFn) {
        this.scenery = scenery;
        this.player = player;
        this.balls = balls;
        this.obstacles = obstacles;

        this.paddleHitFn = paddleHitFn;
        this.gameOverFn = gameOverFn;

        this.resize(device);
    }

    var airResistance = 0.9;

    World.prototype.resize = function (event) {
        this.gravity = Math.floor(event.height / UI.HEIGHT * UI.GRAVITY);
    };

    World.prototype.updatePlayerMovement = function () {
        var player = this.player;

        var forceX = 0;
        var forceY = 0;

        forceY += this.gravity;

        player.forceX *= airResistance;
        player.forceY *= airResistance;

        forceX += player.forceX;
        forceY += player.forceY;

        player.lastX = player.x;
        player.lastY = player.y;

        player.x += Math.round(forceX);
        player.y += Math.round(forceY);
    };

    World.prototype.updateBallMovement = function () {
        this.balls.forEach(function (ball) {
            var forceX = 0;
            var forceY = 0;

            forceX += ball.forceX;
            forceY += ball.forceY;

            ball.lastX = ball.x;
            ball.lastY = ball.y;

            ball.x += Math.round(forceX);
            ball.y += Math.round(forceY);
        }, this);
    };

    World.prototype.checkBallPaddleCollision = function () {
        this.balls.forEach(function (ball) {
            var ballWidthHalf = ball.getWidthHalf();
            var ballHeightHalf = ball.getHeightHalf();

            var player = this.player;
            var widthHalf = player.getWidthHalf();
            var heightHalf = player.getHeightHalf();

            if (player.x + widthHalf > ball.x - ballWidthHalf && player.x - widthHalf < ball.x + ballWidthHalf &&
                player.y + heightHalf > ball.y - ballHeightHalf && player.y - heightHalf < ball.y + ballHeightHalf) {

                // play paddle
                var b4_y = ball.y + ballHeightHalf;
                var b1_y = ball.y - ballHeightHalf;
                var b4_x = ball.x - ballWidthHalf;
                var b1_x = b4_x;
                var b2_x = ball.x + ballWidthHalf;
                var b3_x = b2_x;
                var b2_y = b1_y;
                var b3_y = b4_y;

                var p;

                if (player.lastY + heightHalf <= ball.y - ballHeightHalf &&
                    player.y + heightHalf > ball.y - ballHeightHalf) {

                    if (ball.forceY < 0)
                        ball.forceY *= -1;

                    // Collision on bottom side of player
                    p = Vectors.getIntersectionPoint(ball.lastX, ball.lastY - ballHeightHalf, ball.x,
                        ball.y - ballHeightHalf, b3_x, b3_y, b4_x, b4_y);
                    ball.y = p.y + ballHeightHalf;

                } else {

                    if (ball.forceY > 0)
                        ball.forceY *= -1;

                    // Collision on top side of player
                    p = Vectors.getIntersectionPoint(ball.lastX, ball.lastY + ballHeightHalf, ball.x,
                        ball.y + ballHeightHalf, b1_x, b1_y, b2_x, b2_y);
                    ball.y = p.y - ballHeightHalf;

                }
                this.paddleHitFn();
            }
        }, this);
    };

    World.prototype.checkCollisions = function () {
        this.obstacles.forEach(function (element) {
            for (var i = this.balls.length - 1; i >= 0; i--) {
                var ball = this.balls[i];
                var widthHalf = ball.getWidthHalf();
                var heightHalf = ball.getHeightHalf();
                if (ball.x + widthHalf > element.getCornerX() && ball.x - widthHalf < element.getEndX() &&
                    ball.y + heightHalf > element.getCornerY() && ball.y - heightHalf < element.getEndY()) {

                    this.removeBall(ball, i, this.balls);
                }
            }
        }, this);

        this.scenery.concat(this.obstacles).forEach(function (element) {
            this.balls.forEach(function (ball) {
                var widthHalf = ball.getWidthHalf();
                var heightHalf = ball.getHeightHalf();
                if (ball.x + widthHalf > element.getCornerX() && ball.x - widthHalf < element.getEndX() &&
                    ball.y + heightHalf > element.getCornerY() && ball.y - heightHalf < element.getEndY()) {

                    if (element.getWidth() > element.getHeight()) {
                        ball.forceY *= -1;
                    } else {
                        ball.forceX *= -1;
                    }
                }
            }, this);

            var player = this.player;

            var widthHalf = player.getWidthHalf();
            var heightHalf = player.getHeightHalf();
            if (player.x + widthHalf > element.getCornerX() && player.x - widthHalf < element.getEndX() &&
                player.y + heightHalf > element.getCornerY() && player.y - heightHalf < element.getEndY()) {

                var elemHeightHalf = element.getHeightHalf();
                var elemWidthHalf = element.getWidthHalf();
                var b4_y = element.y + elemHeightHalf;
                var b1_y = element.y - elemHeightHalf;
                var b4_x = element.x - elemWidthHalf;
                var b1_x = b4_x;
                var b2_x = element.x + elemWidthHalf;
                var b3_x = b2_x;
                var b2_y = b1_y;
                var b3_y = b4_y;

                var p;

                // Now compare them to know the side of collision
                if (player.lastX + widthHalf <= element.x - elemWidthHalf &&
                    player.x + widthHalf > element.x - elemWidthHalf) {

                    // Collision on right side of player
                    p = Vectors.getIntersectionPoint(player.lastX + widthHalf, player.lastY, player.x + widthHalf,
                        player.y, b1_x, b1_y, b4_x, b4_y);
                    player.x = p.x - widthHalf;
                    player.forceX = 0;

                } else if (player.lastX - widthHalf >= element.x + elemWidthHalf &&
                    player.x - widthHalf < element.x + elemWidthHalf) {

                    // Collision on left side of player
                    p = Vectors.getIntersectionPoint(player.lastX - widthHalf, player.lastY, player.x - widthHalf,
                        player.y, b2_x, b2_y, b3_x, b3_y);
                    player.x = p.x + widthHalf;
                    player.forceX = 0;
                } else if (player.lastY + heightHalf <= element.y - elemHeightHalf &&
                    player.y + heightHalf > element.y - elemHeightHalf) {

                    // Collision on bottom side of player
                    p = Vectors.getIntersectionPoint(player.lastX, player.lastY + heightHalf, player.x,
                        player.y + heightHalf, b1_x, b1_y, b2_x, b2_y);
                    player.y = p.y - heightHalf;
                    player.forceY = 0;
                } else {
                    // Collision on top side of player
                    p = Vectors.getIntersectionPoint(player.lastX, player.lastY - heightHalf, player.x,
                        player.y - heightHalf, b3_x, b3_y, b4_x, b4_y);
                    player.y = p.y + heightHalf;
                    player.forceY = 0;
                }
            }
        }, this);
    };

    World.prototype.removeBall = function (ball, index, ballArray) {
        ball.remove();
        ballArray.splice(index, 1);

        if (this.balls.length <= 0)
            this.gameOverFn();
    };

    World.prototype.preDestroy = function () {

        function remove(entity) {
            entity.remove();
        }

        this.scenery.forEach(remove);
        this.obstacles.forEach(remove);
        this.balls.forEach(remove);
        remove(this.player);
    };

    return World;
})(Math, Object, H5.Vectors, G.UI);