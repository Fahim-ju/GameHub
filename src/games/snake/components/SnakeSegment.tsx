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

  // Head SVG with eyes & tongue
  if (kind === 'head') {
    return (
      <svg className="snake-svg head-svg" viewBox="0 0 100 100" style={{ transform: `rotate(${rot}deg)` }}>
        <defs>
          <radialGradient id={`headGrad-${index}`} cx="40%" cy="40%" r="70%">
            <stop offset="0%" stopColor="#ffd7ef" />
            <stop offset="55%" stopColor={fill} />
            <stop offset="100%" stopColor={stroke} />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="44" fill={`url(#headGrad-${index})`} stroke={stroke} strokeWidth="4" />
        {/* Eyes */}
        <circle cx="35" cy="42" r="9" fill="#fff" />
        <circle cx="65" cy="42" r="9" fill="#fff" />
        <circle cx="38" cy="44" r="4" fill="#111" />
        <circle cx="62" cy="44" r="4" fill="#111" />
        {/* Tongue */}
        <path d="M50 60 q0 8 4 16 -4 -4 -4 12 -4 -16 -4 -12 4 -8 4 -16z" fill="#ff2a2a" stroke="#aa0000" strokeWidth="2" strokeLinejoin="round" />
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
    </svg>
  );
};

export default SnakeSegment;