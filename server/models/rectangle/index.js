const UniqueObject = require('../unique_object');

class Rectangle extends UniqueObject {
    constructor(width, height) {
        super();
        this.width = width;
        this.height = height;
    }

    get square() {
        return this.width * this.height;
    }

    getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

module.exports = Rectangle;
