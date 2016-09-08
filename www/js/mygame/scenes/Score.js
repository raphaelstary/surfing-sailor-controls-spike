G.Score = (function (Key, Event) {
    "use strict";

    /**
     * @property score
     * @property best
     * @property share
     * @property new
     */
    function Score(services) {
        this.events = services.events;
    }

    //noinspection JSUnusedGlobalSymbols
    Score.prototype.playDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    /** @this ViewModel */
    Score.prototype.playUp = function () {
        this.nextScene();
    };

    /** @this Score */
    Score.prototype.postConstruct = function (score) {
        this.score.setText(score);
        this.best.setText(score);
        this.new.show = false;
        this.share.show = false;

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

    Score.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Score;
})(H5.Key, H5.Event);