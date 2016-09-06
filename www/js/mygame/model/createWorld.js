G.createWorld = (function (Builder, PlayerController, World) {
    "use strict";

    function createWorld(stage, device, paddleHitFn, gameOverFn) {

        var scenery = [];
        var balls = [];
        var obstacles = [];
        var builder = new Builder(stage, device, scenery, balls, obstacles);
        var player = builder.createPlayer();
        var playerController = new PlayerController(device, player, builder);
        return {
            world: new World(device, player, scenery, balls, obstacles, paddleHitFn, gameOverFn),
            builder: builder,
            controller: playerController
        };
    }

    return createWorld;
})(G.Builder, G.PlayerController, G.World);