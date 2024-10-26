import {CSSProperties, FC, useMemo} from 'react';
import {Color, Segment} from './types';
import {getData, segmentToD, strokeToFill, styleAttrs} from './utils';

const GradientPath: FC<{
  d: string;
  segments: number;
  samples: number;
  precision?: number;
  stroke?: Color;
  strokeWidth?: number;
  fill?: Color;
  width?: number;
  style?: CSSProperties;
  className?: string;
}> = ({
  d,
  segments,
  samples,
  precision,
  stroke,
  strokeWidth = 1,
  fill,
  width,
  style,
  className,
}) => {
  const isPathClosed = /z\s*$/i.test(d.trim());
  const allSegments = useMemo((): Segment[] => {
    const data = getData({path: d, segments, samples, precision});

    if (width && fill) {
      return strokeToFill(data, width, precision, isPathClosed);
    }

    return data;
  }, [d, segments, samples, precision, fill, width, isPathClosed]);

  return (
    <g style={style} className={className}>
      {allSegments.map(({samples, progress}, index) => (
        <path
          key={index}
          d={segmentToD(samples, isPathClosed)}
          {...styleAttrs(fill, stroke, strokeWidth, progress)}
        />
      ))}
    </g>
  );
};

GradientPath.displayName = 'GradientPath';

export default GradientPath;
