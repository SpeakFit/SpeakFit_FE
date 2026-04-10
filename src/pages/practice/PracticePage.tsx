import { useMemo, useState, useEffect } from "react";
import "./styles/PracticePage.css";
import PracticeTabs from "./components/PracticeTabs";
import ScriptPanel from "./components/ScriptPanel";
import MetricCard from "@/components/common/MetricCard/MetricCard.tsx";
import RecordButton from "./components/RecordButton";
import PracticeIntroModal from "./components/PracticeIntroModal";
import useAudioMeter from "./hooks/useAudioMeter";
import type { IntroFormState, PracticeStage } from "./types";

const initialForm: IntroFormState = {
  audienceAge: "",
  audienceKnowledge: "",
  speechType: "",
  duration: "",
};

const PRACTICE_TABS = ["스피치 모드", "프레젠테이션 모드"] as const;

export default function PracticePage() {
  const [stage, setStage] = useState<PracticeStage>("intro-modal");
  const [activeTab, setActiveTab] = useState<string>(PRACTICE_TABS[0]);
  const [introForm, setIntroForm] = useState<IntroFormState>(initialForm);
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (stage !== "recording") return;

    const timer = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [elapsedSeconds]);

  // 임시값: 나중에 실제 발화속도 계산 로직 붙이면 됨
  const [speechRate, setSpeechRate] = useState<number | null>(null);

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

  const { isRecording, volumeLevel, startRecording, stopRecording } =
    useAudioMeter();

  const handleRecordClick = async () => {
    if (stage === "intro-modal") return;

    if (isRecording) {
      stopRecording();
      setStage("record-finished");
      setSpeechRate(0); // 임시 초기화
      return;
    }

    try {
      await startRecording();
      setStage("recording");

      // 임시 데모값
      setSpeechRate(132);
    } catch (error) {
      console.error("마이크 권한 오류", error);
    }
  };
  const speechRateDisplay = useMemo(() => {
    if (stage === "recording") return "측정 중...";
    if (stage === "record-finished") return "분석 중...";
    if (speechRate !== null) return String(speechRate);
    return "--";
  }, [stage, speechRate]);

  const handleConfirmIntro = () => {
    if (!isIntroComplete) return;
    setStage("ready");
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

        <section className="practice-page__main-grid">
          <ScriptPanel
            title="Title"
            script={`안녕하세요. 저희는 발표 연습을 돕는 웹 서비스 SpeakFit을 개발하고 있는 팀입니다.
오늘은 저희 프로젝트의 기획 배경과 핵심 기능을 중심으로 발표드리겠습니다.

발표를 준비할 때 대부분의 사람들은 내용 위주로만 연습하고,
자신의 말하기 습관이나 전달력은 객관적으로 확인하기 어렵습니다.

예를 들어, 말을 너무 빠르게 한다거나, 불필요한 추임새를 반복한다거나,
중요한 부분에서 강조가 부족한 문제들이 있지만, 이를 스스로 인식하기는 쉽지 않습니다.
dfdfd
BirthDateFieldd
BirthDateField
BirthDateField`}
            isRecording={isRecording}
            time={formattedTime}
          />

          <div className="practice-page__right-column">
            <MetricCard
              title="발화 속도"
              value={speechRateDisplay}
              unit={speechRate ? "WPM" : ""}
              description="녹음 후 분석 결과가 표시됩니다."
              tone="mint"
              level={speechRate ? Math.min(100, Math.round((speechRate / 180) * 100)) : 0}
            />

            <MetricCard
              title="목소리 크기"
              value={String(volumeLevel)}
              unit="dB"
              description="녹음을 시작하면 데시벨이 측정됩니다."
              tone="red"
              level={Math.min(100, volumeLevel)}
            />

            <RecordButton
              isRecording={isRecording}
              onStart={handleRecordClick}
              onStop={handleRecordClick}
            />
          </div>
        </section>

        {stage === "intro-modal" && (
          <PracticeIntroModal
            form={introForm}
            onChange={setIntroForm}
            onConfirm={handleConfirmIntro}
            isConfirmEnabled={isIntroComplete}
          />
        )}
      </main>
    </div>
  );
}
