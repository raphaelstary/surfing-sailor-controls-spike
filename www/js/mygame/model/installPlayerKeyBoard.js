G.installPlayerKeyBoard = (function (Event, Key) {
    "use strict";

    function installPlayerKeyBoard(events, playerController) {
        var leftPressed = false;
        var rightPressed = false;
        var downPressed = false;

        return events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (keyBoard[Key.LEFT] && !leftPressed) {
                leftPressed = true;
                playerController.jumpLeft();
            } else if (!keyBoard[Key.LEFT] && leftPressed) {
                leftPressed = false;
            }

            if (keyBoard[Key.RIGHT] && !rightPressed) {
                rightPressed = true;
                playerController.jumpRight();
            } else if (!keyBoard[Key.RIGHT] && rightPressed) {
                rightPressed = false;
            }

            if (keyBoard[Key.DOWN] && !downPressed) {
                downPressed = true;
                playerController.down();
            } else if (!keyBoard[Key.DOWN] && downPressed) {
                downPressed = false;
            }

            if (keyBoard[Key.SPACE])
                playerController.spawnBall();
        });
    }

    return installPlayerKeyBoard;
})(H5.Event, H5.Key);