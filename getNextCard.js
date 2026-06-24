'use strict';

module.exports = function getNextCard (overrideLimits = false) {
  const self = this;

  if (overrideLimits) {
    if (self.reviewsToNextNew === 0) {
      return self.getNextNew() || self.getNextDue();
    }
    return self.getNextDue() || self.getNextNew();
  }

  if (
    self.getCountNewCardsToday() < self.config.maxNewCardsPerDay &&
    self.reviewsToNextNew === 0
  ) {
    return self.getNextNew() || self.getNextDue();
  }
  return self.getNextDue();
};
