'use strict';

const t = require('tape');

t.test('formatLocalDate', t => {
  const formatLocalDate = require('../formatLocalDate.js');
  console.log('formatLocalDate: ', formatLocalDate);
  const d1 = formatLocalDate(new Date('2023-10-01T01:02:03.000Z'));
  console.log('d1: ', d1);
  t.equal(d1, '2023-10-01', 'leading zeros');
  const d2 = formatLocalDate(new Date('2023-10-11T01:02:03.000Z'));
  console.log('d2: ', d2);
  t.equal(d2, '2023-10-11', 'no leading zeros');
  t.end();
});
