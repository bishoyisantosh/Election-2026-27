export interface Candidate {
  id: number;
  name: string;
  symbol: string;    // emoji symbol (fallback)
  symbolLabel: string;
  symbolImage?: string; // optional image path — overrides emoji
  photo: string;
  serialNo: number;
}

export type VotePanel = 'boy' | 'girl';

export interface VoteState {
  boyVote: number | null;
  girlVote: number | null;
}
