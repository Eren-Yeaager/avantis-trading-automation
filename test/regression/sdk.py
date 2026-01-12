
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sdk_trades import open_trade, close_trade, get_trades

if __name__ == "__main__":
    command = sys.argv[1]
    provider = sys.argv[2] if len(sys.argv) > 2 else "https://mainnet.base.org"
    
    if command == "open":
        private_key = sys.argv[3]
        asset_pair = sys.argv[4]
        collateral = sys.argv[5]
        leverage = sys.argv[6]
        asyncio.run(open_trade(private_key, provider, asset_pair, collateral, leverage))
    elif command == "close":
        private_key = sys.argv[3]
        trade_index = int(sys.argv[4])
        pair_index = int(sys.argv[5])
        asyncio.run(close_trade(private_key, provider, trade_index, pair_index))
    elif command == "trades":
        private_key = sys.argv[3]
        asyncio.run(get_trades(private_key, provider))
