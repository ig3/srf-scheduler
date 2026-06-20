'use strict';

// This returns the number of unique cards that are due before the
// specified seconds from now.
//
// This is not the number of reviews that will occur if cards are reviewed
// promptly when due. Several factors contribute to this difference:
//
// Cards with short intervals will be reviewed multiple times within the
// window, increasing the number of reviews.
//
// Cards from the same templateset interfere with each other, reducing the
// number of reviews.
//
// New cards, increasing the number of reviews.
//
module.exports = function getCardsDue (secs) {
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
