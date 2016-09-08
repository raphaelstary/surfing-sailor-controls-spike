G.Tutorial = (function () {
    "use strict";

    function Tutorial() {
    }

    //noinspection JSUnusedGlobalSymbols
    /** @this ViewModel */
    Tutorial.prototype.skipUp = function () {
        this.nextScene();
    };
    //noinspection JSUnusedGlobalSymbols
    Tutorial.prototype.skipDown = function () {
    };

    return Tutorial;
})();