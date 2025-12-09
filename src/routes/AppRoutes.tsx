import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoutes";
import { EmployeeProtectedRoute } from "./EmployeeProtectedRoute";
import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";
import { LandingPage } from "../pages/LandingPage/LandingPage";
import { Layout } from "../components/layout/Layout/Layout";
import { Dashboard } from "../components/dashboard/Dashboard";
import CRM from "../pages/CRM/CRM";
import RH from "../pages/RH/RH";
import Estoque from "../pages/Estoque/Estoque";
import History from "../pages/History/History";
import Profile from "../pages/Profile/Profile";
import ContactInfo from "../pages/ContactInfo/ContactInfo";
import PDV from "../pages/PDV/PDV";
import AreaCliente from "../pages/AreaCliente/AreaCliente";
import GestaoFinanceira from "../pages/GestaoFinanceira/GestaoFinanceira";
import PlanosLavagem from "../pages/PlanosLavagem/PlanosLavagem";

export const AppRoutes = () => {

  const Seguranca = () => {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Segurança e Backups</h1>
        <p>Configurações de segurança e backups do sistema</p>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path={paths.home} element={<LandingPage />} />
        <Route path={paths.landing} element={<LandingPage />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route
          path={paths.dashboard}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.areaCliente}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <AreaCliente />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.pdv}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <PDV />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.crm}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <CRM />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.gestaoFinanceira}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <GestaoFinanceira />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.recursosHumanos}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <RH />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.estoque}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <Estoque />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.planosLavagem}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <PlanosLavagem />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.seguranca}
          element={
            <EmployeeProtectedRoute>
              <Layout>
                <Seguranca />
              </Layout>
            </EmployeeProtectedRoute>
          }
        />
        <Route
          path={paths.history}
          element={
            <ProtectedRoute>
              <Layout>
                <History />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.profile}
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.contactInfo}
          element={
            <ProtectedRoute>
              <Layout>
                <ContactInfo />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
