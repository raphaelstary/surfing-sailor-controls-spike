G.PlayerController = (function (UI, GamePlay, Math, Vectors) {
    "use strict";

    function PlayerController(device, player, builder, world) {
        this.player = player;
        this.builder = builder;
        this.world = world;
        this.resize(device);

        this.__leftPressed = false;
        this.__rightPressed = false;
        this.__downPressed = false;
        this.__upPressed = false;
    }

    PlayerController.prototype.resize = function (event) {
        var one = event.height / UI.HEIGHT;
        this.forceX = Math.floor(one * GamePlay.FORCE_X);
        this.forceY = Math.floor(one * GamePlay.FORCE_Y);
    };

    PlayerController.prototype.update = function () {
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

    PlayerController.prototype.left = function () {
        this.player.rotation += Vectors.toRadians(-1);
    };

    PlayerController.prototype.right = function () {
        this.player.rotation += Vectors.toRadians(1);
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