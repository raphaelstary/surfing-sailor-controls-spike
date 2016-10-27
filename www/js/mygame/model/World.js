G.World = (function (Math, Object, Vectors, UI, GamePlay, AppFlag) {
    "use strict";

    function World(device, camera, shaker, view, player, scenery, balls, obstacles, gameOverFn, debugSpeed) {
        this.scenery = scenery;
        this.player = player;
        this.balls = balls;
        this.obstacles = obstacles;

        this.camera = camera;
        this.shaker = shaker;
        this.view = view;

        this.paddleHitFn = function () {
        };
        this.gameOverFn = gameOverFn;

        this.debugSpeed = debugSpeed;

        this.resize(device);

        this.currentSpeed = GamePlay.SLOW_SPEED;
        this.__turn = Math.PI * 2;

        this.__speedApplier = 0;
    }

    World.prototype.speedUp = function () {
        this.__speedApplier = 0;

        if (this.currentSpeed == GamePlay.SLOW_SPEED) {
            this.currentSpeed = GamePlay.MEDIUM_SPEED;
        } else if (this.currentSpeed == GamePlay.MEDIUM_SPEED) {
            this.currentSpeed = GamePlay.FAST_SPEED;
        }
    };

    World.prototype.speedDown = function () {
        this.__speedApplier = 0;

        if (this.currentSpeed == GamePlay.FAST_SPEED) {
            this.currentSpeed = GamePlay.MEDIUM_SPEED;
        } else if (this.currentSpeed == GamePlay.MEDIUM_SPEED) {
            this.currentSpeed = GamePlay.SLOW_SPEED;
        }
    };

    World.prototype.__updatePosition = function (entity) {
        this.camera.calcScreenPosition(entity, entity.drawable);
        if (entity.shadows)
            entity.shadows.forEach(this.__updatePosition, this);
        if (entity.frames)
            entity.frames.forEach(this.__updatePosition, this);
        if (entity.currentVelocity)
            this.camera.calcScreenPosition(entity, entity.currentVelocity, entity.direction);
        if (entity.desiredVelocity)
            this.camera.calcScreenPosition(entity, entity.desiredVelocity);
    };

    World.prototype.updateCamera = function () {
        this.scenery.forEach(this.__updatePosition, this);
        this.__updatePosition(this.player);
        this.balls.forEach(this.__updatePosition, this);
        this.obstacles.forEach(this.__updatePosition, this);
    };

    World.prototype.resize = function (event) {
        var one = event.height / UI.HEIGHT;

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

        if (this.player.isSliding) {

        } else if (this.currentSpeed == GamePlay.FAST_SPEED) {
            this.player.direction = this.player.rotation;

            if (this.player.lastRotation == this.player.rotation && !this.player.isMaxRotation) {
                this.__speedApplier += 0.1;
                if (this.__speedApplier > 4)
                    this.__speedApplier = 4;
            } else {
                this.__speedApplier -= 0.1;
                if (GamePlay.FAST_SPEED + this.__speedApplier <= GamePlay.MEDIUM_SPEED) {
                    this.view.speedDown();
                    this.speedDown();
                }
            }
        } else {
            if (this.currentSpeed == GamePlay.MEDIUM_SPEED) {

                if (this.player.lastRotation == this.player.rotation && !this.player.isMaxRotation) {
                    this.__speedApplier += 0.04;
                    if (GamePlay.MEDIUM_SPEED + this.__speedApplier >= GamePlay.FAST_SPEED) {
                        this.view.speedUp();
                        this.speedUp();
                    }
                } else {
                    this.__speedApplier -= 0.02;
                    if (this.__speedApplier < -2)
                        this.__speedApplier = -2;
                }
            }

            if (this.player.direction < 0) {
                this.player.direction += this.__turn;
            } else if (this.player.direction > this.__turn) {
                this.player.direction -= this.__turn;
            }

            var delta = Math.abs(this.player.rotation - this.player.direction);
            var oneDegree = 0.0175;
            var aboutOneDegree = 0.02;

            if (delta > oneDegree) {
                if (this.player.rotation > this.player.direction) {
                    if (delta > Math.PI) {
                        this.player.direction -= aboutOneDegree;
                    } else {
                        this.player.direction += aboutOneDegree;
                    }
                } else {
                    if (delta > Math.PI) {
                        this.player.direction += aboutOneDegree;
                    } else {
                        this.player.direction -= aboutOneDegree;
                    }
                }
            }
        }

        this.__speedApplier = Math.round(this.__speedApplier * 100) / 100;
        this.player.direction = Math.round(this.player.direction * 10000) / 10000;
        this.player.rotation = Math.round(this.player.rotation * 10000) / 10000;

        if (this.debugSpeed)
            this.debugSpeed.setText(this.__speedApplier + ' ++');

        var forceX = Vectors.getX(0, this.currentSpeed + this.__speedApplier, this.player.direction);
        var forceY = Vectors.getY(0, this.currentSpeed + this.__speedApplier, this.player.direction);

        forceX += player.forceX;
        forceY += player.forceY;

        player.lastX = player.x;
        player.lastY = player.y;

        forceX = Math.round(forceX * 100) / 100;
        forceY = Math.round(forceY * 100) / 100;

        player.lastTotalForceX = forceX;
        player.lastTotalForceY = forceY;

        this.__setPlayerX(player.x + forceX);
        this.__setPlayerY(player.y + forceY);
    };

    World.prototype.__setPlayerX = function (x) {
        this.player.x = x;

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

        if (AppFlag.PLAYER_SHADOW)
            this.player.shadows.forEach(function (shadow, index, array) {
                shadow.lastY = shadow.y;
                if (index < 1) {
                    shadow.y = this.player.lastY;
                    return;
                }
                shadow.y = array[index - 1].lastY;
            }, this);
    };

    World.prototype.checkCollisions = function () {
        this.scenery.concat(this.obstacles).forEach(function (element) {
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

    World.prototype.preDestroy = function () {
        this.scenery.forEach(remove);
        this.obstacles.forEach(remove);
        this.balls.forEach(remove);
        remove(this.player);
    };

    return World;
})(Math, Object, H5.Vectors, G.UI, G.GamePlay, G.AppFlag);