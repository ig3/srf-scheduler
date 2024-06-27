'use strict';

const t = require('node:test');
const assert = require('node:assert/strict');

t.test('formatLocalDate', t => {
  const formatLocalDate = require('../formatLocalDate.js');
  const d1 = formatLocalDate(new Date('2023-10-01T01:02:03.000Z'));
  assert.equal(d1, '2023-10-01', 'leading zeros');
  const d2 = formatLocalDate(new Date('2023-10-11T01:02:03.000Z'));
  assert.equal(d2, '2023-10-11', 'no leading zeros');
});
