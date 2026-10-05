type VoiceAnalysisPromptModalProps = {
  onStartAnalysis: () => void;
  onSkip: () => void;
};

export default function VoiceAnalysisPromptModal({
  onStartAnalysis,
  onSkip,
}: VoiceAnalysisPromptModalProps) {
  return (
    <div className="practice-modal-overlay">
      <div
        className="practice-modal practice-modal--voice-prompt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="practice-voice-prompt-title"
        aria-describedby="practice-voice-prompt-desc"
      >
        <div className="practice-modal__header">
          <h2 id="practice-voice-prompt-title">음색 분석을 먼저 해볼까요?</h2>
          <p id="practice-voice-prompt-desc">
            음색 분석을 하지 않으면 정확한 피드백을 받기 어려워요.
          </p>
        </div>

        <ul className="practice-voice-prompt__list">
          <li>짧은 예문을 한 번 읽으면 분석이 끝나요.</li>
          <li>한 번만 분석해 두면 이후 연습에도 계속 적용돼요.</li>
          <li>
            건너뛰어도 연습은 할 수 있어요. 다만 말하기 속도와 음높이 목표가
            일반 기준으로 계산되어 피드백이 덜 정확할 수 있어요.
          </li>
        </ul>

        <div className="practice-modal__footer practice-voice-prompt__footer">
          <button
            type="button"
            className="practice-modal__confirm is-enabled"
            onClick={onStartAnalysis}
          >
            지금 음색 분석하기
          </button>
          <button
            type="button"
            className="practice-voice-prompt__skip"
            onClick={onSkip}
          >
            건너뛰고 연습하기
          </button>
        </div>
      </div>
    </div>
  );
}
