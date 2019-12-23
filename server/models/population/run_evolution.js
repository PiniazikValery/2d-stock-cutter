const Population = require('./index');
const Gen = require('../gen');

const runEvolution = (gens, chrWidth, chrHeight) => {
    const gensCollection = [];
    gens.forEach(gen => {
        gensCollection.push(new Gen(+gen.width, +gen.height));
    });
    const startAlgorithTime = new Date()
    return new Population(gensCollection)
        .startEvolution()
        .then(result => {
            const resultWithDetails = displaceResultToLeftUpCorner(result[result.length - 1]);
            resultWithDetails.drawInfo = {
                outerRectHeight: chrHeight,
                outerRectWidth: chrWidth,
                widthToDraw: resultWithDetails.width > chrWidth ? resultWithDetails.width : chrWidth,
                heightToDraw: resultWithDetails.height > chrHeight ? resultWithDetails.height : chrHeight
            };
            if (resultWithDetails.gens.length > 1) {
                resultWithDetails.info = {
                    fitness: resultWithDetails.getFitness(),
                    chromosomeSquare: resultWithDetails.getChromosomeSquare(),
                    freeSpace: resultWithDetails.getChromosomeSquare() * (1 - resultWithDetails.getFitness()),
                    time: new Date() - startAlgorithTime
                };
            } else {
                resultWithDetails.info = {
                    chromosomeSquare: resultWithDetails.getChromosomeSquare(),
                    time: new Date() - startAlgorithTime
                };
            }
            return stabilizeResult(resultWithDetails);
        });
};

const displaceResultToLeftUpCorner = (chromosome) => {
    const bulgingUpGen = chromosome.gens.sort(Gen.sortByBulgingUp)[0];
    const leftProtrudingGen = chromosome.gens.sort(Gen.sortByLeftProtruding)[0];
    chromosome.gens.forEach(gen => {
        gen.x = gen.x - leftProtrudingGen.l.x;
        gen.y = gen.y - bulgingUpGen.l.y;
    });
    return chromosome;
};

const stabilizeResult = (result) => {
    const xMultiplier = 1000 / result.drawInfo.widthToDraw * (result.drawInfo.widthToDraw / result.drawInfo.heightToDraw);
    const yMultiplier = 1000 / result.drawInfo.heightToDraw;
    result.drawInfo = {
        outerRectHeight: result.drawInfo.outerRectHeight * yMultiplier,
        outerRectWidth: result.drawInfo.outerRectWidth * xMultiplier,
        widthToDraw: result.drawInfo.widthToDraw * xMultiplier,
        heightToDraw: result.drawInfo.heightToDraw * yMultiplier
    }
    result.gens.forEach(gen => {
        gen.width = gen.width * xMultiplier;
        gen.height = gen.height * yMultiplier;
        gen.x = gen.x * xMultiplier;
        gen.y = gen.y * yMultiplier;
        gen.l.x = gen.l.x * xMultiplier;
        gen.l.y = gen.l.y * yMultiplier;
        gen.r.x = gen.r.x * xMultiplier;
        gen.r.y = gen.r.y * yMultiplier;
    });
    return result;
};

process.on('message', (data) => {
    const { gens, chrHeight, chrWidth } = data;
    runEvolution(gens, chrWidth, chrHeight).then(result => {
        process.send(result);
    });
});