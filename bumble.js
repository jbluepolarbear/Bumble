class Bumble {
    constructor(gameName, width, height, clearColor = 'white', framerate = 60) {
        this.__imageCache = {};
        this.__routines = new BumbleCoroutines();
        this.__preloader = new BumblePreloader(this);
        this.__width = width;
        this.__height = height;
        this.__clearColor = clearColor;
        this.__framerate = framerate;
        this.__running = true;
        this.__gameName = gameName;
        this.__gameState = new BumbleGameState(this.__gameName);
        this.__keys = new BumbleKeys();
        this.__startTime = Date.now();
        this.__lastTime = Date.now();

        this.__canvas = document.createElement('canvas');
        this.__canvas.id = 'canvas-id';
        this.__canvas.width = this.__width;
        this.__canvas.height = this.__height;
        this.__canvas.oncontextmenu = event => { return false; };
        this.__context = this.__canvas.getContext("2d");

        this.__loaderBackgroundColor = 'white';
        this.__loaderProgressBackgroundColor = 'grey';
        this.__loaderProgressColor = 'blue';

        this.__debug = new BumbleDebug(this);

        this.__mouse = new BumbleMouse(this);

        document.body.appendChild(this.__canvas); // adds the canvas to the body element
        setInterval(() => {
            const currentTime = Date.now();
            this.__realFrameRate = Math.floor(1 / ((currentTime - this.__lastTime) / 1000));
            this.__lastTime = currentTime;
            if (this.__running)
            {
                this.__update();
            }
        }, (1.0 / this.__framerate) * 1000.0);
    }

    __update() {
        if (this.__preloader.loading()) {
            this.__preloader.update();
            this.__showProgress();
        } else {
            this.__routines.update();
            this.__gameState.update();
        }
        this.__debug.draw();
    }

    get debug() { return this.__debug; }
    set debug(value) {
        this.__debug = value;
    }

    get gameTime() {
        return (this.__lastTime - this.__startTime) / 1000.0;
    }

    get realFramerate() {
        return this.__realFrameRate;
    }

    get deltaTime() {
        return 1.0 / this.__framerate;
    }

    clearScreen() {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.globalAlpha = 1.0;
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
        return this.__context;
    }

    set clearColor(color) {
        this.__clearColor = color;
    }

    get clearColor() {
        return this.__clearColor;
    }

    get preloader() {
        return this.__preloader;
    }

    runCoroutine(coroutine) {
        this.__routines.runCoroutine(coroutine);
    }

    clearCoroutines() {
        this.__routines.clear();
    }

    getImage(name) {
        return new BumbleImage(this, this.__preloader.getImage(name));
    }

    getAudio(name) {
        return new BumbleAudio(this.__preloader.getAudio(name));
    }

    getShape(points, color, fill = true) {
        return new BumbleShape(this, points, color, fill = true);
    }

    getData(name) {
        return this.__preloader.getData(name);
    }
    
    applyTransformation(transformation) {
        this.__context.setTransform(
            transformation.m11, transformation.m21,
            transformation.m12, transformation.m22,
            transformation.m13, transformation.m23
        );
    }

    get loaderBackgroundColor() {
        return this.__loaderBackgroundColor;
    }
    set loaderBackgroundColor(value) {
        this.__loaderBackgroundColor = value;
    }

    get loaderProgressColor() {
        return this.__loaderProgressColor;
    }
    set loaderProgressColor(value) {
        this.__loaderProgressColor = value;
    }

    get loaderProgressBackgroundColor() {
        return this.__loaderProgressBackgroundColor;
    }
    set loaderProgressBackgroundColor(value) {
        this.__loaderProgressBackgroundColor = value;
    }

    __showProgress() {
        const context = this.__context;
        const width = this.__width;
        const height = this.__height;
        const progressBarWidth = width * 0.65;
        const progressBarHeight = height * 0.1;
        const progressBarBufferWidth = progressBarWidth + progressBarHeight * 0.2;
        const progressBarBufferHeight = progressBarHeight + progressBarHeight * 0.2;

        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.globalAlpha = 1.0;
        context.fillStyle = this.__loaderBackgroundColor;
        context.fillRect(0, 0, width, height);
        
        context.fillStyle = this.__loaderProgressBackgroundColor;
        const startProgressBarBufferX = (width - progressBarBufferWidth) / 2.0;
        const startProgressBarBufferY = (height - progressBarBufferHeight) / 2.0;
        context.fillRect(startProgressBarBufferX, startProgressBarBufferY, progressBarBufferWidth, progressBarBufferHeight);

        context.fillStyle = this.__loaderProgressColor;
        const startProgressBarX = (width - progressBarWidth) / 2.0;
        const startProgressBarY = (height - progressBarHeight) / 2.0;
        const progression = this.__preloader.progression();
        if (progression > 0.0) {
            context.fillRect(startProgressBarX, startProgressBarY, progressBarWidth * progression, progressBarHeight);
        }
    }

    drawRect(rect, color) {
        this.context.setTransform(1, 0, 0, 1, 0, 0);
        this.context.globalAlpha = 1.0;
        this.context.beginPath();
        this.context.moveTo(rect.left, rect.top);
        this.context.lineTo(rect.right, rect.top);
        this.context.lineTo(rect.right, rect.bottom);
        this.context.lineTo(rect.left, rect.bottom);
        this.context.lineTo(rect.left, rect.top);
        if (!color) {
            this.context.strokeStyle = BumbleColor.debugColor;
        } else {
            this.context.strokeStyle = color;
        }
        this.context.stroke();
    }
}

