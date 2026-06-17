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

const getAverageStudyTimePerDay = require('./getAverageStudyTimePerDay.js');
const getAverageNewCardsPerDay = require('./getAverageNewCardsPerDay.js');
const getAverageReviewsPerDay = require('./getAverageReviewsPerDay.js');

module.exports = function getReviewsToNextNew () {
  const error =
    (getAverageStudyTimePerDay.call(this) / this.config.targetStudyTime) - 1;

  const newCardsPerDay = Math.max(
    1,
    getAverageNewCardsPerDay.call(this)
  );

  const reviewsPerDay = getAverageReviewsPerDay.call(this);

  return Math.max(
    1,
    Math.floor(
      reviewsPerDay / newCardsPerDay * (
        1 + error * this.config.studyTimeErrorSensitivity
      )
    )
  );
};
