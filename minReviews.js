/**
 * minReviews is a private instance method of srf-scheduler.
 *
 * It must be called so that `this` is set to the srf-scheduler instance
 * object.
 *
 * Configuration parameters:
 *   config.targetStudyTime
 *   config.maxNewCardsPerDay
 *
 * minReviews returns the minimum number of reviews to be completed between
 * new cards when in slow mode.
 */
'use strict';

const getAverageStudyTime = require('./getAverageStudyTime.js');
const getAverageNewCardsPerDay = require('./getAverageNewCardsPerDay.js');
const getCardsToReview = require('./getCardsToReview.js');

module.exports = function minReviews () {
  const self = this;

  return Math.floor(
    self.config.newCardRateFactor *
    getAverageStudyTime.call(self) / self.config.targetStudyTime *
    getCardsToReview.call(self, 60 * 60 * 24) /
    Math.max(
      1,
      getAverageNewCardsPerDay.call(self) || self.config.maxNewCardsPerDay
    )
  );
};