class BumbleDebug {
    constructor(bumble) {
        this.__bumble = bumble;

        this.__showFramerate = false;
    }

    get showFramerate() { return this.__showFramerate; }
    set showFramerate(value) {
        this.__showFramerate = value;
    }

    draw() {
        if (this.__showFramerate) {
            const boxSize = 38;
            this.__bumble.context.setTransform(1, 0, 0, 1, 0, 0);
            this.__bumble.context.globalAlpha = 1.0;
            this.__bumble.context.fillStyle = BumbleColor.fromRGBA(0, 0, 0, 1.0);
            this.__bumble.context.fillRect(0, this.__bumble.height - boxSize, boxSize, boxSize);
            this.__bumble.context.fillStyle = BumbleColor.fromRGB(255, 255, 0);
            this.__bumble.context.font = "15px Arial";
            this.__bumble.context.textAlign = "center";
            this.__bumble.context.fillText(this.__bumble.realFramerate.toString(), boxSize / 2.0, this.__bumble.height - boxSize / 2.0, boxSize - 2);
        }
    }
}

class BumbleResource {
    constructor(name, url, type) {
        this.__name = name;
        this.__url = url;
        this.__type = type;
    }

    get name() {
        return this.__name;
    }

    get url() {
        return this.__url;
    }

    get type() {
        return this.__type;
    }
}

class BumblePreloader {
    constructor(bumble) {
        this.__bumble = bumble;
        this.__loading = false;
        this.__imageCache = {};
        this.__audioCache = {};
        this.__dataCache = {};
        this.__loadingResources = [];
        this.__routines = new BumbleCoroutines();
        this.__resourcesStarted = 0;
        this.__resourcesLoaded = 0;
    }

    loading() {
        return this.__loading;
    }

    progression() {
        const percentage = this.__resourcesLoaded / this.__resourcesStarted;
        if (percentage >= 1.0) {
            this.__loading = false;
        }
        return percentage;
    }

    update() {
        this.__routines.update();
    }

    getImage(name) {
        if (name in this.__imageCache) {
            return this.__imageCache[name];
        }
        return null;
    }

    getAudio(name) {
        if (name in this.__audioCache) {
            return this.__audioCache[name];
        }
        return null;
    }

    getData(name) {
        if (name in this.__dataCache) {
            return this.__dataCache[name];
        }
        return null;
    }

    loadImage(name, url) {
        this.__loading = true;
        this.__resourcesStarted += 1;
        this.__routines.runCoroutine(function *() {
            if (!(name in this.__imageCache)) {
                const image = yield BumbleUtility.loadImage(url);
                this.__imageCache[name] = image;
            }
            this.__resourcesLoaded += 1;
        }.bind(this));
    }

