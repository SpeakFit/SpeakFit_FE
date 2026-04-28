import type { ReactNode } from "react";
import "../styles/signup.css";

export default function SignupCard({ children }: { children: ReactNode }) {
  return <section className="signup-card">{children}</section>;
}