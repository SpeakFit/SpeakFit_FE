export default function GenderSelect() {
  return (
    <div className="sf-field">
      <div className="sf-label">성별 선택</div>
      <select className="sf-select" defaultValue="">
        <option value="" disabled>
          남성/여성
        </option>
        <option value="male">남성</option>
        <option value="female">여성</option>
        <option value="none">선택 안함</option>
      </select>
    </div>
  );
}
