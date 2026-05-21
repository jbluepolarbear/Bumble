import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
    Bumble,
    BumbleDebug,
    BumbleResource,
    BumblePreloader,
    BumbleGameState,
    BumbleColor,
    BumbleCoroutines,
    BumbleAudio,
    BumbleImage,
    BumbleShape,
    BumbleKeyCodes,
    BumbleKeys,
    BumbleMouse,
    BumbleUtility,
    BumbleVector,
    BumbleMatrix,
    BumbleCollision,
    BumbleTransformation,
    BumbleRect,
    BumbleOrientedRect,
    BumbleCircle,
    BumblePolygon
} from './bumble.js';

describe('BumbleVector', () => {
    it('should create a vector with default values', () => {
        const vector = new BumbleVector();
        assert.strictEqual(vector.x, 0.0);
        assert.strictEqual(vector.y, 0.0);
    });

    it('should create a vector with specified values', () => {
        const vector = new BumbleVector(3, 4);
        assert.strictEqual(vector.x, 3);
        assert.strictEqual(vector.y, 4);
    });

    it('should add vectors', () => {
        const v1 = new BumbleVector(1, 2);
        const v2 = new BumbleVector(3, 4);
        const result = v1.add(v2);
        assert.strictEqual(result.x, 4);
        assert.strictEqual(result.y, 6);
    });

    it('should subtract vectors', () => {
        const v1 = new BumbleVector(5, 7);
        const v2 = new BumbleVector(2, 3);
        const result = v1.subtract(v2);
        assert.strictEqual(result.x, 3);
        assert.strictEqual(result.y, 4);
    });

    it('should add value to vector', () => {
        const vector = new BumbleVector(1, 2);
        const result = vector.addValue(5);
        assert.strictEqual(result.x, 6);
        assert.strictEqual(result.y, 7);
    });

    it('should subtract value from vector', () => {
        const vector = new BumbleVector(5, 7);
        const result = vector.subtractValue(2);
        assert.strictEqual(result.x, 3);
        assert.strictEqual(result.y, 5);
    });

    it('should multiply vector by value', () => {
        const vector = new BumbleVector(2, 3);
        const result = vector.multiplyValue(4);
        assert.strictEqual(result.x, 8);
        assert.strictEqual(result.y, 12);
    });

    it('should divide vector by value', () => {
        const vector = new BumbleVector(8, 12);
        const result = vector.divideValue(4);
        assert.strictEqual(result.x, 2);
        assert.strictEqual(result.y, 3);
    });

    it('should calculate dot product', () => {
        const v1 = new BumbleVector(1, 2);
        const v2 = new BumbleVector(3, 4);
        const result = v1.dot(v2);
        assert.strictEqual(result, 11);
    });

    it('should normalize vector', () => {
        const vector = new BumbleVector(3, 4);
        const result = vector.normalized();
        assert.strictEqual(result.length(), 1);
    });

    it('should calculate length', () => {
        const vector = new BumbleVector(3, 4);
        assert.strictEqual(vector.length(), 5);
    });

    it('should calculate length squared', () => {
        const vector = new BumbleVector(3, 4);
        assert.strictEqual(vector.lengthSquared(), 25);
    });

    it('should calculate distance to another vector', () => {
        const v1 = new BumbleVector(0, 0);
        const v2 = new BumbleVector(3, 4);
        assert.strictEqual(v1.distance(v2), 5);
    });

    it('should calculate distance squared', () => {
        const v1 = new BumbleVector(0, 0);
        const v2 = new BumbleVector(3, 4);
        assert.strictEqual(v1.distanceSquared(v2), 25);
    });

    it('should project vector onto another', () => {
        const v1 = new BumbleVector(1, 0);
        const v2 = new BumbleVector(2, 3);
        const result = v1.project(v2);
        assert.strictEqual(result.x, 2);
        assert.strictEqual(result.y, 0);
    });

    it('should copy vector', () => {
        const vector = new BumbleVector(5, 7);
        const copy = vector.copy();
        assert.strictEqual(copy.x, 5);
        assert.strictEqual(copy.y, 7);
        assert.notStrictEqual(copy, vector);
    });

    it('should check equality', () => {
        const v1 = new BumbleVector(3, 4);
        const v2 = new BumbleVector(3, 4);
        const v3 = new BumbleVector(5, 6);
        assert.strictEqual(v1.equals(v2), true);
        assert.strictEqual(v1.equals(v3), false);
    });

    it('should set vector values', () => {
        const vector = new BumbleVector();
        vector.set(7, 8);
        assert.strictEqual(vector.x, 7);
        assert.strictEqual(vector.y, 8);
    });
});

