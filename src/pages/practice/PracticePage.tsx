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
  getPracticeReport,
  inputPracticeInfo,
  selectPracticeStyle,
  startPractice as requestStartPractice,
  stopPractice,
  type PracticeContentItem,
  type StartPracticeSentence,
  type PracticeReportResponse,
  type PracticeSentenceResponse,
  type SpeechStyle,
} from "../../api/practice";
import { getScript } from "../../api/scripts";
import type {
  FeedbackIssue,
  FeedbackMetric,
  FeedbackMetricId,
  IntroFormState,
  PracticeFeedbackReport,
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

const DEFAULT_FEEDBACK_METRICS: [FeedbackMetric, ...FeedbackMetric[]] = [
  {
    id: "speech-rate",
    label: "발화 속도",
    value: "조금 느림",
    badge: "90wpm",
    initial: "S",
    tone: "slate",
  },
  {
    id: "voice-energy",
    label: "음성 에너지",
    value: "낮음",
    badge: "에너지 부족",
    initial: "E",
    tone: "amber",
  },
  {
    id: "pause",
    label: "멈춤 구간",
    value: "주의",
    badge: "2초+ 멈춤",
    initial: "P",
    tone: "amber",
  },
  {
    id: "emphasis",
    label: "강조 표현",
    value: "낮음",
    badge: "강조 부족",
    initial: "M",
    tone: "violet",
  },
  {
    id: "clarity",
    label: "발음 명료도",
    value: "불명확",
    badge: "ZCR 0.08",
    initial: "M",
    tone: "green",
  },
];

const DEFAULT_FEEDBACK_ISSUES: FeedbackIssue[] = [
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

const DEFAULT_FEEDBACK_REPORT: PracticeFeedbackReport = {
  script: SCRIPT_TEXT,
  goalPercent: 67,
  summary:
    "전반적으로 안정적인 발화였지만, 강조 표현과 발음 명료도가 부족해 전달력이 다소 약하게 느껴졌습니다.",
  tip: "핵심 키워드를 더 강조하고 문장 끝에서 짧게 멈추면 전달력이 좋아집니다.",
  metrics: DEFAULT_FEEDBACK_METRICS,
  issues: DEFAULT_FEEDBACK_ISSUES,
};

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

function getFallbackMetric(index: number) {
  return DEFAULT_FEEDBACK_METRICS[index] ?? DEFAULT_FEEDBACK_METRICS[0];
}

function formatNumber(value: number | undefined, suffix: string, fractionDigits = 1) {
  if (value === undefined || !Number.isFinite(value)) return undefined;

  return `${Number(value.toFixed(fractionDigits))}${suffix}`;
}

function formatDiff(value: number | undefined, suffix: string) {
  if (value === undefined || !Number.isFinite(value)) return undefined;

  const sign = value > 0 ? "+" : "";
  return `${sign}${Number(value.toFixed(1))}${suffix}`;
}

function formatGoalPercent(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    return DEFAULT_FEEDBACK_REPORT.goalPercent;
  }

  const percent = value <= 1 ? value * 100 : value;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

function mapMetricId(value: string | undefined, fallbackIndex: number): FeedbackMetricId {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("voice") || normalized.includes("energy")) {
    return "voice-energy";
  }
  if (normalized.includes("pause") || normalized.includes("silence")) {
    return "pause";
  }
  if (normalized.includes("emphasis")) return "emphasis";
  if (normalized.includes("clarity") || normalized.includes("pronunciation")) {
    return "clarity";
  }
  if (normalized.includes("wpm") || normalized.includes("rate")) {
    return "speech-rate";
  }
  if (
    normalized.includes("속도") ||
    normalized.includes("빠르") ||
    normalized.includes("느리")
  ) {
    return "speech-rate";
  }
  if (
    normalized.includes("에너지") ||
    normalized.includes("음량") ||
    normalized.includes("강도")
  ) {
    return "voice-energy";
  }
  if (normalized.includes("멈춤") || normalized.includes("쉼")) return "pause";
  if (normalized.includes("강조") || normalized.includes("기호")) {
    return "emphasis";
  }
  if (normalized.includes("명료") || normalized.includes("발음")) return "clarity";

  return getFallbackMetric(fallbackIndex).id;
}

function getSortedSentences(sentences: PracticeSentenceResponse[] = []) {
  return [...sentences].sort((a, b) => a.index - b.index);
}

function getSentenceExcerpt(
  sentences: PracticeSentenceResponse[],
  startIndex: number | undefined,
) {
  if (startIndex === undefined || sentences.length === 0) return "";

  const sentence =
    sentences.find((item) => item.index === startIndex) ??
    sentences.find((item) => item.index === startIndex + 1) ??
    sentences.find((item) => item.index === startIndex - 1);

  return sentence?.text ?? sentence?.originalText ?? "";
}

function mapPracticeReport(
  report: PracticeReportResponse,
  fallbackScript: string,
): PracticeFeedbackReport {
  const analysis = report.analysis;
  const aiAnalysis = report.aiAnalysis;
  const sentences = getSortedSentences(report.sentences);
  const scriptFromSentences = sentences
    .map((sentence) => sentence.text ?? sentence.originalText ?? "")
    .filter(Boolean)
    .join("\n");
  const metrics: FeedbackMetric[] = [
    {
      ...getFallbackMetric(0),
      value:
        aiAnalysis?.wpmSummary ??
        formatDiff(analysis?.wpm?.diff, "wpm") ??
        "분석 완료",
      badge: formatNumber(analysis?.wpm?.avg, "wpm", 0) ?? getFallbackMetric(0).badge,
    },
    {
      ...getFallbackMetric(1),
      value:
        aiAnalysis?.energySummary ??
        formatDiff(analysis?.intensity?.diff, "dB") ??
        "분석 완료",
      badge:
        formatNumber(analysis?.intensity?.avg, "dB") ?? getFallbackMetric(1).badge,
    },
    {
      ...getFallbackMetric(2),
      value:
        analysis?.pause?.count !== undefined
          ? `${analysis.pause.count}회`
          : "분석 완료",
      badge:
        formatNumber(
          analysis?.pause?.ratio === undefined ? undefined : analysis.pause.ratio * 100,
          "%",
        ) ?? getFallbackMetric(2).badge,
    },
    {
      ...getFallbackMetric(3),
      value: aiAnalysis?.goalSummary ?? "분석 완료",
      badge: "강조 피드백",
    },
    {
      ...getFallbackMetric(4),
      value: formatDiff(analysis?.zcr?.diff, "") ?? "분석 완료",
      badge: formatNumber(analysis?.zcr?.avg, " ZCR", 3) ?? getFallbackMetric(4).badge,
    },
  ];

  const issues =
    report.practiceIssues && report.practiceIssues.length > 0
      ? report.practiceIssues.map((issue, index): FeedbackIssue => {
          const issueText = `${issue.issueSummary ?? ""} ${
            issue.feedbackContent ?? ""
          }`;

          return {
            metricId: mapMetricId(issueText, index),
            excerpt: getSentenceExcerpt(sentences, issue.startIndex),
            title: issue.issueSummary ?? "상세 피드백",
            description: issue.feedbackContent ?? "분석 결과를 확인해보세요.",
          };
        })
      : DEFAULT_FEEDBACK_ISSUES;

  return {
    script: scriptFromSentences || fallbackScript,
    goalPercent: formatGoalPercent(aiAnalysis?.goalSimilarityScore),
    summary: aiAnalysis?.aiSummary ?? DEFAULT_FEEDBACK_REPORT.summary,
    tip:
      aiAnalysis?.goalFeedback ??
      aiAnalysis?.wpmFeedback ??
      aiAnalysis?.energyFeedback ??
      aiAnalysis?.pauseFeedback ??
      aiAnalysis?.symbolFeedback ??
      DEFAULT_FEEDBACK_REPORT.tip,
    metrics,
    issues,
  };
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
  const [practiceSentences, setPracticeSentences] = useState<StartPracticeSentence[]>([]);
  const [practiceContent, setPracticeContent] = useState<PracticeContentItem[]>([]);
  const [speechStyles, setSpeechStyles] = useState<SpeechStyle[]>([]);
  const [stylesError, setStylesError] = useState<string | null>(null);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [isSubmittingPractice, setIsSubmittingPractice] = useState(false);
  const [isFetchingReport, setIsFetchingReport] = useState(false);
  const [feedbackReport, setFeedbackReport] =
    useState<PracticeFeedbackReport | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const reportRequestedRef = useRef(false);
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
    if (stage === "analyzing") return "분석 중";
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
    setFeedbackReport(null);
    reportRequestedRef.current = false;
    setIsSubmittingPractice(true);

    try {
      const startRes = await requestStartPractice(practiceId);
      
      setPracticeSentences(startRes.sentences);
      setPracticeContent(startRes.contentList);

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
      await realtime.connect(practiceId, startRes.scriptWords, startRes.webSocketUrl);
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

  useEffect(() => {
    if (
      !realtime.isAnalysisComplete ||
      !practiceId ||
      stage !== "analyzing" ||
      isFetchingReport ||
      reportRequestedRef.current
    ) {
      return;
    }

    const loadReport = async () => {
      reportRequestedRef.current = true;
      setIsFetchingReport(true);
      setPracticeError(null);
      realtime.disconnect();

      try {
        const report = await getPracticeReport(practiceId);
        setFeedbackReport(mapPracticeReport(report, practiceScript));
        setActiveFeedbackMetric(null);
        setStage("record-finished");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "분석 리포트를 불러오지 못했습니다.";
        setPracticeError(message);
      } finally {
        setIsFetchingReport(false);
      }
    };

    void loadReport();
  }, [
    isFetchingReport,
    practiceId,
    practiceScript,
    realtime,
    realtime.isAnalysisComplete,
    stage,
  ]);

  const handleFinishRecord = async () => {
    try {
      const finalBlob = await stopRecording();
      setActiveFeedbackMetric(null);
      setStage("analyzing");

      if (practiceId && finalBlob) {
        const result = await stopPractice(practiceId, finalBlob, elapsedSeconds);

        if (["ANALYZED", "COMPLETED"].includes(result.status.toUpperCase())) {
          reportRequestedRef.current = true;
          realtime.disconnect();
          setIsFetchingReport(true);
          const report = await getPracticeReport(practiceId);
          setFeedbackReport(mapPracticeReport(report, practiceScript));
          setStage("record-finished");
          setIsFetchingReport(false);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "녹음 종료 처리에 실패했습니다.";
      setPracticeError(message);
      setIsFetchingReport(false);
    }
  };

  const displayedFeedbackReport = feedbackReport ?? {
    ...DEFAULT_FEEDBACK_REPORT,
    script: practiceScript,
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
                script={displayedFeedbackReport.script}
                activeMetricId={activeFeedbackMetric}
                issues={displayedFeedbackReport.issues}
              />

              <FeedbackMetricsPanel
                activeMetricId={activeFeedbackMetric}
                goalPercent={displayedFeedbackReport.goalPercent}
                metrics={displayedFeedbackReport.metrics}
                summary={displayedFeedbackReport.summary}
                tip={displayedFeedbackReport.tip}
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

              <RecordButton onClick={handleFinishRecord} />
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

          {stage === "analyzing" && (
            <button
              className="practice-page__btn practice-page__btn--primary"
              type="button"
              disabled
            >
              {isFetchingReport ? "리포트 불러오는 중" : "분석 중"}
            </button>
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
