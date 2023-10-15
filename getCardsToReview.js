'use strict';

module.exports = function getCardsToReview (secs) {
  const self = this;
  const limit = Math.min(secs, self.config.minTimeBetweenRelatedCards);
  let cardsDue =
    self.db.prepare(`
      select count(distinct fieldsetid) as count
      from card
      where
        interval != 0 and
        due < ?
    `)
    .get(Math.floor(Date.now() / 1000) + limit).count;
  if (secs > limit) {
    cardsDue +=
      self.db.prepare(`
        select count() as count
        from card
        where
          interval != 0 and
          due > ? and
          due < ?
      `)
      .get(Math.floor(Date.now() / 1000) + limit, Math.floor(Date.now() / 1000) + secs).count;
  }
  return cardsDue;
};
