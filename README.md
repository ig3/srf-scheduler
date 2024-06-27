# @ig3/srf-scheduler

This is the default scheduler for
[srf](https://www.npmjs.com/package/@ig3/srf) - spaced repetition
flashcards.

It's primary functions are:
 * selecting a card for review
 * re-scheduling a card after review

It controls two aspects of study:
 * average study time per day
 * percentage of cards successfully recalled

## installation

```
$ npm install @ig3/srf-scheduler
```

If you install [srf](https://www.npmjs.com/package/@ig3/srf), this
scheduler will be installed as one of its dependencies. There should be no
need to install this independently.

## Algorithms

### new cards

Average study time per day is controlled by adjusting the presentation of
new cards. New cards are usually presented interleaved with review cards.
If average study time is very low, they may be presented without
intervening review cards. If average study time is high, new cards will not
be presented.

New cards are presented if:
 * average study time < configured target study time;
 * new cards in the past 24 hours < configured max new cards per day; and
 * there are no overdue cards

If average study time is less than configured minimum study time, then new
cards are presented if there are no cards due, until the daily limit on new
cards is reached.

For these controls, average study time is determined from:
 * actual study time in the past 24 hours
 * predicted study time in the next 24 hours
 * actual average study time in the past 14 days of study

The number of reviews between new cards is adjusted according to the ratio
of average study time to target study time per day, the number of cards due
in the next 24 hours and the recent average number of new cards per day.

For this control, average study time is the actual average study time over
the previous 14 days of study. This excludes the current day and days on
which no reviews were done.

### review card selection

Every card that has been viewed has a time when it is scheduled to be
reviewed.

If there is more than one card past its scheduled review time, then one of
two algorithms is used to select the next card for review:
 * shortest interval first
 * earliest due first

The algorithm is selected randomly, with probability of the earliest due
cards being selected first determined by configuration parameter
probabilityOldestDue.

For both algorithms, the first five cards are determined and one of these
is selected at random. 

### interval adjustments

Interval is the interval between card reviews. The interval of a card is
updated each time it is reviewed, according to its 'ease' (Fail, Hard,
Good or Easy). Interval (and due date) are also adjusted after any card
with an interval greater than learningThreshold is reviewed, according to
the difference between 'percent correct' and percentCorrectTarget.

#### Fail

If the ease of a review is Fail, then the new interval is the previous
interval multiplied by failFactor, with an upper bound of
failLearningMaxInterval if the previous interval was less than
learningThreshold or failMaxInterval otherwise.

#### Hard

If the ease of a review is Hard, then the new interval is the previous
interval multiplied by hardFactor, with an upper bound of
hardLearningMaxInterval if the previous interval was less than
learningThreshold or hardMaxInterval otherwise.

#### Good

If the ease of a review is Good, then the new interval is the greater of
 * goodMinInterval
 * actual time since last review multiplied by goodMinFactor
 * actual time since last review multiplied by the product of goodFactor
   and the card factor

The new interval is limited to the lesser of maxInterval or
maxGoodInterval.

The card factor is the exponentially weighted moving average of ease
weights, with a decay factor of decayFactor and ease weights of weightFail,
weightHard, weightGood and weightEasy. This reflects how easy or difficult
the card has been recently.

Time since last review is used to calculate the new interval, rather than
the previously scheduled interval. This will typically be longer than the
previously sechedule interval because it is unlikely that the card will be
reviewed as soon as it is due.

This makes most difference for learning cards or in the case of a backlog.

For learning cards, assuming one is not studying all day, there will be
breaks in study. If a card has an interval of one hour but one does not
study again until the next day, then the scheduled interval is one hour but
the actual time since last review might be closer to 24 hours. If the card
remains good after 24 hours, despite being scheduled for review in one
hour, then the longer, actual interval is indicative of ability to recall
the card.

In the case of a backlog, a card might not be reviewed until long after it
was scheduled for review. Again, the longer actual interval is more
indicative of ability to recall the card.

#### Easy

If the ease of a review is Easy, then the new interval is the actual interval
(i.e. time since the last review, rather than the interval scheduled at the
last review) multiplied by the easyFactor and the card factor, with a
minimum of easyMinInterval and maximum of the lower of maxEasyInterval and
maxInteral.

### Percent Correct

Whenever a card is reviewed with a new interval greater than
learningThreshold, then the intervals and due dates of all cards with
interval between learningThreshold and maxInterval are adjusted according
to the difference between 'percent correct' and percentCorrectTarget,
multiplied by percentCorrectSensitivity.


## Configuration

The scheduler is configured by the following configuration parameters.

### config.decayFactor

decayFactor determines the exponential decay of ease weight to determine
the card ease factor. The resulting card ease factor is one of the factors
that contributes the overall factor by which interval is increased for Good
and Easy responses.

### config.easyFactor

The interval for an Easy response is the interval for a Good response
multiplied by easyFactor.

### config.easyMinInterval

easyMinInterval is the minimum interval after an Easy response.

### config.failFactor

failFactor is the factor by which interval is multiplied after a Fail
response.

### config.failLearningMaxInterval

failLearningMaxInterval is the maximum interval after a Fail response for a
card with interval less than learningThreshold.

### config.failMaxInterval

failMaxInterval is the maximum interval after a Fail response.

### config.goodFactor

After a Good response, the interval is multiplied by goodFactor and the
card ease factor. The product of these is the overal factor by which
interval is multiplied.

### config.goodMinFactor

goodMinFactor is the minimum factor by which interval is multiplied after a
Good response. 

### config.goodMinInterval

goodMinInterval is the minimum interval after a Good response.

### config.hardFactor

hardFactor is the factor by which interval is multiplied after a Hard
response.

### config.hardLearningMaxInterval

hardLearningMaxInterval is the maximum interval after a Hard response for a
card with interval less than learningThreshold.

### config.hardMaxInterval

hardMaxInterval is the maximum interval after a Hard response.

### config.learningThreshold

learningThreshold is the threshold between cards being treated as 'new' and
'learning' cards.

Card intervals and due dates are modified periodically if their interval is
between learningThreshold and maxInterval.

### config.matureThreshold

matureThreshold is the threshold between cards being treaded as 'learning'
and 'mature' cards.

### config.maxEasyInterval

maxEasyInterval is an upper bound on interval after an Easy response.

### config.maxGoodInterval

maxGoodInterval is an upper bound on interval after a Good response.

### config.maxInterval

maxInterval is an upper bound on interval after a Good or Easy response.

### config.maxNewCardsPerDay

maxNewCardsPerDay is the maximum number of new cards which may be presented
in a 24 hour period.

### config.maxViewTime

maxViewTime is an upper bound on view time recorded in revlog. It doesn't
have anything to do with the scheduler. It is here for historic reasons,
pending refactoring the processing of card reviews.

### config.minPercentCorrectCount

minPercentCorrectCount is the minimum number of reviews of mature cards in
the percentCorrectWindow in order that 'percent correct' is calculated. The
'percent correct' is a factor in adjusting the intervals and due dates of
cards.

### config.minStudyTime

minStudyTime is the minimum study time in a 24 hour period below which new
cards will be presented in preference to due cards. 

### config.minTimeBetweenRelatedCards

Related cards are cares generated from the same field set.
minTimeBetweenRelatedCards is the minimum time between reviews of related
cards.

### config.percentCorrectSensitivity

percentCorrectSensitivity is a factor that determines the sensitivity to
the difference between 'percent correct' and percentCorrectTarget. It
determines how much the intervals and due dates of cards are modified when
adjusted for percent correct.

### config.percentCorrectTarget

percentCorrectTarget is the target for 'percent correct'. Below this,
intervals are reduced and due dates moved closer. Above this, intervals are
increased and due dates moved further away.

### config.percentCorrectWindow

percnetCorrectWindow is the window over which 'percent correct' is
calculated. Reviews longer ago than this do not contribute.

### config.probabilityOldestDue

probabilityOldestDue is the probability the scheduler will select cards
according to due date rather than interval.

### config.targetStudyTime

targetStudyTime is an upper bound on study time in a 24 hour period above
which new cards will not be presented.

### config.weightEasy

weightEasy is the weight of an Easy response in calculating the card ease
factor by a process of moving average exponential decay.

### config.weightFail

weightFail is the weight of a Fail response in calculating the card ease
factor by a process of moving average exponential decay.

### config.weightGood

weightGood is the weight of a Good response in calculating the card ease
factor by a process of moving average exponential decay.

### config.weightHard

weightHard is the weight of an Hard response in calculating the card ease
factor by a process of moving average exponential decay.

## API

### getCountCardsDueToday

Returns the number of cards to be reviewed between now and the end of the
current day in localtime, excluding deferred cards.

### getIntervals(card)

Returns an object with the new interval for each possible ease for the
given card.

### getNewCardMode()

Returns 'go', 'slow' or 'stop'.

Go if new cards will be presented when there are no cards due.

Slow if new cards will be presented, interleaved with due cards but not if
there are no cards due.

Stop if new cards will not be presented.

### getNextCard(overrideLimits)

Returns the next card to be studied or undefined.

If overrideLimits is true then getNextCard returns the next due card if
there is a card due, otherwise the next new card.

Otherwise, getNextCard returns the next new card if:
 * average study time in the past and next 24 hours is less than
   config.targetStudyTime; and
 * total new cards studied in the past 24 hours is less than
   config.maxNewCardsPerDay; and
 * there are no overdue cards; and
 * sufficient due cards have been reviewed since the last new card or there
   is no due card and average study time is less than
   config.minStudyTime

Otherwise, getNextCard returns the next due card if there is a card due.

Otherwise, getNextCard returns undefined.

### getNextDue(overrideLimits)

getNextDueCard returns a card if one is due, otherwise undefined.

If overrideLimits is true then getNextDueCard one of the five cards with
the earliest due dates, selected ramdomly, regardless of whether they are
due before or after the current time.

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

Count is the number of cards due within the next 24 hours, excluding
deferred cards (multiple cards from the same fieldset due within
minTimeBetweenRelatedCards) and including recent average number of new
cards per day.

Time is an estimate of the time to review all these cards, based on recent
performance.

### getTimeNextDue

Returns the time (seconds since the epoch) when the card with the earliest
due time is due. This may be in the past or in the future, depending on
current backlog.

### review(card, viewTime, studyTime, ease)

Updates the given card, setting new interval and due, according to ease and
creates a revlog record recording the review of the card.

The new interval and due are calculated according to the ease.

## Changes

### 1.0.1 - 20231007
 * README updates
 * Default config parameters relevant to the scheduler
 * Fix error in intervalEasy
 * Fix typo in getNextNew

### 1.0.2 - 20231008
 * Fix getStatsNext24Hours

### 1.1.0 - 20231011
 * Simplify and improve getAverageStudyTimePerNewCard and
   getAverageStudyTimePerOldCard
 * Refactor calculation of stats for next 24 hours
 * Improve getStatsNext24Hours - better estimates, including new cards
 * Add API method: getNewCardMode
 * refactor getNextCard to use getNewCardMode
 * Fix calculation of average new cards per day
 * Exclude current date from estimate of time per card and new cards per day
 * Refactor getNextCard and change new card interval

### 1.1.1 - 20231013
 * Adjust time between new cards according to average study time

### 1.1.2 - 20231014
 * Fix typo

### 1.1.3 - 20231014
 * Fix call to getAverageStudyTime

### 1.1.4 - 20231014
 * Add some tests - not very good but better than nothing

### 1.2.0 - 20231016
 * Add test for formatLocalDate
 * Introduce new cards slowly if predicted study time in the next 24 hours
   is more than config.minStudyTime.

### 1.3.0 - 20231016
 * Refactor formatLocalDate
 * Refactor getPercentCorrect
 * Refactor adjustCards
 * Refactor deferRelated
 * Refactor getCardsToReview
 * Refactor getAverageNewCardsPerDay
 * Refactor getAverageReviewsPerDay
 * Refactor getAverageStudyTime
 * Refactor timeForNewCard
 * Refactor minReviews
 * Add minReviews to getStatsNext24Hours result
 * Add config.newCardRateFactor
 * Base minReviews on cards to study next 24 hours not average

### 1.3.1 - 20231017
 * Test minReviews with 0 new cards per day

### 1.3.2 - 20231030
 * Don't include average new cards in stats for next 24 hours
 * Add test for getNewCardMode
 * Fix test of getStatsNext24Hours
 * Add test for getIntervals
 * Add test for getNextDue
 * Add test for getNextNew
 * Average study time over past and next 24 hours
 * Limit range of minReviews

### 2.0.0 - 20231125
 * Average study time over longer period to determine new card mode
 * Replace reviewsSinceLastNew with reviewsToNextNew

### 2.0.1 - 20231125
 * truncate reviewsToNextNew to integer on start

### 2.0.2 - 20240210
 * revise scheduling of new cards
 * fix typoe in newCardFactor
 * handle 'NaN' as card.factor (and other such invalid values)

### 2.0.3 - 20240314
 * Fix tests to handle reviewsPerNewCard parameter
 * Change intervalEasy to use actual interval

### 2.1.0 - 20240322
 * Introduce failLearningMaxInterval and hardLearningMaxInterval
 * Base interval for Good on actual interval

### 2.1.1 - 20240521
 * Make getReviewsToNextNew a bit more aggressive
 * Get new value for minReviews with each call to getStatsNext24Hours
 * Save reviews to next new card to database at each review
 * Limit reviews per new card
 * Update dependencies

### 2.1.2 - WIP
 * Fix adjustCards to not set interval larger than maxInterval
 * Change test for reviewed cards from interval != 0 to interval > 0
 * Change test for new cards from interval = 0 to interval <= 0
 * Reduce minimum interval for Good to 2 minutes
 * Update dependencies
 * remove tape and multi-tape
