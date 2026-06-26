'use strict';

const t = require('@ig3/test');

t.test('getNewCardMode', t => {
  t.test('Initial conditions', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 0,
      getAverageReviewsPerCard: () => 10,
      getAverageStudyTimePerDay: () => 0,
      getCardsDue: () => 0,
      getStudyTimeToday: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 0, 'Minimum');
    t.end();
  });
  t.test('Card due', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 0,
      getAverageReviewsPerCard: () => 10,
      getAverageStudyTimePerDay: () => 0,
      getCardsDue: () => 1,
      getStudyTimeToday: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 1, 'Minimum');
    t.end();
  });
  t.test('At capacity', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageReviewsPerCard: () => 2,
      getAverageStudyTimePerDay: () => 30 * 60,
      getCardsDue: () => 70,
      getStudyTimeToday: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 14, 'reviews');
    t.end();
  });
  t.test('Adjusts to high study time', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageReviewsPerCard: () => 2,
      getAverageStudyTimePerDay: () => 45 * 60,
      getCardsDue: () => 70,
      getStudyTimeToday: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 21, 'reviews');
    t.end();
  });
  t.test('Adjusts to high study time today', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageReviewsPerCard: () => 2,
      getAverageStudyTimePerDay: () => 30 * 60,
      getCardsDue: () => 70,
      getStudyTimeToday: () => 45 * 60,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 21, 'reviews');
    t.end();
  });
  t.test('Adjusts to low study time', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageReviewsPerCard: () => 2,
      getAverageStudyTimePerDay: () => 15 * 60,
      getCardsDue: () => 70,
      getStudyTimeToday: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 7, 'reviews');
    t.end();
  });
  t.test('Adjusts to higher sensitivity', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 2.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageReviewsPerCard: () => 2,
      getAverageStudyTimePerDay: () => 45 * 60,
      getCardsDue: () => 70,
      getStudyTimeToday: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 28, 'reviews');
    t.end();
  });
  t.test('Adjusts to lower sensitivity', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        studyTimeTarget: 30 * 60,
        studyTimeErrorSensitivity: 0.5,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageReviewsPerCard: () => 2,
      getAverageStudyTimePerDay: () => 45 * 60,
      getCardsDue: () => 70,
      getStudyTimeToday: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 17, 'reviews');
    t.end();
  });
  t.end();
});
