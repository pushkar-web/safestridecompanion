import { motion } from "framer-motion";

interface RiskGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

const RiskGauge = ({ score, size = 180, label = "Safe" }: RiskGaugeProps) => {
  const radius = (size - 24) / 2;
  const circumference = Math.PI * radius;
  const fillPercent = score / 100;
  const strokeDashoffset = circumference * (1 - fillPercent);

  const getColor = (s: number) => {
    if (s >= 70) return "hsl(155, 75%, 40%)";
    if (s >= 40) return "hsl(35, 90%, 50%)";
    return "hsl(0, 80%, 55%)";
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg width={size} height={size / 2 + 24} viewBox={`0 0 ${size} ${size / 2 + 24}`}>
        {/* Background arc */}
        <path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none"
          stroke="hsl(240, 10%, 92%)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <motion.path
          d={`M 12 ${size / 2 + 12} A ${radius} ${radius} 0 0 1 ${size - 12} ${size / 2 + 12}`}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-3">
        <motion.span
          className="text-4xl font-display font-bold"
          style={{ color: getColor(score) }}
          key={score}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {score}<span className="text-lg">%</span>
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
    </div>
  );
};

export default RiskGauge;
