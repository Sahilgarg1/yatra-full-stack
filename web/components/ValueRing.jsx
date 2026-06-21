export default function ValueRing({ score, size = 38 }) {
  if (!score) return null;
  const r = (size / 2) * 0.79;
  const circ = 2 * Math.PI * r;
  const fill = circ * (score / 100);
  const color = score >= 80 ? "#4A7C59" : score >= 60 ? "#C4762A" : "#B94040";
  const cx = size / 2;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#E8E0D4" strokeWidth="3.5" />
        <circle
          cx={cx}
          cy={cx}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3.5"
          strokeDasharray={`${fill} ${circ - fill}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-[11px] font-bold text-text-primary">
        {score}
      </div>
    </div>
  );
}
