import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoutes";
import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";

export const AppRoutes = () => {
  const Menu = () => {
    return <div>Menu</div>;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<Login />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route
          path={paths.menu}
          element={
            <ProtectedRoute>
              <Menu />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
