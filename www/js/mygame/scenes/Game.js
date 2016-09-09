G.Game = (function (Width, Height, Event, installPlayerKeyBoard, installPlayerGamePad, createWorld) {
    "use strict";

    /** @property counter */
    function Game(services) {
        this.events = services.events;
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

            self.nextScene(score);
        }

        var wrapper = createWorld(this.services, count, gameOver);

        this.keyBoardControls = installPlayerKeyBoard(this.events, wrapper.controller);
        this.gamePadControls = installPlayerGamePad(this.events, wrapper.controller);

        this.playerMovement = this.events.subscribe(Event.TICK_MOVE,
            wrapper.world.updatePlayerMovement.bind(wrapper.world));
        this.ballMovement = this.events.subscribe(Event.TICK_MOVE,
            wrapper.world.updateBallMovement.bind(wrapper.world));
        this.playerBallCollision = this.events.subscribe(Event.TICK_CAMERA,
            wrapper.world.checkBallPaddleCollision.bind(wrapper.world));
        this.wallCollision = this.events.subscribe(Event.TICK_COLLISION,
            wrapper.world.checkCollisions.bind(wrapper.world));
        this.paddleForce = this.events.subscribe(Event.RESIZE, wrapper.controller.resize.bind(wrapper.controller));
        this.ballForce = this.events.subscribe(Event.RESIZE, wrapper.builder.resize.bind(wrapper.builder));

        this.gravityForce = this.events.subscribe(Event.RESIZE, wrapper.world.resize.bind(wrapper.world));

        wrapper.builder.createDefaultWalls();
        wrapper.builder.createRandomBall();

        this.world = wrapper.world;
        this.controller = wrapper.controller;
    };

    Game.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardControls);
        this.events.unsubscribe(this.gamePadControls);
        this.events.unsubscribe(this.playerMovement);
        this.events.unsubscribe(this.ballMovement);
        this.events.unsubscribe(this.playerBallCollision);
        this.events.unsubscribe(this.wallCollision);
        this.events.unsubscribe(this.paddleForce);
        this.events.unsubscribe(this.ballForce);
        this.events.unsubscribe(this.gravityForce);
        this.world.preDestroy();
    };

    return Game;
})(H5.Width, H5.Height, H5.Event, G.installPlayerKeyBoard, G.installPlayerGamePad, G.createWorld);