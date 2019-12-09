const Chromosome = require('../chromosome');
const _ = require('lodash');

class Population {
    constructor(chrWidth, chrHeight, gens) {
        this.chrWidth = chrWidth;
        this.chrHeight = chrHeight;
        this.gens = gens;
        this.populationSize = 200;
        this.chromosomes = [];
        this.initPopulation();
    }

    initPopulation() {
        for (let i = 1; i <= this.populationSize; i++) {
            let newChromosome = new Chromosome(this.chrWidth, this.chrHeight);
            newChromosome.initGens(this.gens);
            this.chromosomes.push(newChromosome);
        }
    }

    getPopulationFitness(chromosomes) {
        return (chromosomes ? chromosomes : this.chromosomes).reduce((accumulator, currentValue) => {
            if (accumulator instanceof Chromosome) {
                return accumulator.getFitness() + currentValue.getFitness();
            } else {
                return accumulator + currentValue.getFitness();
            }
        });
    }

    startEvolution() {
        return new Promise(async (resolve, reject) => {
            let newChromosomes = undefined;
            let isEvolving = true;
            while (isEvolving) {
                newChromosomes = await this.generateNewChromosomes();
                if (this.getPopulationFitness() < this.getPopulationFitness(newChromosomes)) {
                    this.chromosomes = _.cloneDeep(newChromosomes);
                } else {
                    isEvolving = false;
                }
            }
            resolve(newChromosomes);
        })
    }

    generateNewChromosomes() {
        const currentChromosomes = _.cloneDeep(this.chromosomes);
        currentChromosomes.sort(Chromosome.sortByFitness);
        currentChromosomes.splice(0, Math.ceil(currentChromosomes.length / 2));
        const crossoverPromises = [];
        crossoverPromises.push(currentChromosomes[currentChromosomes.length - 2].makeCrossOver(currentChromosomes[currentChromosomes.length - 1]));
        crossoverPromises.push(currentChromosomes[currentChromosomes.length - 1].makeCrossOver(currentChromosomes[currentChromosomes.length - 2]));
        for (let i = 0; i < currentChromosomes.length - 1; i += 1) {
            crossoverPromises.push(currentChromosomes[i].makeCrossOver(currentChromosomes[i + 1]));
            crossoverPromises.push(currentChromosomes[i + 1].makeCrossOver(currentChromosomes[i]));
        }
        return Promise.all(crossoverPromises).then(crossovers => {
            return Promise.all(crossovers.map(crossover => crossover.makeMutation())).then(mutantChromosomes => {
                return mutantChromosomes;
            })
        });
    }
}

module.exports = Population;
