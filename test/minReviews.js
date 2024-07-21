'use strict';

const t = require('@ig3/test');
const formatLocalDate = require('../formatLocalDate.js');

t.test('minReviews', t => {
  const minReviews = require('../minReviews.js');

  const result1 = minReviews.call(setup1());
  t.equal(result1, 0, 'Initially, it is 0');

  const result2 = minReviews.call(setup2());
  t.equal(result2, 6, 'With some reviewes');

  const result3 = minReviews.call(setup3());
  t.equal(result3, 6, 'study gaps are ignored');

  const result4 = minReviews.call(setup4());
  t.equal(result4, 2, '0 new cards per day');
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
    minTimeBetweenRelatedCards: 60 * 30,
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
    minTimeBetweenRelatedCards: 60 * 30,
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
    d3: d3,
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
    minTimeBetweenRelatedCards: 60 * 30,
  };

  self.reviewsSinceLastNewCard = 2;

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
    d3: d3,
  });

  return self;
}

function setup4 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    newCardRateFactor: 0.8,
    targetStudyTime: 60 * 30,
    maxNewCardsPerDay: 20,
    minTimeBetweenRelatedCards: 60 * 30,
  };

  self.reviewsSinceLastNewCard = 2;

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
      ( 17, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 18, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 19, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 20, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 21, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 22, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 23, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 24, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 25, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 26, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 27, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 28, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 29, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 30, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 31, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 32, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 33, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 34, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 35, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 36, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 37, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 38, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 39, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 40, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 41, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 42, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 43, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 44, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 45, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 46, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 47, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 48, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 49, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 50, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 51, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 52, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 53, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 54, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 55, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0),
      ( 56, 2, UNIXEPOCH(), 5, 0, UNIXEPOCH()+10, 2, 0, 0, 0)
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
      (@ts - 5010, @d1, 1, 'good', 60 * 5, 50, 1.8, 10, 600, 0),
      (@ts - 5009, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 600, 0),
      (@ts - 5008, @d1, 1, 'good', 60 * 5, 50, 1.8, 10, 600, 0),
      (@ts - 5007, @d2, 1, 'good', 60 * 5, 50, 1.8, 10, 600, 0),
      (@ts - 5006, @d2, 1, 'good', 60 * 5, 500, 1.8, 10, 600, 0),
      (@ts - 5005, @d2, 1, 'good', 60 * 5, 50, 1.8, 10, 600, 0),
      (@ts - 5004, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 600, 0),
      (@ts - 5003, @d2, 1, 'good', 60 * 5, 50, 1.8, 10, 600, 0),
      (@ts - 5002, @d3, 1, 'good', 60 * 5, 50, 1.8, 10, 10, 0)
  `).run({
    ts: Date.now(),
    d1: d1,
    d2: d2,
    d3: d3,
  });

  return self;
}
