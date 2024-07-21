'use strict';

const t = require('@ig3/test');
const formatLocalDate = require('../formatLocalDate.js');

t.test('getAverageStudyTime', t => {
  const getAverageStudyTime = require('../getAverageStudyTime.js');

  const result1 = getAverageStudyTime.call(setup1());
  t.equal(result1, 0, '0 if no revlog entries');

  const result2 = getAverageStudyTime.call(setup2());
  t.equal(result2, 40, 'average 4 with some logs');

  const result3 = getAverageStudyTime.call(setup3());
  t.equal(result3, 40, 'study gaps are ignored');

  const result4 = getAverageStudyTime.call(setup3(), 1);
  t.equal(result4, 50, 'reviews older than days are ignored');
  t.end();
});

function setup1 () {
  const self = {};

  self.config = {
    percentCorrectWindow: 60 * 60 * 24 * 14,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
  };

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
  };

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
      (@ts - 5010, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5009, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 10, 0),
      (@ts - 5008, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5007, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5006, @d2, 1, 'good', 60 * 5, 500, 1.8, 10, 10, 0),
      (@ts - 5005, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5004, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 10, 0),
      (@ts - 5003, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
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
  };

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
  date.setDate(date.getDate() - 20);
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
      (@ts - 5010, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5009, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 10, 0),
      (@ts - 5008, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5007, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5006, @d2, 1, 'good', 60 * 5, 500, 1.8, 10, 10, 0),
      (@ts - 5005, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5004, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 10, 0),
      (@ts - 5003, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0),
      (@ts - 5002, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10, 0)
  `).run({
    ts: Date.now(),
    d1: d1,
    d2: d2,
    d3: d3,
  });

  return self;
}
