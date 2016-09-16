G.Builder = (function (Vectors, range, UI, GamePlay, Math, Width, Height, wrap, Transition, Promise, CallbackCounter,
    Event, subtract, AppFlag, multiply) {
    "use strict";

    function Builder(services, scenery, balls, obstacles, camera, counter) {
        this.stage = services.stage;
        this.timer = services.timer;
        this.events = services.events;
        this.device = services.device;
        this.screen = services.screen;

        this.scenery = scenery;
        this.balls = balls;
        this.obstacles = obstacles;

        this.camera = camera;
        this.counter = counter;

        this.resize(services.device);
    }

    Builder.prototype.resize = function (event) {
        this.magnitude = Math.floor(event.height / UI.HEIGHT * GamePlay.MAGNITUDE);
        this.currentHeight = event.height;
        this.tileHeight = Math.floor(event.height / UI.HEIGHT * GamePlay.TILE);
    };

    Builder.prototype.__createWall = function (xFn, yFn, widthFn, heightFn, filled) {
        var wall = this.stage.createRectangle(filled).setPosition(xFn, yFn).setWidth(widthFn)
            .setHeight(heightFn).setLineWidth(wrap(2));
        wall.show = false;
        wall.drawable = this.stage.createRectangle(filled).setColor(UI.WALL_COLOR).setPosition(xFn, yFn)
            .setWidth(widthFn)
            .setHeight(heightFn).setLineWidth(wrap(2));
        return wall;
    };

    Builder.prototype.createDefaultWalls = function () {

        function getOne(height) {
            return height / UI.HEIGHT;
        }

        function leftX(width, height) {
            return Math.floor(width / 2 - (UI.WIDTH / 2 * getOne(height)));
        }

        function rightX(width, height) {
            return Math.floor(width / 2 + (UI.WIDTH / 2 * getOne(height)));
        }

        //noinspection JSUnusedLocalSymbols
        function getWidth_tile(width, height) {
            return Math.floor(getOne(height) * GamePlay.TILE);
        }

        //noinspection JSUnusedLocalSymbols
        function getWidth_full(width, height) {
            return Math.floor(getOne(height) * UI.WIDTH);
        }

        var wallLeft = this.__createWall(leftX, Height.HALF, getWidth_tile, Height.FULL, true);
        wallLeft.drawable.justWidthScale = true;

        var wallRight = this.__createWall(rightX, Height.HALF, getWidth_tile, Height.FULL, true);
        wallRight.drawable.justWidthScale = true;

        var wallTop = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, GamePlay.TILE / 2), getWidth_full,
            Height.get(UI.HEIGHT, GamePlay.TILE), true);
        wallTop.drawable.justHeightScale = true;

        var wallBottom = this.__createWall(Width.HALF, Height.get(UI.HEIGHT, UI.HEIGHT - GamePlay.TILE / 2),
            getWidth_full, Height.get(UI.HEIGHT, GamePlay.TILE));
        wallBottom.drawable.justHeightScale = true;

        this.scenery.push(wallTop, wallLeft, wallRight);
        this.obstacles.push(wallBottom);
    };

    Builder.prototype.__createPlayer = function (color, alpha, zIndex) {
        var drawable = this.stage.createRectangle(true)
            .setColor(color)
            .setWidth(function (width, height) {
                return Math.floor(height / UI.HEIGHT * GamePlay.TILE * 12);
            })
            .setHeight(Height.get(UI.HEIGHT, GamePlay.TILE * 2));

        if (alpha)
            drawable.setAlpha(alpha);

        if (zIndex)
            drawable.setZIndex(zIndex);

        return drawable;
    };

    Builder.prototype.__createPlayerEntity = function () {
        var player = this.__createPlayer(UI.PLAYER_COLOR).setPosition(Width.HALF, Height.get(6, 5));
        player.show = false;
        player.drawable = this.__createPlayer(UI.PLAYER_COLOR).setPosition(Width.HALF, Height.get(6, 5));
        return player;
    };

    Builder.prototype.__createShadow = function (color, alpha, zIndex) {
        var shadow = this.__createPlayer(color, alpha, zIndex);
        shadow.show = false;
        shadow.drawable = this.__createPlayer(color, alpha, zIndex);
        return shadow;
    };

    Builder.prototype.__createFace = function (player) {
        player.hasFace = true;

        function leftEyeX(width, height) {
            return player.x - 3 * tileWidth(width, height);
        }

        function rightEyeX(width, height) {
            return player.x + 3 * tileWidth(width, height);
        }

        function mouthY(height, width) {
            return player.y + Height.get(UI.HEIGHT, GamePlay.TILE / 2)(height, width);
        }

        var deps = [player];

        var mouth = player.mouth = this.stage.createRectangle(true)
            .setPosition(wrap(player, 'x'), mouthY, deps)
            .setWidth(multiply(tileWidth, 2))
            .setHeight(Height.get(UI.HEIGHT, GamePlay.TILE / 4))
            .setZIndex(4)
            .setColor(UI.MOUTH_COLOR);
        mouth.show = false;
        mouth.drawable = this.stage.createRectangle(true)
            .setPosition(wrap(player, 'x'), mouthY, deps)
            .setWidth(multiply(tileWidth, 2))
            .setHeight(Height.get(UI.HEIGHT, GamePlay.TILE / 4))
            .setZIndex(4)
            .setColor(UI.MOUTH_COLOR);
        mouth.xFn = wrap(player, 'x');
        mouth.yFn = mouthY;

        mouth.drawable.justWidthScale = true;
        mouth.drawable.setScale(0.25);

        var leftEye = player.leftEye = this.__createBall(UI.EYE_COLOR, 1, 4)
            .setPosition(leftEyeX, wrap(player, 'y'), deps);
        leftEye.xFn = leftEyeX;
        leftEye.yFn = wrap(player, 'y');

        var leftPupil = player.leftPupil = this.__createBall(UI.PUPIL_COLOR, 1, 5)
            .setPosition(leftEyeX, wrap(player, 'y'), deps);
        leftPupil.setScale(0.5);
        leftPupil.drawable.setScale(0.75);
        leftPupil.xFn = leftEyeX;
        leftPupil.yFn = wrap(player, 'y');

        var rightEye = player.rightEye = this.__createBall(UI.EYE_COLOR, 1, 4)
            .setPosition(rightEyeX, wrap(player, 'y'), deps);
        rightEye.xFn = rightEyeX;
        rightEye.yFn = wrap(player, 'y');

        var rightPupil = player.rightPupil = this.__createBall(UI.PUPIL_COLOR, 1, 5)
            .setPosition(rightEyeX, wrap(player, 'y'), deps);
        rightPupil.setScale(0.5);
        rightPupil.drawable.setScale(0.75);
        rightPupil.xFn = rightEyeX;
        rightPupil.yFn = wrap(player, 'y');

        function openEyes() {
            leftEye.drawable.show = true;
            rightEye.drawable.show = true;
            leftPupil.drawable.show = true;
            rightPupil.drawable.show = true;
        }

        function closeEyes() {
            leftEye.drawable.show = false;
            rightEye.drawable.show = false;
            leftPupil.drawable.show = false;
            rightPupil.drawable.show = false;
        }

        var self = this;

        function startEyeAnimation() {
            openEyes();
            self.timer.doLater(function () {
                closeEyes();
                self.timer.doLater(startEyeAnimation, 6);
            }, 120);
        }

        startEyeAnimation();
    };

    Builder.prototype.createPlayer = function () {
        var player = this.__createPlayerEntity();

        if (AppFlag.PLAYER_FACE) {
            this.__createFace(player);
        }

        if (AppFlag.PLAYER_SHADOW)
            player.shadows = [
                this.__createShadow(UI.PLAYER_SHADOW_COLOR, 1, 2),
                this.__createShadow(UI.PLAYER_SHADOW_COLOR, 0.8, 2),
                this.__createShadow(UI.PLAYER_SHADOW_COLOR, 0.6, 2),
                this.__createShadow(UI.PLAYER_SHADOW_COLOR, 0.4, 2),
                this.__createShadow(UI.PLAYER_SHADOW_COLOR, 0.2, 2)
            ];

        player.lastX = player.x;
        player.lastY = player.y;
        player.forceX = 0;
        player.forceY = 0;

        return player;
    };

    Builder.prototype.__createFrameOfPlayer = function (player, y, lineWidth, alpha) {
        var dep = [player];
        var frame = this.stage.createRectangle(false)
            .setPosition(wrap(player, 'x'), wrap(y), dep)
            .setWidth(player.getWidth.bind(player), dep)
            .setHeight(player.getHeight.bind(player), dep)
            .setLineWidth(function (width, height) {
                var number = Math.floor(height / UI.HEIGHT * lineWidth);
                if (lineWidth > number)
                    return lineWidth;
                return number;
            });

        frame.show = false;
        frame.drawable = this.stage.createRectangle(false)
            .setColor(UI.PLAYER_FRAME_COLOR)
            .setPosition(wrap(player, 'x'), wrap(y), dep)
            .setWidth(player.getWidth.bind(player), dep)
            .setHeight(player.getHeight.bind(player), dep)
            .setLineWidth(function (width, height) {
                var number = Math.floor(height / UI.HEIGHT * lineWidth);
                if (lineWidth > number)
                    return lineWidth;
                return number;
            })
            .setAlpha(alpha);

        return frame;
    };

    Builder.prototype.reset = function (player) {
        player.y = this.currentHeight - 2 * this.tileHeight - 1;

        var diff = player.y - player.lastY;

        var framesCount = Math.floor(diff / (UI.HEIGHT / 20));
        var frames = [];
        var distance = Math.floor(diff / (framesCount + 1));
        var alphaDiff = 1 / framesCount;
        for (var i = 1; i <= framesCount; i++) {
            var yPos = player.y - distance * i;
            var alpha = 1 - i * alphaDiff;
            if (alpha >= 0.1)
                frames.push(this.__createFrameOfPlayer(player, yPos, 2, alpha));
        }

        frames.reverse().forEach(function (frame, index) {
            this.timer.doLater(function () {
                frame.remove();
                frame.drawable.remove();
            }, index * 2 + 1);
        }, this);

        this.timer.doLater(function () {
            delete player.frames;
        }, frames.length * 2 + 1);

        player.frames = frames;

        player.lastX = player.x;
        player.lastY = player.y;
    };

    Builder.prototype.animateImpactOnTop = function (x, y) {
        this.__animateImpact(x, y, 180, 360);
    };

    Builder.prototype.animateImpactOnLeft = function (x, y) {
        this.__animateImpact(x, y, 90, 270);
    };

    Builder.prototype.animateImpactOnRight = function (x, y) {
        this.__animateImpact(x, y, 270, 450);
    };

    Builder.prototype.animateImpactOnBottom = function (x, y) {
        this.__animateImpact(x, y, 0, 180);
    };

    Builder.prototype.__animateImpact = function (x, y, startAngle, endAngle) {
        if (!AppFlag.PARTICLES)
            return;

        var magnitudeA = Math.floor(this.device.height / UI.HEIGHT * 2.5);
        var magnitudeB = Math.floor(this.device.height / UI.HEIGHT * 5);

        function animateParticle() {
            var particle = this.__createParticle(x, y, magnitudeA, magnitudeB, startAngle, endAngle, 0.1, 0.5);
            var moveId = this.events.subscribe(Event.TICK_MOVE, function () {
                particle.x += Math.round(particle.forceX);
                particle.y += Math.round(particle.forceY);
            });
            var cameraId = this.events.subscribe(Event.TICK_CAMERA, function () {
                this.camera.calcScreenPosition(particle, particle.drawable);
            }, this);
            particle.drawable.opacityTo(0.2)
                .setDuration(15)
                .setSpacing(Transition.LINEAR)
                .setCallback(function () {
                    this.events.unsubscribe(moveId);
                    this.events.unsubscribe(cameraId);
                    particle.drawable.remove();
                    particle.remove();
                }, this);
        }

        for (var i = 0; i < 10; i++) {
            var later = range(0, 5);
            if (later < 1) {
                animateParticle.call(this);
            } else {
                this.timer.doLater(animateParticle, later, this);
            }
        }
    };

    Builder.prototype.__createParticle = function (x, y, startMagnitude, endMagnitude, startAngle, endAngle, startSize,
        endSize) {

        var angle = Vectors.toRadians(range(startAngle, endAngle));
        var magnitude = range(startMagnitude, endMagnitude);
        var zoom = range(startSize * 10, endSize * 10) / 10;

        var particle = this.__createBall(UI.PARTICLE_COLOR, 1, 0)
            .setPosition(wrap(x), wrap(y));

        particle.forceX = Vectors.getX(0, magnitude, angle);
        particle.forceY = Vectors.getY(0, magnitude, angle);

        particle.drawable.setScale(zoom);

        return particle;
    };

    Builder.prototype.createStartBall = function () {
        var randomDegrees = range(50, 60);
        var angle = Vectors.toRadians(randomDegrees);
        this.createBall({
            x: 300,
            y: 100
        }, {
            x: Vectors.getX(0, this.magnitude, angle),
            y: Vectors.getY(0, this.magnitude, angle)
        }, angle);
    };

    Builder.prototype.create2ndBall = function () {
        var randomDegrees = range(0, 1) ? range(260, 265) : range(275, 280);
        var angle = Vectors.toRadians(randomDegrees);
        this.createBall({
            x: 300,
            y: 100
        }, {
            x: Vectors.getX(0, this.magnitude, angle),
            y: Vectors.getY(0, this.magnitude, angle)
        }, angle);
    };

    Builder.prototype.createRandomBall = function () {
        if (this.balls.length == 0) {
            this.createStartBall();
            return;
        }
        if (this.balls.length == 1) {
            this.create2ndBall();
            return;
        }

        var randomDegrees = range(0, 1) ? range(15, 80) : range(100, 165);
        var angle = Vectors.toRadians(randomDegrees);
        this.createBall({
            x: 300,
            y: 100
        }, {
            x: Vectors.getX(0, this.magnitude, angle),
            y: Vectors.getY(0, this.magnitude, angle)
        }, angle);
    };

    Builder.prototype.createBall = function (point, direction, angle) {
        var ball = this.__createBall(UI.BALL_COLOR)
            .setPosition(function (width, height) {
                var one = height / UI.HEIGHT;
                return Math.floor(width / 2 - UI.WIDTH / 2 * one + one * point.x);
            }, Height.get(UI.HEIGHT, point.y));

        if (AppFlag.BALL_ROTATION && angle !== undefined)
            ball.drawable.setRotation(angle);

        if (AppFlag.BALL_SHADOW)
            ball.shadows = [
                this.__createBall(UI.BALL_SHADOW_COLOR, 1, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.9, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.8, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.7, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.6, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.5, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.4, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.3, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.2, 2),
                this.__createBall(UI.BALL_SHADOW_COLOR, 0.1, 2)
            ];

        ball.lastX = ball.x;
        ball.lastY = ball.y;

        this.balls.push(ball);

        ball.forceX = direction.x;
        ball.forceY = direction.y;
    };

    Builder.prototype.__createBall = function (color, alpha, zIndex) {
        var ball = this.__createBallDrawable(color, alpha, zIndex);
        ball.show = false;
        ball.drawable = this.__createBallDrawable(color, alpha, zIndex);
        return ball;
    };

    //noinspection JSUnusedLocalSymbols
    function tileWidth(width, height) {
        return Math.floor(height / UI.HEIGHT * GamePlay.TILE);
    }

    Builder.prototype.__createBallDrawable = function (color, alpha, zIndex) {

        var ball = this.stage.createRectangle(true)
            .setColor(color)
            .setWidth(tileWidth)
            .setHeight(Height.get(UI.HEIGHT, GamePlay.TILE));

        if (zIndex !== undefined)
            ball.setZIndex(zIndex);

        if (alpha !== undefined)
            ball.setAlpha(alpha);

        return ball;
    };

    Builder.prototype.hitBall = function (ball) {
        if (AppFlag.BALL_SCALE) {
            ball.drawable.setScale(2);
            ball.drawable.scaleTo(1).setDuration(10).setSpacing(Transition.EASE_OUT_SIN);
        }
        if (AppFlag.BALL_HIGHLIGHT) {
            var oldColor = ball.drawable.data.color;
            if (oldColor != UI.BALL_HIGHLIGHT_COLOR) {
                ball.drawable.setColor(UI.BALL_HIGHLIGHT_COLOR);
                this.timer.doLater(function () {
                    ball.drawable.setColor(oldColor);
                }, 2);
            }
        }
        if (AppFlag.BALL_ROTATION)
            ball.drawable.setRotation(Vectors.getAngle(ball.forceX, ball.forceY));
    };

    Builder.prototype.highlightScreen = function () {
        if (!AppFlag.HIGHLIGHT_BACKGROUND)
            return;

        this.highlightingCount = 3;
        this.__highlightScreen();
    };

    Builder.prototype.__highlightScreen = function () {
        this.screen.style.backgroundColor = UI.SCREEN_HIGHLIGHT_COLOR;
        this.timer.doLater(function () {
            //noinspection JSPotentiallyInvalidUsageOfThis
            this.screen.style.backgroundColor = UI.SCREEN_COLOR;
            if (--this.highlightingCount > 0) {
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.timer.doLater(this.__highlightScreen, 2, this);
            }
        }, 2, this);
    };

    Builder.prototype.highlightScore = function () {
        if (!AppFlag.HIGHLIGHT_SCORE)
            return;

        this.highlightingScoreCount = 3;
        this.__highlightScore();
    };

    Builder.prototype.__highlightScore = function () {
        this.counter.setColor(UI.SCORE_HIGHLIGHT_COLOR);
        this.timer.doLater(function () {
            //noinspection JSPotentiallyInvalidUsageOfThis
            this.counter.setColor(UI.SCORE_COLOR);
            if (--this.highlightingScoreCount > 0) {
                //noinspection JSPotentiallyInvalidUsageOfThis
                this.timer.doLater(this.__highlightScore, 2, this);
            }
        }, 2, this);
    };

    Builder.prototype.hitWall = function (wall) {
        if (!AppFlag.WALL_SCALE)
            return;
        wall.drawable.setScale(2);
        wall.drawable.scaleTo(1).setDuration(30).setSpacing(Transition.EASE_OUT_ELASTIC);
    };

    Builder.prototype.animateSceneAppearance = function (player) {
        var promise = new Promise();
        if (!AppFlag.SCENE_APPEARANCE) {
            promise.resolve();
            return promise;
        }

        var spacing = Transition.EASE_OUT_BACK;
        var dropInSpeed = 30;

        var callbackCounter = new CallbackCounter(promise.resolve.bind(promise));

        var self = this;

        function dropIn(pair) {
            // var later = range(1, 30);
            pair.drawable.show = false;
            if (pair.shadows)
                pair.shadows.forEach(function (shadow) {
                    shadow.drawable.show = false;
                });
            // this.timer.doLater(function () {
            var callback = callbackCounter.register();
            pair.moveFrom(wrap(pair, 'x'), subtract(wrap(pair, 'y'), Height.FULL))
                .setDuration(dropInSpeed * 2)
                .setSpacing(spacing)
                .setCallback(function () {
                    if (pair.shadows) {
                        self.timer.doLater(function () {
                            pair.shadows.forEach(function (shadow) {
                                shadow.drawable.show = true;
                            });
                        }, 2);
                    }
                    callback();
                });
            // }, later);
            this.timer.doLater(function () {
                pair.drawable.show = true;
            }, 1);
        }

        this.scenery.forEach(dropIn, this);
        this.balls.forEach(dropIn, this);
        this.obstacles.forEach(dropIn, this);
        dropIn.call(this, player);

        if (AppFlag.PLAYER_FACE) {
            dropIn.call(this, player.leftEye);
            dropIn.call(this, player.rightEye);
            dropIn.call(this, player.leftPupil);
            dropIn.call(this, player.rightPupil);
            dropIn.call(this, player.mouth);
        }

        return promise;
    };

    return Builder;
})(H5.Vectors, H5.range, G.UI, G.GamePlay, Math, H5.Width, H5.Height, H5.wrap, H5.Transition, H5.Promise,
    H5.CallbackCounter, H5.Event, H5.subtract, G.AppFlag, H5.multiply);