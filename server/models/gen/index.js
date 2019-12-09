const Rectangle = require('../rectangle');

class Gen extends Rectangle {
    constructor(width, height) {
        super(width, height);
        this.x = undefined;
        this.y = undefined;
        this.l = {
            x: undefined,
            y: undefined
        }
        this.r = {
            x: undefined,
            y: undefined
        }
    }

    setCoords(x, y) {
        this.x = x;
        this.y = y;
        this.l.x = this.x - (this.width / 2);
        this.l.y = this.y - (this.height / 2);
        this.r.x = this.x + (this.width / 2);
        this.r.y = this.y + (this.height / 2);
    }

    valueInRange(value, min, max) {
        return (value >= min) && (value <= max);
    }

    isDoOverlapWith(gen) {
        const xOverlap = this.valueInRange(this.x - (this.width / 2), gen.x - (gen.width / 2), gen.x - (gen.width / 2) + gen.width) ||
            this.valueInRange(gen.x - (gen.width / 2), this.x - (this.width / 2), this.x - (this.width / 2) + this.width);

        const yOverlap = this.valueInRange(this.y - (this.height / 2), gen.y - (gen.height / 2), gen.y - (gen.height / 2) + gen.height) ||
            this.valueInRange(gen.y - (gen.height / 2), this.y - (this.height / 2), this.y - (this.height / 2) + this.height);
        return xOverlap && yOverlap;
    }

    getLeftTopAngel() {
        return {
            x: this.x - (this.width / 2),
            y: this.y - (this.height / 2)
        };
    }

    getRightBottomAngel() {
        return {
            x: this.x + (this.width / 2),
            y: this.y + (this.height / 2)
        };
    }
}

Gen.sortByBulgingUp = (a, b) => {
    const firstAngel = a.getLeftTopAngel();
    const secondAngel = b.getLeftTopAngel();
    return firstAngel.y - secondAngel.y;
};

Gen.sortByBulgingDown = (a, b) => {
    const firstAngel = a.getRightBottomAngel();
    const secondAngel = b.getRightBottomAngel();
    return firstAngel.y - secondAngel.y;
};

Gen.sortByLeftProtruding = (a, b) => {
    const firstAngel = a.getLeftTopAngel();
    const secondAngel = b.getLeftTopAngel();
    return firstAngel.x - secondAngel.x;
};

Gen.sortByRightProtruding = (a, b) => {
    const firstAngel = a.getRightBottomAngel();
    const secondAngel = b.getRightBottomAngel();
    return firstAngel.x - secondAngel.x;
};

module.exports = Gen;
