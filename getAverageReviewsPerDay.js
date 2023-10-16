'use strict';

module.exports = function getAverageReviewsPerDay (days = 14) {
  const self = this;
  return self.db.prepare(`
    select avg(n) as avg
    from (
      select count() as n
      from revlog
      where revdate != (select max(revdate) from revlog)
      group by revdate
      order by revdate desc
      limit ?
    )
  `)
  .get(days).avg || 0;
};
