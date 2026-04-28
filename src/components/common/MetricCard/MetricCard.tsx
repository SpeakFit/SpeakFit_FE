export type MetricCardProps = {
  title: string;
  value: string;
  unit: string;
  description: string;
  tone: "mint" | "red";
  level: number;
};

export default function MetricCard({
  title,
  value,
  unit,
  description,
  tone,
  level,
}: MetricCardProps) {
  const normalizedLevel = Math.max(0, Math.min(level, 100));
  const circumference = Math.PI * 84;
  const strokeOffset = circumference - (normalizedLevel / 100) * circumference;

  return (
    <section className="metric-card">
      <h3 className="metric-card__title">{title}</h3>

      <div className={`metric-card__gauge metric-card__gauge--${tone}`}>
        <svg
          className="metric-card__gauge-svg"
          viewBox="0 0 220 132"
          aria-hidden="true"
        >
          <path
            className="metric-card__gauge-track"
            d="M 26 106 A 84 84 0 0 1 194 106"
            pathLength={circumference}
          />
          <path
            className={`metric-card__gauge-progress metric-card__gauge-progress--${tone}`}
            d="M 26 106 A 84 84 0 0 1 194 106"
            pathLength={circumference}
            style={{
              strokeDasharray: circumference,
              strokeDashoffset: strokeOffset,
            }}
          />
        </svg>

        <div className={`metric-card__value metric-card__value--${tone}`}>
          <span className="metric-card__value-number">{value}</span>
          {unit && <span className="metric-card__unit">{unit}</span>}
        </div>
      </div>

      <p className="metric-card__description">{description}</p>
    </section>
  );
}
