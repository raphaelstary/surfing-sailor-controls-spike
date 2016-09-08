G.installMyScenes = (function (Scenes, Start, Tutorial, Game, Score, MVVMScene, Scene) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        var scenes = new Scenes();

        var start = new Start(services);
        var startScene = new MVVMScene(services, services.scenes[Scene.START], start, Scene.START);

        scenes.add(startScene.show.bind(startScene), true);

        var tutorial = new Tutorial(services);
        var tutorialScene = new MVVMScene(services, services.scenes[Scene.TUTORIAL], tutorial, Scene.TUTORIAL);

        scenes.add(tutorialScene.show.bind(tutorialScene), true);

        var game = new Game(services);
        var gameScene = new MVVMScene(services, services.scenes[Scene.GAME], game, Scene.GAME);

        scenes.add(gameScene.show.bind(gameScene));

        var score = new Score(services);
        var scoreScene = new MVVMScene(services, services.scenes[Scene.SCORE], score, Scene.SCORE);

        scenes.add(scoreScene.show.bind(scoreScene));

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, G.Start, G.Tutorial, G.Game, G.Score, H5.MVVMScene, G.Scene);