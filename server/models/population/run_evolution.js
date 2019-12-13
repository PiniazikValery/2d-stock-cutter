const Population = require('./index');
const Gen = require('../gen');

const runEvolution = (gens, chrWidth, chrHeight) => {
    const gensCollection = [];
    gens.forEach(gen => {
        gensCollection.push(new Gen(+gen.width, +gen.height));
    });
    const startAlgorithTime = new Date()
    return new Population(chrWidth, chrHeight, gensCollection)
        .startEvolution()
        .then(result => {
            const resultWithDetails = result[result.length - 1]
            resultWithDetails.info = {
                fitness: resultWithDetails.getFitness(),
                chromosomeSquare: resultWithDetails.getChromosomeSquare(),
                freeSpace: resultWithDetails.getChromosomeSquare() * (1 - resultWithDetails.getFitness()),
                time: new Date() - startAlgorithTime
            };
            return resultWithDetails;
        });
};

process.on('message', (data) => {
    const { gens, chrHeight, chrWidth } = data;
    runEvolution(gens, chrWidth, chrHeight).then(result => {
        process.send(result);
    });
});