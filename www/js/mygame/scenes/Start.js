G.Start = (function () {
    "use strict";

    function Start() {
    }

    //noinspection JSUnusedGlobalSymbols
    Start.prototype.playDown = function () {
    };

    //noinspection JSUnusedGlobalSymbols
    /** @this ViewModel */
    Start.prototype.playUp = function () {
        this.nextScene();
    };

    return Start;
})();