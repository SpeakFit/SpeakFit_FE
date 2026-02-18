import "../styles/feature.css";

type Props = {
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  variant?: "row1" | "row2";
};

export default function FeatureRow({
  title,
  description,
  buttonText,
  imageSrc,
  imageAlt,
  reverse = false,
  variant = "row1",
}: Props) {
  return (
    <div className={`feature-row feature-row--${variant} ${reverse ? "feature-row--reverse" : ""}`}>
      <div className="feature-row__content">
        <h2 className="feature-row__title">{title}</h2>
        <p className="feature-row__desc">{description}</p>
        <button className="btn btn-primary">{buttonText}</button>
      </div>

      <div className="feature-row__imageWrap">
        <img className="feature-row__image" src={imageSrc} alt={imageAlt} />
      </div>
    </div>
  );
}