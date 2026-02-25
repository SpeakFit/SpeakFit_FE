export default function AccentSelect() {
  return (
    <div className="sf-field">
      <div className="sf-label">사투리 선택</div>
      <div className="sf-help">
        평소 말할 때 쓰는 사투리를 알려주세요. 더 정확한 말투 분석과 피드백에
        도움이 됩니다.
      </div>
      <select className="sf-select" defaultValue="">
        <option value="" disabled>
          선택
        </option>
        <option value="seoul">표준어</option>
        <option value="gyeongsang">경상도</option>
        <option value="chungcheong">충청도</option>
        <option value="jeolla">전라도</option>
        <option value="gangwon">강원도</option>
      </select>
    </div>
  );
}
