'use strict';

const t = require('tape');
const formatLocalDate = require('../formatLocalDate.js');

t.test('timeForNewCard', t => {
  // eslint-disable-next-line
  const timeForNewCard = require('../timeForNewCard.js');

  const result1 = timeForNewCard.call(setup1());
  t.equal(result1, true, 'Initially, it is time for a new card');

  const result2 = timeForNewCard.call(setup2());
  t.equal(result2, false, 'No reviews since last new card');

  const result3 = timeForNewCard.call(setup3());
  t.equal(result3, true, 'study gaps are ignored');

  t.end();
});

function setup1 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    newCardRateFactor: 0.8,
    targetStudyTime: 60 * 30,
    maxNewCardsPerDay: 20,
    minTimeBetweenRelatedCards: 60 * 30
  };

  self.reviewsSinceLastNewCard = 0;

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
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();

  return self;
}

function setup2 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    newCardRateFactor: 0.8,
    targetStudyTime: 60 * 30,
    maxNewCardsPerDay: 20,
    minTimeBetweenRelatedCards: 60 * 30
  };

  self.reviewsSinceLastNewCard = 0;

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
      ( 1, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 1, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 3, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 3, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 4, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 4, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 5, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 5, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 6, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 6, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 7, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 7, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 8, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 8, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 9, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 9, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 10, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 10, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 11, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 11, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 12, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 12, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 13, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 13, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 14, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 14, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 15, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 15, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 16, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 16, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0)
  `).run();

  self.db.prepare(`
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();

  const date = new Date();
  const d3 = formatLocalDate(date);
  date.setDate(date.getDate() - 1);
  const d2 = formatLocalDate(date);
  date.setDate(date.getDate() - 1);
  const d1 = formatLocalDate(date);

  self.db.prepare(`
    insert into revlog (
      id,
      revdate,
      cardid,
      ease,
      interval,
      lastinterval,
      factor,
      viewtime,
      studytime,
      lapses
    ) values
      (@ts - 5010, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5009, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 600, 0),
      (@ts - 5008, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5007, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5006, @d2, 1, 'good', 60 * 5, 500, 1.8, 10, 600, 0),
      (@ts - 5005, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5004, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 600, 0),
      (@ts - 5003, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5002, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0)
  `).run({
    ts: Date.now(),
    d1: d1,
    d2: d2,
    d3: d3
  });

  return self;
}

function setup3 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    newCardRateFactor: 0.8,
    targetStudyTime: 60 * 30,
    maxNewCardsPerDay: 20,
    minTimeBetweenRelatedCards: 60 * 30
  };

  self.reviewsSinceLastNewCard = 8;

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
      ( 1, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 1, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 3, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 3, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 4, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 4, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 5, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 5, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 6, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 6, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 7, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 7, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 8, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 8, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 9, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 9, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 10, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 10, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 11, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 11, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 12, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 12, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 13, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 13, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 14, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 14, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 15, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 15, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 16, 1, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 16, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0)
  `).run();

  self.db.prepare(`
    create table revlog (
      id integer primary key,
      revdate text not null,
      cardid integar not null,
      ease text not null,
      interval integer not null,
      lastinterval integer not null,
      factor real not null,
      viewtime integer not null,
      studytime integer not null,
      lapses integer not null
    )
  `).run();

  const date = new Date();
  const d3 = formatLocalDate(date);
  date.setDate(date.getDate() - 1);
  const d2 = formatLocalDate(date);
  date.setDate(date.getDate() - 1);
  const d1 = formatLocalDate(date);

  self.db.prepare(`
    insert into revlog (
      id,
      revdate,
      cardid,
      ease,
      interval,
      lastinterval,
      factor,
      viewtime,
      studytime,
      lapses
    ) values
      (@ts - 5010, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5009, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 600, 0),
      (@ts - 5008, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5007, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5006, @d2, 1, 'good', 60 * 5, 500, 1.8, 10, 600, 0),
      (@ts - 5005, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5004, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 600, 0),
      (@ts - 5003, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 600, 0),
      (@ts - 5002, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0)
  `).run({
    ts: Date.now(),
    d1: d1,
    d2: d2,
    d3: d3
  });

  return self;
}
