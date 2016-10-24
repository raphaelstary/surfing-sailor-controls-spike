G.MyGameResources = (function (File, UI, URL, addFontToDOM, SoundSpriteManager) {
    "use strict";

    var font, scenes, audioInfo;

    function registerFiles(resourceLoader) {
        font = resourceLoader.addFont(File.FONT);
        scenes = resourceLoader.addJSON(File.SCENES);
        audioInfo = resourceLoader.addJSON(File.AUDIO_INFO);

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

        var sounds = new SoundSpriteManager();
        sounds.load(audioInfo);

        return {
            scenes: scenes,
            sounds: sounds
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(G.File, G.UI, window.URL || window.webkitURL, H5.addFontToDOM, H5.SoundSpriteManager);