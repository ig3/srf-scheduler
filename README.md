# @ig3/srf-scheduler

This is the default scheduler for
[srf](https://www.npmjs.com/package/@ig3/srf).

## installation

```
$ npm install @ig3/srf-scheduler
```

## api

### getCountCardsDueToday

Returns the number of cards to be reviewed between now and the end of the
current day in localtime.

### getIntervals(card)

Returns an object with the new interval for each possible ease for the
given card.

### getNextCard(overrideLimits)

Returns the next card to be studied or undefined.

If overrideLimits is true then getNextCard returns the next due card if
there is a card due, otherwise the next new card.

Otherwise, getNextCard returns the next new card if:
 * total study time in the past 24 hours is less than
   config.targetStudyTime; and
 * total estimated study time in the next 24 hours is less than
   config.targetStudyTime; and
 * total new cards studied in the past 24 hours is less than
   config.maxNewCardsPerDay; and
 * there are no overdue cards; and
 * sufficient due cards have been reviewed since the last new card or there
   is no due card and total study time in the past 24 hours is less than
   config.minStudyTime

Otherwise, getNextCard returns the next due card if there is a card due.

Otherwise, getNextCard returns undefined.

### getNextDue(overrideLimits)

getNextDueCard returns a card if one is due, otherwise undefined.

If overrideLimits is true then getNextDueCard returns the card with the
earliest due date, regardless of whether this is before or after the
current time.

Otherwise, getNextDue selects a sort algorithm randomly, according to
config.probabilityOldestDue: sort by interval or sort by due.

In either case, one of the first 5 cards, according to the sort algorithm,
is selected at random.

### getNextNew

getNextnew returns a new card if one is available, otherwise undefined.

New cards (cards with interval = 0) are sorted by ord, then id.

New cards are ignored if a card from the same fieldset is due within
config.minTimeBetweenRelatedCards or if a card from the same fieldset has
been reviewed within config.minTimeBetweenRelatedCards.

### getStatsNext24Hours

Returns an object with properties:
 * count
 * time

Where count is the number of cards due in the next 24 hours and time is the
estimated time (seconds) to study all the cards due in the next 24 hours.

### getTimeNextDue

Returns the time (seconds since the epoch) when the card with the earliest
due time is due.

### review(card, viewTime, studyTime, ease)

Updates the given card according to ease and creates a revlog record
recording the review of the card.

The new interval and due time for the card are calculated according to
ease.

