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
new cards.

New cards are presented if:
 * average study time < configured target study time;
 * new cards in the current calendar day < `config.maxNewCardsPerDay`; and
 * there are no overdue cards

New cards are presented interleaved with review cards if there are cards
due, unless estimated study time is less than `config.minStudyTime`.

If average study time is less than `config.minStudyTime` then new cards
are presented when there are no cards due.

For these controls, average study time is determined from:
 * actual study time in the past 24 hours
 * predicted study time in the next 24 hours
 * actual average study time in the past 14 days of study

The prediction of study time in the next 24 hours is problematic.
Initially, there is no record of historic performance on which to base the
prediction. Also, actual performance varies from day to day.

The estimate of study time in the next 24 hours assumes that the
time per unique card studied will be the same in the future as in the past.
This is problematic because initially there is no history of review and the
mix of new cards and older, better known cards (and, therefore, requiring
fewer reviews and less time per day) is not typical and changes rapidly as
study progressing. The changing mix of cards makes future performance
different from historic performance. But the algorithm assumes future
performance will be the same as historic performance. This causes
inaccurate predictions, particularly in early days of study.

New cards are typically reviwed several times per day, until they are
learned well enough to be recalled correctly after periods longer than 24
hours. Older, better known cards are typically reviewed only once per day,
with intervals of one or more days between reviews.

On the first day of study, there are only new cards. On the one hand, these
cards will each be reviewed many times, thus accumulating an unusually
hight study time per card per day. On the other hand, until the day is
complete the time per card is less than it will be. Thus the average time
per card at some time on the first day of study is not a very good
predictor of the time per card in the next 24 hours.

As study progresses, the mix of cards changes and the average time per card
will tend to decrease.

During the first day of study, the only data available is for a partial day
of study. It isn't perfect, but it is all that is available, so it is used.

After the first day of study, records of the current day are excluded from
calculation: only records of complete days of study are used. This tends to
make the estimates more accurate, but the mix of cards (some new cards and
a gradually increasing percentage of older, better known cards) changes.
Initially the rate of change is high and the estimate will tend to be an
over-estimate of study time. When the mix of cards stabilizes, the estimate
will tend to be more accurate.

The number of reviews between new cards is adjusted according to the ratio
of average study time to target study time per day, the recent average time
per review, the target study time per day and the recent average number of
new cards per day.

The average study time is a linear average of actual study time per day
over tha past 7 days of study.

The average time per review is the average of the last 1000 reviews.

The average new cards per day is a linear average of new cards per day over
the past 14 days (336 hours) of study. This is a sliding window ending at
the current time, not calendar days.

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
 * recent average interval multiplied by goodMinFactor
 * recent average interval multiplied by the product of goodFactor
   and the card factor

The new interval is limited to the lesser of maxInterval or
maxGoodInterval.

The recent average interval is the average of the last
config.recentIntervalWindow intervals (default 3). For the most recent
interval, the actual interval is used rather than the scheduled interval.
The actual interval will be longer than the scheduled interval when the
card is not reviewed immediately when due.

The card factor is the exponentially weighted moving average of ease
weights, with a decay factor of decayFactor and ease weights of weightFail,
weightHard, weightGood and weightEasy. This reflects how easy or difficult
the card has been recently.


#### Easy

If the ease of a review is Easy, then the recent average interval
multiplied by the easyFactor and the card factor, with a minimum of
easyMinInterval and maximum of the lower of maxEasyInterval and maxInteral.

The recent average interval is the same as for ease Good.

### Percent Correct

This is the percentage of reviews that are not rated 'Fail'.

This is calculated with both a time window and an interval window.

The time window is config.percentCorrectWindow. Only reviews within this
window are considered.

The interval window is config.matureThreshold to config.maxInterval
(exclusive). This excludes reviews of new cards and cards at maximum
interval. The excluded cards are not the target of review difficulty
control.

If there are fewer than config.minPercentCorrectCount reviews within
these windows, then the lower bound on interval is removed.

When a card is reviewed and the new interval is greater than
config.learningThreshold, then the intervals and due dates of all cards with
interval between learningThreshold and maxInterval are adjusted according
to the difference between 'percent correct' and config.percentCorrectTarget,
multiplied by percentCorrectSensitivity. This adjustment makes reviews
sooner or later, to achieve the target percent correct.

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
in a local time calendar day.

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
 * total new cards studied in the current calendar day is less than
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
minTimeBetweenRelatedCards).

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

### 2.1.2 - 20240814
 * Fix adjustCards to not set interval larger than maxInterval
 * Change test for reviewed cards from interval != 0 to interval > 0
 * Change test for new cards from interval = 0 to interval <= 0
 * Reduce minimum interval for Good to 2 minutes
 * Update dependencies
 * Replace tape with @ig3/test

### 2.1.3 - 20240912
 * Remove lapses
 * Simplify adjustCards
 * Handle the case that no configuration is provided
 * increase maximum intervals for failed and hard reviews

### 2.1.4 - 20241206
 * Change good and easy intervals to be based on longest recent interval
 * Reduce window for average study time.
 * Update dependencies

### 2.2.0 - 20260602
 * Reduce percentCorrectSensitivity
 * Fix getCardsToReview
 * Reduce goodMinInterval
 * Fix default maxGoodInterval
 * Use a weighted average for study time
 * Randomize due date to disperse clusters of cards
 * Add latency, backlog and overdue to dailystats
 * Don't exclude current day from average new cards per day
 * Calculate percent correct across all reviews if insufficient reviews
   in the interval window
 * Minimum 1 review per new card
 * Increase maxNewCardsPerDay to 50
 * Fix estimate of study time per card in getStatsNext24Hours
 * Allow new cards after 23 hours to avoid perpetual shift to later
 * Fix getAverageNewCardsPerDay
 * Remove obsolete minReviews
 * Fix getWeightedAverageStudyTime
 * Change git repository to https://codeberg.org/ig3/srf-scheduler.git

### 2.2.1 - WIP
 * Increase default maxNewCardsPerDay to 100
 * Change getReviewsToNextNew
 * Include average new cards per day in estimate of cards in next 24 hours
 * Change getAverageNewCardsPerDay
 * Fix getStatsNext24Hours
 * Fix getAverageStudyTime
 * Remove getWeightedAverageStudyTime
 * Change getNextCard to present new cards more aggressively
 * Change getAverageStudyTime to getAverageStudyTimePerDay
 * Change changes to getNewCardMode
 * Change getAverageReviewsPerDay
 * Change getNewCardMode
