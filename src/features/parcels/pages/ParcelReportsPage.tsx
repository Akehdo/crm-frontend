import { BarChart3, Boxes, PackageCheck } from "lucide-react";
import { PanelHeader } from "../../../shared/components/PanelHeader";
import { ParcelMetrics } from "../components/ParcelMetrics";
import { parcelStatuses } from "../types";
import { useParcelsDashboard } from "../hooks/useParcelsDashboard";

export function ParcelReportsPage(): JSX.Element {
  const parcels = useParcelsDashboard();

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="eyebrow">Контроль</div>
          <h1>Отчёты</h1>
        </div>
      </header>

      <ParcelMetrics
        meta={parcels.meta}
        visibleCount={parcels.parcels.length}
      />

      <section className="report-grid">
        <div className="panel report-panel">
          <PanelHeader icon={<BarChart3 size={18} />} title="Поток" />
          <div className="status-stack">
            <div className="status-row">
              <span>Всего</span>
              <strong>{parcels.meta.total}</strong>
            </div>
            <div className="status-row">
              <span>На странице</span>
              <strong>{parcels.parcels.length}</strong>
            </div>
          </div>
        </div>

        <div className="panel report-panel">
          <PanelHeader icon={<PackageCheck size={18} />} title="Статусы" />
          <div className="status-stack">
            {parcelStatuses.map((status) => (
              <div className="status-row" key={status.value}>
                <span>{status.label}</span>
                <strong>
                  {
                    parcels.parcels.filter(
                      (parcel) => parcel.status === status.value,
                    ).length
                  }
                </strong>
              </div>
            ))}
          </div>
        </div>

        <div className="panel report-panel">
          <PanelHeader icon={<Boxes size={18} />} title="Выборка" />
          <div className="status-row">
            <span>Текущий фильтр</span>
            <strong>{parcels.filter === "all" ? "Все" : parcels.filter}</strong>
          </div>
          <div className="status-row">
            <span>Лимит</span>
            <strong>{parcels.meta.limit}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
