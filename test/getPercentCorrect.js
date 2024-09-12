'use strict';

const t = require('@ig3/test');

t.test('getPercentCorrect', t => {
  const getPercentCorrect = require('../getPercentCorrect.js');
  const result1 = getPercentCorrect.call(setup1());
  t.equal(result1, 0, 'no logs');
  const result2 = getPercentCorrect.call(setup2());
  t.equal(result2, 0, 'less than 10 logs');
  const result3 = getPercentCorrect.call(setup3());
  t.equal(Math.floor(result3), 72, '1 more than 10 logs');
  const result4 = getPercentCorrect.call(setup4());
  t.equal(Math.floor(result4), 72, 'ignore too small lastinterval');
  const result5 = getPercentCorrect.call(setup5());
  t.equal(Math.floor(result5), 0, 'Ignore too large lastinterval');
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
      (@ts - 5010, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5009, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5008, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5007, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5006, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5005, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5004, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5003, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5002, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10)
  `).run({
    ts: Date.now(),
    interval: 60 * 60 * 24 * 21 + 1,
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
      studytime integer not null
    )
  `).run();

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
      (@ts - 5010, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5009, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5008, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5007, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5006, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5005, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5004, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5003, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5002, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5001, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5000, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10)
  `).run({
    ts: Date.now(),
    interval: 60 * 60 * 24 * 21 + 1,
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
      (@ts - 5010, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5009, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5008, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5007, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5006, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5005, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5004, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5003, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5002, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5001, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5000, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 4999, '2023-10-16', 1, 'fail', 60 * 5, @interval-2, 1.8, 10, 10),
      (@ts - 4998, '2023-10-16', 1, 'fail', 60 * 5, @interval-2, 1.8, 10, 10),
      (@ts - 4997, '2023-10-16', 1, 'fail', 60 * 5, @interval-2, 1.8, 10, 10)
  `).run({
    ts: Date.now(),
    interval: 60 * 60 * 24 * 21 + 1,
  });

  return self;
}

function setup5 () {
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
      (@ts - 5010, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5009, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5008, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5007, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5006, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5005, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5004, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5003, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5002, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5001, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10),
      (@ts - 5000, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10)
  `).run({
    ts: Date.now(),
    interval: 60 * 60 * 24 * 365,
  });

  return self;
}
