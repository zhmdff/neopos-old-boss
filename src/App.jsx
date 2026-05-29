import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import LandingPage from "./Landing/pages/LandingPage";

// BOSS PANEL IMPORTS
import BossLogin from "./Boss/pages/BossLogin";
import BossLayout from "./Boss/layouts/BossLayout";
import BossDashboardPage from "./Boss/pages/BossDashboardPage";
import ChecksPage from "./Boss/pages/ChecksPage";
import ReportsPage from "./Boss/pages/ReportsPage";
import ReportsByTablesPage from "./Boss/pages/ReportsByTablesPage";
import ReportsByWaitersPage from "./Boss/pages/ReportsByWaitersPage";
import ReportsByProductsPage from "./Boss/pages/ReportsByProductsPage";
import DeletedProductsReportPage from "./Boss/pages/DeletedProductsReportPage";
import CustomersLoyaltyPage from "./Boss/pages/CustomersLoyaltyPage";
import AuditLogs from "./Boss/pages/AuditLogs";
import ShiftsPage from "./Boss/pages/ShiftsPage";
import ShiftExpensesPage from "./Boss/pages/ShiftExpensesPage";
import RolePage from "./Boss/pages/RolePage";
import UsersPage from "./Boss/pages/UsersPage";
import TableTypesPage from "./Boss/pages/TableTypesPage";
import StockHistoryPage from "./Boss/pages/StockHistoryPage";
import PurchasesPage from "./Boss/pages/PurchasesPage";
import WorkshopsPage from "./Boss/pages/WorkshopsPage";
import SuppliersPage from "./Boss/pages/SuppliersPage";
import CategoryPage from "./Boss/pages/CategoryPage";
import ProductPage from "./Boss/pages/ProductPage";
import ProductSortPage from "./Boss/pages/ProductSortPage";
import ProductSetPage from "./Boss/pages/ProductSetPage";
import WarehousesPage from "./Boss/pages/WarehousesPage";
import QRSettings from "./Boss/pages/QRSettings";
import QRCategorySort from "./Boss/pages/QRCategorySort";
import QRProductSort from "./Boss/pages/QRProductSort";
import CompanySettings from "./Boss/pages/CompanySettings";
import IntegrationsPage from "./Boss/pages/IntegrationsPage";
import ReceiptDesignPage from "./Boss/pages/ReceiptDesignPage";
import KitchenPrinterDesignPage from "./Boss/pages/KitchenPrinterDesignPage";
import PaymentMethodsPage from "./Boss/pages/PaymentMethodsPage";
import BossProfilePage from "./Boss/pages/BossProfilePage";

import CustomerMenu from "./QR/pages/CustomerMenu";
import QRProductCatalog from "./QR/pages/QRProductCatalog";
import { parseStoredBossUser, isBossPanelAdmin } from "./utils/bossAdminAuth";

const ProtectedRoute = () => {
  const token = localStorage.getItem("token");
  const user = parseStoredBossUser();

  if (!token || !isBossPanelAdmin(user)) {
    if (token) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    return <Navigate to="/boss/login" replace />;
  }
  return <Outlet />;
};

const router = createBrowserRouter([
  {
    path: "/",
    // element: <LandingPage />,
    element: <BossLogin />,
  },

  {
    path: "/boss/login",
    element: <BossLogin />,
  },

  {
    path: "/boss",
    element: <ProtectedRoute />,
    children: [
      {
        element: <BossLayout />,
        children: [
          { index: true, element: <Navigate to="/boss/dashboard" replace /> },
          { path: "dashboard", element: <BossDashboardPage /> },
          { path: "checks", element: <ChecksPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "reports/tables", element: <ReportsByTablesPage /> },
          { path: "reports/waiters", element: <ReportsByWaitersPage /> },
          { path: "reports/products", element: <ReportsByProductsPage /> },
          { path: "reports/deletions", element: <DeletedProductsReportPage /> },
          { path: "customers-loyalty", element: <CustomersLoyaltyPage /> },
          { path: "shifts", element: <ShiftsPage /> },
          { path: "shift-expenses", element: <ShiftExpensesPage /> },
          { path: "audit-logs", element: <AuditLogs /> },
          { path: "users", element: <UsersPage /> },
          { path: "roles", element: <RolePage /> },
          { path: "table-types", element: <TableTypesPage /> },
          { path: "stock-history", element: <StockHistoryPage /> },
          { path: "purchases", element: <PurchasesPage /> },
          { path: "workshops", element: <WorkshopsPage /> },
          { path: "products", element: <ProductPage /> },
          { path: "products-sort", element: <ProductSortPage /> },
          { path: "categories", element: <CategoryPage /> },
          { path: "product-sets", element: <ProductSetPage /> },
          { path: "business-lunch", element: <ProductSetPage mode="lunch" /> },
          { path: "warehouses", element: <WarehousesPage /> },
          { path: "suppliers", element: <SuppliersPage /> },
          { path: "qr-settings", element: <QRSettings /> },
          { path: "qr-category-sort", element: <QRCategorySort /> },
          { path: "qr-product-sort", element: <QRProductSort /> },
          { path: "company-settings", element: <CompanySettings /> },
          { path: "integrations", element: <IntegrationsPage /> },
          { path: "receipt-design", element: <ReceiptDesignPage /> },
          {
            path: "kitchen-printer-design",
            element: <KitchenPrinterDesignPage />,
          },
          { path: "payment-methods", element: <PaymentMethodsPage /> },
          { path: "profile", element: <BossProfilePage /> },
        ],
      },
    ],
  },

  {
    path: "/q/:slug",
    children: [
      { index: true, element: <CustomerMenu /> },
      { path: "products", element: <QRProductCatalog /> },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