describe('BumbleMatrix', () => {
    it('should create identity matrix by default', () => {
        const matrix = new BumbleMatrix();
        assert.strictEqual(matrix.m11, 1);
        assert.strictEqual(matrix.m22, 1);
        assert.strictEqual(matrix.m33, 1);
        assert.strictEqual(matrix.m12, 0);
        assert.strictEqual(matrix.m21, 0);
    });

    it('should create matrix with specified values', () => {
        const matrix = new BumbleMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
        assert.strictEqual(matrix.m11, 1);
        assert.strictEqual(matrix.m12, 2);
        assert.strictEqual(matrix.m13, 3);
        assert.strictEqual(matrix.m21, 4);
        assert.strictEqual(matrix.m22, 5);
        assert.strictEqual(matrix.m23, 6);
        assert.strictEqual(matrix.m31, 7);
        assert.strictEqual(matrix.m32, 8);
        assert.strictEqual(matrix.m33, 9);
    });

    it('should multiply matrices', () => {
        const m1 = BumbleMatrix.identity();
        const m2 = BumbleMatrix.scale(2, 3);
        const result = m1.multiply(m2);
        assert.strictEqual(result.m11, 2);
        assert.strictEqual(result.m22, 3);
    });

    it('should add matrices', () => {
        const m1 = BumbleMatrix.identity();
        const m2 = BumbleMatrix.identity();
        const result = m1.add(m2);
        assert.strictEqual(result.m11, 2);
        assert.strictEqual(result.m22, 2);
    });

    it('should transpose matrix', () => {
        const matrix = new BumbleMatrix(1, 2, 3, 4, 5, 6, 7, 8, 9);
        const transposed = matrix.transpose();
        assert.strictEqual(transposed.m12, 4);
        assert.strictEqual(transposed.m21, 2);
    });

    it('should create translation matrix', () => {
        const matrix = BumbleMatrix.translate(5, 10);
        assert.strictEqual(matrix.m13, 5);
        assert.strictEqual(matrix.m23, 10);
    });

    it('should create scale matrix', () => {
        const matrix = BumbleMatrix.scale(2, 3);
        assert.strictEqual(matrix.m11, 2);
        assert.strictEqual(matrix.m22, 3);
    });

    it('should create rotation matrix', () => {
        const matrix = BumbleMatrix.rotate(Math.PI / 2);
        assert.ok(Math.abs(matrix.m11) < 0.0001);
        assert.ok(Math.abs(matrix.m12 + 1) < 0.0001);
        assert.ok(Math.abs(matrix.m21 - 1) < 0.0001);
        assert.ok(Math.abs(matrix.m22) < 0.0001);
    });
});

describe('BumbleColor', () => {
    it('should create RGB color', () => {
        const color = BumbleColor.fromRGB(255, 128, 64);
        assert.strictEqual(color, 'rgb(255, 128, 64)');
    });

    it('should create RGBA color', () => {
        const color = BumbleColor.fromRGBA(255, 128, 64, 0.5);
        assert.strictEqual(color, 'rgba(255, 128, 64, 0.5)');
    });

    it('should have debug color', () => {
        assert.strictEqual(BumbleColor.debugColor, 'red');
    });
});

