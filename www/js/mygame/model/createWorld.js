G.createWorld = (function (Builder, PlayerController, World, Camera, createViewPort, ScreenShaker) {
    "use strict";

    function createWorld(services, paddleHitFn, gameOverFn) {

        var shaker = new ScreenShaker(services.device);
        var viewPort = createViewPort(services.stage);
        var camera = new Camera(viewPort);

        shaker.add(viewPort);

        var scenery = [];
        var balls = [];
        var obstacles = [];
        var builder = new Builder(services, scenery, balls, obstacles, camera);

        function initLevel() {
            var player = builder.createPlayer();
            builder.createDefaultWalls();
            builder.createRandomBall();

            return player;
        }

        var player = initLevel();
        var playerController = new PlayerController(services.device, player, builder);

        return {
            world: new World(services.device, camera, shaker, builder, player, scenery, balls, obstacles, paddleHitFn, gameOverFn),
            builder: builder,
            controller: playerController,
            camera: camera,
            shaker: shaker,
            player: player
        };
    }

    return createWorld;
})(G.Builder, G.PlayerController, G.World, G.Camera, G.createViewPort, H5.ScreenShaker);