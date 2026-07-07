import { Parcel } from "../types";
import { StatusBadge } from "./StatusBadge";

type ParcelPreviewProps = {
  parcel: Parcel;
};

export function ParcelPreview({ parcel }: ParcelPreviewProps): JSX.Element {
  return (
    <div className="parcel-preview">
      <span>{parcel.track_number}</span>
      <StatusBadge status={parcel.status} />
    </div>
  );
}
