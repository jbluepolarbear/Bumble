class Bumble {
    constructor(gameName, width, height, clearColor = 'white', framerate = 60) {
        this.__imageCache = {};
        this.__routines = new BumbleCoroutines();
        this.__width = width;
        this.__height = height;
        this.__clearColor = clearColor;
        this.__framerate = framerate;
        this.__running = true;
        this.__gameName = gameName;
        this.__gameState = new BumbleGameState(this.__gameName);
        this.__keys = new BumbleKeys();

        this.__canvas = document.createElement('canvas');
        this.__canvas.id = 'canvas-id';
        this.__canvas.width = this.__width;
        this.__canvas.height = this.__height;
        this.__canvas.oncontextmenu = event => { return false; };
        this.__contex = this.__canvas.getContext("2d");

        this.__mouse = new BumbleMouse(this);

        document.body.appendChild(this.__canvas); // adds the canvas to the body element
        setInterval(() => {
            if (this.__running)
            {
                this.__update();
            }
        }, (1.0 / this.__framerate) * 1000.0);
    }

    __update() {
        this.__routines.update();
        this.__gameState.update();
    }

    clearScreen() {
        this.context.fillStyle = this.__clearColor;
        this.context.fillRect(0, 0, this.__width, this.__height);
    }

    get width() {
        return this.__width;
    }

    get height() {
        return this.__height;
    }

    get running() {
        return this.__running;
    }

    get framerate() {
        return this.__framerate;
    }

    get gameState() {
        return this.__gameState;
    }

    get keys() {
        return this.__keys;
    }

    get mouse() {
        return this.__mouse;
    }

    get deltaTime() {
        return 1.0 / this.__framerate;
    }

    get canvas() {
        return this.__canvas;
    }

    get context() {
        return this.__contex;
    }

    set clearColor(color) {
        this.__clearColor = color;
    }

    get clearColor() {
        return this.__clearColor;
    }

    runCoroutine(coroutine) {
        this.__routines.runCoroutine(coroutine);
    }

    clearCoroutines() {
        this.__routines.clear();
    }

    getImage(url) {
        return new Promise((resolve, reject) => {
            if (url in this.__imageCache) {
                resolve(new BumbleImage(this, this.__imageCache[url]));
            } else {
                BumbleUtility.loadImage(url).then((image) => {
                    this.__imageCache[url] = image;
                    resolve(new BumbleImage(this, image));
                });
            }
        });
    }
}

class BumbleGameState {
    constructor(gameName) {
        this.__gameName = '___{' + gameName + '}___';
        const gameState = window.localStorage.getItem(this.__gameName);
        if (!!gameState) {
            this.__localStore = JSON.parse(gameState);
        } else {
            this.__localStore = {};
            this.__stateChanged = true;
        }
        this.__stateChanged = false;
    }

    update() {
        if (this.__stateChanged) {
            this.__applyChanges();
        }
    }

    getState(stateName) {
        if (stateName in this.__localStore) {
            return this.__localStore[stateName];
        }
        return null;
    }

    setState(stateName, value) {
        this.__localStore[stateName] = value;
        this.__stateChanged = true;
    }

    __applyChanges() {
        window.localStorage.setItem(this.__gameName, JSON.stringify(this.__localStore));
        this.__stateChanged = false;
    }
}

const BumbleColor = {
    fromRGB: (r, g, b) => {
        return `rgb(${r}, ${g}, ${b})`
    },
    fromRGBA: (r, g, b, a) => {
        return `rgba(${r}, ${g}, ${b}, ${a})`
    },
    debugColor: 'red'
};

class BumbleCoroutines {
    constructor() {
        this.__coroutines = [];
    }

    clear() {
        this.__coroutines = [];
    }

    runCoroutine(coroutine) {
        this.__coroutines.push(this.coroutine(coroutine));
    }

    update() {
        for (let i = 0; i < this.__coroutines.length;) {
            let routine = this.__coroutines[i];
            if (routine.next().done) {
                this.__coroutines.splice(i, 1);
                continue;
            }
            ++i;
        }
    }
    
    *coroutine(coroutineFunc) {
        const GeneratorFunction = function*(){}.constructor;
        const co = coroutineFunc();
        let yielded;
        let nextResult;
        do {
            yielded = co.next(nextResult);
            nextResult = null;
            if (yielded.value instanceof GeneratorFunction) {
                const subCo = coroutine(yielded.value);
                let subYielded;
                do {
                    subYielded = subCo.next();
                    yield;
                } while (!subYielded.done);
                nextResult = subYielded.value;
            } else if (Promise.resolve(yielded.value) === yielded.value) {
                let completed = false;
                yielded.value.then((result) => {
                    completed = true;
                    nextResult = result;
                })
                while (!completed) {
                    yield;
                }
            } else if (yielded.value instanceof Array) {
                nextResult = [];
                for (let item of yielded.value) {
                    if (item instanceof Promise) {
                        let completed = false;
                        item.then((result) => {
                            completed = true;
                            nextResult.push(result);
                        })
                        while (!completed) {
                            yield;
                        }
                    }
                } 
            } else {
                nextResult = yielded.value;
                yield;
            }
        } while (!yielded.done);
        return yielded.value;
    }
}

