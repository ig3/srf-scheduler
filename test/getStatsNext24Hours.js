'use strict';

const t = require('@ig3/test');

t.test('getStatsNext24Hours', t => {
  t.test('Initial conditions', t => {
    const getStatsNext24Hours = require('../getStatsNext24Hours.js');
    const stats = getStatsNext24Hours.call({
      getCardsDue: () => 0,
      getAverageNewCardsPerDay: () => 0,
      getAverageStudyTimePerCard: () => 30,
      getReviewsToNextNew: () => 0,
      reviewsToNextNew: 0,
    });
    t.equal(stats.count, 0, '0 count');
    t.equal(stats.time, 0, '0 time');
    t.equal(stats.cardsDue, 0, '0 cards due');
    t.equal(stats.minReviews, 0, '0 reviews between new cards');
    t.equal(stats.reviewsToNextNew, 0, 'reviews to next new card');
    t.end();
  });
  t.test('Typical study', t => {
    const getStatsNext24Hours = require('../getStatsNext24Hours.js');
    const stats = getStatsNext24Hours.call({
      getCardsDue: () => 80,
      getAverageNewCardsPerDay: () => 20,
      getAverageStudyTimePerCard: () => 9.0,
      getReviewsToNextNew: () => 7,
      reviewsToNextNew: 5,
    });
    t.equal(stats.count, 100, 'count');
    t.equal(stats.time, 900, 'time');
    t.equal(stats.cardsDue, 80, 'cards due');
    t.equal(stats.minReviews, 7, 'reviews between new cards');
    t.equal(stats.reviewsToNextNew, 5, 'reviews to next new card');
    t.end();
  });
  t.test('High cards due', t => {
    const getStatsNext24Hours = require('../getStatsNext24Hours.js');
    const stats = getStatsNext24Hours.call({
      getCardsDue: () => 800,
      getAverageNewCardsPerDay: () => 200,
      getAverageStudyTimePerCard: () => 100,
      getReviewsToNextNew: () => 7,
      reviewsToNextNew: 5,
    });
    t.equal(stats.count, 1000, 'count');
    t.equal(stats.time, 86400, 'time');
    t.equal(stats.cardsDue, 800, 'cards due');
    t.equal(stats.minReviews, 7, 'reviews between new cards');
    t.equal(stats.reviewsToNextNew, 5, 'reviews to next new card');
    t.end();
  });
  t.end();
});
