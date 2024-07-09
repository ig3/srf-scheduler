'use strict';

const t = require('tape');

t.test('adjustCards', t => {
  const adjustCards = require('../adjustCards.js');
  adjustCards.call(setup1());
  const s2 = setup2();
  const before = s2.db.prepare(`
    select * from card
    limit 1
  `).get();
  adjustCards.call(s2);
  const after = s2.db.prepare(`
    select * from card
    limit 1
  `).get();
  t.ok(after.due < before.due, 'due is reduced');
  t.ok(after.interval < before.interval, 'interval is reduced');
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
    learningThreshold: 60 * 60 * 24 * 7,
    matureThreshold: 60 * 60 * 24 * 21,
    maxInterval: 60 * 60 * 24 * 365,
    minPercentCorrectCount: 10,
    percentCorrectTarget: 90,
    percentCorrectSensitivity: 0.0001,
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
      ( 1, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 1, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
      ( 2, 2, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0)
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
      (@ts - 5010, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5009, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5008, '2023-10-16', 1, 'fail', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5007, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5006, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5005, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5004, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5003, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5002, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5001, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0),
      (@ts - 5000, '2023-10-16', 1, 'good', 60 * 5, @interval, 1.8, 10, 10, 0)
  `).run({
    ts: Date.now(),
    interval: 60 * 60 * 24 * 21 + 1,
  });

  return self;
}
