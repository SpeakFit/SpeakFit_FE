import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../app/routes.const";
import { getStoredUser, markVoiceOnboardingSeen } from "../../api/auth";
import { uploadVoiceProfileRecording } from "../../api/voice";
import PracticeHeader from "../../components/common/Header/PracticeHeader";
import useAudioMeter from "../practice/hooks/useAudioMeter";
import logoIcon from "../../assets/speakfit-logo.png";
import "./styles/voice-recording.css";

type VoicePageState =
  | "default"
  | "recording"
  | "recorded"
  | "processing"
  | "done"
  | "later-warning";

const EXAMPLE_SENTENCE = `안녕하세요. 오늘 발표에서는 사용자 경험을 개선하기 위한 핵심 방향을 말씀드리겠습니다.\n중요한 내용은 천천히, 강조할 부분은 또렷하게 전달해보겠습니다.`;

const PROCESSING_MODAL_TITLE_ID = "voice-recording-processing-title";
const PROCESSING_MODAL_DESC_ID = "voice-recording-processing-desc";
const DONE_MODAL_TITLE_ID = "voice-recording-done-title";
const DONE_MODAL_DESC_ID = "voice-recording-done-desc";
const WARNING_MODAL_TITLE_ID = "voice-recording-warning-title";
const WARNING_MODAL_DESC_ID = "voice-recording-warning-desc";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export default function VoiceRecordingPage() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<VoicePageState>("default");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const progressTimerRef = useRef<number | null>(null);
  const doneTimeoutRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const {
    status,
    audioBlob,
    recordingError,
    startRecording,
    stopRecording,
  } = useAudioMeter();

  const currentUser = useMemo(() => getStoredUser(), []);
  const displayName = currentUser?.nickname?.trim() || "사용자";

  const rememberTrigger = (element: HTMLElement | null) => {
    lastTriggerRef.current = element;
  };

  const restoreTriggerFocus = () => {
    if (!lastTriggerRef.current) return;

    window.requestAnimationFrame(() => {
      lastTriggerRef.current?.focus?.();
    });
  };

  const clearProgressTimer = () => {
    if (progressTimerRef.current) {
      window.clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  };

  const clearDoneTimeout = () => {
    if (doneTimeoutRef.current) {
      window.clearTimeout(doneTimeoutRef.current);
      doneTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    markVoiceOnboardingSeen();
  }, []);

  useEffect(() => {
    if (status !== "recording") return;

    const timer = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (!recordingError) return;

    setErrorMessage(recordingError);
    setPageState("default");
  }, [recordingError]);

  useEffect(() => {
    const isModalState =
      pageState === "processing" ||
      pageState === "done" ||
      pageState === "later-warning";

    if (!isModalState) return;

    window.requestAnimationFrame(() => {
      modalRef.current?.focus();
    });
  }, [pageState]);

  useEffect(() => {
    return () => {
      clearProgressTimer();
      clearDoneTimeout();
    };
  }, []);

  const handleStartRecording = async () => {
    setErrorMessage(null);
    setRecordingSeconds(0);

    const didStart = await startRecording();
    if (!didStart) return;

    setPageState("recording");
  };

  const handleStopRecording = async () => {
    setErrorMessage(null);
    const finalBlob = await stopRecording();

    if (!finalBlob) {
      setErrorMessage("녹음을 저장하지 못했어요. 다시 시도해주세요.");
      setPageState("default");
      return;
    }

    setPageState("recorded");
  };

  const handleResetRecording = () => {
    clearProgressTimer();
    clearDoneTimeout();
    setRecordingSeconds(0);
    setProgress(0);
    setErrorMessage(null);
    setPageState("default");
    restoreTriggerFocus();
  };

  const handleAnalyze = async () => {
    rememberTrigger(
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    );

    setErrorMessage(null);
    setProgress(0);
    setPageState("processing");

    clearProgressTimer();
    clearDoneTimeout();

    progressTimerRef.current = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + 2, 92));
    }, 80);

    try {
      if (!audioBlob) {
        throw new Error("분석할 녹음 파일이 없어요. 다시 녹음해주세요.");
      }

      await uploadVoiceProfileRecording(audioBlob);

      clearProgressTimer();
      setProgress(100);

      doneTimeoutRef.current = window.setTimeout(() => {
        setPageState("done");
        doneTimeoutRef.current = null;
      }, 250);
    } catch (error) {
      clearProgressTimer();
      clearDoneTimeout();
      setProgress(0);
      setPageState("recorded");
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "음성 분석 중 문제가 발생했어요. 다시 시도해주세요."
      );
      restoreTriggerFocus();
    }
  };

  const handleOpenLaterWarning = () => {
    rememberTrigger(
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    );
    setPageState("later-warning");
  };

  const handleCloseLaterWarning = () => {
    setPageState("default");
    restoreTriggerFocus();
  };

  const handleGoLanding = () => {
    restoreTriggerFocus();
    navigate(ROUTES.LANDING, { replace: true });
  };

  const handleGoScript = () => {
    restoreTriggerFocus();
    navigate(ROUTES.SCRIPT, { replace: true });
  };

  return (
    <div className="voice-recording-page">
      <PracticeHeader />

      <main className="voice-recording-page__content">
        <section className="voice-recording-card">
          <div className="voice-recording-card__body">
            <div className="voice-recording-card__brand">
              <img src={logoIcon} alt="Speakfit icon" />
              <span>Speakfit</span>
            </div>

            <h1 className="voice-recording-card__title">
              안녕하세요, {displayName}님
            </h1>

            <div className="voice-recording-card__description">
              <p>맞춤 피드백을 위해 짧은 예문 녹음이 필요해요.</p>
              <p>음성 톤을 분석해 더 정확한 맞춤 가이드를 제공해드릴게요.</p>
            </div>

            <p className="voice-recording-card__hint">
              녹음 시작하기 버튼을 누르고 아래 예문을 읽어주세요.
            </p>

            <p className="voice-recording-card__example-label">예시 문장</p>

            <div className="voice-recording-card__example-box">
              {EXAMPLE_SENTENCE.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>

            <div className="voice-recording-card__tip-box">
              <p className="voice-recording-card__tip-title">💡 읽기 팁</p>
              <p className="voice-recording-card__tip-text">
                속도와 톤을 일부러 바꾸지 말고, 편한 속도로 또박또박 읽어주세요.
              </p>
            </div>
          </div>

          <div className="voice-recording-card__divider" />

          <div className="voice-recording-card__actions">
            {(pageState === "default" || pageState === "later-warning") && (
              <>
                <button
                  type="button"
                  onClick={handleStartRecording}
                  className="voice-recording-card__primary-btn"
                >
                  녹음 시작하기
                </button>
                <button
                  type="button"
                  onClick={handleOpenLaterWarning}
                  className="voice-recording-card__link-btn"
                >
                  나중에 하기
                </button>
              </>
            )}

            {pageState === "recording" && (
              <>
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="voice-recording-card__primary-btn voice-recording-card__primary-btn--recording"
                >
                  녹음 정지
                </button>
                <div className="voice-recording-card__status-row">
                  <div className="voice-recording-card__rec-wrap">
                    <span className="voice-recording-card__rec-dot" />
                    <span>REC</span>
                  </div>
                  <span>{formatTime(recordingSeconds)}</span>
                </div>
              </>
            )}

            {(pageState === "recorded" || pageState === "processing") && (
              <>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="voice-recording-card__primary-btn"
                  disabled={pageState === "processing"}
                >
                  발표 분석하기
                </button>
                <button
                  type="button"
                  onClick={handleResetRecording}
                  className="voice-recording-card__re-record-btn"
                  disabled={pageState === "processing"}
                >
                  다시 녹음하기
                </button>
              </>
            )}

            {errorMessage && (
              <p className="voice-recording-card__error-text">{errorMessage}</p>
            )}
          </div>
        </section>
      </main>

      {pageState === "processing" && (
        <div className="voice-recording-modal-overlay">
          <div
            ref={modalRef}
            className="voice-recording-modal voice-recording-modal--processing"
            role="dialog"
            aria-modal="true"
            aria-labelledby={PROCESSING_MODAL_TITLE_ID}
            aria-describedby={PROCESSING_MODAL_DESC_ID}
            tabIndex={-1}
          >
            <div className="voice-recording-modal__text-wrap">
              <p
                id={PROCESSING_MODAL_TITLE_ID}
                className="voice-recording-modal__title"
              >
                녹음하신 음성을 분석하고 있어요
              </p>
              <p
                id={PROCESSING_MODAL_DESC_ID}
                className="voice-recording-modal__desc"
              >
                잠시만 기다려주세요.
              </p>
            </div>

            <div className="voice-recording-modal__progress-wrap">
              <div className="voice-recording-modal__progress-track">
                <div
                  className="voice-recording-modal__progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="voice-recording-modal__progress-text">{progress}%</p>
            </div>
          </div>
        </div>
      )}

      {pageState === "done" && (
        <div className="voice-recording-modal-overlay">
          <div
            ref={modalRef}
            className="voice-recording-modal voice-recording-modal--done"
            role="dialog"
            aria-modal="true"
            aria-labelledby={DONE_MODAL_TITLE_ID}
            aria-describedby={DONE_MODAL_DESC_ID}
            tabIndex={-1}
          >
            <div className="voice-recording-modal__done-icon">✓</div>
            <p
              id={DONE_MODAL_TITLE_ID}
              className="voice-recording-modal__title voice-recording-modal__title--center"
            >
              분석이 완료됐어요
            </p>
            <p
              id={DONE_MODAL_DESC_ID}
              className="voice-recording-modal__desc voice-recording-modal__desc--center"
            >
              이제 발표 연습모드에서 맞춤 피드백을 받아보세요.
            </p>
            <button
              type="button"
              className="voice-recording-card__primary-btn"
              onClick={handleGoScript}
            >
              발표 연습 시작하기
            </button>
          </div>
        </div>
      )}

      {pageState === "later-warning" && (
        <div className="voice-recording-modal-overlay">
          <div
            ref={modalRef}
            className="voice-recording-modal voice-recording-modal--warning"
            role="dialog"
            aria-modal="true"
            aria-labelledby={WARNING_MODAL_TITLE_ID}
            aria-describedby={WARNING_MODAL_DESC_ID}
            tabIndex={-1}
          >
            <div className="voice-recording-modal__warning-header">
              <span className="voice-recording-modal__warning-icon">⚠</span>
              <p
                id={WARNING_MODAL_TITLE_ID}
                className="voice-recording-modal__warning-title"
              >
                음성 분석이 필요해요
              </p>
            </div>

            <div
              id={WARNING_MODAL_DESC_ID}
              className="voice-recording-modal__warning-copy"
            >
              <p>맞춤 피드백을 위해 짧은 예문 녹음이 필요해요.</p>
              <p>발표 스타일을 분석해 맞춤 가이드를 제공해드릴게요.</p>
            </div>

            <p className="voice-recording-modal__warning-subcopy">
              지금 건너뛰면 연습 시작 전에 다시 안내해드릴게요.
            </p>

            <button
              type="button"
              className="voice-recording-card__primary-btn voice-recording-card__primary-btn--full"
              onClick={handleCloseLaterWarning}
            >
              지금 녹음하기
            </button>

            <button
              type="button"
              className="voice-recording-card__link-btn"
              onClick={handleGoLanding}
            >
              나중에 하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
