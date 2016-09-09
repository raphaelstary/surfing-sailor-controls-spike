G.Tutorial = (function (Key, Event) {
    "use strict";

    function Tutorial(services) {
        this.events = services.events;
    }

    //noinspection JSUnusedGlobalSymbols
    /** @this ViewModel */
    Tutorial.prototype.skipUp = function () {
        this.nextScene();
    };
    //noinspection JSUnusedGlobalSymbols
    Tutorial.prototype.skipDown = function () {
    };

    Tutorial.prototype.postConstruct = function () {
        this.itIsOver = false;
        var self = this;
        this.keyListener = this.events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (self.itIsOver)
                return;

            if (keyBoard[Key.ENTER] || keyBoard[Key.SPACE]) {
                self.itIsOver = true;
                self.nextScene();
            }
        });

        this.gamePadListener = this.events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (self.itIsOver)
                return;

            if (gamePad.isAPressed() || gamePad.isStartPressed()) {
                self.itIsOver = true;
                self.nextScene();
            }
        });
    };

    Tutorial.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Tutorial;
})(H5.Key, H5.Event);