describe('BumbleRect', () => {
    it('should create rect with proper left/right ordering', () => {
        const rect = new BumbleRect(10, 20, 30, 40);
        assert.strictEqual(rect.left, 10);
        assert.strictEqual(rect.right, 20);
        assert.strictEqual(rect.top, 30);
        assert.strictEqual(rect.bottom, 40);
    });

    it('should reorder left/right if reversed', () => {
        const rect = new BumbleRect(20, 10, 40, 30);
        assert.strictEqual(rect.left, 10);
        assert.strictEqual(rect.right, 20);
        assert.strictEqual(rect.top, 30);
        assert.strictEqual(rect.bottom, 40);
    });

    it('should calculate width', () => {
        const rect = new BumbleRect(10, 20, 30, 40);
        assert.strictEqual(rect.width, 10);
    });

    it('should calculate height', () => {
        const rect = new BumbleRect(10, 20, 30, 40);
        assert.strictEqual(rect.height, 10);
    });

    it('should calculate center', () => {
        const rect = new BumbleRect(10, 20, 30, 40);
        const center = rect.center;
        assert.strictEqual(center.x, 15);
        assert.strictEqual(center.y, 35);
    });
});

describe('BumbleCircle', () => {
    it('should create circle with default values', () => {
        const circle = new BumbleCircle();
        assert.strictEqual(circle.center.x, 0);
        assert.strictEqual(circle.center.y, 0);
        assert.strictEqual(circle.radius, 0);
    });

    it('should create circle with specified values', () => {
        const center = new BumbleVector(5, 10);
        const circle = new BumbleCircle(center, 15);
        assert.strictEqual(circle.center.x, 5);
        assert.strictEqual(circle.center.y, 10);
        assert.strictEqual(circle.radius, 15);
    });

    it('should set center', () => {
        const circle = new BumbleCircle();
        circle.center = new BumbleVector(7, 8);
        assert.strictEqual(circle.center.x, 7);
        assert.strictEqual(circle.center.y, 8);
    });

    it('should set radius', () => {
        const circle = new BumbleCircle();
        circle.radius = 20;
        assert.strictEqual(circle.radius, 20);
    });
});

