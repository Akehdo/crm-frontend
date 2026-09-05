import { Loader2, Search } from "lucide-react";
import { FormEvent } from "react";
import { PanelHeader } from "../../../shared/components/PanelHeader";
import type { RecordEntity } from "../../records/types";
import { SavingState } from "../hooks/useParcelsDashboard";
import { Parcel } from "../types";
import { ParcelPreview } from "./ParcelPreview";

type ParcelSearchPanelProps = {
  selectedParcel: Parcel | null;
  selectedRecord: RecordEntity | null;
  saving: SavingState;
  track: string;
  onRecordOpen: (record: RecordEntity) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
  onTrackChange: (value: string) => void;
};

export function ParcelSearchPanel({
  selectedParcel,
  selectedRecord,
  saving,
  track,
  onRecordOpen,
  onSubmit,
  onTrackChange,
}: ParcelSearchPanelProps): JSX.Element {
  return (
    <div className="panel search-panel" id="parcel-search-panel">
      <PanelHeader icon={<Search size={18} />} title="Поиск" />
      <form onSubmit={onSubmit} className="search-form">
        <input
          value={track}
          onChange={(event) => onTrackChange(event.target.value)}
          placeholder="Трек-номер"
        />
        <button
          className="icon-button"
          disabled={saving === "search"}
          type="submit"
          title="Найти"
        >
          {saving === "search" ? (
            <Loader2 className="spin" size={18} />
          ) : (
            <Search size={18} />
          )}
        </button>
      </form>
      {selectedParcel && (
        <ParcelPreview
          parcel={selectedParcel}
          record={selectedRecord}
          onRecordOpen={onRecordOpen}
        />
      )}
    </div>
  );
}
