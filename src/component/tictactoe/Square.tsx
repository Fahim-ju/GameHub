import { motion, type Variants } from "motion/react";

interface SquareProps {
  ind?: number;
  updateSquares?: (index: number) => void;
  clsName?: string;
}

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.5;
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay, duration: 0.01 },
      },
    };
  },
};

const Square: React.FC<SquareProps> = ({ ind, updateSquares, clsName }) => {
  const handleClick = () => {
    if (ind === undefined) return;
    updateSquares?.(ind);
  };
  
  return (
    <motion.div 
      className="square" 
      onClick={handleClick}
      whileHover={ind !== undefined ? { scale: 0.95, backgroundColor: "rgba(255, 255, 255, 0.05)" } : {}}
      whileTap={ind !== undefined ? { scale: 0.9 } : {}}
      transition={{ duration: 0.2 }}
    >
      {clsName === "x" && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <PathDrawingCross />
        </motion.div>
      )}
      {clsName === "o" && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <PathDrawingCircle />
        </motion.div>
      )}
    </motion.div>
  );
};

export default Square;

function PathDrawingCircle() {
  return (
    <motion.svg width="100%" height="100%" viewBox="0 0 100 100" initial="hidden" animate="visible" style={image}>
      <motion.circle className="circle-path" cx="50" cy="50" r="35" stroke="#ffa02e" variants={draw} custom={0.5} style={shape} />
    </motion.svg>
  );
}

function PathDrawingCross() {
  return (
    <motion.svg width="100%" height="100%" viewBox="0 0 100 100" initial="hidden" animate="visible" style={image}>
      <motion.line x1="25" y1="25" x2="75" y2="75" stroke="#ff0088" custom={0.5} variants={draw} style={shape} />
      <motion.line x1="25" y1="75" x2="75" y2="25" stroke="#ff0088" custom={0.5} variants={draw} style={shape} />
    </motion.svg>
  );
}

const image: React.CSSProperties = {
  width: "100%",
  height: "100%",
};

const shape: React.CSSProperties = {
  strokeWidth: 5,
  strokeLinecap: "round",
  fill: "transparent",
};
