/**
 * getReviewsToNextNew is a private instance method of srf-scheduler.
 *
 * It must be called so that `this` is set to the srf-scheduler instance
 * object.
 *
 * Configuration parameters:
 *   config.targetStudyTime
 *   config.maxNewCardsPerDay
 *
 * getReviewsToNextNew returns the number of reviews to be completed before
 * the next new card is shown.
 */
'use strict';

const getAverageStudyTime = require('./getAverageStudyTime.js');
const getAverageNewCardsPerDay = require('./getAverageNewCardsPerDay.js');
const getCardsToReview = require('./getCardsToReview.js');

module.exports = function getReviewsToNextNew () {
  const error =
    (getAverageStudyTime.call(this) / this.config.targetStudyTime) - 1;

  const newCardsPerDay = Math.max(
    1,
    getAverageNewCardsPerDay.call(this)
  );

  return Math.floor(
    getCardsToReview.call(this, 60 * 60 * 24) / newCardsPerDay *
    Math.max(
      0,
      1 + error * this.config.studyTimeErrorSensitivity
    )
  );
};
