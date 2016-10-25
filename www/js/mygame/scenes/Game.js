G.Game = (function (Width, Height, Event, installPlayerKeyBoard, installPlayerGamePad, createWorld, AppFlag, Sound,
    Font) {
    "use strict";

    /** @property counter */
    function Game(services) {
        this.events = services.events;
        this.timer = services.timer;
        this.sounds = services.sounds;
        this.services = services;
    }

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.leftUp = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.leftDown = function () {
        // this.controller.jumpLeft();
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.rightUp = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.rightDown = function () {
        // this.controller.jumpRight();
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.bottomUp = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    Game.prototype.bottomDown = function () {
        // this.controller.down();
    };

    /** @this Game */
    Game.prototype.postConstruct = function () {
        var isOver = false;
        var score = 0;

        // this.counter.show = false;
        this.counter.setText('slow');
        this.counter.setSize(Font._15);
        this.counter.setPosition(Width.HALF, Height.HALF);

        var self = this;

        function gameOver() {
            if (isOver)
                return;
            isOver = true;

            self.timer.doLater(function () {
                self.nextScene(score);
            }, 5);
        }

        var wrapper = createWorld(this.services, gameOver, this.counter);

        this.camera = this.events.subscribe(Event.TICK_CAMERA, wrapper.world.updateCamera.bind(wrapper.world));
        this.world = wrapper.world;
        this.controller = wrapper.controller;
        this.builder = wrapper.builder;
        this.shaker = wrapper.shaker;

        wrapper.builder.animateSceneAppearance(wrapper.player).then(this.__registerEventListeners, this);

        this.__startMusic();
    };

    Game.prototype.__startMusic = function () {
        if (!AppFlag.MUSIC)
            return;
        var self = this;
        self.stopMusic = false;
        self.lastLoop = 0;

        function loopMusic(sound) {
            if (self.stopMusic)
                return;

            var loop = self.lastLoop = self.sounds.play(sound);
            self.sounds.notifyOnce(loop, 'end', loopMusic.bind(undefined, sound));
        }

        loopMusic(Sound.SABUMY);
    };

    Game.prototype.__stopMusic = function () {
        if (!AppFlag.MUSIC)
            return;
        this.stopMusic = true;
        if (this.lastLoop !== 0)
            this.sounds.fadeOut(this.lastLoop);
    };

    Game.prototype.__registerEventListeners = function () {
        this.keyBoardControls = installPlayerKeyBoard(this.events, this.controller);
        this.gamePadControls = installPlayerGamePad(this.events, this.controller);
        this.controls = this.events.subscribe(Event.TICK_POST_INPUT, this.controller.update.bind(this.controller));

        this.playerMovement = this.events.subscribe(Event.TICK_MOVE, this.world.updatePlayerMovement.bind(this.world));

        this.wallCollision = this.events.subscribe(Event.TICK_COLLISION, this.world.checkCollisions.bind(this.world));
        this.paddleForce = this.events.subscribe(Event.RESIZE, this.controller.resize.bind(this.controller));
        this.ballForce = this.events.subscribe(Event.RESIZE, this.builder.resize.bind(this.builder));
        this.gravityForce = this.events.subscribe(Event.RESIZE, this.world.resize.bind(this.world));
        this.shaker = this.events.subscribe(Event.TICK_MOVE, this.shaker.update.bind(this.shaker));
    };

    Game.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyBoardControls);
        this.events.unsubscribe(this.gamePadControls);
        this.events.unsubscribe(this.controls);

        this.events.unsubscribe(this.playerMovement);

        this.events.unsubscribe(this.wallCollision);
        this.events.unsubscribe(this.paddleForce);
        this.events.unsubscribe(this.ballForce);
        this.events.unsubscribe(this.gravityForce);
        this.events.unsubscribe(this.camera);
        this.events.unsubscribe(this.shaker);
        this.world.preDestroy();

        this.__stopMusic();
    };

    return Game;
})(H5.Width, H5.Height, H5.Event, G.installPlayerKeyBoard, G.installPlayerGamePad, G.createWorld, G.AppFlag, G.Sound,
    H5.Font);