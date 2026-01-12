export type OrderType='market' | 'limit' | 'stop-limit'
export type PositionType = 'long' | 'short'

export interface TradeConfig{
    assetPair:string;
    collateral:string;
    leverage:string;
    positionType:PositionType;
    orderType:OrderType;
    scenario:string;
    limitPrice?:string;
    stopPrice?:string;
    assertions?:{
        checkOrderPlaced?:boolean;
        checkPositionCreated?:boolean;
        checkOrderType?:boolean;
        checkPrice?:boolean;
        checkPnL?:boolean;
    }

}
export const LONG_MARKET_SCENARIOS: TradeConfig[] = [
    {
      assetPair: "BTC-USD",
      collateral: "1",
      leverage: "10",
      positionType: "long",
      orderType: "market",
      scenario: "standard",
      assertions: { 
        checkOrderPlaced: true, 
        checkPositionCreated: true 
      }
    },
    {
      assetPair: "ETH-USD",
      collateral: "1",
      leverage: "10",
      positionType: "long",
      orderType: "market",
      scenario: "standard",
      assertions: { 
        checkOrderPlaced: true, 
        checkPositionCreated: true 
      }
    },
  ];
export const TRADE_SCENARIOS:TradeConfig[]=[
    
    ...LONG_MARKET_SCENARIOS,
]