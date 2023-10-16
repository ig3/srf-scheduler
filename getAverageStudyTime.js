'use strict';

module.exports = function getAverageStudyTime (days = 14) {
  const self = this;
  return self.db.prepare(`
    select avg(n) as avg
    from (
      select sum(studytime) as n
      from revlog
      where revdate != (select max(revdate) from revlog)
      group by revdate
      order by revdate desc
      limit ?
    )
  `)
  .get(days).avg || 0;
};
