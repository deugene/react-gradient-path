import {SVGProps} from 'react';
import tinygradient from 'tinygradient';
import {svgPathProperties} from 'svg-path-properties';
import {Color, Sample, Segment} from './types';

const DEFAULT_PRECISION = 2;

// The main function responsible for getting data
// This will take a path, number of samples, number of samples, and a precision value
// It will return an array of Segments, which in turn contains an array of Samples
// This can later be used to generate a stroked path, converted to outlines for a filled path
export function getData({
  path,
  segments,
  samples,
  precision = DEFAULT_PRECISION,
}: {
  path: string;
  segments: number;
  samples: number;
  precision?: number;
}) {
  const properties = new svgPathProperties(path);
  const pathLength = properties.getTotalLength();

  if (samples > 1) {
    samples--;
  }

  const totalSamples = segments * samples;
  const allSamples: Sample[] = [];
  const allSegments: Segment[] = [];

  for (let sample = 0; sample <= totalSamples; sample++) {
    const progress = sample / totalSamples;
    const length = progress * pathLength;
    const point = properties.getPointAtLength(length);
    let x = point.x;
    let y = point.y;

    if (precision) {
      x = +x.toFixed(precision);
      y = +y.toFixed(precision);
    }

    allSamples.push({x, y, progress});
  }

  for (let segment = 0; segment < segments; segment++) {
    const currentStart = segment * samples;
    const nextStart = currentStart + samples;
    const segmentSamples: Sample[] = [];

    for (let samInSeg = 0; samInSeg < samples; samInSeg++) {
      segmentSamples.push(allSamples[currentStart + samInSeg]);
    }

    segmentSamples.push(allSamples[nextStart]);
    allSegments.push({
      samples: segmentSamples,
      progress: getMiddleSample(segmentSamples).progress,
    });
  }

  return allSegments;
}

// The function responsible for converting strokable data (from getData()) into fillable data
export function strokeToFill(
  data: Segment[],
  width: number,
  precision: number = DEFAULT_PRECISION,
  pathClosed?: boolean,
): Segment[] {
  const outlinedStrokes = outlineStrokes(data, width, precision);
  const averagedSegmentJoins = averageSegmentJoins(
    outlinedStrokes,
    precision,
    pathClosed,
  );

  return averagedSegmentJoins;
}

export function segmentToD(samples: Sample[], pathClosed: boolean): string {
  let d = '';

  for (let i = 0; i < samples.length; i++) {
    const {x, y} = samples[i];

    if (i === 0) {
      d += `M${x},${y}`;
    } else {
      d += `L${x},${y}`;
    }
  }

  if (pathClosed) {
    d += 'Z';
  }

  return d;
}

export function styleAttrs(
  fill?: Color,
  stroke?: Color,
  strokeWidth?: number,
  progress: number = 0,
) {
  const determineColor = (type: Color, progress: number) => {
    if (!type) {
      return;
    }

    return typeof type === 'string'
      ? type
      : tinygradient(type as {color: string; pos: number}[])
          .rgbAt(progress)
          .toHexString();
  };
  const attrs: Omit<SVGProps<SVGElement>, 'ref'> = {};

  if (stroke) {
    attrs.stroke = determineColor(stroke, progress);
    attrs.strokeWidth = strokeWidth;
  }

  if (fill) {
    attrs.fill = determineColor(fill, progress);
  }

  return attrs;
}

function getMiddleSample(samples: Sample[]): Sample {
  return [...samples].sort((a, b) => a.progress - b.progress)[
    Math.floor(samples.length / 2)
  ];
}

