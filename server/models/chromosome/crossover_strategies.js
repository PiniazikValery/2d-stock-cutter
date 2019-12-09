const workaroundStrategies = [
    {
        start: () => 0,
        condition: (gens, i) => i < gens.length / 2,
        step: (i) => i + 1
    },
    {
        start: () => 0,
        condition: (gens, i) => i < gens.length,
        step: (i) => i + 2
    },
    {
        start: () => 1,
        condition: (gens, i) => i < gens.length,
        step: (i) => i + 2
    },
    {
        start: (gens) => Math.round(gens.length / 2),
        condition: (gens, i) => i < gens.length,
        step: (i) => i + 1
    },
];

module.exports = workaroundStrategies;
