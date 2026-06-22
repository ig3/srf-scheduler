'use strict';

module.exports = function getNextCard (overrideLimits = false) {
  const self = this;

  const newCardMode = overrideLimits ? 'go' : self.getNewCardMode();
  const dueCard = self.getNextDue();
  const newCard = self.getNextNew();

  if (newCardMode !== 'stop') {
    if (self.reviewsToNextNew === 0) {
      return newCard || dueCard;
    }
    if (newCardMode === 'go') {
      return dueCard || newCard;
    }
  }
  return dueCard;
};
