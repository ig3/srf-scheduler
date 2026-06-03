'use strict';

module.exports = function getAverageReviewsPerDay (days = 14) {
  const self = this;

  const hist = self.db.prepare(`
    select count() as n
    from revlog
    group by revdate
    order by revdate desc
    limit ?
  `)
  .all(days + 1);

  if (hist.length === 0) return 0;
  if (hist.length > 1) hist.shift();
  let sum = 0;
  hist.forEach(record => {
    sum += record.n;
  });
  return (sum / hist.length);
};
