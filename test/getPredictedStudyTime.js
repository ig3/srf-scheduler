'use strict';

const t = require('@ig3/test');

t.test('getPredictedStudyTime', t => {
  t.test('initial conditions', t => {
    const getPredictedStudyTime = require('../getPredictedStudyTime.js');

    const time = getPredictedStudyTime.call({
      getAverageNewCardsPerDay: () => 0,
      getAverageStudyTimePerCard: () => 30,
      getCardsDue: () => 0,
    });

    t.equal(time, 0, 'time');
    t.end();
  });
  t.test('typical conditions', t => {
    const getPredictedStudyTime = require('../getPredictedStudyTime.js');

    const time = getPredictedStudyTime.call({
      getAverageNewCardsPerDay: () => 20,
      getAverageStudyTimePerCard: () => 10,
      getCardsDue: () => 80,
    });

    t.equal(time, 1000, 'time');
    t.end();
  });
  t.test('extreme conditions', t => {
    const getPredictedStudyTime = require('../getPredictedStudyTime.js');

    const time = getPredictedStudyTime.call({
      getAverageNewCardsPerDay: () => 10000,
      getAverageStudyTimePerCard: () => 10,
      getCardsDue: () => 800,
    });

    t.equal(time, 86400, 'time');
    t.end();
  });
  t.end();
});
