import { useEffect, useMemo, useState } from "react";
import "./styles/PracticePage.css";
import PracticeTabs from "./components/PracticeTabs";
import ScriptPanel from "./components/ScriptPanel";
import MetricCard from "../../components/common/MetricCard/MetricCard";
import RecordButton from "./components/RecordButton";
import FeedbackMetricsPanel from "./components/FeedbackMetricsPanel";
import FeedbackScriptPanel from "./components/FeedbackScriptPanel";
import PracticeIntroModal from "./components/PracticeIntroModal";
import PracticeStyleModal from "./components/PracticeStyleModal";
import useAudioMeter from "./hooks/useAudioMeter";
import type {
  FeedbackIssue,
  FeedbackMetricId,
  IntroFormState,
  PracticeStage,
  SpeechStyleId,
} from "./types";

const initialForm: IntroFormState = {
  audienceAge: "",
  audienceKnowledge: "",
  speechType: "",
  duration: "",
};

const PRACTICE_TABS = ["스피치 모드", "프레젠테이션 모드"] as const;

const SCRIPT_TEXT = `안녕하세요. 저희는 발표 연습을 돕는 웹 서비스 SpeakFit을 개발하고 있는 팀입니다.
오늘은 저희 프로젝트의 기획 배경과 핵심 기능을 중심으로 발표드리겠습니다.

발표를 준비할 때 대부분의 사람들은 내용 위주로만 연습하고,
자신의 말하기 습관이나 전달력은 객관적으로 확인하기 어렵습니다.

예를 들어, 말을 너무 빠르게 한다거나, 불필요한 추임새를 반복한다거나,
중요한 부분에서 강조가 부족한 문제들이 있지만, 이를 스스로 인식하기는 쉽지 않습니다.

알
알
알알
알알알
알알
`;

const feedbackIssues: FeedbackIssue[] = [
  {
    metricId: "speech-rate",
    excerpt: "발표를 준비할 때 대부분의 사람들은 내용 위주로만 연습하고,",
    title: "발화 속도가 목표보다 조금 느렸습니다.",
    description:
      "핵심 문장 앞에서는 속도를 유지하고, 문장 끝에서만 짧게 쉬면 흐름이 더 자연스러워집니다.",
  },
  {
    metricId: "voice-energy",
    excerpt: "오늘은 저희 프로젝트의 기획 배경과 핵심 기능을 중심으로 발표드리겠습니다.",
    title: "문장 끝 에너지가 낮게 측정되었습니다.",
    description:
      "도입부의 주요 안내 문장은 끝까지 힘을 유지하면 청중이 발표 흐름을 더 쉽게 따라올 수 있습니다.",
  },
  {
    metricId: "pause",
    excerpt: "자신의 말하기 습관이나 전달력은 객관적으로 확인하기 어렵습니다.",
    title: "문장 중간에서 2초 이상의 멈춤이 발생했습니다.",
    description:
      "문장 중간에 흐름이 끊겼습니다. 이어서 말하고 문장 끝에서 0.5~0.5초 정도 자연스럽게 쉬어보세요.",
  },
  {
    metricId: "emphasis",
    excerpt: "중요한 부분에서 강조가 부족한 문제들이 있지만,",
    title: "핵심 문장의 강조가 부족했습니다.",
    description:
      "중요한 단어는 음량이나 억양을 살짝 올려 말하면 메시지가 더 분명하게 전달됩니다.",
  },
  {
    metricId: "clarity",
    excerpt: "발표를 녹음하면 말하기 속도,침묵 구간, 반복 단어, 전체 발표 흐름을 분석",
    title: "일부 구간의 발음 명료도가 낮았습니다.",
    description:
      "긴 나열 문장은 단어 사이를 조금 더 또렷하게 끊어 말하면 인식률과 전달력이 함께 좋아집니다.",
  },
];

