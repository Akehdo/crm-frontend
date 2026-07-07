import { useEffect } from "react";
import { AuthPage } from "../features/auth/pages/AuthPage";
import { ParcelOperationsPage } from "../features/parcels/pages/ParcelOperationsPage";
import { ParcelReportsPage } from "../features/parcels/pages/ParcelReportsPage";
import { ParcelSearchPage } from "../features/parcels/pages/ParcelSearchPage";
import { RecordsPage } from "../features/records/pages/RecordsPage";
import { ExpensesPage } from "../features/expenses/pages/ExpensesPage";
import { CashPage } from "../features/cash/pages/CashPage";
import { SessionRestorePage } from "../features/session/pages/SessionRestorePage";
import { useAuth } from "../features/auth/context/AuthContext";
import { AuthenticatedLayout } from "../layouts/AuthenticatedLayout";
import { PublicShell } from "../layouts/PublicShell";
import { ThemeMode } from "../shared/components/ThemeToggle";
import { usePersistedState } from "../shared/hooks/usePersistedState";
import { isWorkspaceModule, WorkspaceModuleKey } from "./modules";

export function AppRoot(): JSX.Element {
  const { bootstrapping, isAuthenticated, sessionMessage } = useAuth();
  const [theme, setTheme] = usePersistedState<ThemeMode>(
    "crm.ui.theme",
    "dark",
  );
  const [activeModule, setActiveModule] = usePersistedState<WorkspaceModuleKey>(
    "crm.workspace.module",
    "operations",
  );
  const safeModule = isWorkspaceModule(activeModule)
    ? activeModule
    : "operations";

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  if (bootstrapping) {
    return (
      <PublicShell theme={theme} onThemeChange={setTheme}>
        <SessionRestorePage />
      </PublicShell>
    );
  }

  if (!isAuthenticated) {
    return (
      <PublicShell theme={theme} onThemeChange={setTheme}>
        <AuthPage sessionMessage={sessionMessage} />
      </PublicShell>
    );
  }

  return (
    <AuthenticatedLayout
      activeModule={safeModule}
      theme={theme}
      onModuleChange={setActiveModule}
      onThemeChange={setTheme}
    >
      {renderWorkspaceModule(safeModule)}
    </AuthenticatedLayout>
  );
}

function renderWorkspaceModule(module: WorkspaceModuleKey): JSX.Element {
  switch (module) {
    case "operations":
      return <ParcelOperationsPage />;
    case "records":
      return <RecordsPage />;
    case "expenses":
      return <ExpensesPage />;
    case "cash":
      return <CashPage />;
    case "search":
      return <ParcelSearchPage />;
    case "reports":
      return <ParcelReportsPage />;
    default:
      return <ParcelOperationsPage />;
  }
}
