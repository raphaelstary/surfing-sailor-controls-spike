G.Score = (function (Key, Event, Storage, parseInt, loadInteger, localStorage, Transition) {
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

        var best = loadInteger(Storage.BEST);
        var points = parseInt(score);
        var newRecord = points > best;

        if (newRecord) {
            localStorage.setItem(Storage.BEST, points);
            best = points;

            this.new.show = true;
            this.new.setAlpha(1);
            this.new.opacityPattern([
                {
                    value: 0.5,
                    duration: 30,
                    easing: Transition.LINEAR
                }, {
                    value: 1,
                    duration: 30,
                    easing: Transition.LINEAR
                }
            ], true);
        }

        this.score.setText(points.toString());
        this.best.setText(best.toString());
    };

    Score.prototype.preDestroy = function () {
        this.events.unsubscribe(this.keyListener);
        this.events.unsubscribe(this.gamePadListener);
    };

    return Score;
})(H5.Key, H5.Event, G.Storage, parseInt, H5.loadInteger, H5.lclStorage, H5.Transition);