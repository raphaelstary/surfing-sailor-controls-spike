G.Score = (function () {
    "use strict";

    /**
     * @property score
     * @property best
     * @property share
     * @property new
     */
    function Score() {
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
    };

    return Score;
})();