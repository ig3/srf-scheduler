'use strict';
// Returns the average reviews per card per day.
// This is the average per day that a card is studied. Most cards are not
// studied every day in the window. Therefore, the average must first be
// determined on a daily basis.
module.exports = function getAverageReviewsPerCard (days = 14) {
  if (this.getAverageReviewsPerCardCache !== undefined) {
    return this.getAverageReviewsPerCardCache;
  }
  const hist = this.db.prepare(`
    select
      revdate,
      count() as reviews,
      count(distinct cardid) as cards
    from revlog
    group by revdate
    order by revdate desc
    limit ?
  `).all(days + 1);
  if (hist.length === 0) {
    this.getAverageReviewsPerCardCache = 10;
  } else {
    if (hist.length > 1) hist.shift();
    let sum = 0;
    hist.forEach(record => {
      sum += record.reviews / record.cards;
    });
    this.getAverageReviewsPerCardCache = (sum / hist.length);
  }
  setTimeout(
    () => {
      delete this.getAverageReviewsPerCardCache;
    },
    50
  );
  return this.getAverageReviewsPerCardCache;
};
