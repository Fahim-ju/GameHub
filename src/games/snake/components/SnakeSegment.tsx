import React from 'react';

export type SegmentKind = 'head' | 'tail' | 'straight' | 'corner';
export type SegmentDir = 'up' | 'down' | 'left' | 'right';

interface SnakeSegmentProps {
  kind: SegmentKind;
  dir: SegmentDir;           // facing direction (head/tail primary direction; for straight the axis; for corner direction indicates exit direction)
  enterDir?: SegmentDir;     // for corner: direction snake came from
  index: number;             // segment index (0=head)
  length: number;            // total snake length for gradient shift
}

// Helper rotation mapping
const rotationFor = (dir: SegmentDir): number => {
  switch (dir) {
    case 'up': return 0;
    case 'right': return 90;
    case 'down': return 180;
    case 'left': return 270;
  }
};

const SnakeSegment: React.FC<SnakeSegmentProps> = ({ kind, dir, enterDir, index, length }) => {
  const rot = rotationFor(dir);
  const progress = index / Math.max(1, length - 1);
  const baseHue = 18; // orange base
  const hue = baseHue + progress * 15; // shift slightly toward yellow at tail
  const saturation = 90 - progress * 25;
  const light = 55 - progress * 15;
  const fill = `hsl(${hue} ${saturation}% ${light}%)`;
  const stroke = `hsl(${hue} ${Math.min(100, saturation + 5)}% ${Math.max(20, light - 25)}%)`;
  const gloss = `hsl(${hue} ${Math.min(100, saturation + 10)}% ${Math.min(95, light + 32)}% / .9)`;

  // Head SVG with eyes & tongue
  if (kind === 'head') {
    return (
      <svg className="snake-svg head-svg" viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
        <defs>
          <radialGradient id={`headGrad-${index}`} cx="48%" cy="58%" r="60%">
            <stop offset="0%" stopColor={gloss} />
            <stop offset="55%" stopColor={fill} />
            <stop offset="100%" stopColor={stroke} />
          </radialGradient>
          <linearGradient id={`jawGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} />
            <stop offset="100%" stopColor={stroke} />
          </linearGradient>
          <radialGradient id={`tongueGrad-${index}`} cx="50%" cy="10%" r="90%">
            <stop offset="0%" stopColor="#ffb1b1" />
            <stop offset="60%" stopColor="#ff2a2a" />
            <stop offset="100%" stopColor="#b80000" />
          </radialGradient>
        </defs>
        {/* Head back (so jaws can animate over dark cavity) */}
        <path d="M15 70 Q15 35 50 15 Q85 35 85 70 Q70 90 50 92 Q30 90 15 70Z" fill={`url(#headGrad-${index})`} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
        {/* Mouth cavity */}
        <path className="mouth-cavity" d="M28 56 Q50 40 72 56 Q61 58 50 59.5 Q39 58 28 56Z" fill="#270012" />
        {/* Tongue inside mouth (flick via CSS) */}
        <path className="tongue" d="M50 58 Q53 70 50 82 Q47 70 50 58Z" fill={`url(#tongueGrad-${index})`} />
        {/* Lower jaw (animated) */}
        <path className="lower-jaw" d="M22 58 Q50 50 78 58 Q68 63 50 66 Q32 63 22 58Z" fill={`url(#jawGrad-${index})`} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        {/* Upper jaw (static) */}
        <path className="upper-jaw" d="M20 56 Q50 28 80 56 Q66 52 50 52 Q34 52 20 56Z" fill={`url(#jawGrad-${index})`} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        {/* Eyes */}
        <g className="eyes">
          <circle cx="37" cy="46" r="8" fill="#fff" />
          <circle cx="63" cy="46" r="8" fill="#fff" />
          <circle cx={dir === 'left' ? 35 : dir === 'right' ? 39 : 37} cy={dir === 'down' ? 48 : 46} r="3.6" fill="#111" />
            <circle cx={dir === 'right' ? 65 : dir === 'left' ? 61 : 63} cy={dir === 'down' ? 48 : 46} r="3.6" fill="#111" />
          <circle cx={dir === 'left' ? 34 : dir === 'right' ? 38 : 36.3} cy={dir === 'down' ? 46.8 : 45.6} r="1.1" fill="#fff" />
          <circle cx={dir === 'right' ? 66 : dir === 'left' ? 62 : 64} cy={dir === 'down' ? 46.8 : 45.6} r="1.1" fill="#fff" />
        </g>
      </svg>
    );
  }

  if (kind === 'tail') {
    return (
      <svg className="snake-svg tail-svg" viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
        <path d="M50 10 C70 25 80 45 82 60 70 72 58 82 50 90 42 82 30 72 18 60 20 45 30 25 50 10z" fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === 'corner') {
    // Determine clockwise vs counter based on enter/exit
    const ed = enterDir || dir;
    const order = ['up','right','down','left'];
    const ei = order.indexOf(ed);
    const di = order.indexOf(dir);
    const clockwise = (ei + 1) % 4 === di;
    return (
      <svg className="snake-svg corner-svg" viewBox="0 0 100 100" style={{ transform: `rotate(${rotationFor(ed)}deg)` }}>
        <path d={clockwise ? 'M10 90 Q10 10 90 10 L90 40 Q40 40 40 90Z' : 'M90 90 Q90 10 10 10 L10 40 Q60 40 60 90Z'} fill={fill} stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }

  // straight body
  return (
    <svg className="snake-svg body-svg" viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
  <rect x="22" y="6" width="56" height="88" rx="34" fill={fill} stroke={stroke} strokeWidth="4" />
  <rect x="26" y="10" width="48" height="68" rx="30" fill={gloss} opacity="0.08" />
    </svg>
  );
};

export default SnakeSegment;