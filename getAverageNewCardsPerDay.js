'use strict';

module.exports = function getAverageNewCardsPerDay (days = 14) {
  const self = this;

  return self.db.prepare(`
    select avg(n) as avg
    from (
      select count(case when lastinterval = 0 then 1 end) as n
      from revlog
      group by revdate
      order by revdate desc
      limit ?
    )
  `)
  .get(days).avg || 0;
};
