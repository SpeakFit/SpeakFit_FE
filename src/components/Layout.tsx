// src/components/Layout.tsx
import { Outlet, Link } from "react-router-dom";
import { ROUTES } from "../app/routes";

const Layout = () => {
  return (
    <div>
      <header style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
        <Link to={ROUTES.LANDING} style={{ marginRight: 12 }}>
          SpeakFit
        </Link>
        <Link to={ROUTES.LOGIN}>Login</Link>
      </header>

      <main style={{ padding: "24px" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
