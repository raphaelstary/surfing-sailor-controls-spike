G.PlayerController = (function (UI, GamePlay, Math, Vectors) {
    "use strict";

    function PlayerController(device, player, builder, world) {
        this.player = player;
        this.builder = builder;
        this.world = world;
        this.resize(device);

        this.__1 = 0.03;
        this.__2 = 0.04;
        this.__3 = 0.05;

        this.__leftPressed = false;
        this.__rightPressed = false;
        this.__downPressed = false;
        this.__upPressed = false;

        this.__turn = Math.PI * 2;
    }

    PlayerController.prototype.resize = function (event) {
        var one = event.height / UI.HEIGHT;
        this.forceX = Math.floor(one * GamePlay.FORCE_X);
        this.forceY = Math.floor(one * GamePlay.FORCE_Y);
    };

    PlayerController.prototype.update = function () {
        this.player.lastRotation = this.player.rotation;

        if (this.__leftPressed) {
            this.left();
        }
        if (this.__rightPressed) {
            this.right();
        }
        if (this.__downPressed) {
            this.down();
        }
        if (this.__upPressed) {
            this.up();
        }
    };

    PlayerController.prototype.handleLeftKeyDown = function () {
        this.__leftPressed = true;
    };

    PlayerController.prototype.handleRightKeyDown = function () {
        this.__rightPressed = true;
    };

    PlayerController.prototype.handleUpKeyDown = function () {
        this.__upPressed = true;
    };

    PlayerController.prototype.handleDownKeyDown = function () {
        this.__downPressed = true;
    };

    PlayerController.prototype.handleLeftKeyUp = function () {
        this.__leftPressed = false;
    };

    PlayerController.prototype.handleRightKeyUp = function () {
        this.__rightPressed = false;
    };

    PlayerController.prototype.handleUpKeyUp = function () {
        this.__upPressed = false;
    };

    PlayerController.prototype.handleDownKeyUp = function () {
        this.__downPressed = false;
    };

    PlayerController.prototype.__getRotationValue = function () {
        if (this.world.currentSpeed == GamePlay.SLOW_SPEED) {
            return this.__1;
        } else if (this.world.currentSpeed == GamePlay.MEDIUM_SPEED) {
            return this.__2;
        }
        return this.__3;
    };

    PlayerController.prototype.__greaterThanMaxTurn = function () {
        var maxTurn = Math.PI / 4;
        var minusMaxTurn = 7 * Math.PI / 4;

        var a = this.player.direction;
        var b = this.player.rotation;

        if ((a > minusMaxTurn && b < maxTurn) || (b > minusMaxTurn && a < maxTurn)) {
            var aDash = Vectors.normalizeAngle(a);
            var bDash = Vectors.normalizeAngle(b);
            return Math.abs(bDash - aDash) > maxTurn;
        }

        var diff = Math.abs(b - a);
        return diff > maxTurn;
    };

    PlayerController.prototype.left = function () {
        var lastRotation = this.player.rotation;

        this.player.rotation -= this.__getRotationValue();
        if (this.player.rotation < 0)
            this.player.rotation += this.__turn;

        if (this.__greaterThanMaxTurn())
            this.player.rotation = lastRotation;
    };

    PlayerController.prototype.right = function () {
        var lastRotation = this.player.rotation;

        this.player.rotation += this.__getRotationValue();
        if (this.player.rotation > this.__turn)
            this.player.rotation -= this.__turn;

        if (this.__greaterThanMaxTurn())
            this.player.rotation = lastRotation;
    };

    PlayerController.prototype.up = function () {

    };

    PlayerController.prototype.down = function () {

    };

    PlayerController.prototype.speedUp = function () {
        this.builder.speedUp();
        this.world.speedUp();
    };

    PlayerController.prototype.speedDown = function () {
        this.builder.speedDown();
        this.world.speedDown();
    };

    return PlayerController;
})(G.UI, G.GamePlay, Math, H5.Vectors);