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

const getWeightedAverageStudyTime = require('./getWeightedAverageStudyTime.js');
const getAverageNewCardsPerDay = require('./getAverageNewCardsPerDay.js');

module.exports = function getReviewsToNextNew () {
  const error =
    (getWeightedAverageStudyTime.call(this) / this.config.targetStudyTime) - 1;

  const newCardsPerDay = Math.max(
    1,
    getAverageNewCardsPerDay.call(this)
  );

  const timePerReview = this.db.prepare(`
    select avg(studytime) as avg
    from (
      select studytime
      from revlog
      order by id desc
      limit 1000
    )
  `)
  .get().avg || 30;

  const reviewsPerDay = this.config.targetStudyTime / timePerReview;

  return Math.max(
    1,
    Math.round(
      reviewsPerDay / newCardsPerDay * (
        1 + error * this.config.studyTimeErrorSensitivity
      )
    )
  );
};
