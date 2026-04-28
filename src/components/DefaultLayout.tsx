import { Outlet, useLocation } from "react-router-dom";
import Header from "./common/Header/Header";
import PracticeHeader from "./common/Header/PracticeHeader";
import Footer from "./common/Footer/Footer";
import { ROUTES } from "../app/routes.const";
import "../styles/layout.css";

const Layout = () => {
  const location = useLocation();
  const isScriptPage = location.pathname === ROUTES.SCRIPT;

  return (
    <div className="layout">
      {isScriptPage ? <PracticeHeader /> : <Header />}
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
