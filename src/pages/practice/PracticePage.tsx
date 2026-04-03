import { useState } from "react";
import "./styles/PracticePage.css";
import PracticeTabs from "./components/PracticeTabs";
import ScriptPanel from "./components/ScriptPanel";
import MetricCard from "./components/MetricCard";
import RecordButton from "./components/RecordButton";
import type { PracticeStage } from "./types";

export default function PracticePage() {
  const PRACTICE_TABS = ["스피치 모드", "프레젠테이션 모드"] as const;
  const [stage, setStage] = useState<PracticeStage>("ready");
  const [activeTab, setActiveTab] = useState<string>(PRACTICE_TABS[0]);

  const handleStartRecord = () => {
    setStage("recording");
  };

  const handleStopRecord = () => {
    setStage("record-finished");
  };

  return (
    <div className="practice-page">
      {/* 본문 */}
      <main className="practice-page__content">
        <h1 className="practice-page__title">발표 연습모드</h1>

        <PracticeTabs
          tabs={PRACTICE_TABS}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <section className="practice-page__main-grid">
          {/* 왼쪽 스크립트 */}
          <ScriptPanel
            title="Title"
            script={`안녕하세요. 저희는 발표 연습을 돕는 웹 서비스 SpeakFit을 개발하고 있는 팀입니다.
오늘은 저희 프로젝트의 기획 배경과 핵심 기능을 중심으로 발표드리겠습니다.

발표를 준비할 때 대부분의 사람들은 내용 위주로만 연습하고,
자신의 말하기 습관이나 전달력은 객관적으로 확인하기 어렵습니다.

예를 들어, 말을 너무 빠르게 한다거나, 불필요한 추임새를 반복한다거나,
중요한 부분에서 강조가 부족한 문제들이 있지만, 이를 스스로 인식하기는 쉽지 않습니다.`}
            isRecording={stage === "recording"}
          />

          {/* 오른쪽 지표 */}
          <div className="practice-page__right-column">
            <MetricCard
              title="발화 속도"
              value="0"
              unit="WPM"
              description="녹음을 시작하면 발화 속도가 측정됩니다."
              tone="mint"
            />
            <MetricCard
              title="목소리 크기"
              value="0"
              unit="dB"
              description="녹음을 시작하면 데시벨이 측정됩니다."
              tone="red"
            />
          </div>
        </section>

        {/* 녹음 버튼 */}
        <RecordButton
          isRecording={stage === "recording"}
          onStart={handleStartRecord}
          onStop={handleStopRecord}
        />
      </main>
    </div>
  );
}