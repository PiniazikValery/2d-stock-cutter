const _ = require('lodash');
const Gen = require('../gen');
const Rectangle = require('../rectangle');
const workaroundStrategies = require('./crossover_strategies');

class Chromosome extends Rectangle {
    constructor(width, height) {
        super(width, height);
        this.gens = [];
    }

    initGens(gens) {
        _.cloneDeep(gens).forEach(gen => {
            this.randomlyInsertGen(gen)
        });
    }

    genIsSuitable(gen) {
        let isSuitable = true;
        if (this.gens.length !== 0) {
            for (let i = 0; i < this.gens.length; i++) {
                if (this.gens[i].isDoOverlapWith(gen)) {
                    isSuitable = false;
                    break;
                }
            }
        }
        return isSuitable;
    }

    randomlyInsertGen(gen) {
        do {
            let x = this.getRandomArbitrary((this.width - (gen.width / 2)), (gen.width / 2));
            let y = this.getRandomArbitrary((this.height - (gen.height / 2)), (gen.height / 2));
            gen.setCoords(x, y);
        } while (!this.genIsSuitable(gen))
        this.gens.push(gen);
    }

    getFitness() {
        const bulgingUpGen = this.gens.sort(Gen.sortByBulgingUp)[0];
        const bulgingDownGen = this.gens.sort(Gen.sortByBulgingDown).slice(-1)[0];
        const leftProtrudingGen = this.gens.sort(Gen.sortByLeftProtruding)[0];
        const rightProtrudingGen = this.gens.sort(Gen.sortByRightProtruding).slice(-1)[0];
        const gensTakenSquare = Math.abs(bulgingUpGen.l.y - bulgingDownGen.r.y) * Math.abs(leftProtrudingGen.l.x - rightProtrudingGen.r.x);
        return this.getChromosomeSquare() / gensTakenSquare;
    }

    makeCrossOver(chromosome) {
        return new Promise((resolve) => {
            const copyOfOriginChromosome = _.cloneDeep(this);
            const copyOfDestinationChromosome = _.cloneDeep(chromosome);
            const randomlySelectedStrategies = workaroundStrategies[this.getRandomInt(0, workaroundStrategies.length - 1)];
            const listOfIds = this.getListOfIds();
            for (let i = randomlySelectedStrategies.start(listOfIds); randomlySelectedStrategies.condition(listOfIds, i); i = randomlySelectedStrategies.step(i)) {
                const originGen = copyOfOriginChromosome.getGenById(listOfIds[i]);
                const destinationGen = copyOfDestinationChromosome.getGenById(originGen.id);
                if (
                    copyOfOriginChromosome.getChromosomeWithoutOneGenById(originGen.id).genIsSuitable(destinationGen)
                    && copyOfDestinationChromosome.getChromosomeWithoutOneGenById(destinationGen.id).genIsSuitable(originGen)
                ) {
                    copyOfOriginChromosome.removeGenById(originGen.id);
                    copyOfDestinationChromosome.removeGenById(originGen.id);
                    copyOfOriginChromosome.addGen(destinationGen);
                    copyOfDestinationChromosome.addGen(originGen);
                }
            }
            if (copyOfOriginChromosome.getFitness() > copyOfDestinationChromosome.getFitness()) {
                resolve(copyOfOriginChromosome);
            } else {
                resolve(copyOfDestinationChromosome);
            }
        });
    }

    makeMutation() {
        return new Promise((resolve) => {
            const currentChromosome = _.cloneDeep(this);
            if (Math.random() >= 0.5) {
                const randomGen = currentChromosome.gens[currentChromosome.getRandomInt(0, currentChromosome.gens.length - 1)];
                let availableCoords = currentChromosome.getAllAvailableCoordsForGen(randomGen);
                let randomCoord = undefined;
                if (availableCoords.length !== 0) {
                    currentChromosome.removeGenById(randomGen.id);
                    randomCoord = availableCoords[currentChromosome.getRandomInt(0, availableCoords.length - 1)];
                    randomGen.setCoords(randomCoord.x, randomCoord.y);
                    currentChromosome.addGen(randomGen);
                }
            }
            resolve(currentChromosome);
        });
    }

    getAllAvailableCoordsForGen(gen) {
        const result = [];
        const bufferGen = _.cloneDeep(gen);
        const currentChromosome = _.cloneDeep(this);
        currentChromosome.removeGenById(gen.id);
        const bulgingUpGen = this.gens.sort(Gen.sortByBulgingUp)[0];
        const bulgingDownGen = this.gens.sort(Gen.sortByBulgingDown).slice(-1)[0];
        const leftProtrudingGen = this.gens.sort(Gen.sortByLeftProtruding)[0];
        const rightProtrudingGen = this.gens.sort(Gen.sortByRightProtruding).slice(-1)[0];
        const fitness = this.getFitness();
        // console.log(fitness);
        const xStep = this.gens > 2 ? (rightProtrudingGen.r.x - bufferGen.width - leftProtrudingGen.l.x) * 0.005
            :
            (rightProtrudingGen.r.x - leftProtrudingGen.l.x) * 0.005;
        const yStep = this.gens > 2 ? (bulgingDownGen.r.y - bufferGen.height - bulgingUpGen.l.y) * 0.005
            :
            (bulgingDownGen.r.y - bulgingUpGen.l.y) * 0.005;
        let counter = 0;
        for (let x = leftProtrudingGen.l.x; x < rightProtrudingGen.r.x - bufferGen.width; x += xStep) {
            for (let y = bulgingUpGen.l.y; y < bulgingDownGen.r.y - bufferGen.height; y += yStep) {
                bufferGen.setCoords(x + (bufferGen.width / 2), y + (bufferGen.height / 2));
                if (currentChromosome.genIsSuitable(bufferGen)) {
                    counter++;
                    result.push({ x: x + (bufferGen.width / 2), y: y + (bufferGen.height / 2) });
                    if (counter > 50) { break; }
                }
            }
        }
        return result;
    }

    removeGenById(id) {
        const genPos = this.gens.map(function (x) { return x.id; }).indexOf(id);
        return this.gens.splice(genPos, 1);
    }

    getGenById(id) {
        const gen = this.gens.filter(gen => gen.id === id)[0];
        return _.cloneDeep(gen);
    }

    getChromosomeWithoutOneGenById(id) {
        const copyChromosome = _.cloneDeep(this);
        copyChromosome.removeGenById(id);
        return copyChromosome;
    }

    addGen(gen) {
        this.gens.push(_.cloneDeep(gen));
    }

    getListOfIds() {
        return _.cloneDeep(this.gens.map(gen => gen.id));
    }

    getChromosomeSquare(gens) {
        return (gens ? gens : this.gens).reduce((accumulator, currentValue) => {
            if (accumulator instanceof Gen) {
                return accumulator.square + currentValue.square;
            } else {
                return accumulator + currentValue.square;
            }
        });
    }
}

Chromosome.sortByFitness = (a, b) => {
    return a.getFitness() - b.getFitness();
};

module.exports = Chromosome;
