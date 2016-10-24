G.GoFullScreen = (function (document, window, getDevicePixelRatio, Math, installOneTimeTap, Width, Height) {
    "use strict";

    function GoFullScreen(services) {
        this.stage = services.stage;
        this.sceneStorage = services.sceneStorage;
        this.timer = services.timer;
        this.device = services.device;
    }

    GoFullScreen.prototype.show = function (next) {
        var self = this;

        var goFullScreenTxt = this.stage.createText('START GAME').setPosition(Width.HALF, Height.HALF);

        function installFullScreen() {
            // full screen hack for IE11, it accepts only calls from some DOM elements like button, link or div NOT
            // canvas
            var screenElement = document.getElementsByTagName('canvas')[0];
            var parent = screenElement.parentNode;
            var wrapper = document.createElement('div');
            parent.replaceChild(wrapper, screenElement);
            wrapper.appendChild(screenElement);

            installOneTimeTap(wrapper, function () {
                wrapper.parentNode.replaceChild(screenElement, wrapper);
                goFullScreen();
            });
        }

        installFullScreen();

        function goFullScreen() {

            self.timer.doLater(function () {
                toNextScene();
            }, 6);

            self.device.requestFullScreen();
        }

        var itIsOver = false;

        function toNextScene() {
            if (itIsOver)
                return;
            itIsOver = true;
            goFullScreenTxt.remove();
            self.timer.doLater(next, 16);
        }
    };

    return GoFullScreen;
})(window.document, window, H5.getDevicePixelRatio, Math, H5.installOneTimeTap, H5.Width, H5.Height);