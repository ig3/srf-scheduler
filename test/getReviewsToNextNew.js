'use strict';

const t = require('@ig3/test');

t.test('getNewCardMode', t => {
  t.test('Initial conditions', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        targetStudyTime: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 0,
      getAverageStudyTimePerDay: () => 0,
      getCardsDue: () => 0,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 0, 'Minimum');
    t.end();
  });
  t.test('At capacity', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        targetStudyTime: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageStudyTimePerDay: () => 30 * 60,
      getCardsDue: () => 70,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 7, 'reviews');
    t.end();
  });
  t.test('Adjusts to high study time', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        targetStudyTime: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageStudyTimePerDay: () => 45 * 60,
      getCardsDue: () => 70,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 10, 'reviews');
    t.end();
  });
  t.test('Adjusts to low study time', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        targetStudyTime: 30 * 60,
        studyTimeErrorSensitivity: 1.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageStudyTimePerDay: () => 15 * 60,
      getCardsDue: () => 70,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 3, 'reviews');
    t.end();
  });
  t.test('Adjusts to higher sensitivity', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        targetStudyTime: 30 * 60,
        studyTimeErrorSensitivity: 2.0,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageStudyTimePerDay: () => 45 * 60,
      getCardsDue: () => 70,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 14, 'reviews');
    t.end();
  });
  t.test('Adjusts to lower sensitivity', t => {
    const getReviewsToNextNew = require('../getReviewsToNextNew.js');

    const context = {
      config: {
        targetStudyTime: 30 * 60,
        studyTimeErrorSensitivity: 0.5,
      },
      getAverageNewCardsPerDay: () => 9,
      getAverageStudyTimePerDay: () => 45 * 60,
      getCardsDue: () => 70,
    };

    const n = getReviewsToNextNew.call(context);
    t.equal(n, 8, 'reviews');
    t.end();
  });
  t.end();
});
