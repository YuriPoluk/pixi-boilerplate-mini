export default {
    alpha: {
        start: 1,
        end: 0.6,
    },
    scale: {
        start: 0.7,
        end: 0.1,
        minimumScaleMultiplier: 1,
    },
    color: {
        start: '#ffd900',
        end: '#ff8e24',
    },
    speed: {
        start: 100,
        end: 50,
        minimumSpeedMultiplier: 1,
    },
    acceleration: {
        x: 0,
        y: 0,
    },
    maxSpeed: 0,
    startRotation: {
        min: 270,
        max: 270,
    },
    noRotation: true,
    rotationSpeed: {
        min: 0,
        max: 0,
    },
    lifetime: {
        min: 0.5,
        max: 1,
    },
    blendMode: 'screen',
    frequency: 0.1,
    emitterLifetime: -1,
    maxParticles: 10,
    pos: {
        x: 0,
        y: 0,
    },
    addAtBack: false,
    spawnType: 'rect',
    spawnRect: {
        x: -10,
        y: -5,
        w: 20,
        h: 10,
    },
}
