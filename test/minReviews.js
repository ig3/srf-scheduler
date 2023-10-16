'use strict';

const t = require('tape');
const formatLocalDate = require('../formatLocalDate.js');

t.test('minReviews', t => {
  // eslint-disable-next-line
  const minReviews = require('../minReviews.js');

  const result1 = minReviews.call(setup1());
  t.equal(result1, 0, 'Initially, it is 0');

  const result2 = minReviews.call(setup2());
  t.equal(result2, 2, 'With some reviewes');

  const result3 = minReviews.call(setup3());
  t.equal(result3, 2, 'study gaps are ignored');

  t.end();
});

function setup1 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    targetStudyTime: 60 * 30,
    maxNewCardsPerDay: 20
  };

  self.reviewsSinceLastNewCard = 0;

  self.db = require('better-sqlite3')();
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
    targetStudyTime: 60 * 30,
    maxNewCardsPerDay: 20
  };

  self.reviewsSinceLastNewCard = 0;

  self.db = require('better-sqlite3')();
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
    targetStudyTime: 60 * 30,
    maxNewCardsPerDay: 20
  };

  self.reviewsSinceLastNewCard = 2;

  self.db = require('better-sqlite3')();
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
