import { measureMarketOpenLatency, measureMarketCloseLatency, assertLatencyWithinThreshold } from "../utils/performance";

export async function testMarketOpenLatency(page: any, maxLatency: number): Promise<number> {
    const latency = await measureMarketOpenLatency(page);
    assertLatencyWithinThreshold(latency, maxLatency, "Market Open Latency");
    return latency;
}

export async function testMarketCloseLatency(page: any, maxLatency: number): Promise<number> {
    const latency = await measureMarketCloseLatency(page);
    assertLatencyWithinThreshold(latency, maxLatency, "Market Close Latency");
    return latency;
}
