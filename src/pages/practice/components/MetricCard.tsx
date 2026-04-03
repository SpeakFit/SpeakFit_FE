type MetricCardProps = {
  title: string;
  value: string;
  unit: string;
  description: string;
  tone: "mint" | "red";
};

export default function MetricCard({
  title,
  value,
  unit,
  description,
  tone,
}: MetricCardProps) {
  return (
    <section className="metric-card">
      <h3 className="metric-card__title">{title}</h3>

      <div className={`metric-card__gauge metric-card__gauge--${tone}`}>
        <div className="metric-card__gauge-circle" />
        <div className="metric-card__gauge-center" />
      </div>

      <div className={`metric-card__value metric-card__value--${tone}`}>
        {value} <span>{unit}</span>
      </div>

      <p className="metric-card__description">{description}</p>
    </section>
  );
}