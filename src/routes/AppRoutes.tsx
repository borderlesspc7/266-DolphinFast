import { BrowserRouter, Routes, Route } from "react-router-dom";
import { paths } from "./paths";
import { ProtectedRoute } from "./ProtectedRoutes";
import { Login } from "../pages/Login/Login";
import { Register } from "../pages/Register/Register";
import { Layout } from "../components/layout/Layout/Layout";
import { Dashboard } from "../components/dashboard/Dashboard";
import CRM from "../pages/CRM/CRM";
import RH from "../pages/RH/RH";

export const AppRoutes = () => {
  const AreaCliente = () => {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Área do Cliente</h1>
        <p>Gerenciamento de clientes e relacionamento</p>
      </div>
    );
  };

  const PDV = () => {
    return (
      <div style={{ padding: "20px" }}>
        <h1>PDV</h1>
        <p>Ponto de venda e controle de transações</p>
      </div>
    );
  };

  const GestaoFinanceira = () => {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Gestão Financeira e Contábil</h1>
        <p>Controle financeiro e contabilidade</p>
      </div>
    );
  };

  const Estoque = () => {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Estoque</h1>
        <p>Controle de inventário e produtos</p>
      </div>
    );
  };

  const PlanosLavagem = () => {
    return (
      <div style={{ padding: "20px" }}>
        <h1>Planos de Lavagem</h1>
        <p>Gerenciamento de planos e serviços de lavagem</p>
      </div>
    );
  };

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
        <Route path={paths.home} element={<Login />} />
        <Route path={paths.login} element={<Login />} />
        <Route path={paths.register} element={<Register />} />
        <Route
          path={paths.dashboard}
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.areaCliente}
          element={
            <ProtectedRoute>
              <Layout>
                <AreaCliente />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.pdv}
          element={
            <ProtectedRoute>
              <Layout>
                <PDV />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.crm}
          element={
            <ProtectedRoute>
              <Layout>
                <CRM />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.gestaoFinanceira}
          element={
            <ProtectedRoute>
              <Layout>
                <GestaoFinanceira />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.recursosHumanos}
          element={
            <ProtectedRoute>
              <Layout>
                <RH />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.estoque}
          element={
            <ProtectedRoute>
              <Layout>
                <Estoque />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.planosLavagem}
          element={
            <ProtectedRoute>
              <Layout>
                <PlanosLavagem />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path={paths.seguranca}
          element={
            <ProtectedRoute>
              <Layout>
                <Seguranca />
              </Layout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
