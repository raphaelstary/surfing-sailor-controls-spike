G.PlayerController = (function (UI, GamePlay, Math, Vectors, Date) {
    "use strict";

    function PlayerController(device, player, builder, world) {
        this.player = player;
        this.builder = builder;
        this.world = world;
        this.resize(device);

        this.__1 = 0.03;
        this.__2 = 0.04;
        this.__3 = 0.08;

        this.__leftPressed = false;
        this.__rightPressed = false;
        this.__downPressed = false;
        this.__upPressed = false;

        this.__turn = Math.PI * 2;

        this.__history = [];
        this.__isCombo = false;
    }

    PlayerController.prototype.resize = function (event) {
        var one = event.height / UI.HEIGHT;
        this.forceX = Math.floor(one * GamePlay.FORCE_X);
        this.forceY = Math.floor(one * GamePlay.FORCE_Y);
    };

    PlayerController.prototype.update = function () {
        this.player.lastRotation = this.player.rotation;
        this.player.isMaxRotation = false;

        if (this.__isCombo) {
            this.__doCombo();
            return;
        }

        if (this.__leftPressed) {
            this.left();
        } else if (this.__rightPressed) {
            this.right();
        }

        if (this.__downPressed) {
            this.down();
        } else if (this.__upPressed) {
            this.up();
        }
    };

    PlayerController.prototype.__doCombo = function () {
        this.__isCombo = false;

        this.world.activateCombo();

        this.player.isSliding = true;
        this.player.rotation += Math.PI / 2;

        if (this.player.rotation > this.__turn)
            this.player.rotation -= this.__turn;
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
        if (this.player.isSliding) {
            this.world.forwardEdge();
            return;
        }

        var lastRotation = this.player.rotation;

        this.player.rotation -= this.__getRotationValue();
        if (this.player.rotation < 0)
            this.player.rotation += this.__turn;

        if (this.__greaterThanMaxTurn()) {
            this.player.rotation = lastRotation;
            this.player.isMaxRotation = true;
        } else {
            this.__registerTurn('left');
        }
    };

    PlayerController.prototype.right = function () {
        if (this.player.isSliding) {
            this.world.backEdge();
            return;
        }

        var lastRotation = this.player.rotation;

        this.player.rotation += this.__getRotationValue();
        if (this.player.rotation > this.__turn)
            this.player.rotation -= this.__turn;

        if (this.__greaterThanMaxTurn()) {
            this.player.rotation = lastRotation;
            this.player.isMaxRotation = true;
        } else {
            this.__registerTurn('right');
        }
    };

    PlayerController.prototype.__registerTurn = function (turn) {
        if (this.world.currentSpeed != GamePlay.FAST_SPEED)
            return;

        this.__history.push({
            time: Date.now(),
            turn: turn
        });

        var now = Date.now();
        this.__history = this.__history.filter(function (elem) {
            return now - elem.time < 500;
        });

        var lastTurn = this.__history[0] && this.__history[0].turn;
        var changes = 0;
        this.__history.forEach(function (elem) {
            if (lastTurn != elem.turn)
                changes++;
            lastTurn = elem.turn;
        });

        if (changes >= 2) {
            this.__history = [];
            this.__isCombo = true;
        }
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
})(G.UI, G.GamePlay, Math, H5.Vectors, Date);