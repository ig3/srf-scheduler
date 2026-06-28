'use strict';
// Returns the predicted study time in the next 24 hours
// Based on cards due, average new cards per day and average study time per
// card.
module.exports = function getPredictedStudyTime () {
  if (this.getPredictedStudyTimeCache !== undefined) {
    return this.getPredictedStudyTimeCache;
  }
  this.getPredictedStudyTimeCache = Math.min(
    86400,
    Math.round(
      (this.getCardsDue(86400) + this.getAverageNewCardsPerDay()) *
        this.getAverageStudyTimePerCard()
    )
  );
  setTimeout(
    () => {
      delete this.getPredictedStudyTimeCache;
    },
    50
  );
  return this.getPredictedStudyTimeCache;
};
