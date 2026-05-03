import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
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
import usePracticeRealtime from "./hooks/usePracticeRealtime";
import {
  inputPracticeInfo,
  selectPracticeStyle,
  startPractice as requestStartPractice,
  stopPractice,
  type PracticeContent,
  type SentenceRes,
  type SpeechStyle,
} from "../../api/practice";
import { getScript } from "../../api/scripts";
import type {
  FeedbackIssue,
  FeedbackMetricId,
  IntroFormState,
  PracticeRouteState,
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
const PRACTICE_ROUTE_STATE_KEY = "speakfit_practice_route_state";

const SCRIPT_TEXT = `안녕하세요. 저는 발표 연습을 돕는 서비스 SpeakFit을 개발하고 있는 팀입니다.
오늘은 프로젝트의 기획 배경과 핵심 기능을 중심으로 발표드리겠습니다.

발표를 준비할 때 많은 사람들은 내용 위주로만 연습하고,
자신의 말하기 속도나 전달력을 객관적으로 확인하기 어렵습니다.

예를 들어, 말을 너무 빠르게 하거나 불필요한 추임새를 반복하거나,
중요한 부분에서 강조가 부족한 문제가 있어도 스스로 인식하기 쉽지 않습니다.
`;

const getStoredPracticeRouteState = () => {
  const stateJson = sessionStorage.getItem(PRACTICE_ROUTE_STATE_KEY);

  if (!stateJson) return null;

  try {
    return JSON.parse(stateJson) as PracticeRouteState;
  } catch {
    sessionStorage.removeItem(PRACTICE_ROUTE_STATE_KEY);
    return null;
  }
};

const feedbackIssues: FeedbackIssue[] = [
  {
    metricId: "speech-rate",
    excerpt: "발표를 준비할 때 많은 사람들은 내용 위주로만 연습하고,",
    title: "발화 속도가 목표보다 조금 빨랐습니다.",
    description:
      "핵심 문장 앞에서는 속도를 낮추고 문장 끝에서 짧게 쉬면 흐름이 자연스러워집니다.",
  },
  {
    metricId: "voice-energy",
    excerpt: "오늘은 프로젝트의 기획 배경과 핵심 기능을 중심으로 발표드리겠습니다.",
    title: "문장 끝의 에너지가 낮게 측정되었습니다.",
    description:
      "중요한 안내 문장은 끝까지 힘을 유지하면 청중이 발표 흐름을 더 쉽게 따라올 수 있습니다.",
  },
  {
    metricId: "pause",
    excerpt: "자신의 말하기 속도나 전달력을 객관적으로 확인하기 어렵습니다.",
    title: "문장 중간에서 긴 멈춤이 발생했습니다.",
    description:
      "문장 중간보다 문장 끝에서 0.5초 정도 쉬면 더 자연스럽게 들립니다.",
  },
  {
    metricId: "emphasis",
    excerpt: "중요한 부분에서 강조가 부족한 문제가 있어도",
    title: "핵심 문장의 강조가 부족했습니다.",
    description:
      "중요한 단어는 음량이나 억양을 살짝 올려 말하면 메시지가 더 분명해집니다.",
  },
  {
    metricId: "clarity",
    excerpt: "스스로 인식하기 쉽지 않습니다.",
    title: "일부 구간의 발음 명료도가 낮았습니다.",
    description:
      "긴 문장은 단어 사이를 조금 더 분명하게 띄어 말하면 전달력이 좋아집니다.",
  },
];

function mapAudienceAge(value: IntroFormState["audienceAge"]) {
  switch (value) {
    case "어린이":
      return "CHILD";
    case "청소년":
      return "YOUTH";
    case "성인":
      return "ADULT";
    case "노년":
      return "SENIOR";
    default:
      throw new Error("청중 연령대를 선택해 주세요.");
  }
}

function mapAudienceKnowledge(value: IntroFormState["audienceKnowledge"]) {
  switch (value) {
    case "잘 모름":
      return "LOW";
    case "보통":
      return "MIDDLE";
    case "잘 앎":
      return "HIGH";
    default:
      throw new Error("청중 이해도를 선택해 주세요.");
  }
}

function mapSpeechType(value: IntroFormState["speechType"]) {
  switch (value) {
    case "발표":
      return "PRESENTATION";
    case "면접":
      return "INTERVIEW";
    case "강의":
      return "LECTURE";
    case "토론":
      return "DISCUSSION";
    case "피드백 연습":
      return "FEEDBACKPRACTICE";
    default:
      throw new Error("스피치 유형을 선택해 주세요.");
  }
}

export default function PracticePage() {
  const location = useLocation();
  const routeState =
    (location.state as PracticeRouteState | null) ?? getStoredPracticeRouteState();
  const scriptId = routeState?.scriptId ?? null;
  const [practiceTitle, setPracticeTitle] = useState(routeState?.scriptTitle || "Title");
  const [practiceScript, setPracticeScript] = useState(
    routeState?.scriptContent || SCRIPT_TEXT,
  );
  const [markedScript, setMarkedScript] = useState(
    routeState?.scriptContent || SCRIPT_TEXT,
  );
  const [stage, setStage] = useState<PracticeStage>("intro-modal");
  const [activeTab, setActiveTab] = useState<string>(PRACTICE_TABS[0]);
  const [introForm, setIntroForm] = useState<IntroFormState>(
    routeState?.introForm ?? initialForm
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isReadingMarksEnabled, setIsReadingMarksEnabled] = useState(true);
  const [activeFeedbackMetric, setActiveFeedbackMetric] =
    useState<FeedbackMetricId | null>(null);
  const [timeExceededType, setTimeExceededType] = useState<
    "initial" | "periodic" | "max" | null
  >(null);
  const [nextTriggerTime, setNextTriggerTime] = useState<number | null>(null);
  const [practiceId, setPracticeId] = useState<number | null>(null);
  const [practiceSentences, setPracticeSentences] = useState<SentenceRes[]>([]);
  const [practiceContent, setPracticeContent] = useState<PracticeContent[]>([]);
  const [speechStyles, setSpeechStyles] = useState<SpeechStyle[]>([]);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const realtime = usePracticeRealtime();

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
  } = useAudioMeter({
    onAudioChunk: realtime.sendAudioChunk,
  });

  useEffect(() => {
    return () => {
      previewAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!scriptId) return;

    let isMounted = true;

    const loadScriptDetail = async () => {
      try {
        const script = await getScript(scriptId);

        if (!isMounted) return;

        const content = script.content || routeState?.scriptContent || SCRIPT_TEXT;
        const nextMarkedScript =
          script.markedContent || script.marked_content || content;

        setPracticeTitle(script.title || routeState?.scriptTitle || "Title");
        setPracticeScript(content);
        setMarkedScript(nextMarkedScript);
      } catch (error) {
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : "대본 상세 정보를 불러오지 못했습니다.";
        setPracticeError(message);
      }
    };

    void loadScriptDetail();

    return () => {
      isMounted = false;
    };
  }, [scriptId, routeState?.scriptContent, routeState?.scriptTitle]);

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

  const speechRateWpm = useMemo(() => {
    if (elapsedSeconds <= 0 || realtime.lastReadIndex < 0) return 0;

    return Math.round(((realtime.lastReadIndex + 1) / elapsedSeconds) * 60);
  }, [elapsedSeconds, realtime.lastReadIndex]);

  const speechRateDisplay = useMemo(() => {
    if (stage === "recording" || stage === "paused") {
      return String(speechRateWpm);
    }
    if (stage === "record-finished") return "0";
    return "0";
  }, [speechRateWpm, stage]);

  const speechRateLevel = useMemo(() => {
    return Math.min(100, Math.round((speechRateWpm / 180) * 100));
  }, [speechRateWpm]);

  const handleConfirmIntro = async () => {
    if (!isIntroComplete) return;
    if (!scriptId) {
      setPracticeError("연습을 시작할 대본 정보가 없습니다. 대본 화면에서 다시 시작해 주세요.");
      return;
    }

    setPracticeError(null);
    setIsSubmittingPractice(true);

    try {
      const practice = await inputPracticeInfo(scriptId, {
        audienceType: mapAudienceAge(introForm.audienceAge),
        audienceUnderstanding: mapAudienceKnowledge(
          introForm.audienceKnowledge,
        ),
        speechInformation: mapSpeechType(introForm.speechType),
        targetTime: Number(introForm.duration),
      });

      setPracticeId(practice.practiceId);
      setSpeechStyles(practice.styleList);
      setStylesError(
        practice.styleList.length === 0
          ? "선택 가능한 스피치 스타일이 없습니다."
          : null,
      );
      setStage("style-modal");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "연습 정보 저장에 실패했습니다.";
      setPracticeError(message);
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  const handlePreviewStyleTts = (styleId: SpeechStyleId) => {
    const style = speechStyles.find((item) => item.styleId === styleId);
    const audioUrl = style?.guideAudioUrl ?? style?.sampleAudioUrl;
    if (!audioUrl) return;

    previewAudioRef.current?.pause();
    previewAudioRef.current = new Audio(audioUrl);
    void previewAudioRef.current.play();
  };

  const handleConfirmStyle = async (styleId: SpeechStyleId) => {
    if (!practiceId) {
      setPracticeError("연습 정보가 저장되지 않았습니다. 다시 시도해 주세요.");
      return;
    }

    setPracticeError(null);
    setIsSubmittingPractice(true);

    try {
      await selectPracticeStyle(practiceId, styleId);
      setStage("ready");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "스피치 스타일 선택에 실패했습니다.";
      setPracticeError(message);
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  const startRecording = async () => {
    if (!practiceId) {
      setPracticeError("연습 정보가 저장되지 않았습니다. 다시 시도해 주세요.");
      return;
    }

    setPracticeError(null);
    setIsSubmittingPractice(true);

    try {
      const startRes = await requestStartPractice(practiceId);
      
      setPracticeSentences(startRes.sentences);
      setPracticeContent(startRes.contentList);

      await realtime.connect(startRes.webSocketUrl, startRes.scriptWords);

      const durationNumber = Number(introForm.duration);
      const maxSeconds = durationNumber * 60;
      setElapsedSeconds(0);
      setNextTriggerTime(maxSeconds);

      const didStart = await hookStartRecording();
      if (!didStart) {
        realtime.disconnect();
        setNextTriggerTime(null);
        return;
      }

      setStage("recording");
    } catch (error) {
      realtime.disconnect();
      setStage("ready");
      setNextTriggerTime(null);
      const message =
        error instanceof Error ? error.message : "연습 시작에 실패했습니다.";
      setPracticeError(message);
    } finally {
      setIsSubmittingPractice(false);
    }
  };

  const pauseRecording = () => {
    hookPauseRecording();
    realtime.sendControl("pause");
    setStage("paused");
  };

  const resumeRecording = () => {
    hookResumeRecording();
    realtime.sendControl("resume");
    setStage("recording");
  };

  const handleFinishRecord = async () => {
    try {
      const finalBlob = await stopRecording();
      setActiveFeedbackMetric(null);
      setStage("record-finished");
      realtime.disconnect();

      if (practiceId && finalBlob) {
        await stopPractice(practiceId, finalBlob, elapsedSeconds);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "녹음 종료 처리에 실패했습니다.";
      setPracticeError(message);
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
                title={practiceTitle}
                script={practiceScript}
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
                title={practiceTitle}
                script={practiceScript}
                markedScript={markedScript}
                sentences={practiceSentences}
                contentList={practiceContent}
                lastReadIndex={realtime.lastReadIndex}
                wordFeedbackByIndex={realtime.wordFeedbackByIndex}
                time={formattedTime}
                isRecording={isRecording}
                statusText={recordingStatusText}
                isReadingMarksEnabled={isReadingMarksEnabled}
                realtimeHighlight={realtime.highlight}
                realtimeTranscript={realtime.transcript}
                onToggleReadingMarks={setIsReadingMarksEnabled}
              />

              <div className="practice-page__right-column">
                <MetricCard
                  title="발화 속도"
                  value={speechRateDisplay}
                  unit="WPM"
                  description="녹음 중 실시간 발화 속도가 표시됩니다."
                  tone="mint"
                  level={speechRateLevel}
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
          {stage === "ready" && !isSubmittingPractice && (
            <RecordButton onClick={startRecording} />
          )}

          {isSubmittingPractice && (
            <button
              className="practice-page__btn practice-page__btn--primary"
              type="button"
              disabled
            >
              녹음 준비 중...
            </button>
          )}

          {stage === "recording" && !isSubmittingPractice && (
            <>
              <button
                className="practice-page__btn practice-page__btn--sub"
                onClick={pauseRecording}
              >
                일시정지
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
        {practiceError && (
          <p className="practice-page__recording-error">{practiceError}</p>
        )}
        {realtime.errorMessage && (
          <p className="practice-page__recording-error">
            {realtime.errorMessage}
          </p>
        )}

        {stage === "intro-modal" && (
          <PracticeIntroModal
            form={introForm}
            onChange={setIntroForm}
            onConfirm={handleConfirmIntro}
            isConfirmEnabled={isIntroComplete && !isSubmittingPractice}
          />
        )}

        {stage === "style-modal" && (
          <PracticeStyleModal
            styles={speechStyles}
            isLoading={isSubmittingPractice}
            errorMessage={stylesError}
            onPreviewTts={handlePreviewStyleTts}
            onRetry={handleConfirmIntro}
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
                    "예상 시간을 초과했습니다. 계속해서 연습을 진행하시겠습니까?"}
                  {timeExceededType === "periodic" &&
                    "10분이 지났습니다. 발표를 계속하시겠습니까?"}
                  {timeExceededType === "max" &&
                    "발표 녹음의 최대 사용 시간을 초과했습니다. 피드백 화면으로 이동합니다."}
                </p>
              </div>
              <div className="practice-modal__footer">
                {timeExceededType !== "max" && (
                  <button
                    className="practice-modal__confirm is-enabled"
                    onClick={() => {
                      hookResumeRecording();
                      realtime.sendControl("resume");
                      setStage("recording");
                      setTimeExceededType(null);
                      setNextTriggerTime(elapsedSeconds + 600);
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
