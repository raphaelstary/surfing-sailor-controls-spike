G.installPlayerGamePad = (function (Event) {
    "use strict";

    function installPlayerGamePad(events, playerController) {
        var leftPressed = false;
        var rightPressed = false;
        var downPressed = false;

        return events.subscribe(Event.GAME_PAD, function (gamePad) {
            if (gamePad.isLeftBumperPressed() && !leftPressed) {
                leftPressed = true;
                playerController.jumpLeft();
            } else if (!gamePad.isLeftBumperPressed() && leftPressed) {
                leftPressed = false;
            }

            if (gamePad.isRightBumperPressed() && !rightPressed) {
                rightPressed = true;
                playerController.jumpRight();
            } else if (!gamePad.isRightBumperPressed() && rightPressed) {
                rightPressed = false;
            }

            if (gamePad.isBPressed() && !downPressed) {
                downPressed = true;
                playerController.down();
            } else if (!gamePad.isBPressed() && downPressed) {
                downPressed = false;
            }

            if (gamePad.isDPadDownPressed())
                playerController.spawnBall();
        });
    }

    return installPlayerGamePad;
})(H5.Event);