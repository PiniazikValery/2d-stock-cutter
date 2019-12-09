const Population = require('./index');
const Gen = require('../gen');

const runEvolution = (gens, chrWidth, chrHeight) => {
    const gensCollection = [];
    gens.forEach(gen => {
        gensCollection.push(new Gen(+gen.width, +gen.height));
    });
    return new Population(chrWidth, chrHeight, gensCollection)
        .startEvolution()
        .then(result => result[result.length - 1]);
};

process.on('message', (data) => {
    const { gens, chrHeight, chrWidth } = data;
    runEvolution(gens, chrWidth, chrHeight).then(result => {
        process.send(result);
    });
});