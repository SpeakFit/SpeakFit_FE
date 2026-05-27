import { useEffect } from "react";
import "../styles/script.css";

interface ScriptOptimizingModalProps {
  open: boolean;
  /** 취소 버튼을 보여줄지 여부. 호출 abort 미구현이면 false 권장. */
  onCancel?: () => void;
}

/**
 * 스크립트 "최적화" 중에 떠 있는 모달.
 * 기존 대본을 사용자가 이미 작성해 둔 상태이므로,
 * 그 위에 dim 오버레이를 깔아 원본은 그대로 보이게 두고 작업 중임을 알린다.
 *
 * - ESC / 바깥 클릭으로 닫히지 않음 (실수 방지)
 * - onCancel이 주어진 경우에만 취소 버튼 노출
 */
const ScriptOptimizingModal = ({ open, onCancel }: ScriptOptimizingModalProps) => {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="script-optimizing-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="script-optimizing-modal-title"
    >
      <div className="script-optimizing-modal__backdrop" />

      <div className="script-optimizing-modal__panel">
        <div className="script-optimizing-modal__spinner" aria-hidden />

        <p
          id="script-optimizing-modal-title"
          className="script-optimizing-modal__title"
        >
          대본 최적화 중
        </p>
        <p className="script-optimizing-modal__desc">
          원본 대본을 다듬고 있어요. 잠시만 기다려주세요.
        </p>

        {onCancel && (
          <button
            type="button"
            className="script-optimizing-modal__cancel-btn"
            onClick={onCancel}
          >
            취소
          </button>
        )}
      </div>
    </div>
  );
};

export default ScriptOptimizingModal;