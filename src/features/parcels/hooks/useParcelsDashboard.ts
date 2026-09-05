import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { findRecordByTrackNumberRequest } from "../../records/api/recordsApi";
import type { RecordEntity } from "../../records/types";
import { ApiError } from "../../../shared/api/http";
import { usePersistedState } from "../../../shared/hooks/usePersistedState";
import { readableError } from "../../../shared/utils/errors";
import {
  ListMeta,
  ListParcelsResponse,
  Parcel,
  ParcelStatus,
  StatusFilter,
} from "../types";
import { parseTracks } from "../lib/trackNumbers";

export type SavingState = "" | "create" | "status" | "search";

export function useParcelsDashboard() {
  const { api } = useAuth();
  const [filter, setFilter] = usePersistedState<StatusFilter>(
    "crm.parcels.filter",
    "all",
  );
  const [page, setPage] = usePersistedState("crm.parcels.page", 1);
  const [createDraft, setCreateDraft] = usePersistedState(
    "crm.parcels.createDraft",
    "",
  );
  const [statusDraft, setStatusDraft] = usePersistedState(
    "crm.parcels.statusDraft",
    "",
  );
  const [statusTarget, setStatusTarget] = usePersistedState<ParcelStatus>(
    "crm.parcels.statusTarget",
    "shipped",
  );
  const [searchTrack, setSearchTrack] = usePersistedState(
    "crm.parcels.search",
    "",
  );
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [meta, setMeta] = useState<ListMeta>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<RecordEntity | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<SavingState>("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: "20",
    });

    if (filter !== "all") {
      params.set("status", filter);
    }

    return params.toString();
  }, [filter, page]);

  const loadParcels = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await api<ListParcelsResponse>(`/parcels?${query}`);
      setParcels(payload.items ?? []);
      setMeta(payload.meta ?? { page, limit: 20, total: 0, total_pages: 0 });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  }, [api, page, query]);

  useEffect(() => {
    loadParcels();
  }, [loadParcels]);

  const createParcels = async () => {
    const trackNumbers = parseTracks(createDraft);
    if (trackNumbers.length === 0) {
      setError("Добавьте хотя бы один трек-номер.");
      return;
    }

    setSaving("create");
    setError("");
    setNotice("");

    try {
      await api("/parcels", {
        method: "POST",
        body: { track_numbers: trackNumbers },
      });
      setCreateDraft("");
      setNotice(`Добавлено: ${trackNumbers.length}`);
      if (page === 1) {
        await loadParcels();
      } else {
        setPage(1);
      }
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving("");
    }
  };

  const updateStatuses = async () => {
    const trackNumbers = parseTracks(statusDraft);
    if (trackNumbers.length === 0) {
      setError("Добавьте трек-номера для обновления.");
      return;
    }

    setSaving("status");
    setError("");
    setNotice("");

    try {
      await api("/parcels/status", {
        method: "PUT",
        body: { track_numbers: trackNumbers, status: statusTarget },
      });
      setStatusDraft("");
      setNotice(`Обновлено: ${trackNumbers.length}`);
      await loadParcels();
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving("");
    }
  };

  const findTrack = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const track = searchTrack.trim();
    if (!track) {
      setSelectedParcel(null);
      setSelectedRecord(null);
      return;
    }

    setSaving("search");
    setError("");
    setSelectedParcel(null);
    setSelectedRecord(null);

    try {
      const payload = await api<Parcel>(
        `/parcels/${encodeURIComponent(track)}`,
      );
      setSelectedParcel(payload);

      try {
        setSelectedRecord(await findRecordByTrackNumberRequest(api, track));
      } catch {
        setSelectedRecord(null);
      }
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving("");
    }
  };

  const openRecordForParcel = async (
    parcel: Parcel,
    onRecordOpen: (record: RecordEntity) => void,
  ) => {
    setSaving("search");
    setError("");
    setNotice("");
    setSearchTrack(parcel.track_number);
    setSelectedParcel(parcel);
    setSelectedRecord(null);

    try {
      const record = await findRecordByTrackNumberRequest(
        api,
        parcel.track_number,
      );
      setSelectedRecord(record);
      onRecordOpen(record);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotice("Для этой посылки выдача ещё не создана.");
      } else {
        setError(readableError(err));
      }

      requestAnimationFrame(() => {
        document.getElementById("parcel-search-panel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } finally {
      setSaving("");
    }
  };

  return {
    createDraft,
    createParcels,
    error,
    filter,
    findTrack,
    loadParcels,
    loading,
    meta,
    notice,
    openRecordForParcel,
    page,
    parcels,
    saving,
    searchTrack,
    selectedParcel,
    selectedRecord,
    setCreateDraft,
    setFilter,
    setPage,
    setSearchTrack,
    setStatusDraft,
    setStatusTarget,
    statusDraft,
    statusTarget,
    updateStatuses,
  };
}
