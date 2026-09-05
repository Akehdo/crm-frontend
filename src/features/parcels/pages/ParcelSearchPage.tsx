import { ParcelMessages } from "../components/ParcelMessages";
import { ParcelSearchPanel } from "../components/ParcelSearchPanel";
import { ParcelTablePanel } from "../components/ParcelTablePanel";
import { useParcelsDashboard } from "../hooks/useParcelsDashboard";
import type { RecordEntity } from "../../records/types";

type ParcelSearchPageProps = {
  onRecordOpen: (record: RecordEntity) => void;
};

export function ParcelSearchPage({
  onRecordOpen,
}: ParcelSearchPageProps): JSX.Element {
  const parcels = useParcelsDashboard();

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="eyebrow">Точный поиск</div>
          <h1>Поиск</h1>
        </div>
      </header>

      <section className="single-column-grid">
        <ParcelSearchPanel
          selectedParcel={parcels.selectedParcel}
          selectedRecord={parcels.selectedRecord}
          saving={parcels.saving}
          track={parcels.searchTrack}
          onRecordOpen={onRecordOpen}
          onSubmit={parcels.findTrack}
          onTrackChange={parcels.setSearchTrack}
        />
      </section>

      <ParcelMessages error={parcels.error} notice={parcels.notice} />

      <ParcelTablePanel
        filter={parcels.filter}
        loading={parcels.loading}
        meta={parcels.meta}
        page={parcels.page}
        parcels={parcels.parcels}
        setFilter={parcels.setFilter}
        setPage={parcels.setPage}
        onParcelOpen={(parcel) =>
          parcels.openRecordForParcel(parcel, onRecordOpen)
        }
      />
    </main>
  );
}
