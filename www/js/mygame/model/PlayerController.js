G.PlayerController = (function (UI, GamePlay, Math) {
    "use strict";

    function PlayerController(device, player, builder) {
        this.player = player;
        this.builder = builder;
        this.resize(device);
    }

    PlayerController.prototype.resize = function (event) {
        var one = event.height / UI.HEIGHT;
        this.forceX = Math.floor(one * GamePlay.FORCE_X);
        this.forceY = Math.floor(one * GamePlay.FORCE_Y);
    };

    PlayerController.prototype.jumpLeft = function () {
        if (this.player.forceX > -this.forceX) {
            this.player.forceX -= this.forceX;
            if (this.player.forceX < -this.forceX * 1.5)
                this.player.forceX = -this.forceX * 1.5;
        }
        if (this.player.forceY > -this.forceY) {
            this.player.forceY -= this.forceY;
            if (this.player.forceY < -this.forceY * 1.5)
                this.player.forceY = -this.forceY * 1.5;
        }
    };

    PlayerController.prototype.jumpRight = function () {
        if (this.player.forceX < this.forceX) {
            this.player.forceX += this.forceX;
            if (this.player.forceX > this.forceX * 1.5)
                this.player.forceX = this.forceX * 1.5;
        }
        if (this.player.forceY > -this.forceY) {
            this.player.forceY -= this.forceY;
            if (this.player.forceY < -this.forceY * 1.5)
                this.player.forceY = -this.forceY * 1.5;
        }
    };

    PlayerController.prototype.down = function () {
        this.builder.reset(this.player);
    };

    PlayerController.prototype.spawnBall = function () {
        this.builder.createRandomBall();
    };

    return PlayerController;
})(G.UI, G.GamePlay, Math);