export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "이메일을 입력해주세요.";
  if (!emailRegex.test(email)) return "올바른 이메일 형식이 아닙니다.";
  return "";
}

export function validatePassword(password: string) {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,20}$/;

  if (!password) return "비밀번호를 입력해주세요.";
  if (!passwordRegex.test(password)) {
    return "비밀번호는 8~20자이며 영문, 숫자, 특수문자를 포함해야 합니다.";
  }
  return "";
}

export function validatePasswordConfirm(
  password: string,
  passwordConfirm: string
) {
  if (!passwordConfirm) return "비밀번호 확인을 입력해주세요.";
  if (password !== passwordConfirm) return "비밀번호가 일치하지 않습니다.";
  return "";
}

export function validateNickname(nickname: string) {
  if (!nickname.trim()) return "닉네임을 입력해주세요.";

  if (nickname.length < 2 || nickname.length > 10) {
    return "닉네임은 2자 이상 10자 이하로 입력해주세요.";
  }

  const regex = /^[a-zA-Z0-9가-힣]+$/;

  if (!regex.test(nickname)) {
    return "닉네임은 한글, 영문, 숫자만 사용할 수 있습니다.";
  }

  return "";
}

export function validateBirthDate(birthDate: string) {
  if (!birthDate) return "생년월일을 입력해주세요.";

  const selected = new Date(birthDate);
  const today = new Date();

  if (selected > today) return "미래 날짜는 선택할 수 없습니다.";
  return "";
}