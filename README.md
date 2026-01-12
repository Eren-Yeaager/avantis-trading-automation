# Avantis Trading Automation - Latency Tests

Latency measurement tests for Avantis trading operations using the SDK.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Install Python SDK:

```bash
pip3 install avantis-trader-sdk
```

3. Set environment variable:

```bash
export CONNECTED_WALLET_PK="your_private_key"
```

Or create a `.env` file:

```
CONNECTED_WALLET_PK=your_private_key
```

## Run Tests

```bash
# Run all latency tests
npx playwright test test/regression/latency.spec.ts

# Run specific test
npx playwright test test/regression/latency.spec.ts -g "Measure trade open latency"
npx playwright test test/regression/latency.spec.ts -g "Measure trade close latency"
```

## Tests

- **Measure trade open latency** - Opens a trade and measures execution time
- **Measure trade close latency** - Closes a trade and measures execution time

## Project Structure

```
test/regression/
├── latency.spec.ts    # Latency test suite
├── sdk.py             # Python CLI entry point
├── sdk.ts             # TypeScript SDK client
├── sdk_base.py        # Base utilities
└── sdk_trades.py      # Trade operations
```
