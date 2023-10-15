'use strict';

module.exports = function deferRelated (card, due) {
  const self = this;

  if (
    !card ||
    !card.id ||
    !card.fieldsetid ||
    !due
  ) {
    return;
  }

  self.db.prepare(`
    update card
    set due = ?
    where
      fieldsetid = ? and
      id != ? and
      interval != 0 and
      due < ?
  `)
  .run(
    due,
    card.fieldsetid,
    card.id,
    due
  );
};
