/**
 * getReviewsToNextNew is a private instance method of srf-scheduler.
 *
 * It must be called so that `this` is set to the srf-scheduler instance
 * object.
 *
 * Configuration parameters:
 *   config.studyTimeTarget
 *   config.studyTimeErrorSensitivity
 *
 * getReviewsToNextNew returns the number of reviews to be completed before
 * the next new card is shown, when new card mode is `slow`.
 *
 * Actual reviews will usually be more than the number returned by
 * getCardsToRevew() because this does not include multiple reviews of
 * cards with short intervals or new cards. This results in a lower number
 * of reviews between new cards than required to space them out throughout
 * the entire day of study.
 */
'use strict';

module.exports = function getReviewsToNextNew () {
  const studyTime = Math.max(
    this.getAverageStudyTimePerDay(),
    this.getStudyTimeToday()
  );
  const error = this.config.studyTimeErrorSensitivity * (
    (studyTime - this.config.studyTimeTarget) /
      this.config.studyTimeTarget
  );

  return Math.max(
    (this.getCardsDue(0) ? 1 : 0),
    Math.floor(
      (1 + error) *
      this.getCardsDue(86400) * this.getAverageReviewsPerCard() /
      (1 + this.getAverageNewCardsPerDay())
    )
  );
};
