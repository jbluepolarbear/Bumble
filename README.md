# Bumble
A small JavaScript game framwork with a focus on coroutines.
<p align="center">
  <img src="https://raw.githubusercontent.com/jbluepolarbear/Bumble/master/bumble.png"/>
</p>

## Road Map
* Preloader (Audio, JSON)
* Audio
* Collision Utilities
* Sprite:
    * Hierarchy
    * Input Blocking
    * Clipping
    * Render order/transportation
    * Button
    * Text Box
    * Scroll list


## Sample Usage
```javascript
// create bumble instance
const bumble = new Bumble('sample', 720, 480, 'black', 60);
// can get and set gamestate that is saved in localStorage
const gamestate = bumble.gameState;
let timeRun = gamestate.getState('times run');
if (timeRun === null) {
    timeRun = 1;
}
gamestate.setState('times run', timeRun + 1);

bumble.preloader.loadAll([
    new BumbleResource('bumble', 'img/bumble.png', 'image'),
    new BumbleResource('laser', 'audio/laser.mp3', 'audio')
]);

// all loading and game logic is run in coroutines
// coroutines support yielding naked yields, genertors, promises, and arrays of promises
bumble.runCoroutine(function *() {
    // load an image by url
    const image = bumble.getImage('bumble');

    // create a shape
    const shape = bumble.getShape([
        new BumbleVector(64, 0),
        new BumbleVector(128, 128),
        new BumbleVector(0, 128),
        new BumbleVector(64, 0)
    ], BumbleColor.fromRGB(0, 0, 255));
    shape.position = new BumbleVector(shape.width, shape.height);
    shape.setAnchorToCenterPoint();

    const audio = bumble.getAudio('laser');

    // coroutine to handle snaping the shape to the mouse on right/main click
    bumble.runCoroutine(function *() {
        while (true) {
            if (bumble.mouse.mouseState.buttonState[0]) {
                shape.position = bumble.mouse.mouseState.position.copy();
                audio.play();
            }
            yield;
        }
    });
    let angle = 0;

    // check keyboard input and left/alt mouse click
    while (!bumble.keys.isDown(BumbleKeyCodes.R) && !bumble.mouse.mouseState.buttonState[2]) {
        // clear canvas screen
        bumble.clearScreen();
        
        image.draw();
        shape.draw();
        angle += 0.01;
        image.rotation = angle;
        shape.rotation = -angle;
        yield;
    }
});
```