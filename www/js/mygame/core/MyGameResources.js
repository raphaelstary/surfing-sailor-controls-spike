G.MyGameResources = (function (File, UI, URL, addFontToDOM) {
    "use strict";

    var font, scenes;

    function registerFiles(resourceLoader) {
        font = resourceLoader.addFont(File.FONT);
        scenes = resourceLoader.addJSON(File.SCENES);
        return resourceLoader.getCount();
    }

    function processFiles() {
        if (URL) {
            addFontToDOM([
                {
                    name: UI.FONT,
                    url: URL.createObjectURL(font.blob)
                }
            ]);
        }
        return {
            scenes: scenes
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(G.File, G.UI, window.URL || window.webkitURL, H5.addFontToDOM);