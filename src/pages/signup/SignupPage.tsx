import "./styles/signup.css";

import SignupCard from "./components/SignupCard";
import SignupTitle from "./components/SignupTitle";
import NameField from "./components/NameField";
import BirthDateField from "./components/BirthDateField";
import PhoneVerifyField from "./components/PhoneVerifyField";
import NicknameField from "./components/NicknameField";
import EmailField from "./components/EmailField";
import PasswordFields from "./components/PasswordFields";
import GenderSelect from "./components/GenderSelect";
import SpeechStyleSelect from "./components/SpeechStyleSelect";
import AccentSelect from "./components/AccentSelect";
import TermsAgreements from "./components/TermsAgreements";
import SubmitSection from "./components/SubmitSection";
import SocialSignup from "./components/SocialSignup";

export default function SignupPage() {
  return (
    <div className="signup-page">
      <div className="signup-page__inner">
        <SignupTitle />

        <SignupCard>
          <div className="signup-form">
            <NameField />
            <BirthDateField />
            <PhoneVerifyField />
            <NicknameField />
            <EmailField />
            <PasswordFields />
            <GenderSelect />
            <SpeechStyleSelect />
            <AccentSelect />
            <TermsAgreements />
          </div>

          <SubmitSection />
          <SocialSignup />
        </SignupCard>
      </div>
    </div>
  );
}