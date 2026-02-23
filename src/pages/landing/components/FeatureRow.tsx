import "../styles/feature.css";
import {Link} from "react-router-dom";

type Props = {
  title: string;
  description: string;
  buttonText: string;
  buttonTo: string;
  imageSrc: string;
  imageAlt: string;
  reverse?: boolean;
  variant?: "row1" | "row2";
};

export default function FeatureRow({
  title,
  description,
  buttonText,
  buttonTo,
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
        <Link to={buttonTo} className="btn btn-primary">{buttonText}</Link>
      </div>

      <div className="feature-row__imageWrap">
        <img className="feature-row__image" src={imageSrc} alt={imageAlt} />
      </div>
    </div>
  );
}