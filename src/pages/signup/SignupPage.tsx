import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/signup.css";
import { signUp, type SignUpRequest } from "../../api/auth";
import { ROUTES } from "../../app/routes.const";
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

const genderMap: Record<string, SignUpRequest["gender"]> = {
  male: "MALE",
  female: "FEMALE",
};

const dialectMap: Record<string, SignUpRequest["dialect"]> = {
  seoul: "STANDARD",
  gyeongsang: "GYEONGSANG",
  chungcheong: "CHUNGCHEONG",
  jeolla: "JEOLLA",
  gangwon: "GANGWON",
};

export default function SignupPage() {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      gender: genderMap[form.gender] ? "" : "성별을 선택해주세요.",
      accent: form.accent ? "" : "사투리를 선택해주세요.",
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((value) => value !== "");
    if (hasError) return;

    if (!form.serviceAgreed || !form.privacyAgreed) {
      alert("필수 약관에 모두 동의해주세요.");
      return;
    }

    const gender = genderMap[form.gender];
    const dialect = dialectMap[form.accent];

    if (!gender || !dialect) return;

    const payload: SignUpRequest = {
      email: form.email,
      birthday: form.birthDate,
      password: form.password,
      nickname: form.nickname,
      gender,
      dialect,
      terms: [
        { termId: 1, agreed: form.serviceAgreed },
        { termId: 2, agreed: form.privacyAgreed },
      ],
    };

    try {
      setIsSubmitting(true);
      await signUp(payload);
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "회원가입에 실패했습니다.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
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

            <SubmitSection disabled={isSubmitting} />
          </form>
        </SignupCard>
      </div>
    </div>
  );
}
