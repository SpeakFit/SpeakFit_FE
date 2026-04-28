// src/components/Layout.tsx
import { Outlet } from "react-router-dom";
import Footer from "./common/Footer/Footer";
import "../styles/layout.css";

const Layout = () => {
  return (
    <div className="layout">
      <main className="layout__main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
