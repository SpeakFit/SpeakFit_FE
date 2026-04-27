import { Outlet } from "react-router-dom";
import PracticeHeader from "./common/Header/PracticeHeader";
import PracticeFooter from "./common/Footer/PracticeFooter";

export default function PracticeLayout() {
  return (
    <>
      <PracticeHeader />
      <main>
        <Outlet />
      </main>
      <PracticeFooter/>
    </>
  );
}