    loadAudio(name, url) {
        this.__loading = true;
        this.__resourcesStarted += 1;
        this.__routines.runCoroutine(function *() {
            if (!(name in this.__audioCache)) {
                const audio = yield BumbleUtility.loadAudio(url);
                this.__audioCache[name] = audio;
            }
            this.__resourcesLoaded += 1;
        }.bind(this));
    }

    loadData(name, url) {
        this.__loading = true;
        this.__resourcesStarted += 1;
        this.__routines.runCoroutine(function *() {
            if (!(name in this.__dataCache)) {
                const data = yield BumbleUtility.loadData(url);
                this.__dataCache[name] = data;
            }
            this.__resourcesLoaded += 1;
        }.bind(this));
    }

    load(resource) {
        if (resource.type === 'image') {
            this.loadImage(resource.name, resource.url);
        } else if (resource.type === 'audio') {
            this.loadAudio(resource.name, resource.url);
        } else if (resource.type === 'data') {
            this.loadData(resource.name, resource.url);
        }
    }

    // [new BumbleResource('name', '/something.com/resourcename.ext', '(image) or (audio)')]
    loadAll(resourecs) {
        for (let resource of resourecs) {
            this.load(resource);
        }
    }

    clearImages() {
        this.__imageCache = {};
    }

    clearAudios() {
        this.__audioCache = {};
    }

    clearDatas() {
        this.__dataCache = {};
    }

