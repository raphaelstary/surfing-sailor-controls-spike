G.createViewPort = (function (Width, Height) {
    "use strict";

    function createViewPort(stage) {
        var viewPort = stage.createRectangle(false)
            .setPosition(Width.HALF, Height.HALF)
            .setWidth(Width.FULL)
            .setHeight(Height.FULL);
        viewPort.show = false;
        return viewPort;
    }

    return createViewPort;
})(H5.Width, H5.Height);