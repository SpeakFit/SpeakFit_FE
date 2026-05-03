export type PracticeStage =
  | "intro-modal"
  | "style-modal"
  | "ready"
  | "recording"
  | "paused"
  | "analyzing"
  | "record-finished";

export type AudienceAge = "어린이" | "청소년" | "성인" | "노년";
export type AudienceKnowledge = "잘 모름" | "보통" | "잘 앎";
export type SpeechType = "발표" | "면접" | "토론" | "강의" | "피드백 연습";

export type IntroFormState = {
  audienceAge: AudienceAge | "";
  audienceKnowledge: AudienceKnowledge | "";
  speechType: SpeechType | "";
  duration: string;
};

export type PracticeRouteState = {
  scriptId: number;
  scriptTitle: string;
  scriptContent: string;
  introForm: IntroFormState;
};

export type SpeechStyleId = number;

export type FeedbackMetricId =
  | "speech-rate"
  | "voice-energy"
  | "pause"
  | "emphasis"
  | "clarity";

export type FeedbackIssue = {
  metricId: FeedbackMetricId;
  excerpt: string;
  title: string;
  description: string;
};

export type FeedbackMetric = {
  id: FeedbackMetricId;
  label: string;
  value: string;
  badge: string;
  initial: string;
  tone: "slate" | "amber" | "violet" | "green";
};

export type PracticeFeedbackReport = {
  script: string;
  goalPercent: number;
  summary: string;
  tip: string;
  metrics: FeedbackMetric[];
  issues: FeedbackIssue[];
};

export type RealtimeHighlight = {
  wordIndex?: number;
  lineIndex?: number;
  startOffset?: number;
  endOffset?: number;
  text?: string;
  isCorrect?: boolean;
  wordResults?: WordRealtimeFeedback[];
};

export type WordRealtimeFeedback = {
  globalWordIndex: number;
  expectedWord: string;
  spokenWord: string;
  matchScore: number;
  isCorrect: boolean;
};

export type WordFeedback = {
  index: number;
  isCorrect: boolean;
};
