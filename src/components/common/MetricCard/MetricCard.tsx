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
  const angle = -60 + (Math.max(0, Math.min(level, 100)) / 100) * 120;

  return (
    <section className="metric-card">
      <h3 className="metric-card__title">{title}</h3>

      <div className={`metric-card__gauge metric-card__gauge--${tone}`}>
        <div className="metric-card__gauge-circle" />
        <div
          className={`metric-card__needle metric-card__needle--${tone}`}
          style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
        />
        <div className="metric-card__gauge-center" />
      </div>

      <div className={`metric-card__value metric-card__value--${tone}`}>
        {value} <span className="metric-card__unit">{unit}</span>
      </div>

      <p className="metric-card__description">{description}</p>
    </section>
  );
}
