import { formatDate } from "../../../shared/utils/date";
import { Parcel } from "../types";
import { StatusBadge } from "./StatusBadge";

type ParcelPreviewProps = {
  parcel: Parcel;
};

export function ParcelPreview({ parcel }: ParcelPreviewProps): JSX.Element {
  return (
    <div className="parcel-preview">
      <span className="parcel-preview-track">{parcel.track_number}</span>
      <div className="parcel-preview-meta">
        <StatusBadge status={parcel.status} />
        {parcel.status === "issued" && (
          <span className="parcel-issued-date">
            Дата выдачи: {formatDate(parcel.updated_at)}
          </span>
        )}
      </div>
    </div>
  );
}
