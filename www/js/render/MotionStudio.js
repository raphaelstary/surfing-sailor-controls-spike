var MotionStudio = (function () {
    "use strict";

    // handles low level moving of draw-ables
    function MotionStudio() {
        this.motionsDict = {};
    }

    MotionStudio.prototype.move = function (drawable, path, callback) {
        if (path) {
            var axis = path.startX === path.endX ? 'y' : 'x';
        }

        this.motionsDict[drawable.id] = {
            item: drawable,
            path: path,
            ready: callback,
            time: 0,
            axis: axis
        };
    };

    MotionStudio.prototype.update = function () {
        for (var key in this.motionsDict) {
            if (!this.motionsDict.hasOwnProperty(key)) {
                continue;
            }

            var motion = this.motionsDict[key];

            var path = motion.path;
            if (path.duration > motion.time) {

                if (motion.axis === 'x') {
                    motion.item.x = Math.floor(path.timingFn(motion.time, path.startX, path.length, path.duration));

                } else if (motion.axis === 'y') {
                    motion.item.y = Math.floor(path.timingFn(motion.time, path.startY, path.length, path.duration));
                }

                motion.time++;
            } else {
                if (path.loop) {
                    motion.time = 0;
                } else {
                    delete this.motionsDict[key];
                }

                if (motion.ready) {
                    motion.ready();
                }
            }
        }
    };

    MotionStudio.prototype.remove = function (drawable) {
        delete this.motionsDict[drawable.id];
    };

    MotionStudio.prototype.has = function (drawable) {
        return this.motionsDict[drawable.id] !== undefined;
    };

    return MotionStudio;
})();