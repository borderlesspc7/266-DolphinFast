import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoutes";

export const AppRoutes = () => {
  const Home = () => {
    return <div>Home</div>;
  };

  const Login = () => {
    return <div>Login</div>;
  };

  const Register = () => {
    return <div>Register</div>;
  };

  const Menu = () => {
    return <div>Menu</div>;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<Home />} />
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