    clearAll() {
        this.clearImages();
        this.clearAudios();
        this.clearDatas();
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
                    if (Promise.resolve(item) === item) {
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

class BumbleAudio {
    constructor(audio) {
        this.__audio = audio;
    }

    play() {
        this.__audio.play();
    }

    get loop() {
        return this.__audio.loop;
    }
    set loop(value) {
        this.__audio.loop = value;
    }

    pause() {
        this.__audio.pause();
    }
}

class BumbleImage {
    constructor(bumble, image) {
        this.__bumble = bumble;
        this.__image = image;
        this.__transformation = new BumbleTransformation(this.__bumble, this.__image.width, this.__image.height);
        this.__transformation.position = new BumbleVector();
        this.__transformation.rotation = 0.0;
        this.__transformation.anchor = new BumbleVector(0.5, 0.5);
        this.__transformation.scale = new BumbleVector(1.0, 1.0);
    }

    get image() { return this.__image; }

    draw() {
        this.__bumble.context.drawImage(this.__image, 0, 0);
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

    getAnchorToCenterPoint() {
        return new BumbleVector(this.__centerPoint.x / this.__width, this.__centerPoint.y / this.__height);
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

    draw() {
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

class BumbleUtility {
    static loadImage(url) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => {
                resolve(image);
            }, false);
            image.src = url;
        });
    }

    static loadAudio(url) {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            resolve(audio);
            audio.src = url;
        });
    }

    static loadData(url) {
        return new Promise((resolve, reject) => {
            const request = new XMLHttpRequest();
            request.overrideMimeType("application/json");
            request.open('GET', url, true);
            request.onreadystatechange = function () {
                if (request.readyState == 4 && request.status == "200") {
                    resolve(JSON.parse(request.responseText));
                }
            };
            request.send(null); 
        });
    }

    static wait(duration) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, duration * 1000);
        });
    }

    static line(context, x, y, x2, y2) {
        context.beginPath();
        context.moveTo(x,y);
        context.lineTo(x2,y2);
        context.stroke();
    }

    static clamp(x, a, b) {
        return Math.min(Math.max(x, a), b)
    }

    static random(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    static randomFloat(max) {
        return Math.random() * max;
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

    equals(vector) {
        return this.__x === vector.x && this.__y === vector.y;
    }

    set(x, y) {
        this.__x = x;
        this.__y = y;
    }

    multiplyMatrix(matrix) {
        return new BumbleVector(
            this.__x * matrix.m11 + this.__y * matrix.m12 + 1 * matrix.m13,
            this.__x * matrix.m21 + this.__y * matrix.m22 + 1 * matrix.m23
        );
    }
}

class BumbleMatrix {
    constructor(m11 = 1, m12 = 0, m13 = 0,
                m21 = 0, m22 = 1, m23 = 0,
                m31 = 0, m32 = 0, m33 = 1) {
        this.__m11 = m11;
        this.__m12 = m12;
        this.__m13 = m13;
        this.__m21 = m21;
        this.__m22 = m22;
        this.__m23 = m23;
        this.__m31 = m31;
        this.__m32 = m32;
        this.__m33 = m33;
    }

    //row 1
    get m11() { return this.__m11; }
    set m11(value) {
        this.__m11 = value;
    }
    get m12() { return this.__m12; }
    set m12(value) {
        this.__m12 = value;
    }
    get m13() { return this.__m13; }
    set m13(value) {
        this.__m13 = value;
    }

    //row 2
    get m21() { return this.__m21; }
    set m21(value) {
        this.__m21 = value;
    }
    get m22() { return this.__m22; }
    set m22(value) {
        this.__m22 = value;
    }
    get m23() { return this.__m23; }
    set m23(value) {
        this.__m23 = value;
    }

    //row 3
    get m31() { return this.__m31; }
    set m31(value) {
        this.__m31 = value;
    }
    get m32() { return this.__m32; }
    set m32(value) {
        this.__m32 = value;
    }
    get m33() { return this.__m33; }
    set m33(value) {
        this.__m33 = value;
    }

    multiply(matrix) {
        return new BumbleMatrix(
            this.__m11  * matrix.m11 + this.__m12  * matrix.m21 + this.__m13  * matrix.m31,
            this.__m11  * matrix.m12 + this.__m12  * matrix.m22 + this.__m13  * matrix.m32,
            this.__m11  * matrix.m13 + this.__m12  * matrix.m23 + this.__m13  * matrix.m33,
            this.__m21  * matrix.m11 + this.__m22  * matrix.m21 + this.__m23  * matrix.m31,
            this.__m21  * matrix.m12 + this.__m22  * matrix.m22 + this.__m23  * matrix.m32,
            this.__m21  * matrix.m13 + this.__m22  * matrix.m23 + this.__m23  * matrix.m33,
            this.__m31  * matrix.m11 + this.__m32  * matrix.m21 + this.__m33  * matrix.m31,
            this.__m31  * matrix.m12 + this.__m32  * matrix.m22 + this.__m33  * matrix.m32,
            this.__m31  * matrix.m13 + this.__m32  * matrix.m23 + this.__m33  * matrix.m33
        );
    }

    add(matrix) {
        return new BumbleMatrix(
            this.__m11 + matrix.m11, this.__m12 + matrix.m12, this.__m13 + matrix.m13,
            this.__m21 + matrix.m21, this.__m22 + matrix.m22, this.__m23 + matrix.m23,
            this.__m31 + matrix.m31, this.__m32 + matrix.m32, this.__m33 + matrix.m33
        );
    }

    set(matrix) {
        this.__m11 = matrix.m11;
        this.__m12 = matrix.m12;
        this.__m13 = matrix.m13;
        this.__m21 = matrix.m21;
        this.__m22 = matrix.m22;
        this.__m23 = matrix.m23;
        this.__m31 = matrix.m31;
        this.__m32 = matrix.m32;
        this.__m33 = matrix.m33;
    }

    setIdentity(matrix) {
        this.__m11 = 1;
        this.__m12 = 0;
        this.__m13 = 0;
        this.__m21 = 0;
        this.__m22 = 1;
        this.__m23 = 0;
        this.__m31 = 0;
        this.__m32 = 0;
        this.__m33 = 1;
    }

    transpose() {
        return new BumbleMatrix(
            this.__11, this.__21, this.__31,
            this.__12, this.__22, this.__32,
            this.__13, this.__23, this.__33
        );
    }

    static identity() {
        return new BumbleMatrix(
            1, 0, 0,
            0, 1, 0,
            0, 0, 1
        );
    }

    static translate(x, y) {
        return new BumbleMatrix(
            1, 0, x,
            0, 1, y,
            0, 0, 1
        );
    }

    static scale(x, y) {
        return new BumbleMatrix(
            x, 0, 0,
            0, y, 0,
            0, 0, 1
        );
    }

    static rotate(radians) {
        return new BumbleMatrix(
            Math.cos(radians), -Math.sin(radians), 0.0,
            Math.sin(radians), Math.cos(radians), 0.0,
            0, 0, 1
        );
    }
}

class BumbleCollision {
    static rectToRect(rect1, rect2) {
        const halfWidth1 = rect1.width / 2.0;
        const halfHeight1 = rect1.height / 2.0;
        const halfWidth2 = rect2.width / 2.0;
        const halfHeight2 = rect2.height / 2.0;

        let x1 = rect1.center.x;
        let x2 = rect2.center.x;
        if (x1 > x2) {
            const t = x1;
            x1 = x2;
            x2 = t;
        }

        let y1 = rect1.center.y;
        let y2 = rect2.center.y;
        if (y1 > y2) {
            const t = y1;
            y1 = y2;
            y2 = t;
        }

        if (x1 + halfWidth1 + halfWidth2 >= x2 &&
            y1 + halfHeight1 + halfHeight2 >= y2) {
            return true;
        }

        return false;
    }

    static pointToRect(position, rect) {
        const halfWidth = rect.width / 2.0;
        const halfHeight = rect.height / 2.0;

        let x1 = position.x;
        let x2 = rect.center.x;
        if (x1 > x2) {
            const t = x1;
            x1 = x2;
            x2 = t;
        }

        let y1 = position.y;
        let y2 = rect.center.y;
        if (y1 > y2) {
            const t = y1;
            y1 = y2;
            y2 = t;
        }

        if (x1 + halfWidth >= x2 &&
            y1 + halfHeight >= y2) {
            return true;
        }

        return false;
    }

    static circleToCircle(circle1, circle2) {
        const radius0 = circle1.radius * circle1.radius
        const radius1 = circle2.radius * circle2.radius
        if (circle1.center.subtract(circle2.center).lengthSquared() <= (radius0 + radius1)) {
            return true;
        }
        return false;
    }

    static pointToCircle(position, circle) {
        const radius = circle.radius * circle.radius
        if (position.subtract(circle.center).lengthSquared() <= (radius)) {
            return true;
        }
        return false;
    }
}

class BumbleTransformation {
    constructor(width = 0.0, height = 0.0) {
        this.__rotation = 0;
        this.__position = new BumbleVector(0.0, 0.0);
        this.__scale = new BumbleVector(1.0, 1.0);
        this.__anchor = new BumbleVector(0.5, 0.5);
        this.__width = width;
        this.__height = height;
    }

    get rotation() { return this.__rotation; }
    set rotation(value) {
        this.__rotation = value;
    }

    get position() { return this.__position; }
    set position(value) {
        this.__position = value;
    }

    get scale() { return this.__scale; }
    set scale(value) {
        this.__scale = value;
    }

    get anchor() { return this.__anchor; }
    set anchor(value) {
        this.__anchor = value;
    }

    get width() { return this.__width; }
    set width(value) {
        this.__width = value;
    }

    get height() { return this.__height; }
    set height(value) {
        this.__height = value;
    }

    build() {
        const rot = BumbleMatrix.rotate(this.__rotation);
        const scl = BumbleMatrix.scale(this.__scale.x, this.__scale.y);
        const pos = BumbleMatrix.translate(this.__position.x, this.__position.y);
        const ctr = BumbleMatrix.translate(-this.__width * this.__anchor.x, -this.__height * this.__anchor.y);
        
        return pos.multiply(rot).multiply(scl).multiply(ctr);
    }
}

class BumbleRect {
    constructor(left = 0, right = 0, top = 0, bottom = 0) {
        this.__left = left;
        this.__right = right;
        this.__top = top;
        this.__bottom = bottom;
    }

    get left() { return this.__left; }
    set left(value) {
        this.__left = value;
    }

    get right() { return this.__right; }
    set right(value) {
        this.__right = value;
    }

    get top() { return this.__top; }
    set top(value) {
        this.__top = value;
    }

    get bottom() { return this.__bottom; }
    set bottom(value) {
        this.__bottom = value;
    }

    get width() { return this.__right - this.__left; }

    get height() { return this.__bottom - this.__top; }

    get center() { return new BumbleVector(this.__right - this.__left, this.__bottom - this.__top); }
}

class BumbleCircle {
    constructor(center = new BumbleVector(), radius = 0) {
        this.__center = center;
        this.__radius = radius;
    }

    get center() { return this.__center; }
    set center(value) {
        this.center = value;
    }

    get radius() { return this.__radius; }
    set radius(value) {
        this.__radius = value;
    }
}
