
import asyncio
import json
import sys
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from sdk_base import retry_with_backoff, create_client, get_trader_address
from avantis_trader_sdk.types import TradeInput, TradeInputOrderType

async def open_trade(private_key, provider, asset_pair, collateral, leverage):
    try:
        async def _open_trade():
            client = create_client(provider, private_key)
            trader = get_trader_address(client)
            if not trader:
                return {"success": False, "error": "Failed to get signer"}
            
            pair_name = asset_pair.replace("-", "/")
            try:
                pair_index = await client.pairs_cache.get_pair_index(pair_name)
            except Exception as e:
                return {"success": False, "error": f"Pair {asset_pair} not found: {str(e)}"}
            
            collateral_amount = float(collateral)
            
            allowance = await client.get_usdc_allowance_for_trading(trader)
            if allowance < collateral_amount:
                print(f"INFO: Approving {collateral_amount} USDC for trading (current: {allowance} USDC)", file=sys.stderr)
                approval_tx = await client.approve_usdc_for_trading(int(collateral_amount))
                approval_receipt = await client.sign_and_get_receipt(approval_tx)
                print(f"INFO: Approval transaction: {approval_receipt.transactionHash.hex()}", file=sys.stderr)
                await asyncio.sleep(2)
            
            trade_input = TradeInput(
                trader=trader,
                open_price=None,
                pair_index=pair_index,
                collateral_in_trade=collateral_amount,
                is_long=True,
                leverage=int(float(leverage)),
                index=0,
                tp=0,
                sl=0,
                timestamp=0,
            )
            
            slippage_percentage = 1
            trade_input_order_type = TradeInputOrderType.MARKET
            
            try:
                tx = await client.trade.build_trade_open_tx(
                    trade_input, trade_input_order_type, slippage_percentage
                )
            except Exception as build_error:
                error_str = str(build_error)
                print(f"DEBUG: Build error details: {error_str}", file=sys.stderr)
                if "BELOW_MIN_POS" in error_str:
                    return {"success": False, "error": f"Collateral amount {collateral_amount} USDC is below the minimum position size for {asset_pair}. Please increase the collateral amount."}
                elif "balance" in error_str.lower() or "ERC20" in error_str:
                    try:
                        usdc_balance = await client.get_usdc_balance(trader)
                        return {"success": False, "error": f"Insufficient USDC balance. Available: {usdc_balance} USDC. Required: {collateral_amount} USDC (plus fees). Please add more USDC to your wallet or reduce the collateral amount."}
                    except:
                        return {"success": False, "error": f"Insufficient USDC balance. Required: {collateral_amount} USDC (plus fees). Full error: {error_str}"}
                return {"success": False, "error": f"Failed to build trade: {error_str}"}
            
            receipt = await client.sign_and_get_receipt(tx)
            
            await asyncio.sleep(2)
            
            new_trade = None
            for attempt in range(5):
                trades, _ = await client.trade.get_trades(trader)
                new_trade = next((t for t in trades if t.trade.pair_index == pair_index and t.trade.trade_index is not None), None)
                if new_trade:
                    break
                await asyncio.sleep(1)
            
            if not new_trade:
                return {
                    "success": True,
                    "txHash": receipt.transactionHash.hex(),
                    "tradeIndex": None,
                    "pairIndex": pair_index,
                    "warning": "Trade opened but could not retrieve trade_index immediately"
                }
            
            return {
                "success": True,
                "txHash": receipt.transactionHash.hex(),
                "tradeIndex": new_trade.trade.trade_index,
                "pairIndex": pair_index,
            }
        
        result = await retry_with_backoff(_open_trade, max_retries=5, initial_delay=2)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

async def close_trade(private_key, provider, trade_index, pair_index, collateral_to_close=None):
    try:
        async def _close_trade():
            client = create_client(provider, private_key)
            trader = get_trader_address(client)
            if not trader:
                return {"success": False, "error": "Failed to get signer"}
            
            collateral_amount = collateral_to_close
            if collateral_amount is None:
                trades, _ = await client.trade.get_trades(trader)
                print(f"DEBUG: Found {len(trades)} trades for trader {trader}", file=sys.stderr)
                trade = next((t for t in trades if t.trade.trade_index == trade_index and t.trade.pair_index == pair_index), None)
                if trade:
                    collateral_amount = trade.trade.open_collateral
                    print(f"DEBUG: Closing trade with collateral: {collateral_amount} (open_collateral)", file=sys.stderr)
                else:
                    available_trades = [(t.trade.trade_index, t.trade.pair_index) for t in trades]
                    return {"success": False, "error": f"Trade not found: trade_index={trade_index}, pair_index={pair_index}. Available trades: {available_trades}"}
            
            try:
                tx = await client.trade.build_trade_close_tx(
                    pair_index=pair_index,
                    trade_index=trade_index,
                    collateral_to_close=float(collateral_amount),
                    trader=trader,
                )
            except Exception as build_error:
                error_str = str(build_error)
                print(f"DEBUG: Close build error details: {error_str}", file=sys.stderr)
                if "balance" in error_str.lower():
                    return {"success": False, "error": f"Insufficient balance to close trade. Full error: {error_str}"}
                elif "not found" in error_str.lower() or "invalid" in error_str.lower():
                    return {"success": False, "error": f"Invalid trade or trade already closed. Full error: {error_str}"}
                else:
                    return {"success": False, "error": f"Failed to build close transaction: {error_str}"}
            
            receipt = await client.sign_and_get_receipt(tx)
            return {"success": True, "txHash": receipt.transactionHash.hex()}
        
        result = await retry_with_backoff(_close_trade, max_retries=5, initial_delay=2)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

async def get_trades(private_key, provider):
    try:
        async def _get_trades():
            client = create_client(provider, private_key)
            trader = get_trader_address(client)
            if not trader:
                return {"success": False, "error": "Failed to get signer"}
            
            trades, _ = await client.trade.get_trades(trader)
            trade_list = []
            for t in trades:
                trade_list.append({
                    "tradeIndex": t.trade.trade_index,
                    "pairIndex": t.trade.pair_index,
                    "openCollateral": float(t.trade.open_collateral),
                    "collateralInTrade": float(t.trade.collateral_in_trade),
                    "isLong": t.trade.is_long,
                    "leverage": t.trade.leverage,
                })
            
            return {
                "success": True,
                "trades": trade_list,
                "count": len(trade_list)
            }
        
        result = await retry_with_backoff(_get_trades, max_retries=3, initial_delay=1)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
