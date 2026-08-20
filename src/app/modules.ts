import {
  Banknote,
  Boxes,
  PackagePlus,
  ReceiptText,
  Search,
  Wallet,
  LucideIcon,
} from "lucide-react";

export type WorkspaceModuleKey =
  "operations" | "records" | "expenses" | "cash" | "search";

export type WorkspaceModule = {
  key: WorkspaceModuleKey;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const workspaceModules: WorkspaceModule[] = [
  {
    key: "operations",
    label: "Операции",
    description: "Массовые действия",
    icon: PackagePlus,
  },
  {
    key: "records",
    label: "Записи",
    description: "Создание записей",
    icon: ReceiptText,
  },
  {
    key: "expenses",
    label: "Расходы",
    description: "Списания и траты",
    icon: Wallet,
  },
  {
    key: "cash",
    label: "Касса",
    description: "Баланс и операции",
    icon: Banknote,
  },
  {
    key: "search",
    label: "Поиск",
    description: "Трек-номер и выборка",
    icon: Search,
  },
];

export const workspaceBrandIcon = Boxes;

export function isWorkspaceModule(value: string): value is WorkspaceModuleKey {
  return workspaceModules.some((module) => module.key === value);
}
