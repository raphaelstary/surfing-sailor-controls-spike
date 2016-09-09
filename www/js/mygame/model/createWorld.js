G.createWorld = (function (Builder, PlayerController, World) {
    "use strict";

    function createWorld(services, paddleHitFn, gameOverFn) {

        var scenery = [];
        var balls = [];
        var obstacles = [];
        var builder = new Builder(services, scenery, balls, obstacles);
        var player = builder.createPlayer();
        var playerController = new PlayerController(services.device, player, builder);
        return {
            world: new World(services.device, player, scenery, balls, obstacles, paddleHitFn, gameOverFn),
            builder: builder,
            controller: playerController
        };
    }

    return createWorld;
})(G.Builder, G.PlayerController, G.World);