'use strict';

module.exports = function getCardsToReview (secs) {
  const self = this;
  return self.db.prepare(`
      select count() as count
      from card
      where
        interval > 0 and
        due < ?
    `)
  .get(Math.floor(Date.now() / 1000) + secs).count;
};
