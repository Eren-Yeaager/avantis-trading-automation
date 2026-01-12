# Pyth Lazer Integration - Test Cases

**Goal:** Faster execution + correctness across all order types

---

## 📋 Test Case Index

1. [Market Orders](#1-market-orders)
2. [Limit Orders](#2-limit-orders)
3. [TP/SL Triggers](#3-tpsl-triggers-high-priority)
4. [Liquidations](#4-liquidations)
5. [Fast Price Movement](#5-fast-price-movement)
6. [Load / Burst Scenarios](#6-load--burst-scenarios)

---

## 1️⃣ Market Orders

### TC-MO-001: Open Market Order (Long)

**Objective:** Measure latency for opening a long market order

**Prerequisites:**
- Wallet has sufficient USDC balance
- No existing trades (or use existing trade)

**Test Steps:**
1. Check for existing trades using `getTrades()`
2. If no trades exist:
   - Record start time
   - Call `openTrade()` with parameters:
     - Asset: BTC-USD
     - Collateral: 10 USDC
     - Leverage: 10x
     - Direction: Long
   - Record end time
3. Calculate latency = end time - start time

**Expected Results:**
- ✅ Trade opens successfully (`success: true`)
- ✅ Transaction hash returned
- ✅ Trade index and pair index returned
- ✅ Latency < 30 seconds
- ✅ Latency improved vs baseline (if baseline exists)

**Validation:**
- [ ] Faster execution vs baseline
- [ ] Correct execution price (matches oracle at time of execution)
- [ ] No duplicate fills (single transaction)

**Metrics to Record:**
- Execution latency (ms)
- Transaction hash
- Trade index
- Pair index
- Execution price vs oracle price

---

### TC-MO-002: Open Market Order (Short)

**Objective:** Measure latency for opening a short market order

**Prerequisites:**
- Wallet has sufficient USDC balance
- SDK supports `is_long=False` parameter

**Test Steps:**
1. Check for existing trades
2. If no trades exist:
   - Record start time
   - Call `openTrade()` with `is_long=False`
   - Record end time
3. Calculate latency

**Expected Results:**
- ✅ Trade opens successfully
- ✅ Transaction hash returned
- ✅ Latency < 30 seconds
- ✅ Trade direction is Short

**Validation:**
- [ ] Faster execution vs baseline
- [ ] Correct execution price
- [ ] No duplicate fills

**Metrics to Record:**
- Execution latency (ms)
- Transaction hash
- Trade direction verification

**Status:** ⚠️ Pending SDK support for `is_long=False`

---

### TC-MO-003: Close Market Order

**Objective:** Measure latency for closing a market order

**Prerequisites:**
- At least one open trade exists (or open one first)

**Test Steps:**
1. Get existing trades using `getTrades()`
2. If no trades exist:
   - Open a trade first
   - Wait 2 seconds for confirmation
3. Select first trade
4. Record start time
5. Call `closeTrade()` with trade_index and pair_index
6. Record end time
7. Calculate latency

**Expected Results:**
- ✅ Trade closes successfully
- ✅ Transaction hash returned
- ✅ Latency < 30 seconds
- ✅ Trade removed from open trades list

**Validation:**
- [ ] Faster execution vs baseline
- [ ] Correct execution price
- [ ] No duplicate fills
- [ ] Trade properly closed (verify with `getTrades()`)

**Metrics to Record:**
- Execution latency (ms)
- Transaction hash
- Closing price vs oracle price

---

### TC-MO-004: Open → Close Immediately

**Objective:** Measure total latency for complete trade cycle

**Prerequisites:**
- Wallet has sufficient USDC balance

**Test Steps:**
1. Record cycle start time
2. Open trade (record open latency)
3. Wait 2 seconds for confirmation
4. Close trade (record close latency)
5. Record cycle end time
6. Calculate total latency

**Expected Results:**
- ✅ Both operations succeed
- ✅ Total latency < 60 seconds
- ✅ Open latency < 30 seconds
- ✅ Close latency < 30 seconds

**Validation:**
- [ ] Complete cycle faster than baseline
- [ ] Both operations use correct prices
- [ ] No errors in sequence

**Metrics to Record:**
- Total cycle latency (ms)
- Open latency (ms)
- Close latency (ms)
- Breakdown: Open=Xms, Close=Yms, Total=Zms

---

### TC-MO-005: High Volatility Execution

**Objective:** Verify correct execution price during high volatility

**Prerequisites:**
- Wallet has sufficient USDC balance

**Test Steps:**
1. Get current price (Price 1)
2. Open market order
3. Get price immediately after (Price 2)
4. Calculate price change percentage
5. Verify execution price matches oracle

**Expected Results:**
- ✅ Trade executes successfully
- ✅ Execution price within acceptable slippage (1%)
- ✅ Price fetched correctly during volatility
- ✅ No stale prices used

**Validation:**
- [ ] Correct execution price (within 1% of oracle)
- [ ] No duplicate fills
- [ ] Latest oracle price used (not stale)

**Metrics to Record:**
- Price before open
- Price after open
- Price change percentage
- Execution price vs oracle price
- Slippage percentage

---

## 2️⃣ Limit Orders

### TC-LO-001: Limit Order Near Price

**Objective:** Place limit order near current price and verify execution

**Prerequisites:**
- SDK supports `TradeInputOrderType.LIMIT`
- SDK supports `open_price` parameter
- Wallet has sufficient USDC balance

**Test Steps:**
1. Get current price
2. Set limit price 1% below current (for long)
3. Record start time
4. Place limit order with `open_price` set
5. Monitor for execution
6. Record execution time
7. Calculate latency

**Expected Results:**
- ✅ Limit order placed successfully
- ✅ Executes when price reaches limit
- ✅ Executes exactly once
- ✅ Execution price matches limit price

**Validation:**
- [ ] Executes exactly once
- [ ] No early execution (before price reaches limit)
- [ ] No missed execution (when price reaches limit)
- [ ] Correct execution price

**Metrics to Record:**
- Order placement latency (ms)
- Time to execution (ms)
- Execution price vs limit price
- Execution count (should be 1)

**Status:** ⚠️ Pending SDK support for limit orders

---

### TC-LO-002: Cancel Limit Order Before Execution

**Objective:** Cancel limit order before it executes

**Prerequisites:**
- SDK supports limit orders
- SDK supports `build_trade_cancel_limit_order_tx()`

**Test Steps:**
1. Place limit order at price far from current
2. Record start time
3. Cancel limit order
4. Record end time
5. Verify order does not execute
6. Calculate cancel latency

**Expected Results:**
- ✅ Limit order placed
- ✅ Cancel succeeds
- ✅ Order does not execute
- ✅ Cancel latency < 30 seconds

**Validation:**
- [ ] Cancel succeeds
- [ ] Order removed from pending orders
- [ ] Order does not execute after cancel

**Metrics to Record:**
- Cancel latency (ms)
- Order status after cancel
- Verification that order didn't execute

**Status:** ⚠️ Pending SDK support for cancel limit order

---

### TC-LO-003: Edit Limit Order Price Rapidly

**Objective:** Edit limit order price multiple times rapidly

**Prerequisites:**
- SDK supports limit orders
- SDK supports `build_trade_edit_limit_order_tx()`

**Test Steps:**
1. Place limit order
2. Edit price (Edit 1)
3. Wait 1 second
4. Edit price again (Edit 2)
5. Wait 1 second
6. Edit price again (Edit 3)
7. Verify final price is correct
8. Monitor for execution at final price

**Expected Results:**
- ✅ All edits succeed
- ✅ Final price is correct
- ✅ No race conditions
- ✅ Executes at final price (not intermediate)

**Validation:**
- [ ] Cancel/edit race handled correctly
- [ ] Final price is correct
- [ ] No execution at intermediate prices
- [ ] Executes at final price only

**Metrics to Record:**
- Edit latency for each edit (ms)
- Final price verification
- Execution price vs final limit price

**Status:** ⚠️ Pending SDK support for edit limit order

---

### TC-LO-004: Multiple Limit Orders at Same Price

**Objective:** Place multiple limit orders at same price level

**Prerequisites:**
- SDK supports limit orders
- Wallet has sufficient USDC balance

**Test Steps:**
1. Get current price
2. Set limit price (e.g., 1% below)
3. Place limit order 1
4. Place limit order 2
5. Place limit order 3
6. Monitor for execution
7. Verify all execute correctly

**Expected Results:**
- ✅ All orders placed successfully
- ✅ All orders execute when price reached
- ✅ Each order executes exactly once
- ✅ No duplicate executions

**Validation:**
- [ ] All orders execute
- [ ] Each executes exactly once
- [ ] No duplicate fills
- [ ] Correct execution prices

**Metrics to Record:**
- Number of orders placed
- Number of executions
- Execution latency for each
- Duplicate execution count (should be 0)

**Status:** ⚠️ Pending SDK support for limit orders

---

## 3️⃣ TP/SL Triggers (High Priority)

### TC-TPSL-001: TP Close to Price

**Objective:** Set TP very close to current price and verify trigger

**Prerequisites:**
- At least one open trade exists (or open one)

**Test Steps:**
1. Get existing trade (or open new one)
2. Get current price
3. Calculate TP = current price * 1.001 (0.1% above)
4. Record start time
5. Update TP using `updateTPSL()`
6. Record end time
7. Calculate update latency
8. Monitor for TP trigger (if price moves)

**Expected Results:**
- ✅ TP set successfully
- ✅ Transaction hash returned
- ✅ Update latency < 30 seconds
- ✅ TP value correct (0.1% above current)
- ✅ Trigger fires correctly when price reaches TP

**Validation:**
- [ ] Correct trigger fires
- [ ] No double execution
- [ ] Correct PnL calculation
- [ ] Single execution only

**Metrics to Record:**
- TP update latency (ms)
- TP price set
- Current price
- Trigger execution time (if triggered)
- Execution count (should be 1)

---

### TC-TPSL-002: SL Close to Price

**Objective:** Set SL very close to current price and verify trigger

**Prerequisites:**
- At least one open trade exists (or open one)

**Test Steps:**
1. Get existing trade (or open new one)
2. Get current price
3. Calculate SL = current price * 0.999 (0.1% below)
4. Record start time
5. Update SL using `updateTPSL()`
6. Record end time
7. Calculate update latency
8. Monitor for SL trigger (if price moves)

**Expected Results:**
- ✅ SL set successfully
- ✅ Transaction hash returned
- ✅ Update latency < 30 seconds
- ✅ SL value correct (0.1% below current)
- ✅ Trigger fires correctly when price reaches SL

**Validation:**
- [ ] Correct trigger fires
- [ ] No double execution
- [ ] Correct PnL calculation
- [ ] Single execution only

**Metrics to Record:**
- SL update latency (ms)
- SL price set
- Current price
- Trigger execution time (if triggered)
- Execution count (should be 1)

---

### TC-TPSL-003: Price Spike Through TP/SL

**Objective:** Verify TP/SL triggers correctly during price spike

**Prerequisites:**
- At least one open trade exists
- TP and SL set

**Test Steps:**
1. Get existing trade
2. Set TP and SL (e.g., 1% above/below)
3. Monitor price for spike
4. If price spikes through TP/SL:
   - Verify trigger fires
   - Verify single execution
   - Verify correct PnL
5. If no spike: Document test structure

**Expected Results:**
- ✅ TP/SL set correctly
- ✅ Trigger fires on price spike
- ✅ Single execution only
- ✅ Correct PnL calculation

**Validation:**
- [ ] Correct trigger fires
- [ ] No double execution
- [ ] Correct PnL
- [ ] Execution at correct price

**Metrics to Record:**
- Price spike magnitude
- Trigger execution time
- Execution price
- PnL calculation
- Execution count (should be 1)

**Note:** May require price simulation or real market conditions

---

### TC-TPSL-004: Edit TP/SL Near Trigger

**Objective:** Update TP/SL when already set and near trigger point

**Prerequisites:**
- At least one open trade exists
- TP/SL already set

**Test Steps:**
1. Get existing trade
2. Get current price
3. Set initial TP/SL (1% away)
4. Wait 2 seconds
5. Get current price again
6. Update TP/SL to be closer (0.5% away)
7. Record update latency
8. Verify new values are correct

**Expected Results:**
- ✅ Initial TP/SL set successfully
- ✅ Update succeeds
- ✅ New TP/SL values correct
- ✅ Update latency < 30 seconds
- ✅ No race conditions

**Validation:**
- [ ] Update succeeds
- [ ] New values correct
- [ ] No race conditions
- [ ] Trigger works with new values

**Metrics to Record:**
- Initial TP/SL values
- Updated TP/SL values
- Update latency (ms)
- Price at update time

---

## 4️⃣ Liquidations

### TC-LIQ-001: Liquidation at Threshold

**Objective:** Verify liquidation triggers at correct threshold

**Prerequisites:**
- High-leverage trade open (25x)
- Price movement simulation or real market

**Test Steps:**
1. Open high-leverage trade (25x, near liquidation threshold)
2. Calculate liquidation threshold
3. Simulate or wait for price to reach threshold
4. Monitor for liquidation
5. Verify liquidation executes

**Expected Results:**
- ✅ Liquidation triggers at threshold
- ✅ Single execution only
- ✅ Correct liquidation price
- ✅ No premature liquidation

**Validation:**
- [ ] No premature liquidation
- [ ] Correct liquidation price
- [ ] Single execution only
- [ ] Liquidation at correct threshold

**Metrics to Record:**
- Liquidation threshold
- Actual liquidation price
- Price difference
- Execution count (should be 1)

**Status:** ⚠️ Requires price simulation or Tenderly fork

---

### TC-LIQ-002: Brief Price Touch - No Premature Liquidation

**Objective:** Verify liquidation does not trigger on brief price touch

**Prerequisites:**
- High-leverage trade open
- Price simulation capability

**Test Steps:**
1. Open high-leverage trade
2. Price briefly touches liquidation threshold
3. Price immediately recovers
4. Verify liquidation does NOT trigger
5. Verify trade remains open

**Expected Results:**
- ✅ Price touches threshold briefly
- ✅ Price recovers
- ✅ Liquidation does NOT trigger
- ✅ Trade remains open

**Validation:**
- [ ] No premature liquidation
- [ ] Trade remains open
- [ ] Correct behavior (liquidation only on sustained breach)

**Metrics to Record:**
- Brief touch duration
- Price recovery time
- Liquidation trigger status (should be false)
- Trade status (should be open)

**Status:** ⚠️ Requires price simulation

---

### TC-LIQ-003: Add Collateral Near Liquidation

**Objective:** Deposit collateral to prevent liquidation

**Prerequisites:**
- High-leverage trade open near liquidation
- SDK supports `build_trade_margin_update_tx()` with `DEPOSIT`

**Test Steps:**
1. Open high-leverage trade
2. Verify near liquidation threshold
3. Record start time
4. Deposit additional collateral
5. Record end time
6. Verify liquidation threshold updated
7. Verify trade remains safe

**Expected Results:**
- ✅ Collateral deposited successfully
- ✅ Liquidation threshold updated
- ✅ Trade remains safe
- ✅ Deposit latency < 30 seconds

**Validation:**
- [ ] Collateral deposited
- [ ] Threshold updated correctly
- [ ] Trade safe from liquidation
- [ ] No errors

**Metrics to Record:**
- Deposit latency (ms)
- Collateral amount deposited
- New liquidation threshold
- Safety margin

**Status:** ⚠️ Pending SDK support for margin updates

---

## 5️⃣ Fast Price Movement

### TC-FPM-001: Sudden Price Jump - No False Triggers

**Objective:** Verify no false triggers during sudden price jumps

**Prerequisites:**
- Trade with TP/SL set
- Price monitoring capability

**Test Steps:**
1. Get existing trade (or open new one)
2. Set TP/SL close to current price
3. Monitor price for sudden jumps
4. Verify no false triggers on brief touches
5. Verify triggers only on sustained moves

**Expected Results:**
- ✅ TP/SL set correctly
- ✅ No false triggers on brief touches
- ✅ Triggers only on sustained moves
- ✅ Correct trigger behavior

**Validation:**
- [ ] No false triggers
- [ ] Correct trigger behavior
- [ ] Latest price used (not stale)

**Metrics to Record:**
- Price jump magnitude
- False trigger count (should be 0)
- Correct trigger count
- Price staleness check

---

### TC-FPM-002: Wick Touches Trigger Briefly

**Objective:** Verify trigger behavior when price wick briefly touches TP/SL

**Prerequisites:**
- Trade with TP/SL set
- Price data with wicks

**Test Steps:**
1. Set TP/SL at specific level
2. Monitor for wick touches (brief price touches)
3. Verify trigger behavior:
   - Triggers on wick touch (if expected)
   - Or: Does not trigger (if wick should be ignored)
4. Document expected vs actual behavior

**Expected Results:**
- ✅ Behavior matches expected
- ✅ Documented clearly
- ✅ Consistent behavior

**Validation:**
- [ ] Behavior matches specification
- [ ] Documented clearly
- [ ] Consistent across tests

**Metrics to Record:**
- Wick touch duration
- Trigger behavior
- Expected vs actual
- Consistency check

**Status:** ⚠️ Requires price simulation or real market data

---

### TC-FPM-003: Rapid Movement Around Trigger

**Objective:** Verify no stale prices used during rapid price movement

**Prerequisites:**
- Trade with TP/SL set

**Test Steps:**
1. Set TP/SL
2. Monitor price rapidly moving around trigger level
3. Sample prices multiple times (every 500ms)
4. Verify latest oracle price always used
5. Verify trigger fires at correct time

**Expected Results:**
- ✅ No stale prices used
- ✅ Latest price always used
- ✅ Correct trigger timing
- ✅ Consistent price data

**Validation:**
- [ ] No stale prices
- [ ] Latest price always used
- [ ] Correct trigger timing
- [ ] Price freshness verified

**Metrics to Record:**
- Price sample times
- Price freshness (age)
- Stale price count (should be 0)
- Trigger timing accuracy

---

## 6️⃣ Load / Burst Scenarios

### TC-LB-001: Many TP/SL Triggers at Same Price

**Objective:** Test multiple TP/SL triggers at same price level

**Prerequisites:**
- Multiple open trades (or ability to open multiple)

**Test Steps:**
1. Get existing trades (or open multiple)
2. Get current price
3. Set TP to same level for all trades
4. Measure update latency for each
5. Monitor for triggers
6. Verify all trigger correctly

**Expected Results:**
- ✅ All TP/SL updates succeed
- ✅ All triggers set to same price
- ✅ All trigger correctly when price reached
- ✅ No dropped orders

**Validation:**
- [ ] No dropped orders
- [ ] Stable execution
- [ ] All triggers fire correctly
- [ ] No conflicts

**Metrics to Record:**
- Number of trades
- Update latency for each
- Trigger execution count
- Dropped order count (should be 0)

---

### TC-LB-002: Multiple Users Trading Same Asset

**Objective:** Test concurrent trading by multiple users

**Prerequisites:**
- Multiple test accounts (EOA, 1CT, Social)
- Multiple private keys

**Test Steps:**
1. Set up multiple test accounts
2. All users trade same asset simultaneously
3. Measure latency for each user
4. Verify all trades execute
5. Verify stable execution

**Expected Results:**
- ✅ All trades execute successfully
- ✅ Stable execution
- ✅ No conflicts
- ✅ Acceptable latency for all

**Validation:**
- [ ] No dropped orders
- [ ] Stable execution
- [ ] No conflicts between users
- [ ] Consistent performance

**Metrics to Record:**
- Number of users
- Execution latency per user
- Failed transaction count
- Conflict count (should be 0)

**Status:** ⚠️ Requires multiple test accounts

---

## 📊 Metrics Collection Template

### Per Test Run

```markdown
## Test Run: [DATE] - [TEST_NAME]

### Execution Metrics
- Start Time: [timestamp]
- End Time: [timestamp]
- Total Duration: [ms]

### Operation Metrics
- Operation: [open/close/update]
- Latency: [ms]
- Transaction Hash: [hash]
- Success: [true/false]

### Price Metrics
- Price Before: [price]
- Price After: [price]
- Price Change: [%]
- Execution Price: [price]
- Oracle Price: [price]
- Slippage: [%]

### Validation
- Faster than baseline: [yes/no]
- Correct execution price: [yes/no]
- No duplicate fills: [yes/no]
- Single execution: [yes/no]

### Errors
- Error Messages: [if any]
- Retry Count: [if any]
```

---

## 🎯 Test Execution Priority

### P0 - Critical (Do First)
1. TC-MO-001: Open Market Order (Long)
2. TC-MO-003: Close Market Order
3. TC-MO-004: Open → Close Immediately
4. TC-MO-005: High Volatility Execution

### P1 - High Priority
1. TC-TPSL-001: TP Close to Price
2. TC-TPSL-002: SL Close to Price
3. TC-TPSL-004: Edit TP/SL Near Trigger

### P2 - Medium Priority
1. TC-MO-002: Open Market Order (Short) - when SDK supports
2. TC-TPSL-003: Price Spike Through TP/SL
3. TC-FPM-001: Sudden Price Jump
4. TC-FPM-003: Rapid Movement Around Trigger

### P3 - Low Priority (When Infrastructure Ready)
1. All Limit Order tests (TC-LO-001 to TC-LO-004)
2. All Liquidation tests (TC-LIQ-001 to TC-LIQ-003)
3. TC-FPM-002: Wick Touches Trigger
4. TC-LB-002: Multiple Users Trading

---

## 📝 Test Status Tracking

### Implemented ✅
- TC-MO-001: Open Market Order (Long)
- TC-MO-003: Close Market Order
- TC-MO-004: Open → Close Immediately
- TC-MO-005: High Volatility Execution

### Pending SDK Support ⚠️
- TC-MO-002: Open Market Order (Short)
- TC-LO-001 to TC-LO-004: All Limit Order tests
- TC-LIQ-003: Add Collateral Near Liquidation

### Pending Infrastructure ⚠️
- TC-LIQ-001: Liquidation at Threshold
- TC-LIQ-002: Brief Price Touch
- TC-FPM-002: Wick Touches Trigger
- TC-LB-002: Multiple Users Trading

---

## 🔄 Test Execution Workflow

### Before Running Tests
1. Check prerequisites
2. Verify environment setup
3. Check wallet balance
4. Review baseline metrics (if available)

### During Test Execution
1. Follow test steps exactly
2. Record all metrics
3. Capture error messages
4. Take screenshots/logs if needed

### After Test Execution
1. Verify all validations pass
2. Record metrics in template
3. Compare vs baseline
4. Document any issues
5. Update test status

---

## 📈 Baseline Metrics Collection

### Initial Baseline (Before Pyth Lazer)
Run each test 5-10 times and record:
- Average execution latency
- Min/Max latency
- Failed transaction rate
- Price accuracy

### After Pyth Lazer
Run same tests and compare:
- Latency improvement percentage
- Failed transaction rate change
- Price accuracy maintained

---

## 🚨 Known Limitations

1. **Limit Orders:** Require SDK update or Tenderly fork
2. **Short Positions:** Require SDK `is_long=False` support
3. **Liquidations:** Require price simulation or Tenderly
4. **Multi-User:** Require multiple test accounts
5. **Price Simulation:** Some tests need price manipulation capability

---

## 📚 References

- [Avantis Trader SDK](https://sdk.avantisfi.com/)
- [SDK Examples](https://github.com/Avantis-Labs/avantis_trader_sdk/tree/main/examples)
- [Pyth Network](https://pyth.network/)
