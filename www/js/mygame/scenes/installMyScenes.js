G.installMyScenes = (function (Scenes, Start, Tutorial, Game, Score, MVVMScene, Scene, Event, Stats, AppFlag, Width,
    Height, Font, UI, GoFullScreen) {
    "use strict";

    function installMyScenes(services) {
        // create your scenes and add them to the scene manager

        function toHsl(hue, saturation, brightness) {
            var SB = {
                s: saturation / 100,
                b: brightness / 100
            };
            var SL = {
                s: 0,
                l: 0
            };
            SL.l = (2 - SB.s) * SB.b / 2;
            SL.s = SL.l && SL.l < 1 ? SB.s * SB.b / (SL.l < 0.5 ? SL.l * 2 : 2 - SL.l * 2) : SL.s;

            return 'hsl(' + hue + ',' + (SL.s * 100 | 0) + '%,' + (SL.l * 100 | 0) + '%)';
        }

        function setColors() {
            var hue = 300;
            var saturation = 75;
            var brightness = 75;
            var step = 25;

            UI.PLAYER_COLOR = toHsl(hue, saturation, brightness);
            UI.PLAYER_SHADOW_COLOR = toHsl(hue, saturation, brightness - step);

            UI.WALL_COLOR = toHsl(hue, saturation - step * 2, brightness - step);

            UI.BALL_COLOR = toHsl(hue, saturation - step, brightness);
            UI.BALL_SHADOW_COLOR = toHsl(hue, saturation - step, brightness - step);

            UI.SCREEN_HIGHLIGHT_COLOR = toHsl(hue, saturation - step, brightness - step);
            UI.SCREEN_COLOR = toHsl(hue, saturation, brightness - step * 2);

            services.screen.style.backgroundColor = UI.SCREEN_COLOR;
        }

        setColors();

        var scenes = new Scenes();

        // if (services.device.isMobile) {
        //     var goFullScreen = new GoFullScreen(services);
        //     scenes.add(goFullScreen.show.bind(goFullScreen), true);
        // }

        // var start = new Start(services);
        // var startScene = new MVVMScene(services, services.scenes[Scene.START], start, Scene.START);
        //
        // scenes.add(startScene.show.bind(startScene), true);

        // var tutorial = new Tutorial(services);
        // var tutorialScene = new MVVMScene(services, services.scenes[Scene.TUTORIAL], tutorial, Scene.TUTORIAL);
        //
        // scenes.add(tutorialScene.show.bind(tutorialScene), true);

        var game = new Game(services);
        var gameScene = new MVVMScene(services, services.scenes[Scene.GAME], game, Scene.GAME);

        scenes.add(gameScene.show.bind(gameScene));

        // var score = new Score(services);
        // var scoreScene = new MVVMScene(services, services.scenes[Scene.SCORE], score, Scene.SCORE);
        //
        // scenes.add(scoreScene.show.bind(scoreScene));

        services.events.subscribe(Event.TICK_START, Stats.start);
        services.events.subscribe(Event.TICK_END, Stats.end);

        services.sceneStorage.msTotal = 0;
        services.sceneStorage.msCount = 0;
        services.sceneStorage.fpsTotal = 0;
        services.sceneStorage.fpsCount = 0;

        if (AppFlag.DEBUG) {
            var ms = services.stage.createText('0').setPosition(Width.get(1920, 1880), Height.get(1080, 1020))
                .setSize(Font._60).setZIndex(11).setColor('white');
            var fps = services.stage.createText('0').setPosition(Width.get(1920, 1880), Height.get(1080, 1040))
                .setSize(Font._60).setZIndex(11).setColor('white');

            services.events.subscribe(Event.TICK_DRAW, function () {
                ms.data.msg = Stats.getMs().toString() + " ms";
                fps.data.msg = Stats.getFps().toString() + " fps";

                services.sceneStorage.msTotal += Stats.getMs();
                services.sceneStorage.msCount++;
                services.sceneStorage.fpsTotal += Stats.getFps();
                services.sceneStorage.fpsCount++;
            });
        } else {
            services.events.subscribe(Event.TICK_DRAW, function () {
                services.sceneStorage.msTotal += Stats.getMs();
                services.sceneStorage.msCount++;
                services.sceneStorage.fpsTotal += Stats.getFps();
                services.sceneStorage.fpsCount++;
            });
        }

        return scenes;
    }

    return installMyScenes;
})(H5.Scenes, G.Start, G.Tutorial, G.Game, G.Score, H5.MVVMScene, G.Scene, H5.Event, H5.Stats, G.AppFlag, H5.Width,
    H5.Height, H5.Font, G.UI, G.GoFullScreen);