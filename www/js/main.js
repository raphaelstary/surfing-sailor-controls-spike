window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.pointer().keyBoard().responsive().gamePad().build(G.MyGameResources, G.installMyScenes);
    app.start();
};