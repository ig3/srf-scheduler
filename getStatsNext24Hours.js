'use strict';

module.exports = function getStatsNext24Hours () {
  const cardsDue = this.getCardsDue(86400);
  const cards = Math.round(cardsDue + this.getAverageNewCardsPerDay());

  return ({
    count: cards,
    cardsDue: cardsDue,
    time: this.getPredictedStudyTime(),
    minReviews: this.getReviewsToNextNew(),
    reviewsToNextNew: this.reviewsToNextNew,
  });
};
