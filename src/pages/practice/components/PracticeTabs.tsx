type PracticeTabsProps = {
  tabs: readonly string[];
  activeTab: string;
  onChange: (tab: string) => void;
};

export default function PracticeTabs({
  tabs,
  activeTab,
  onChange,
}: PracticeTabsProps) {
  return (
    <div className="practice-tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`practice-tabs__button ${
            activeTab === tab ? "is-active" : ""
          }`}
          type="button"
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}