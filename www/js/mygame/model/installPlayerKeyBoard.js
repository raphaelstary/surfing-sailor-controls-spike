G.installPlayerKeyBoard = (function (Event, Key) {
    "use strict";

    function installPlayerKeyBoard(events, playerController) {
        var leftPressed = false;
        var rightPressed = false;
        var downPressed = false;
        var upPressed = false;

        var speedUpPressed = false;
        var speedDownPressed = false;

        return events.subscribe(Event.KEY_BOARD, function (keyBoard) {
            if (keyBoard[Key.LEFT] && !leftPressed) {
                leftPressed = true;
                playerController.handleLeftKeyDown();
            } else if (!keyBoard[Key.LEFT] && leftPressed) {
                leftPressed = false;
                playerController.handleLeftKeyUp();
            }

            if (keyBoard[Key.RIGHT] && !rightPressed) {
                rightPressed = true;
                playerController.handleRightKeyDown();
            } else if (!keyBoard[Key.RIGHT] && rightPressed) {
                rightPressed = false;
                playerController.handleRightKeyUp();
            }

            if (keyBoard[Key.DOWN] && !downPressed) {
                downPressed = true;
                playerController.handleDownKeyDown();
            } else if (!keyBoard[Key.DOWN] && downPressed) {
                downPressed = false;
                playerController.handleDownKeyUp();
            }

            if (keyBoard[Key.UP] && !upPressed) {
                upPressed = true;
                playerController.handleUpKeyDown();
            } else if (!keyBoard[Key.UP] && upPressed) {
                upPressed = false;
                playerController.handleUpKeyUp();
            }

            if (keyBoard[Key.Q] && !upPressed) {
                upPressed = true;
                playerController.handleUpKeyDown();
            } else if (!keyBoard[Key.UP] && upPressed) {
                upPressed = false;
                playerController.handleUpKeyUp();
            }
        });
    }

    return installPlayerKeyBoard;
})(H5.Event, H5.Key);