class BumbleImage {
    constructor(bumble, image) {
        this.__bumble = bumble;
        this.__image = image;
        this.__position = new BumbleVector();
        this.__rotation = 0.0;
        this.__anchor = new BumbleVector(0.5, 0.5);
        this.__scale = new BumbleVector(1.0, 1.0);
    }

    get image() { return this.__image; }

    get rotation() { this.__rotation; }
    set rotation(value) {
        this.__rotation = value;
    }
    
    get position() { this.__position; }
    set position(value) {
        this.__position = value;
    }
    
    get anchor() { this.__anchor; }
    set anchor(value) {
        this.__anchor = value;
    }
    
    get scale() { this.__scale; }
    set scale(value) {
        this.__scale = value;
    }

    setSize(width, height) {
        this.__scale.x = width / this.image.width;
        this.__scale.y = height / this.image.height;
    }

    draw() {
        this.__bumble.context.save();
        this.__bumble.context.translate(this.__position.x, this.__position.y);
        this.__bumble.context.rotate(this.__rotation);
        this.__bumble.context.scale(this.__scale.x, this.__scale.y);
        this.__bumble.context.translate(-this.__image.width * this.__anchor.x, -this.__image.height * this.__anchor.y);
        this.__bumble.context.drawImage(this.__image, 0, 0);
        this.__bumble.context.restore();
    }
}

class BumbleShape {
    constructor(bumble, points, color, fill = true) {
        this.__bumble = bumble;
        this.__points = points;
        this.__color = color;
        this.__fill = fill;
        this.__lineWidth = 1;
        this.__path = new Path2D();
        this.__width = 0;
        this.__height = 0;
        this.__position = new BumbleVector();
        this.__rotation = 0.0;
        this.__anchor = new BumbleVector(0.5, 0.5);
        this.__scale = new BumbleVector(1.0, 1.0);
        this.__drawBoundingBox = false;

        this.__width = this.__points[0].x;
        this.__height = this.__points[0].y;
        this.__centerPoint = new BumbleVector(this.__points[0].x, this.__points[0].y);
        this.__path.moveTo(this.__points[0].x, this.__points[0].y);
        for (let i = 1; i < this.__points.length; ++i) {
            if (i < this.__points.length - 1) {
                this.__centerPoint = this.__centerPoint.add(this.__points[i]);
            }
            this.__path.lineTo(this.__points[i].x, this.__points[i].y);
            if (this.__points[i].x > this.__width) {
                this.__width = this.__points[i].x;
            }
            if (this.__points[i].y > this.__height) {
                this.__height = this.__points[i].y;
            }
        }
        this.__centerPoint = this.__centerPoint.divideValue(this.__points.length - 1);
    }

    get drawBoundingBox() {
        return this.__drawBoundingBox;
    }

    set drawBoundingBox(value) {
        this.__drawBoundingBox = value;
    }

    setAnchorToCenterPoint() {
        this.__anchor = new BumbleVector(this.__centerPoint.x / this.__width, this.__centerPoint.y / this.__height);
    }

    get centerPoint() {
        return this.__centerPoint;
    }

    get fill() {
        return this.__fill;
    }
    set fill(value) {
        this.__fill = value;
    }

    get color() {
        return this.__color;
    }
    set color(value) {
        this.__color = value;
    }

    get width() {
        return this.__width;
    }

    get height() {
        return this.__height;
    }

    get rotation() { this.__rotation; }
    set rotation(value) {
        this.__rotation = value;
    }
    
    get position() { this.__position; }
    set position(value) {
        this.__position = value;
    }
    
    get anchor() { this.__anchor; }
    set anchor(value) {
        this.__anchor = value;
    }
    
    get scale() { this.__scale; }
    set scale(value) {
        this.__scale = value;
    }

    draw() {
        this.__bumble.context.save();
        this.__bumble.context.translate(this.__position.x, this.__position.y);
        this.__bumble.context.rotate(this.__rotation);
        this.__bumble.context.scale(this.__scale.x, this.__scale.y);
        this.__bumble.context.translate(-this.__width * this.__anchor.x, -this.__height * this.__anchor.y);
        if (this.__fill) {
            this.__bumble.context.fillStyle = this.__color;
            this.__bumble.context.fill(this.__path);
        } else {
            this.__bumble.context.strokeStyle = this.__color;
            this.__bumble.context.stroke(this.__path);
        }
        if (this.__drawBoundingBox) {
            this.__bumble.context.beginPath();
            this.__bumble.context.moveTo(0, 0);
            this.__bumble.context.lineTo(this.__width, 0);
            this.__bumble.context.lineTo(this.__width, this.__height);
            this.__bumble.context.lineTo(0, this.__height);
            this.__bumble.context.lineTo(0, 0);
            this.__bumble.context.strokeStyle = BumbleColor.debugColor;
            this.__bumble.context.stroke();
        }
        this.__bumble.context.restore();
    }
}

