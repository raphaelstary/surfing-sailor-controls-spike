G.createWorld = (function (Builder, PlayerController, World, Camera, createViewPort, ScreenShaker) {
    "use strict";

    function createWorld(services, gameOverFn, speedometer, debugSpeed) {

        var shaker = new ScreenShaker(services.device);
        var viewPort = createViewPort(services.stage);
        var camera = new Camera(viewPort);

        shaker.add(viewPort);

        var scenery = [];
        var balls = [];
        var obstacles = [];
        var builder = new Builder(services, scenery, balls, obstacles, camera, speedometer);

        function initLevel() {
            var player = builder.createPlayer();
            builder.createDefaultWalls();
            // builder.createRandomBall();

            return player;
        }

        var player = initLevel();
        var world = new World(services.device, camera, shaker, builder, player, scenery, balls, obstacles, gameOverFn, debugSpeed);
        var playerController = new PlayerController(services.device, player, builder, world);

        return {
            world: world,
            builder: builder,
            controller: playerController,
            camera: camera,
            shaker: shaker,
            player: player
        };
    }

    return createWorld;
})(G.Builder, G.PlayerController, G.World, G.Camera, G.createViewPort, H5.ScreenShaker);