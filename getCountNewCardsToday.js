'use strict';
// Returns the number of new cards studied since the start of the current
// calendar day.
module.exports = function getCountNewCardsToday () {
  const startOfDay = Math.floor(new Date().setHours(0, 0, 0, 0).valueOf());
  const newCards = this.db.prepare(`
    select count(case when lastinterval = 0 then 1 end) as n
    from revlog
    where id > ?
  `)
  .get(startOfDay).n;

  return newCards;
};
