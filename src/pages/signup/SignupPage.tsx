import "./styles/signup.css";

import SignupCard from "./components/SignupCard";
import SignupTitle from "./components/SignupTitle";
import BirthDateField from "./components/BirthDateField";
import NicknameField from "./components/NicknameField";
import EmailField from "./components/EmailField";
import PasswordFields from "./components/PasswordFields";
import GenderSelect from "./components/GenderSelect";
import AccentSelect from "./components/AccentSelect";
import TermsAgreements from "./components/TermsAgreements";
import SubmitSection from "./components/SubmitSection";

export default function SignupPage() {
  return (
    <div className="signup-page">
      <div className="signup-page__inner">
        <SignupTitle />

        <SignupCard>
          <div className="signup-form">
            <NicknameField />
            <BirthDateField />
            <EmailField />
            <PasswordFields />
            <GenderSelect />
            <AccentSelect />
            <TermsAgreements />
          </div>

          <SubmitSection />
        </SignupCard>
      </div>
    </div>
  );
}