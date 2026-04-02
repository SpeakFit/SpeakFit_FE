import { useState } from "react";
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
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateNickname,
  validateBirthDate,
} from "./utils/validateSignup";

export default function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    birthDate: "",
    gender: "",
    accent: "",
    serviceAgreed: false,
    privacyAgreed: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    birthDate: "",
    gender: "",
    accent: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      passwordConfirm: validatePasswordConfirm(
        form.password,
        form.passwordConfirm
      ),
      nickname: validateNickname(form.nickname),
      birthDate: validateBirthDate(form.birthDate),
      gender: form.gender ? "" : "성별을 선택해주세요.",
      accent: form.accent ? "" : "사투리를 선택해주세요.",
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((value) => value !== "");
    if (hasError) return;

    if (!form.serviceAgreed || !form.privacyAgreed) {
      alert("필수 약관에 모두 동의해주세요.");
      return;
    }

    console.log("회원가입 요청 데이터:", form);
    // 회원가입 API 호출
  };

  return (
    <div className="signup-page">
      <div className="signup-page__inner">
        <SignupTitle />

        <SignupCard>
          <form className="signup-form" onSubmit={handleSubmit}>
            <NicknameField
              value={form.nickname}
              error={errors.nickname}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, nickname: value }))
              }
            />

            <BirthDateField
              value={form.birthDate}
              error={errors.birthDate}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, birthDate: value }))
              }
            />

            <EmailField
              value={form.email}
              error={errors.email}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, email: value }))
              }
            />

            <PasswordFields
              password={form.password}
              passwordConfirm={form.passwordConfirm}
              error={errors.password}
              confirmError={errors.passwordConfirm}
              onChangePassword={(value) =>
                setForm((prev) => ({ ...prev, password: value }))
              }
              onChangePasswordConfirm={(value) =>
                setForm((prev) => ({ ...prev, passwordConfirm: value }))
              }
            />

            <GenderSelect
              value={form.gender}
              error={errors.gender}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, gender: value }))
              }
            />

            <AccentSelect
              value={form.accent}
              error={errors.accent}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, accent: value }))
              }
            />

            <TermsAgreements
              serviceChecked={form.serviceAgreed}
              privacyChecked={form.privacyAgreed}
              onChangeService={(checked) =>
                setForm((prev) => ({ ...prev, serviceAgreed: checked }))
              }
              onChangePrivacy={(checked) =>
                setForm((prev) => ({ ...prev, privacyAgreed: checked }))
              }
            />

            <SubmitSection />
          </form>
        </SignupCard>
      </div>
    </div>
  );
}