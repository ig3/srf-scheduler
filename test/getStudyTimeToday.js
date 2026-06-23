'use strict';

const t = require('@ig3/test');

t.test('getStudyTimeToday', t => {
  t.test('No reviews', t => {
    const setup = setup1();
    const result = require('../getStudyTimeToday.js').call(setup);
    t.equal(result, 0, 'No reviews');
    t.end();
  });

  t.test('Some reviews yesterday', t => {
    const setup = setup2();
    const result = require('../getStudyTimeToday.js').call(setup);
    t.equal(result, 0, 'No reviews');
    t.end();
  });

  t.test('Some reviews today', t => {
    const setup = setup3();
    const result = require('../getStudyTimeToday.js').call(setup);
    t.equal(result, 50, 'No reviews');
    t.end();
  });

  t.end();
});

function formatLocalDate (date) {
  const format = (n) => (n < 10 ? '0' : '') + n;
  return date.getFullYear() +
    '-' + format(date.getMonth() + 1) +
    '-' + format(date.getDate());
}

function dateDaysAgo (n) {
  const d = new Date();

  d.setDate(d.getDate() - n);

  return formatLocalDate(d);
}

// Return seconds since the epoch
// eslint-disable-next-line
function now () {
  return Math.floor(Date.now() / 1000);
}

// Empty DB - no new cards and no due cards and no review logs

function setup1 () {
  const db = require('better-sqlite3')();

  db.prepare(`
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

  return {
    db: db,
  };
}

function setup2 () {
  const db = require('better-sqlite3')();

  db.prepare(`
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

  db.prepare(`
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
      (@ts - 60 * 60 * 24 * 1000 - 4, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (@ts - 60 * 60 * 24 * 1000 - 3, @date, 2, 'good', 60 * 5, 0, 1.8, 10, 10),
      (@ts - 60 * 60 * 24 * 1000 - 2, @date, 3, 'good', 60 * 5, 0, 1.8, 10, 10),
      (@ts - 60 * 60 * 24 * 1000 - 1, @date, 4, 'good', 60 * 5, 0, 1.8, 10, 10)
  `).run({
    ts: Date.now(),
    date: dateDaysAgo(1),
  });

  return {
    db: db,
  };
}

function setup3 () {
  const db = require('better-sqlite3')();

  db.prepare(`
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

  db.prepare(`
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
      (@ts - 81, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (@ts - 71, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (@ts - 61, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (@ts - 51, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10),
      (@ts - 1, @date, 1, 'good', 60 * 5, 0, 1.8, 10, 10)
  `).run({
    ts: Date.now(),
    date: dateDaysAgo(0),
  });

  return {
    db: db,
  };
}
