import type { ReactNode } from "react";
import "./button.css";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
};

export default function Button({
  children,
  variant = "primary",
  onClick,
}: ButtonProps) {
  return (
    <button type="button" className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
