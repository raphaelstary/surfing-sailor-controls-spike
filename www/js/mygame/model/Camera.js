G.Camera = (function () {
    "use strict";

    function Camera(viewPort) {
        this.viewPort = viewPort;

        // introducing a 3rd universe:
        // 1st grid tiles (u,v)
        // 2nd px screen coordinates (x,y)
        // 3rd px space coordinates (x,y) 
        // - while screen coordinates are relative, space coordinates are an absolute representation of tiles in px
    }

    Camera.prototype.calcScreenPosition = function (entity, drawable) {
        var cornerX = this.viewPort.getCornerX();
        var cornerY = this.viewPort.getCornerY();

        drawable.x = entity.x - cornerX * this.viewPort.scale;
        drawable.y = entity.y - cornerY * this.viewPort.scale;
    };

    Camera.prototype.move = function (anchor) {
        this.viewPort.x = anchor.x;
        this.viewPort.y = anchor.y;
    };

    return Camera;
})();