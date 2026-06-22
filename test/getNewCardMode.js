'use strict';

const t = require('@ig3/test');

t.test('getNewCardMode', t => {
  t.test('Initial conditions', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 0,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 0 }),
      getStudyTime: () => 0,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'go', 'Go mode');
    t.end();
  });
  t.test('High study time past 24 hours', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 0,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 0 }),
      getStudyTime: () => 4 * 30 * 60,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'stop', 'Stop mode');
    t.end();
  });
  t.test('High study time next 24 hours', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 0,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 4 * 30 * 60 }),
      getStudyTime: () => 0,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'stop', 'Stop mode');
    t.end();
  });
  t.test('High average study time', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 2 * 30 * 60,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 0 }),
      getStudyTime: () => 0,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'stop', 'Stop mode');
    t.end();
  });
  t.test('Max new cards per day', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 0,
      getCountNewCardsToday: () => 20,
      getStatsNext24Hours: () => ({ time: 0 }),
      getStudyTime: () => 0,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'stop', 'Stop mode');
    t.end();
  });
  t.test('Overdue cards', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 0,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 0 }),
      getStudyTime: () => 0,
      srf: {
        getCountCardsOverdue: () => 1,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'stop', 'Stop mode');
    t.end();
  });
  t.test('Study time more than goModeThreshold', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 28 * 60,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 28 * 60 }),
      getStudyTime: () => 28 * 60,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'slow', 'Slow mode');
    t.end();
  });
  t.test('Study time less than goModeThreshold', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 28 * 60,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 28 * 60 }),
      getStudyTime: () => 27 * 60,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'go', 'Go mode');
    t.end();
  });
  t.test('Study time next 24 hours less than goModeThreshold', t => {
    const getNewCardMode = require('../getNewCardMode.js');

    const mode = getNewCardMode.call({
      getAverageStudyTimePerDay: () => 29 * 60,
      getCountNewCardsToday: () => 0,
      getStatsNext24Hours: () => ({ time: 27 * 60 }),
      getStudyTime: () => 28 * 60,
      srf: {
        getCountCardsOverdue: () => 0,
      },
      config: {
        goModeThreshold: 28 * 60,
        maxNewCardsPerDay: 20,
        targetStudyTime: 30 * 60,
      }
    });

    t.equal(mode, 'go', 'Go mode');
    t.end();
  });
  t.end();
});
