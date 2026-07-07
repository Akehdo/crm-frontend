import { LogOut } from "lucide-react";
import { ReactNode } from "react";
import { ThemeMode, ThemeToggle } from "../shared/components/ThemeToggle";
import { useAuth } from "../features/auth/context/AuthContext";
import {
  WorkspaceModuleKey,
  workspaceBrandIcon,
  workspaceModules,
} from "../app/modules";

type AuthenticatedLayoutProps = {
  activeModule: WorkspaceModuleKey;
  children: ReactNode;
  theme: ThemeMode;
  onModuleChange: (module: WorkspaceModuleKey) => void;
  onThemeChange: (theme: ThemeMode) => void;
};

export function AuthenticatedLayout({
  activeModule,
  children,
  theme,
  onModuleChange,
  onThemeChange,
}: AuthenticatedLayoutProps): JSX.Element {
  const { logout } = useAuth();
  const BrandIcon = workspaceBrandIcon;

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <BrandIcon size={22} />
          </div>
          <div>
            <strong>CRM Parcels</strong>
            <span>операционная панель</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Модули CRM">
          {workspaceModules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                className={activeModule === module.key ? "active" : ""}
                key={module.key}
                type="button"
                onClick={() => onModuleChange(module.key)}
              >
                <Icon size={18} />
                <span>
                  <strong>{module.label}</strong>
                  <small>{module.description}</small>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ThemeToggle theme={theme} onChange={onThemeChange} />
          <button
            className="icon-button"
            type="button"
            title="Выйти"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <section className="workspace-content">{children}</section>
    </div>
  );
}
