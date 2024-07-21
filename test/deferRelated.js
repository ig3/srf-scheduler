'use strict';

const t = require('@ig3/test');

t.test('deferRelated', t => {
  const deferRelated = require('../deferRelated.js');
  deferRelated.call(setup1());
  const s2 = setup2();
  const before = s2.db.prepare(`
    select * from card
  `).all();
  const card = {
    id: 1,
    fieldsetid: 1,
  };
  const due = Math.floor(Date.now() / 1000) + 60 * 60;
  deferRelated.call(s2, card, due);
  const after = s2.db.prepare(`
    select * from card
  `).all();
  t.equal(after[0].due, before[0].due, 'due is not changed on card 1');
  t.equal(after[1].due, due, 'due is set on card 2');
  t.equal(after[2].due, before[2].due, 'due is not changed on card 3');
  t.equal(after[3].due, before[3].due, 'due is not changed on card 4');
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
      ( 1, 2, UNIXEPOCH(), 500, 0, UNIXEPOCH()+6, 2, 0, 0, 0),
      ( 1, 3, UNIXEPOCH(), 0, 0, 0, 2, 0, 0, 0),
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