export default function PracticePage() {
  const [stage, setStage] = useState<PracticeStage>("intro-modal");
  const [activeTab, setActiveTab] = useState<string>(PRACTICE_TABS[0]);
  const [introForm, setIntroForm] = useState<IntroFormState>(initialForm);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isReadingMarksEnabled, setIsReadingMarksEnabled] = useState(true);
  const [activeFeedbackMetric, setActiveFeedbackMetric] =
    useState<FeedbackMetricId | null>(null);
  const [timeExceededType, setTimeExceededType] = useState<
    "initial" | "periodic" | "max" | null
  >(null);
  const [nextTriggerTime, setNextTriggerTime] = useState<number | null>(null);

  const isIntroComplete = useMemo(() => {
    const durationNumber = Number(introForm.duration);

    return (
      !!introForm.audienceAge &&
      !!introForm.audienceKnowledge &&
      !!introForm.speechType &&
      !!introForm.duration.trim() &&
      durationNumber >= 1 &&
      durationNumber <= 60
    );
  }, [introForm]);

  const {
    status,
    isRecording,
    volumeLevel,
    recordingError,
    startRecording: hookStartRecording,
    pauseRecording: hookPauseRecording,
    resumeRecording: hookResumeRecording,
    stopRecording,
  } = useAudioMeter();

  useEffect(() => {
    if (status !== "recording") return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => {
        const newElapsed = prev + 1;
        const durationNumber = Number(introForm.duration);
        const maxSeconds = durationNumber * 60;
        const totalMax = 3600;

        if (newElapsed >= totalMax) {
          hookPauseRecording();
          setStage("paused");
          setTimeExceededType("max");
          return newElapsed;
        }

        if (nextTriggerTime && newElapsed === nextTriggerTime) {
          hookPauseRecording();
          setStage("paused");

          if (nextTriggerTime === maxSeconds) {
            setTimeExceededType("initial");
          } else {
            setTimeExceededType("periodic");
          }

          return newElapsed;
        }

        return newElapsed;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    status,
    introForm.duration,
    timeExceededType,
    nextTriggerTime,
    hookPauseRecording,
  ]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  }, [elapsedSeconds]);

  const recordingStatusText = useMemo(() => {
    if (stage === "intro-modal" || stage === "style-modal" || stage === "ready")
      return "녹음 전";
    if (stage === "recording") return "녹음 중";
    if (stage === "paused") return "일시정지";
    if (stage === "record-finished") return "녹음 완료";
    return "녹음 전";
  }, [stage]);

  const speechRateDisplay = useMemo(() => {
    // TODO: BE STT 분석 결과 연동
    // - 녹음 완료 후 recordId 기준으로 분석 요청
    // - Analysis_Result.avg_wpm 값을 받아와 표시
    // - 현재는 UI placeholder만 표시
    if (stage === "recording") return "측정 중";
    if (stage === "paused") return "일시정지";
    if (stage === "record-finished") return "분석 중";
    return "--";
  }, [stage]);

  const handleConfirmIntro = () => {
    if (!isIntroComplete) return;
    setStage("style-modal");
  };

  const handlePreviewStyleTts = (styleId: SpeechStyleId) => {
    // TODO: 백엔드 TTS 연동 시 선택한 styleId에 맞는 가이드 음성을 재생
    console.log("TTS preview style", styleId);
  };

  const handleConfirmStyle = (styleId: SpeechStyleId) => {
    // TODO: 백엔드 연동 시 선택한 styleId를 연습 세션 생성 요청에 포함
    console.log("Selected speech style", styleId);
    setStage("ready");
  };

  const startRecording = async () => {
    const durationNumber = Number(introForm.duration);
    const maxSeconds = durationNumber * 60;
    setElapsedSeconds(0);
    setNextTriggerTime(maxSeconds);

    const didStart = await hookStartRecording();
    if (!didStart) {
      setNextTriggerTime(null);
      return;
    }

    setStage("recording");
  };

  const pauseRecording = () => {
    hookPauseRecording();
    setStage("paused");
  };

  const resumeRecording = () => {
    hookResumeRecording();
    setStage("recording");
  };

  const handleFinishRecord = async () => {
    try {
      const finalBlob = await stopRecording();
      setActiveFeedbackMetric(null);
      setStage("record-finished");

      // TODO: 백엔드 연동 후 finalBlob을 FormData로 업로드
      // const formData = new FormData();
      // formData.append("audio", finalBlob, "practice-recording.webm");
      // await uploadPracticeAudio(formData);

      console.log("최종 녹음 Blob", finalBlob);
    } catch (error) {
      console.error("녹음 종료 오류", error);
    }
  };

  return (
    <div className="practice-page">
      <main className="practice-page__content">
        <h1 className="practice-page__title">발표 연습모드</h1>

        <PracticeTabs
          tabs={PRACTICE_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <section
          className={`practice-page__main-grid ${
            stage === "record-finished" ? "practice-page__main-grid--feedback" : ""
          }`}
        >
          {stage === "record-finished" ? (
            <>
              <FeedbackScriptPanel
                title="캡스톤 1차 발표"
                script={SCRIPT_TEXT}
                activeMetricId={activeFeedbackMetric}
                issues={feedbackIssues}
              />

              <FeedbackMetricsPanel
                activeMetricId={activeFeedbackMetric}
                onSelectMetric={setActiveFeedbackMetric}
              />
            </>
          ) : (
            <>
              <ScriptPanel
                title="Title"
                script={SCRIPT_TEXT}
                time={formattedTime}
                isRecording={isRecording}
                statusText={recordingStatusText}
                isReadingMarksEnabled={isReadingMarksEnabled}
                onToggleReadingMarks={setIsReadingMarksEnabled}
              />

              <div className="practice-page__right-column">
                <MetricCard
                  title="발화 속도"
                  value={speechRateDisplay}
                  unit={speechRateDisplay === "--" ? "" : ""}
                  description="녹음 후 백엔드 분석 결과가 표시됩니다."
                  tone="mint"
                  level={0}
                />

                <MetricCard
                  title="목소리 크기"
                  value={String(volumeLevel)}
                  unit="dB"
                  description="녹음 중 실시간으로 표시됩니다."
                  tone="red"
                  level={volumeLevel}
                />
              </div>
            </>
          )}
        </section>

        <div className="practice-page__record-controls">
          {stage === "ready" && <RecordButton onClick={startRecording} />}

          {stage === "recording" && (
            <>
              <button
                className="practice-page__btn practice-page__btn--sub"
                onClick={pauseRecording}
              >
                일시 정지
              </button>

              <button
                className="practice-page__btn practice-page__btn--primary"
                onClick={handleFinishRecord}
              >
                발표 완료
              </button>
            </>
          )}

          {stage === "paused" && (
            <>
              <button
                className="practice-page__btn practice-page__btn--sub"
                onClick={resumeRecording}
              >
                녹음 재개
              </button>

              <button
                className="practice-page__btn practice-page__btn--primary"
                onClick={handleFinishRecord}
              >
                발표 완료
              </button>
            </>
          )}
        </div>

        {recordingError && (
          <p className="practice-page__recording-error">{recordingError}</p>
        )}

        {stage === "intro-modal" && (
          <PracticeIntroModal
            form={introForm}
            onChange={setIntroForm}
            onConfirm={handleConfirmIntro}
            isConfirmEnabled={isIntroComplete}
          />
        )}

        {stage === "style-modal" && (
          <PracticeStyleModal
            recommendedStyle="passionate"
            onPreviewTts={handlePreviewStyleTts}
            onConfirm={handleConfirmStyle}
          />
        )}

        {timeExceededType && (
          <div className="practice-modal-overlay">
            <div className="practice-modal">
              <div className="practice-modal__header">
                <h2>시간 초과 안내</h2>
                <p>
                  {timeExceededType === "initial" &&
                    "예상 시간이 초과되었습니다. 계속해서 연습을 진행하시겠습니까?"}
                  {timeExceededType === "periodic" &&
                    "10분이 지났습니다. 발표를 계속 하겠습니까?"}
                  {timeExceededType === "max" &&
                    "발표 녹음에 대한 최대 사용 시간이 초과되었습니다. 피드백 화면으로 넘어갑니다."}
                </p>
              </div>
              <div className="practice-modal__footer">
                {timeExceededType !== "max" && (
                  <button
                    className="practice-modal__confirm is-enabled"
                    onClick={() => {
                      hookResumeRecording();
                      setStage("recording");
                      setTimeExceededType(null);
                      setNextTriggerTime(elapsedSeconds + 600); // 다음 초과 시점 10분 후로 설정
                    }}
                  >
                    계속하기
                  </button>
                )}
                <button
                  className="practice-modal__confirm is-enabled"
                  onClick={() => {
                    setTimeExceededType(null);
                    handleFinishRecord();
                  }}
                >
                  발표 완료
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
