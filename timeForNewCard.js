'use strict';

const getAverageStudyTime = require('./getAverageStudyTime.js');
const getAverageReviewsPerDay = require('./getAverageReviewsPerDay.js');
const getAverageNewCardsPerDay = require('./getAverageNewCardsPerDay.js');

module.exports = function timeForNewCard () {
  const self = this;

  const minReviews = Math.floor(
    getAverageStudyTime.call(self) / self.config.targetStudyTime *
    getAverageReviewsPerDay.call(self) /
    (getAverageNewCardsPerDay.call(self) || self.config.maxNewCardsPerDay)
  );

  return self.reviewsSinceLastNewCard >= minReviews;
};
