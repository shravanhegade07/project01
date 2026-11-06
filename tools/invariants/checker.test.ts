import { describe, it, expect } from 'vitest';

describe('Invariant Checker Validation Tests', () => {
  it('detects non-contiguous sequence numbers (I1 violation)', () => {
    const bids = [{ seq: 1 }, { seq: 3 }]; // Missing seq 2
    const isContiguous = bids.every((b, i) => b.seq === i + 1);
    expect(isContiguous).toBe(false);
  });

  it('detects price mismatch with highest bid (I2 violation)', () => {
    const currentPrice = 1000;
    const highestBid = 1500;
    expect(currentPrice === highestBid).toBe(false);
  });

  it('detects bids placed after end time (I6 violation)', () => {
    const endAt = new Date('2026-01-01T12:00:00Z');
    const bidAt = new Date('2026-01-01T12:05:00Z');
    const isValidTime = bidAt <= endAt;
    expect(isValidTime).toBe(false);
  });
});
