'use strict';

module.exports = function getStatsNext24Hours () {
  const cardsDue = this.getCardsDue(86400);
  const cards = Math.round(cardsDue + this.getAverageNewCardsPerDay());
  const timePerCard = this.getAverageStudyTimePerCard();

  return ({
    count: cards,
    cardsDue: cardsDue,
    time: Math.min(86400, Math.round(cards * timePerCard)),
    minReviews: this.getReviewsToNextNew(),
    reviewsToNextNew: this.reviewsToNextNew,
  });
};
