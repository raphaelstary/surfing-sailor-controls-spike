G.Game = (function (Width, Height, Event, installPlayerKeyBoard, installPlayerGamePad, createWorld, AppFlag) {
    "use strict";

    /** @property counter */
    function Game(services) {
        this.events = services.events;
        this.timer = services.timer;
        this.services = services;
    }

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.leftUp = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.leftDown = function () {
        this.controller.jumpLeft();
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.rightUp = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.rightDown = function () {
        this.controller.jumpRight();
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.bottomUp = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.bottomDown = function () {
        this.controller.down();
    };

    /** @this Game */
    Game.prototype.postConstruct = function () {
        var isOver = false;
        var score = 0;

        this.counter.setText('0');
        this.counter.setPosition(Width.HALF, Height.HALF);

        var self = this;

        function count() {
            score++;
            self.counter.setText(score.toString());

            if (score % 10 == 0) {
                wrapper.builder.createRandomBall();
            }
        }

        function gameOver() {
            if (isOver)
                return;
            isOver = true;

            self.timer.doLater(function () {
                self.nextScene(score);
            }, 5);
        }

        var wrapper = createWorld(this.services, count, gameOver);

        this.camera = this.events.subscribe(Event.TICK_CAMERA, wrapper.world.updateCamera.bind(wrapper.world));
        this.world = wrapper.world;
        this.controller = wrapper.controller;
        this.builder = wrapper.builder;
        this.shaker = wrapper.shaker;

        wrapper.builder.animateSceneAppearance(wrapper.player).then(this.__registerEventListeners, this);
    };

    Game.prototype.__registerEventListeners = function () {
        this.keyBoardControls = installPlayerKeyBoard(this.events, this.controller);
        this.gamePadControls = installPlayerGamePad(this.events, this.controller);

        this.playerMovement = this.events.subscribe(Event.TICK_MOVE, this.world.updatePlayerMovement.bind(this.world));
        this.ballMovement = this.events.subscribe(Event.TICK_MOVE, this.world.updateBallMovement.bind(this.world));
        if (AppFlag.PLAYER_FACE)
            this.eyeMovement = this.events.subscribe(Event.TICK_POST_COLLISION, this.world.updateEyes.bind(this.world));
        this.playerBallCollision = this.events.subscribe(Event.TICK_POST_COLLISION,
            this.world.checkBallPaddleCollision.bind(this.world));
        this.wallCollision = this.events.subscribe(Event.TICK_COLLISION, this.world.checkCollisions.bind(this.world));
        this.paddleForce = this.events.subscribe(Event.RESIZE, this.controller.resize.bind(this.controller));
        this.ballForce = this.events.subscribe(Event.RESIZE, this.builder.resize.bind(this.builder));
        this.gravityForce = this.events.subscribe(Event.RESIZE, this.world.resize.bind(this.world));
        this.shaker = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));
    };

    Game.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardControls);
        this.events.unsubscribe(this.gamePadControls);
        this.events.unsubscribe(this.playerMovement);
        this.events.unsubscribe(this.ballMovement);
        if (AppFlag.PLAYER_FACE)
            this.events.unsubscribe(this.eyeMovement);
        this.events.unsubscribe(this.playerBallCollision);
        this.events.unsubscribe(this.wallCollision);
        this.events.unsubscribe(this.paddleForce);
        this.events.unsubscribe(this.ballForce);
        this.events.unsubscribe(this.gravityForce);
        this.events.unsubscribe(this.camera);
        this.events.unsubscribe(this.shaker);
        this.world.preDestroy();
    };

    return Game;
})(H5.Width, H5.Height, H5.Event, G.installPlayerKeyBoard, G.installPlayerGamePad, G.createWorld, G.AppFlag);