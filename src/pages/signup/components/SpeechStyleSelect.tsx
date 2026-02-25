export default function SpeechStyleSelect() {
  return (
    <div className="sf-field">
      <div className="sf-label">추구하는 발표 스타일 선택</div>
      <select className="sf-select" defaultValue="">
        <option value="" disabled>
          선택
        </option>
        <option value="calm">중저음의 신중하고 차분한 스타일</option>
        <option value="standard">안정적인 톤의 표준 강의 스타일</option>
        <option value="energetic">에너지 넘치는 고음/빠른 스타일</option>
      </select>
    </div>
  );
}
