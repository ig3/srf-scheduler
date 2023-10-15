'use strict';

module.exports = function getAverageNewCardsPerDay (days = 14) {
  const self = this;

  // Exclude the current date because it will be incomplete so will
  // underestimate the number of new cards for the full day.
  return self.db.prepare(`
    select avg(n) as avg
    from (
      select count(case when lastinterval = 0 then 1 end) as n
      from revlog
      where revdate != (select max(revdate) from revlog)
      group by revdate
      order by revdate desc
      limit ?
    )
  `)
  .get(days).avg || 0;
};