const BumbleKeyCodes = {
    SPACE: 32,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90
};

class BumbleKeys {
    constructor() {
        window.addEventListener('keyup', (event) => this.onKeyup(event), false);
        window.addEventListener('keydown', (event) => this.onKeydown(event), false);
        this.__pressed = {};
    }

    isDown(keyCode) {
        return this.__pressed[keyCode];
    }

    onKeydown(event) {
        this.__pressed[event.keyCode] = true;
    }

    onKeyup(event) {
        this.__pressed[event.keyCode] = false;
    }
}

class BumbleMouse {
    constructor(bumble) {
        this.__mouseState = {
            position: new BumbleVector(),
            buttonState: [false, false, false],
        };
        this.__mouseDownEventListeners = [];
        this.__mouseUpEventListeners = [];
        this.__mouseMoveEventListeners = [];
        bumble.canvas.addEventListener("mousedown", this.__mouseDownEvent.bind(this), false);
        bumble.canvas.addEventListener("mouseup", this.__mouseUpEvent.bind(this), false);
        bumble.canvas.addEventListener("mousemove", this.__mouseMoveEvent.bind(this), false);
    }

    get mouseState() { return this.__mouseState; }

    addMouseDownEventListener(callback) {
        this.__mouseDownEventListeners.push(callback);
    }

    addMouseUpEventListener(callback) {
        this.__mouseUpEventListeners.push(callback);
    }

    addMouseMoveEventListener(callback) {
        this.__mouseMoveEventListeners.push(callback);
    }

    __mouseDownEvent(event) {
        this.__mouseState.position.x = event.layerX;
        this.__mouseState.position.y = event.layerY;
        this.__mouseState.buttonState[event.button] = true;
        for (let listener of this.__mouseDownEventListeners) {
            listener(this.__mouseState);
        }
    }

    __mouseUpEvent(event) {
        this.__mouseState.position.x = event.layerX;
        this.__mouseState.position.y = event.layerY;
        this.__mouseState.buttonState[event.button] = false;
        for (let listener of this.__mouseUpEventListeners) {
            listener(this.__mouseState);
        }
    }

    __mouseMoveEvent(event) {
        this.__mouseState.position.x = event.layerX;
        this.__mouseState.position.y = event.layerY;
        for (let listener of this.__mouseMoveEventListeners) {
            listener(this.__mouseState);
        }
    }
}

const BumbleUtility = {
    loadImage: function (url) {
        return new Promise((resolve, reject) => {
            let image = new Image();
            image.addEventListener('load', () => {
                resolve(image);
            }, false);
            image.src = url;
        });
    },
    wait: function (duration) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, duration * 1000);
        });
    },
    line: (context, x, y, x2, y2) => {
        context.beginPath();
        context.moveTo(x,y);
        context.lineTo(x2,y2);
        context.stroke();
    },
    clamp: (x, a, b) => {
        return Math.min(Math.max(x, a), b)
    }
}

class BumbleVector {
    constructor(x = 0.0, y = 0.0) {
        this.__x = x;
        this.__y = y;
    }

    set x(value)
    {
        this.__x = value;
    }
    get x() { return this.__x; }
    set y(value)
    {
        this.__y = value;
    }
    get y() { return this.__y; }

    add(vector) {
        return new BumbleVector(this.__x + vector.x, this.__y + vector.y);
    }

    subtract(vector) {
        return new BumbleVector(this.__x - vector.x, this.__y - vector.y);
    }

    addValue(value) {
        return new BumbleVector(this.__x + value, this.__y + value);
    }

    subtractValue(value) {
        return new BumbleVector(this.__x - value, this.__y - value);
    }

    multiplyValue(value) {
        return new BumbleVector(this.__x * value, this.__y * value);
    }

    divideValue(value) {
        return new BumbleVector(this.__x / value, this.__y / value);
    }

    dot(vector) {
        return this.__x * vector.x + this.__y * y;
    }

    normalized() {
        const magnitude = Math.sqrt(this.dot(this));
        return new BumbleVector(this.__x / magnitude, this.__y / magnitude);
    }

    length() {
        return Math.sqrt(this.lengthSquared());
    }

    lengthSquared() {
        return this.dot(this);
    }

    copy() {
        return new BumbleVector(this.__x, this.__y);
    }
}
