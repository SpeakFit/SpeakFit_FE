import { Outlet } from "react-router-dom";
import PracticeHeader from "./common/Header/PracticeHeader";

export default function PracticeLayout() {
  return (
    <>
      <PracticeHeader />
      <main>
        <Outlet />
      </main>
    </>
  );
}