// A function for outlining stroked data
function outlineStrokes(
  data: Segment[],
  width: number,
  precision: number,
): Segment[] {
  const radius = width / 2;
  const outlinedData: Segment[] = [];

  for (let i = 0; i < data.length; i++) {
    const samples = data[i].samples;
    const segmentSamples: Sample[] = [];

    for (let j = 0; j < samples.length; j++) {
      if (samples[j + 1] === undefined) {
        break;
      }

      const p0 = samples[j];
      const p1 = samples[j + 1];
      const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);
      const p0Perps = getPerpSamples(angle, radius, precision, p0);
      const p1Perps = getPerpSamples(angle, radius, precision, p1);

      if (j === 0) {
        segmentSamples.push(...p0Perps);
      }

      segmentSamples.push(...p1Perps);
    }

    const outlinedDataSamples = [
      ...segmentSamples.filter((_, i) => i % 2 === 0),
      ...segmentSamples.filter((_, i) => i % 2 === 1).reverse(),
    ];

    outlinedData.push({
      samples: outlinedDataSamples,
      progress: getMiddleSample(outlinedDataSamples).progress,
    });
  }

  return outlinedData;
}

function getPerpSamples(
  angle: number,
  radius: number,
  precision: number,
  startPoint: Sample,
): Sample[] {
  const p0: Sample = {
    ...startPoint,
    x: Math.sin(angle) * radius + startPoint.x,
    y: -Math.cos(angle) * radius + startPoint.y,
  };
  const p1: Sample = {
    ...startPoint,
    x: -Math.sin(angle) * radius + startPoint.x,
    y: Math.cos(angle) * radius + startPoint.y,
  };

  if (precision) {
    p0.x = +p0.x.toFixed(precision);
    p0.y = +p0.y.toFixed(precision);
    p1.x = +p1.x.toFixed(precision);
    p1.y = +p1.y.toFixed(precision);
  }

  return [p0, p1];
}

// A function taking outlinedData (from outlineStrokes()) and averaging adjacent edges
function averageSegmentJoins(
  outlinedData: Segment[],
  precision: number,
  pathClosed?: boolean,
): Segment[] {
  const avg = (p0: Sample, p1: Sample): {x: number; y: number} => ({
    x: (p0.x + p1.x) / 2,
    y: (p0.y + p1.y) / 2,
  });
  const combine = (
    segment: Sample[],
    pos: number,
    avgPoint: {x: number; y: number},
  ): Sample => ({
    ...segment[pos],
    x: avgPoint.x,
    y: avgPoint.y,
  });

  const initOutlinedData = JSON.parse(JSON.stringify(outlinedData));

  for (let i = 0; i < outlinedData.length; i++) {
    const currentSamples = pathClosed
      ? outlinedData[i].samples
      : outlinedData[i + 1]
        ? outlinedData[i].samples
        : initOutlinedData[i].samples;
    const nextSamples = pathClosed
      ? outlinedData[i + 1]
        ? outlinedData[i + 1].samples
        : outlinedData[0].samples
      : outlinedData[i + 1]
        ? outlinedData[i + 1].samples
        : initOutlinedData[0].samples;
    const currentMiddle = currentSamples.length / 2;
    const nextEnd = nextSamples.length - 1;
    const p0Average = avg(currentSamples[currentMiddle - 1], nextSamples[0]);
    const p1Average = avg(currentSamples[currentMiddle], nextSamples[nextEnd]);

    if (precision) {
      p0Average.x = +p0Average.x.toFixed(precision);
      p0Average.y = +p0Average.y.toFixed(precision);
      p1Average.x = +p1Average.x.toFixed(precision);
      p1Average.y = +p1Average.y.toFixed(precision);
    }

    currentSamples[currentMiddle - 1] = {
      ...combine(currentSamples, currentMiddle - 1, p0Average),
    };
    currentSamples[currentMiddle] = {
      ...combine(currentSamples, currentMiddle, p1Average),
    };
    nextSamples[0] = {
      ...combine(nextSamples, 0, p0Average),
    };
    nextSamples[nextEnd] = {
      ...combine(nextSamples, nextEnd, p1Average),
    };
  }

  return outlinedData;
}