describe('BumbleCollision', () => {
    describe('rectToRect', () => {
        it('should detect overlapping rectangles', () => {
            const rect1 = { center: new BumbleVector(0, 0), width: 10, height: 10 };
            const rect2 = { center: new BumbleVector(5, 0), width: 10, height: 10 };
            assert.strictEqual(BumbleCollision.rectToRect(rect1, rect2), true);
        });

        it('should detect non-overlapping rectangles', () => {
            const rect1 = { center: new BumbleVector(0, 0), width: 10, height: 10 };
            const rect2 = { center: new BumbleVector(20, 0), width: 10, height: 10 };
            assert.strictEqual(BumbleCollision.rectToRect(rect1, rect2), false);
        });
    });

    describe('pointToRect', () => {
        it('should detect point inside rectangle', () => {
            const rect = { center: new BumbleVector(0, 0), width: 10, height: 10 };
            const point = new BumbleVector(0, 0);
            assert.strictEqual(BumbleCollision.pointToRect(point, rect), true);
        });

        it('should detect point outside rectangle', () => {
            const rect = { center: new BumbleVector(0, 0), width: 10, height: 10 };
            const point = new BumbleVector(20, 20);
            assert.strictEqual(BumbleCollision.pointToRect(point, rect), false);
        });
    });

    describe('circleToCircle', () => {
        it('should detect overlapping circles', () => {
            const circle1 = new BumbleCircle(new BumbleVector(0, 0), 5);
            const circle2 = new BumbleCircle(new BumbleVector(5, 0), 5);
            assert.strictEqual(BumbleCollision.circleToCircle(circle1, circle2), true);
        });

        it('should detect non-overlapping circles', () => {
            const circle1 = new BumbleCircle(new BumbleVector(0, 0), 5);
            const circle2 = new BumbleCircle(new BumbleVector(20, 0), 5);
            assert.strictEqual(BumbleCollision.circleToCircle(circle1, circle2), false);
        });
    });

    describe('pointToCircle', () => {
        it('should detect point inside circle', () => {
            const circle = new BumbleCircle(new BumbleVector(0, 0), 10);
            const point = new BumbleVector(0, 0);
            assert.strictEqual(BumbleCollision.pointToCircle(point, circle), true);
        });

        it('should detect point outside circle', () => {
            const circle = new BumbleCircle(new BumbleVector(0, 0), 10);
            const point = new BumbleVector(20, 20);
            assert.strictEqual(BumbleCollision.pointToCircle(point, circle), false);
        });
    });

    describe('pointToPolygon', () => {
        it('should detect point inside square polygon', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const point = new BumbleVector(5, 5);
            assert.strictEqual(BumbleCollision.pointToPolygon(point, polygon), true);
        });

        it('should detect point outside square polygon', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const point = new BumbleVector(20, 20);
            assert.strictEqual(BumbleCollision.pointToPolygon(point, polygon), false);
        });

        it('should detect point on polygon edge', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const point = new BumbleVector(5, 0);
            assert.strictEqual(BumbleCollision.pointToPolygon(point, polygon), true);
        });

        it('should detect point on polygon vertex', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const point = new BumbleVector(0, 0);
            assert.strictEqual(BumbleCollision.pointToPolygon(point, polygon), true);
        });

        it('should detect point outside polygon but within radius', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const point = new BumbleVector(-5, 5);
            assert.strictEqual(BumbleCollision.pointToPolygon(point, polygon), false);
        });

        it('should detect point inside triangle polygon', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(5, 10)
            ];
            const polygon = new BumblePolygon(points);
            const point = new BumbleVector(5, 3);
            assert.strictEqual(BumbleCollision.pointToPolygon(point, polygon), true);
        });

        it('should detect point outside triangle polygon', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(5, 10)
            ];
            const polygon = new BumblePolygon(points);
            const point = new BumbleVector(5, 15);
            assert.strictEqual(BumbleCollision.pointToPolygon(point, polygon), false);
        });
    });

    describe('circleToPolygon', () => {
        it('should detect circle inside polygon', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(20, 0),
                new BumbleVector(20, 20),
                new BumbleVector(0, 20)
            ];
            const polygon = new BumblePolygon(points);
            const circle = new BumbleCircle(new BumbleVector(10, 10), 3);
            assert.strictEqual(BumbleCollision.circleToPolygon(circle, polygon), true);
        });

        it('should detect circle completely outside polygon', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const circle = new BumbleCircle(new BumbleVector(50, 50), 3);
            assert.strictEqual(BumbleCollision.circleToPolygon(circle, polygon), false);
        });

        it('should detect circle overlapping polygon edge', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const circle = new BumbleCircle(new BumbleVector(5, -2), 3);
            assert.strictEqual(BumbleCollision.circleToPolygon(circle, polygon), true);
        });

        it('should detect circle near polygon but not touching', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const circle = new BumbleCircle(new BumbleVector(5, -10), 3);
            assert.strictEqual(BumbleCollision.circleToPolygon(circle, polygon), false);
        });

        it('should detect circle containing polygon', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const circle = new BumbleCircle(new BumbleVector(5, 5), 20);
            assert.strictEqual(BumbleCollision.circleToPolygon(circle, polygon), true);
        });

        it('should detect circle overlapping polygon vertex', () => {
            const points = [
                new BumbleVector(0, 0),
                new BumbleVector(10, 0),
                new BumbleVector(10, 10),
                new BumbleVector(0, 10)
            ];
            const polygon = new BumblePolygon(points);
            const circle = new BumbleCircle(new BumbleVector(-2, -2), 3);
            assert.strictEqual(BumbleCollision.circleToPolygon(circle, polygon), true);
        });
    });
});

