export const ProblemTypes = {
  BID_TOO_LOW: 'BID_TOO_LOW',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  AUCTION_NOT_LIVE: 'AUCTION_NOT_LIVE',
  AUCTION_ENDED: 'AUCTION_ENDED',
  SELF_BID: 'SELF_BID',
  RATE_LIMITED: 'RATE_LIMITED',
  DUPLICATE_BID: 'DUPLICATE_BID',
  INVALID_INPUT: 'INVALID_INPUT',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ProblemType = (typeof ProblemTypes)[keyof typeof ProblemTypes];

export interface ProblemDetail {
  type: ProblemType;
  title: string;
  status: number;
  detail: string;
  instance?: string;
}
