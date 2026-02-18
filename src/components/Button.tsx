import "./button.css";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
};

export default function Button({
  children,
  variant = "primary",
  onClick,
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
