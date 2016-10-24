G.World = (function (Math, Object, Vectors, UI, GamePlay, AppFlag) {
    "use strict";

    function World(device, camera, shaker, view, player, scenery, balls, obstacles, paddleHitFn, gameOverFn) {
        this.scenery = scenery;
        this.player = player;
        this.balls = balls;
        this.obstacles = obstacles;

        this.camera = camera;
        this.shaker = shaker;
        this.view = view;

        this.paddleHitFn = paddleHitFn;
        this.gameOverFn = gameOverFn;

        this.resize(device);
    }

    World.prototype.__updatePosition = function (entity) {
        this.camera.calcScreenPosition(entity, entity.drawable);
        if (entity.shadows)
            entity.shadows.forEach(this.__updatePosition, this);
        if (entity.frames)
            entity.frames.forEach(this.__updatePosition, this);
        if (entity.hasFace && AppFlag.PLAYER_FACE) {
            // todo: if position is always relative to entity itself there is no need for separate entities
            // (e.g. leftEye and leftEye.drawable)
            this.__updatePosition(this.player.leftEye);
            this.__updatePosition(this.player.rightEye);
            this.__updatePosition(this.player.leftPupil);
            this.__updatePosition(this.player.rightPupil);
            this.__updatePosition(this.player.mouth);
        }
    };

    World.prototype.updateEyes = function () {
        if (this.balls.length == 0)
            return;

        var distanceOfNearest = 0;
        var distanceVector;
        this.balls.forEach(function (ball, index) {
            var vector = Vectors.get(this.player.x, this.player.y, ball.x, ball.y);
            var distance = Vectors.squaredMagnitude(vector.x, vector.y);

            if (index == 0 || distance < distanceOfNearest) {
                distanceOfNearest = distance;
                distanceVector = vector;
            }
        }, this);

        if (distanceOfNearest > this.view.device.height * this.view.device.height / 3) {
            this.player.mouth.drawable.justWidthScale = true;
            this.player.mouth.drawable.setScale(0.25);
        } else {
            this.player.mouth.drawable.justWidthScale = false;
            this.player.mouth.drawable.setScale(1);
        }

        //noinspection JSUnusedAssignment
        var angle = Vectors.getAngle(distanceVector.x, distanceVector.y);
        var magnitude = this.player.leftEye.getWidth() / 8;

        this.player.leftPupil.x = Vectors.getX(this.player.leftEye.x, magnitude, angle);
        this.player.leftPupil.y = Vectors.getY(this.player.leftEye.y, magnitude, angle);

        this.player.rightPupil.x = Vectors.getX(this.player.rightEye.x, magnitude, angle);
        this.player.rightPupil.y = Vectors.getY(this.player.rightEye.y, magnitude, angle);
    };

    World.prototype.updateCamera = function () {
        this.scenery.forEach(this.__updatePosition, this);
        this.__updatePosition(this.player);
        this.balls.forEach(this.__updatePosition, this);
        this.obstacles.forEach(this.__updatePosition, this);
    };

    var airResistance = 0.9;

    World.prototype.resize = function (event) {
        var one = event.height / UI.HEIGHT;

        this.gravity = Math.floor(one * GamePlay.GRAVITY);

        var widthHalf = UI.WIDTH / 2 * one;
        var screenWidthHalf = event.width / 2;

        var tile = Math.floor(one * GamePlay.TILE);

        this.cornerX = Math.floor(screenWidthHalf - widthHalf) + tile;
        this.endX = Math.floor(screenWidthHalf + widthHalf) - tile;

        this.cornerY = tile;
        this.endY = event.height - tile;
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

        forceX = Math.round(forceX);
        forceY = Math.round(forceY);

        player.lastTotalForceX = forceX;
        player.lastTotalForceY = forceY;

        this.__setPlayerX(player.x + forceX);
        this.__setPlayerY(player.y + forceY);
    };

    World.prototype.__setPlayerX = function (x) {
        this.player.x = x;

        if (AppFlag.PLAYER_FACE) {
            this.player.leftEye.x = this.player.leftEye.xFn(this.view.device.width, this.view.device.height);
            this.player.rightEye.x = this.player.rightEye.xFn(this.view.device.width, this.view.device.height);
            this.player.leftPupil.x = this.player.leftPupil.xFn(this.view.device.width, this.view.device.height);
            this.player.rightPupil.x = this.player.rightPupil.xFn(this.view.device.width, this.view.device.height);
            this.player.mouth.x = this.player.mouth.xFn(this.view.device.width, this.view.device.height);
        }

        if (AppFlag.PLAYER_SHADOW)
            this.player.shadows.forEach(function (shadow, index, array) {
                shadow.lastX = shadow.x;
                if (index < 1) {
                    shadow.x = this.player.lastX;
                    return;
                }
                shadow.x = array[index - 1].lastX;
            }, this);
    };

    World.prototype.__setPlayerY = function (y) {
        this.player.y = y;

        if (AppFlag.PLAYER_FACE) {
            this.player.leftEye.y = this.player.leftEye.yFn(this.view.device.height, this.view.device.width);
            this.player.rightEye.y = this.player.rightEye.yFn(this.view.device.height, this.view.device.width);
            this.player.leftPupil.y = this.player.leftPupil.yFn(this.view.device.height, this.view.device.width);
            this.player.rightPupil.y = this.player.rightPupil.yFn(this.view.device.height, this.view.device.width);
            this.player.mouth.y = this.player.mouth.yFn(this.view.device.height, this.view.device.width);
        }

        if (AppFlag.PLAYER_SHADOW)
            this.player.shadows.forEach(function (shadow, index, array) {
                if (this.player.lastTotalForceY > 0) {
                    shadow.y = this.player.y;
                    return;
                }
                shadow.lastY = shadow.y;
                if (index < 1) {
                    shadow.y = this.player.lastY;
                    return;
                }
                shadow.y = array[index - 1].lastY;
            }, this);
    };

    World.prototype.__setBallX = function (ball, value) {
        ball.x = value;

        if (AppFlag.BALL_SHADOW)
            ball.shadows.forEach(function (shadow, index, array) {
                shadow.lastX = shadow.x;
                if (index < 1) {
                    shadow.x = ball.lastX;
                    return;
                }
                shadow.x = array[index - 1].lastX;
            });
    };

    World.prototype.__setBallY = function (ball, value) {
        ball.y = value;

        if (AppFlag.BALL_SHADOW)
            ball.shadows.forEach(function (shadow, index, array) {
                shadow.lastY = shadow.y;
                if (index < 1) {
                    shadow.y = ball.lastY;
                    return;
                }
                shadow.y = array[index - 1].lastY;
            });
    };

    World.prototype.updateBallMovement = function () {
        this.balls.forEach(function (ball) {
            var forceX = 0;
            var forceY = 0;

            forceX += ball.forceX;
            forceY += ball.forceY;

            ball.lastX = ball.x;
            ball.lastY = ball.y;

            this.__setBallX(ball, ball.x + Math.round(forceX));
            this.__setBallY(ball, ball.y + Math.round(forceY));
        }, this);
    };

    World.prototype.__hit = function (ball, wall) {
        this.view.hitBall(ball);
        if (wall) {
            this.view.hitWall(wall);
            this.view.playWallHit();
            if (AppFlag.SCREEN_SHAKE)
                this.shaker.startVerySmallShake();
        } else {
            if (AppFlag.SCREEN_SHAKE) {
                this.shaker.startSmallShake();
            }
            this.view.highlightScreen();
            this.view.highlightScore();
            this.view.playPaddleHit();
        }
    };

    World.prototype.checkBallPaddleCollision = function () {
        this.balls.forEach(function (ball) {
            var ballWidthHalf = ball.getWidthHalf();
            var ballHeightHalf = ball.getHeightHalf();

            var player = this.player;
            var playerWidthHalf = player.getWidthHalf();
            var playerHeightHalf = player.getHeightHalf();

            var playerBoundingLeft, playerBoundingTop, playerBoundingRight, playerBoundingBottom;
            if (player.x > player.lastX) {
                // lastX is left & x is right
                playerBoundingLeft = player.lastX - playerWidthHalf;
                playerBoundingRight = player.x + playerWidthHalf;
            } else {
                // x is left & lastX is right
                playerBoundingLeft = player.x - playerWidthHalf;
                playerBoundingRight = player.lastX + playerWidthHalf;
            }
            if (player.y > player.lastY) {
                // lastY is up & y is down
                playerBoundingTop = player.lastY - playerHeightHalf;
                playerBoundingBottom = player.y + playerHeightHalf;
            } else {
                // y is up & lastY is down
                playerBoundingTop = player.y - playerHeightHalf;
                playerBoundingBottom = player.lastY + playerHeightHalf;
            }

            var ballBoundingLeft, ballBoundingTop, ballBoundingRight, ballBoundingBottom;
            if (ball.x > ball.lastX) {
                // lastX is left & x is right
                ballBoundingLeft = ball.lastX - ballWidthHalf;
                ballBoundingRight = ball.x + ballWidthHalf;
            } else {
                // x is left & lastX is right
                ballBoundingLeft = ball.x - ballWidthHalf;
                ballBoundingRight = ball.lastX + ballWidthHalf;
            }
            if (ball.y > ball.lastY) {
                // lastY is up & y is down
                ballBoundingTop = ball.lastY - ballHeightHalf;
                ballBoundingBottom = ball.y + ballHeightHalf;
            } else {
                // y is up & lastY is down
                ballBoundingTop = ball.y - ballHeightHalf;
                ballBoundingBottom = ball.lastY + ballHeightHalf;
            }

            var isBallLeftOfPlayer = ballBoundingRight < playerBoundingLeft;
            var isBallRightOfPlayer = ballBoundingLeft > playerBoundingRight;
            var isBallOverPlayer = ballBoundingBottom < playerBoundingTop;
            var isBallUnderPlayer = ballBoundingTop > playerBoundingBottom;

            if (!(isBallLeftOfPlayer || isBallRightOfPlayer || isBallOverPlayer || isBallUnderPlayer)) {

                var lastBallLeft = ball.lastX - ballWidthHalf;
                var lastBallRight = ball.lastX + ballWidthHalf;
                var lastBallTop = ball.lastY - ballHeightHalf;
                var lastBallBottom = ball.lastY + ballHeightHalf;

                var lastPlayerLeft = player.lastX - playerWidthHalf;
                var lastPlayerRight = player.lastX + playerWidthHalf;
                var lastPlayerTop = player.lastY - playerHeightHalf;
                var lastPlayerBottom = player.lastY + playerHeightHalf;

                var wasBallLeftOfPlayer = lastBallRight < lastPlayerLeft;
                var wasBallRightOfPlayer = lastBallLeft > lastPlayerRight;
                var wasBallOverPlayer = lastBallBottom < lastPlayerTop;
                var wasBallUnderPlayer = lastBallTop > lastPlayerBottom;

                if (wasBallOverPlayer) {
                    if (ball.forceY > 0) {
                        ball.forceY *= -1;
                        this.paddleHitFn();
                        this.__hit(ball);
                        this.view.animateImpactOnTop(ball.x, ball.y);
                    }
                    ball.y = player.y - playerHeightHalf - 2 * ballHeightHalf;

                } else if (wasBallUnderPlayer) {
                    if (ball.forceY < 0) {
                        ball.forceY *= -1;
                        this.paddleHitFn();
                        this.__hit(ball);
                        this.view.animateImpactOnBottom(ball.x, ball.y);
                    }
                    ball.y = player.y + playerHeightHalf + 2 * ballHeightHalf;

                } else if (wasBallLeftOfPlayer) {
                    if (ball.forceX > 0) {
                        ball.forceX *= -1;
                        this.paddleHitFn();
                        this.__hit(ball);
                        this.view.animateImpactOnLeft(ball.x, ball.y);
                    }
                    this.__setBallX(ball, player.x - playerWidthHalf - 2 * ballWidthHalf);

                } else if (wasBallRightOfPlayer) {
                    if (ball.forceX < 0) {
                        ball.forceX *= -1;
                        this.paddleHitFn();
                        this.__hit(ball);
                        this.view.animateImpactOnRight(ball.x, ball.y);
                    }
                    this.__setBallX(ball, player.x + playerWidthHalf + 2 * ballWidthHalf);
                }

                var ballLeft = ball.x - ballWidthHalf;
                var ballRight = ball.x + ballWidthHalf;
                var ballTop = ball.y - ballHeightHalf;
                var ballBottom = ball.y + ballHeightHalf;

                // var playerLeft = player.x - playerWidthHalf;
                // var playerRight = player.x + playerWidthHalf;
                // var playerTop = player.y - playerHeightHalf;
                // var playerBottom = player.y + playerHeightHalf;

                // var isNowBallLeftOfPlayer = ballRight < playerLeft;
                // var isNowBallRightOfPlayer = ballLeft > playerRight;
                // var isNowBallOverPlayer = ballBottom < playerTop;
                // var isNowBallUnderPlayer = ballTop > playerBottom;
                //
                // if (!(isNowBallLeftOfPlayer || isNowBallRightOfPlayer || isNowBallOverPlayer ||
                // isNowBallUnderPlayer)) { console.log('EERRRRRRRROOEEER'); }

                // recheck if ball is not inside scenery otherwise move player and ball
                this.scenery.forEach(function (element) {

                    if (ballRight > element.getCornerX() && ballLeft < element.getEndX() &&
                        ballBottom > element.getCornerY() && ballTop < element.getEndY()) {

                        if (ball.x - ballWidthHalf < this.cornerX)
                            this.__setBallX(ball, this.cornerX + ballWidthHalf);
                        if (ball.x + ballWidthHalf > this.endX)
                            this.__setBallX(ball, this.endX - ballWidthHalf);
                        if (ball.y - ballHeightHalf < this.cornerY)
                            ball.y = this.cornerY + ballHeightHalf;
                        if (ball.y + ballHeightHalf > this.endY)
                            ball.y = this.endY - ballHeightHalf;

                        if (wasBallOverPlayer) {
                            this.__setPlayerY(ball.y + ballHeightHalf + playerHeightHalf + 1);

                        } else if (wasBallUnderPlayer) {
                            this.__setPlayerY(ball.y - ballHeightHalf - playerHeightHalf - 1);

                        } else if (wasBallLeftOfPlayer) {
                            this.__setPlayerX(ball.x + ballWidthHalf + playerWidthHalf + 1);

                        } else if (wasBallRightOfPlayer) {
                            this.__setPlayerX(ball.x - ballWidthHalf - playerWidthHalf - 1);
                        }
                    }

                }, this);
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
                //noinspection JSSuspiciousNameCombination
                var heightHalf = widthHalf;
                if (ball.x + widthHalf > element.getCornerX() && ball.x - widthHalf < element.getEndX() &&
                    ball.y + heightHalf > element.getCornerY() && ball.y - heightHalf < element.getEndY()) {

                    if (ball.x - widthHalf < this.cornerX)
                        this.__setBallX(ball, this.cornerX + widthHalf);
                    if (ball.x + widthHalf > this.endX)
                        this.__setBallX(ball, this.endX - widthHalf);
                    if (ball.y - heightHalf < this.cornerY)
                        ball.y = this.cornerY + heightHalf;
                    if (ball.y + heightHalf > this.endY)
                        ball.y = this.endY - heightHalf;

                    if (element.getWidth() > element.getHeight()) {
                        ball.forceY *= -1;
                        if (ball.y < element.y) {
                            this.view.animateImpactOnTop(ball.x, ball.y);
                        } else {
                            this.view.animateImpactOnBottom(ball.x, ball.y);
                        }
                    } else {
                        ball.forceX *= -1;
                        if (ball.x < element.x) {
                            this.view.animateImpactOnLeft(ball.x, ball.y);
                        } else {
                            this.view.animateImpactOnRight(ball.x, ball.y);
                        }
                    }
                    this.__hit(ball, element);
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
                    this.__setPlayerX(p.x - widthHalf);
                    player.forceX = 0;

                } else if (player.lastX - widthHalf >= element.x + elemWidthHalf &&
                    player.x - widthHalf < element.x + elemWidthHalf) {

                    // Collision on left side of player
                    p = Vectors.getIntersectionPoint(player.lastX - widthHalf, player.lastY, player.x - widthHalf,
                        player.y, b2_x, b2_y, b3_x, b3_y);
                    this.__setPlayerX(p.x + widthHalf);
                    player.forceX = 0;
                } else if (player.lastY + heightHalf <= element.y - elemHeightHalf &&
                    player.y + heightHalf > element.y - elemHeightHalf) {

                    // Collision on bottom side of player
                    p = Vectors.getIntersectionPoint(player.lastX, player.lastY + heightHalf, player.x,
                        player.y + heightHalf, b1_x, b1_y, b2_x, b2_y);
                    this.__setPlayerY(p.y - heightHalf);
                    player.forceY = 0;
                } else {
                    // Collision on top side of player
                    p = Vectors.getIntersectionPoint(player.lastX, player.lastY - heightHalf, player.x,
                        player.y - heightHalf, b3_x, b3_y, b4_x, b4_y);
                    this.__setPlayerY(p.y + heightHalf);
                    player.forceY = 0;
                }
            }
        }, this);
    };

    function remove(entity) {
        if (entity.shadows)
            entity.shadows.forEach(remove);
        if (entity.frames)
            entity.frames.forEach(remove);
        if (entity.hasFace) {
            remove(entity.leftEye);
            remove(entity.rightEye);
            remove(entity.rightPupil);
            remove(entity.leftPupil);
            remove(entity.mouth);
        }
        entity.remove();
        entity.drawable.remove();
    }

    World.prototype.removeBall = function (ball, index, ballArray) {
        remove(ball);
        ballArray.splice(index, 1);

        if (!AppFlag.TEST_GAME)
            this.gameOverFn();
    };

    World.prototype.preDestroy = function () {
        this.scenery.forEach(remove);
        this.obstacles.forEach(remove);
        this.balls.forEach(remove);
        remove(this.player);
    };

    return World;
})(Math, Object, H5.Vectors, G.UI, G.GamePlay, G.AppFlag);