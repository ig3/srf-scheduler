'use strict';
// Returns the number of new cards studied in the specified number of
// hours (default: 20).
module.exports = function getCountNewCards (hours = 20) {
  const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0).valueOf());
  const newCards = this.db.prepare(`
    select count(case when lastinterval = 0 then 1 end) as n
    from revlog
    where id > ?
  `)
  .get(startOfDay).n;

  return newCards;
};
