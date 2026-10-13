import { useEffect } from "react";

type TermModalProps = {
  title: string;
  content: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onClose: () => void;
};

export default function TermModal({
  title,
  content,
  isLoading,
  errorMessage,
  onRetry,
  onClose,
}: TermModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="sf-term-modal__overlay" onClick={onClose}>
      <div
        className="sf-term-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sf-term-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="sf-term-modal-title" className="sf-term-modal__title">
          {title}
        </h2>

        <div className="sf-term-modal__body">
          {isLoading && <p className="sf-term-modal__status">불러오는 중...</p>}

          {!isLoading && errorMessage && (
            <div className="sf-term-modal__status">
              <p>{errorMessage}</p>
              <button
                type="button"
                className="sf-term-modal__retry"
                onClick={onRetry}
              >
                다시 시도
              </button>
            </div>
          )}

          {!isLoading && !errorMessage && content && (
            <p className="sf-term-modal__content">{content}</p>
          )}
        </div>

        <button type="button" className="sf-term-modal__close" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}