describe('BumblePolygon', () => {
    it('should create polygon with points', () => {
        const points = [
            new BumbleVector(0, 0),
            new BumbleVector(10, 0),
            new BumbleVector(10, 10),
            new BumbleVector(0, 10)
        ];
        const polygon = new BumblePolygon(points);
        assert.strictEqual(polygon.points.length, 4);
    });

    it('should calculate center', () => {
        const points = [
            new BumbleVector(0, 0),
            new BumbleVector(10, 0),
            new BumbleVector(10, 10),
            new BumbleVector(0, 10)
        ];
        const polygon = new BumblePolygon(points);
        assert.strictEqual(polygon.center.x, 5);
        assert.strictEqual(polygon.center.y, 5);
    });

    it('should calculate radius', () => {
        const points = [
            new BumbleVector(0, 0),
            new BumbleVector(10, 0),
            new BumbleVector(10, 10),
            new BumbleVector(0, 10)
        ];
        const polygon = new BumblePolygon(points);
        assert.ok(polygon.radius > 0);
    });
});

describe('BumbleTransformation', () => {
    it('should create transformation with default values', () => {
        const transformation = new BumbleTransformation();
        assert.strictEqual(transformation.rotation, 0.0);
        assert.strictEqual(transformation.position.x, 0.0);
        assert.strictEqual(transformation.position.y, 0.0);
        assert.strictEqual(transformation.scale.x, 1.0);
        assert.strictEqual(transformation.scale.y, 1.0);
        assert.strictEqual(transformation.anchor.x, 0.5);
        assert.strictEqual(transformation.anchor.y, 0.5);
    });

    it('should create transformation with dimensions', () => {
        const transformation = new BumbleTransformation(100, 200);
        assert.strictEqual(transformation.width, 100);
        assert.strictEqual(transformation.height, 200);
    });

    it('should normalize rotation', () => {
        const transformation = new BumbleTransformation();
        transformation.rotation = Math.PI * 3;
        assert.ok(transformation.rotation <= Math.PI * 2);
    });

    it('should build transformation matrix', () => {
        const transformation = new BumbleTransformation(100, 100);
        transformation.position = new BumbleVector(50, 50);
        transformation.rotation = Math.PI / 4;
        transformation.scale = new BumbleVector(2, 2);
        const matrix = transformation.build();
        assert.ok(matrix instanceof BumbleMatrix);
    });
});

describe('BumbleOrientedRect', () => {
    it('should create oriented rect with default values', () => {
        const rect = new BumbleOrientedRect();
        assert.ok(rect.leftTop instanceof BumbleVector);
        assert.ok(rect.rightTop instanceof BumbleVector);
        assert.ok(rect.rightBottom instanceof BumbleVector);
        assert.ok(rect.leftBottom instanceof BumbleVector);
    });

    it('should create oriented rect with specified corners', () => {
        const lt = new BumbleVector(0, 10);
        const rt = new BumbleVector(10, 10);
        const rb = new BumbleVector(10, 0);
        const lb = new BumbleVector(0, 0);
        const rect = new BumbleOrientedRect(lt, rt, rb, lb);
        assert.strictEqual(rect.leftTop.x, 0);
        assert.strictEqual(rect.leftTop.y, 10);
        assert.strictEqual(rect.rightTop.x, 10);
        assert.strictEqual(rect.rightTop.y, 10);
    });

    it('should calculate center', () => {
        const lt = new BumbleVector(0, 10);
        const rt = new BumbleVector(10, 10);
        const rb = new BumbleVector(10, 0);
        const lb = new BumbleVector(0, 0);
        const rect = new BumbleOrientedRect(lt, rt, rb, lb);
        const center = rect.center;
        assert.strictEqual(center.x, 5);
        assert.strictEqual(center.y, 5);
    });

    it('should calculate up vector', () => {
        const lt = new BumbleVector(0, 10);
        const rt = new BumbleVector(10, 10);
        const rb = new BumbleVector(10, 0);
        const lb = new BumbleVector(0, 0);
        const rect = new BumbleOrientedRect(lt, rt, rb, lb);
        const upVector = rect.upVector;
        assert.ok(Math.abs(upVector.y - 1) < 0.0001);
    });
});

