export type Color = string | string[] | {color: string; pos: number}[];

export type Sample = {
  x: number;
  y: number;
  progress: number;
  segment?: Segment;
};

export type Segment = {
  samples: Sample[];
  progress: number;
};
