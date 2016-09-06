window.onload = function () {
    "use strict";

    var app = H5.Bootstrapper.pointer().keyBoard().responsive().build(G.MyGameResources, G.installMyScenes);
    app.start();
};