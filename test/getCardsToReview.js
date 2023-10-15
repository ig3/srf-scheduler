'use strict';

const t = require('tape');

t.test('getCardsToReview', t => {
  // eslint-disable-next-line
  const getCardsToReview = require('../getCardsToReview.js');

  const limit = 60 * 60 * 12;

  const r1 = getCardsToReview.call(setup1(), limit);
  t.equal(r1, 0, 'No records to review');

  const s2 = setup2();
  const r2 = getCardsToReview.call(s2, limit);
  t.equal(r2, 2, 'Two records to review');

  t.end();
});

function setup1 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    minTimeBetweenRelatedCards: 60 * 60
  };

  self.db = require('better-sqlite3')();

  self.db.prepare(`
    create table card (
      id integer primary key,
      fieldsetid integer not null,
      templateid integer not null,
      modified integer not null,
      interval integer not null,
      lastinterval integer not null,
      due integer not null,
      factor integer not null,
      views integer not null,
      lapses integer not null,
      ord integer not null
    )
  `).run();

  return self;
}

function setup2 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    percentCorrectTarget: 90,
    percentCorrectSensitivity: 0.0001,
    minTimeBetweenRelatedCards: 60 * 60
  };

  self.db = require('better-sqlite3')();

  self.db.prepare(`
    create table card (
      id integer primary key,
      fieldsetid integer not null,
      templateid integer not null,
      modified integer not null,
      interval integer not null,
      lastinterval integer not null,
      due integer not null,
      factor integer not null,
      views integer not null,
      lapses integer not null,
      ord integer not null
    )
  `).run();

  self.db.prepare(`
    insert into card (
      fieldsetid,
      templateid,
      modified,
      interval,
      lastinterval,
      due,
      factor,
      views,
      lapses,
      ord
    ) values
      ( 1, 1, UNIXEPOCH()-10, 60 * 60 * 24 * 7 + 1, 0, UNIXEPOCH()+5, 2, 0, 0, 0),
      ( 1, 2, UNIXEPOCH(), 500, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 1800, 500, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0)
  `).run();

  return self;
}
