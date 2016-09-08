G.Start = (function (Key, Event) {
    "use strict";

    function Start(services) {
        this.events = services.events;
    }

    //noinspection JSUnusedGlobalSymbols
    Start.prototype.playDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    /** @this ViewModel */
    Start.prototype.playUp = function () {
        this.nextScene();
    };

    Start.prototype.postConstruct = function () {
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

    Start.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Start;
})(H5.Key, H5.Event);