'use strict';

const t = require('@ig3/test');
const formatLocalDate = require('../formatLocalDate.js');

t.test('getAverageStudyTime', t => {
  const getAverageStudyTimePerDay = require('../getAverageStudyTimePerDay.js');

  const result1 = getAverageStudyTimePerDay.call(setup1());
  t.equal(result1, 0, 'no revlog entries');

  const result2 = getAverageStudyTimePerDay.call(setup2());
  t.equal(result2, 20, 'average with some logs');

  const result4 = getAverageStudyTimePerDay.call(setup2(), 1);
  t.equal(result4, 70, 'reviews older than days are ignored');
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
      studytime integer not null
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
      studytime integer not null
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
      studytime
    ) values
      (unixepoch() * 1000 - 86400000 * 2 - 3, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 86400000 * 2 - 2, @d1, 1, 'good', 60 * 5, 30, 1.8, 10, 10),
      (unixepoch() * 1000 - 86400000 * 2 - 1, @d1, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 86400000 - 4, @d2, 1, 'good', 60 * 5, 500, 1.8, 10, 10),
      (unixepoch() * 1000 - 86400000 - 3, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 86400000 - 2, @d2, 1, 'good', 60 * 5, 1000000, 1.8, 10, 10),
      (unixepoch() * 1000 - 86400000 - 1, @d2, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 7, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 6, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 5, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 4, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 3, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 2, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (unixepoch() * 1000 - 1, @d3, 1, 'good', 60 * 5, 0, 1.8, 10, 10)
  `).run({
    ts: Date.now(),
    d1: d1,
    d2: d2,
    d3: d3,
  });

  return self;
}