describe('BumbleUtility', () => {
    it('should clamp value within range', () => {
        assert.strictEqual(BumbleUtility.clamp(5, 0, 10), 5);
        assert.strictEqual(BumbleUtility.clamp(-5, 0, 10), 0);
        assert.strictEqual(BumbleUtility.clamp(15, 0, 10), 10);
    });

    it('should generate random integer', () => {
        const result = BumbleUtility.random(10);
        assert.ok(result >= 0 && result < 10);
    });

    it('should generate random float', () => {
        const result = BumbleUtility.randomFloat(10);
        assert.ok(result >= 0 && result < 10);
    });

    it('should generate random float in range', () => {
        const result = BumbleUtility.randomFloatRange(5, 10);
        assert.ok(result >= 5 && result < 10);
    });

    it('should generate random sign', () => {
        const result = BumbleUtility.randomSign();
        assert.ok(result === 1 || result === -1);
    });
});

describe('BumbleCoroutines', () => {
    it('should create empty coroutines manager', () => {
        const coroutines = new BumbleCoroutines();
        assert.ok(coroutines);
    });

    it('should clear coroutines', () => {
        const coroutines = new BumbleCoroutines();
        coroutines.runCoroutine(function*() {
            yield 1;
        });
        coroutines.clear();
        coroutines.update();
        assert.ok(coroutines);
    });

    it('should run simple coroutine without yields', () => {
        const coroutines = new BumbleCoroutines();
        let executed = false;
        coroutines.runCoroutine(function*() {
            executed = true;
        });
        coroutines.update();
        assert.strictEqual(executed, true);
    });

    it('should run coroutine with single yield', () => {
        const coroutines = new BumbleCoroutines();
        let step = 0;
        coroutines.runCoroutine(function*() {
            step = 1;
            yield;
            step = 2;
        });
        coroutines.update();
        assert.strictEqual(step, 1);
        coroutines.update();
        assert.strictEqual(step, 2);
    });

    it('should run coroutine with multiple yields', () => {
        const coroutines = new BumbleCoroutines();
        let counter = 0;
        coroutines.runCoroutine(function*() {
            counter++;
            yield;
            counter++;
            yield;
            counter++;
        });
        coroutines.update();
        assert.strictEqual(counter, 1);
        coroutines.update();
        assert.strictEqual(counter, 2);
        coroutines.update();
        assert.strictEqual(counter, 3);
    });

    it('should remove completed coroutine after execution', () => {
        const coroutines = new BumbleCoroutines();
        coroutines.runCoroutine(function*() {
            yield;
        });
        coroutines.update();
        coroutines.update();
        coroutines.update();
        assert.strictEqual(coroutines.__coroutines.length, 0);
    });

    it('should run multiple coroutines concurrently', () => {
        const coroutines = new BumbleCoroutines();
        let counter1 = 0;
        let counter2 = 0;
        coroutines.runCoroutine(function*() {
            counter1++;
            yield;
            counter1++;
        });
        coroutines.runCoroutine(function*() {
            counter2++;
            yield;
            counter2++;
            yield;
            counter2++;
        });
        coroutines.update();
        assert.strictEqual(counter1, 1);
        assert.strictEqual(counter2, 1);
        coroutines.update();
        assert.strictEqual(counter1, 2);
        assert.strictEqual(counter2, 2);
        coroutines.update();
        assert.strictEqual(counter2, 3);
    });

    it('should handle coroutine yielding a value on next iteration', () => {
        const coroutines = new BumbleCoroutines();
        let yieldedValue = null;
        coroutines.runCoroutine(function*() {
            const val = yield 42;
            yieldedValue = val;
        });
        coroutines.update();
        coroutines.update();
        assert.strictEqual(yieldedValue, 42);
    });

    it('should handle coroutine returning a value', () => {
        const coroutines = new BumbleCoroutines();
        coroutines.runCoroutine(function*() {
            return 'result';
        });
        coroutines.update();
    });

    it('should maintain coroutine order during update', () => {
        const coroutines = new BumbleCoroutines();
        const executionOrder = [];
        coroutines.runCoroutine(function*() {
            executionOrder.push('A1');
            yield;
            executionOrder.push('A2');
        });
        coroutines.runCoroutine(function*() {
            executionOrder.push('B1');
            yield;
            executionOrder.push('B2');
        });
        coroutines.update();
        assert.deepStrictEqual(executionOrder, ['A1', 'B1']);
        coroutines.update();
        assert.deepStrictEqual(executionOrder, ['A1', 'B1', 'A2', 'B2']);
    });

    it('should increment counter across multiple yields', () => {
        const coroutines = new BumbleCoroutines();
        let sum = 0;
        coroutines.runCoroutine(function*() {
            for (let i = 1; i <= 5; i++) {
                sum += i;
                yield;
            }
        });
        for (let i = 0; i < 6; i++) {
            coroutines.update();
        }
        assert.strictEqual(sum, 15);
    });

    it('should handle coroutine with conditional yields', () => {
        const coroutines = new BumbleCoroutines();
        let result = 0;
        let condition = false;
        coroutines.runCoroutine(function*() {
            result = 1;
            yield;
            if (condition) {
                result = 10;
            } else {
                result = 20;
            }
        });
        coroutines.update();
        assert.strictEqual(result, 1);
        coroutines.update();
        assert.strictEqual(result, 20);
    });

    it('should handle array accumulation across yields', () => {
        const coroutines = new BumbleCoroutines();
        const items = [];
        coroutines.runCoroutine(function*() {
            items.push(1);
            yield;
            items.push(2);
            yield;
            items.push(3);
        });
        coroutines.update();
        assert.deepStrictEqual(items, [1]);
        coroutines.update();
        assert.deepStrictEqual(items, [1, 2]);
        coroutines.update();
        assert.deepStrictEqual(items, [1, 2, 3]);
    });

    it('should clear all running coroutines', () => {
        const coroutines = new BumbleCoroutines();
        let counter1 = 0;
        let counter2 = 0;
        coroutines.runCoroutine(function*() {
            while (true) {
                counter1++;
                yield;
            }
        });
        coroutines.runCoroutine(function*() {
            while (true) {
                counter2++;
                yield;
            }
        });
        coroutines.update();
        coroutines.update();
        const count1Before = counter1;
        const count2Before = counter2;
        coroutines.clear();
        coroutines.update();
        coroutines.update();
        assert.strictEqual(counter1, count1Before);
        assert.strictEqual(counter2, count2Before);
    });
});

describe('BumbleKeyCodes', () => {
    it('should have correct key codes', () => {
        assert.strictEqual(BumbleKeyCodes.SPACE, 32);
        assert.strictEqual(BumbleKeyCodes.LEFT, 37);
        assert.strictEqual(BumbleKeyCodes.UP, 38);
        assert.strictEqual(BumbleKeyCodes.RIGHT, 39);
        assert.strictEqual(BumbleKeyCodes.DOWN, 40);
        assert.strictEqual(BumbleKeyCodes.A, 65);
        assert.strictEqual(BumbleKeyCodes.Z, 90);
    });
});

describe('BumbleResource', () => {
    it('should create resource with name, url, and type', () => {
        const resource = new BumbleResource('test', '/path/to/file.png', 'image');
        assert.strictEqual(resource.name, 'test');
        assert.strictEqual(resource.url, '/path/to/file.png');
        assert.strictEqual(resource.type, 'image');
    });
});
