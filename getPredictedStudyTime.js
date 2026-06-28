'use strict';
// Returns the predicted study time in the next 24 hours
// Based on cards due, average new cards per day and average study time per
// card.
module.exports = function getPredictedStudyTime () {
  return Math.min(
    86400,
    Math.round(
      (this.getCardsDue(86400) + this.getAverageNewCardsPerDay()) *
        this.getAverageStudyTimePerCard()
    )
  );
};
