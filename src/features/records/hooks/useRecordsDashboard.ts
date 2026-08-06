import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { usePersistedState } from "../../../shared/hooks/usePersistedState";
import { readableError } from "../../../shared/utils/errors";
import {
  createRecordRequest,
  deleteRecordRequest,
  listDailyTrackNumbersRequest,
  listRecordsRequest,
  updateRecordRequest,
} from "../api/recordsApi";
import { parseRecordTracks } from "../lib/trackNumbers";
import {
  calculateTotalPrice,
  totalPriceToUnitPrice,
} from "../lib/recordForm";
import type {
  CreateRecordDraft,
  CreateRecordPayload,
  ListMeta,
  PaymentDraft,
  PaymentFilter,
  RecordEntity,
  RecordPayment,
  UpdateRecordDraft,
  UpdateRecordPayload,
} from "../types";
import {
  initialPaymentDraft,
  initialRecordDraft,
  initialUpdateRecordDraft,
} from "../types";

export type RecordSavingState = "" | "create" | "update" | "delete";

type PayloadResult<TPayload> =
  { ok: true; payload: TPayload } | { ok: false; error: string };

export function useRecordsDashboard() {
  const { api } = useAuth();
  const [createDraft, setCreateDraft] = usePersistedState<CreateRecordDraft>(
    "crm.records.createDraft",
    initialRecordDraft,
  );
  const [updateDraft, setUpdateDraft] = usePersistedState<UpdateRecordDraft>(
    "crm.records.updateDraft",
    initialUpdateRecordDraft,
  );
  const [filter, setFilter] = usePersistedState<PaymentFilter>(
    "crm.records.paymentFilter",
    "all",
  );
  const [page, setPage] = usePersistedState("crm.records.page", 1);
  const [records, setRecords] = useState<RecordEntity[]>([]);
  const [meta, setMeta] = useState<ListMeta>({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<RecordSavingState>("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [dailyTracksOpen, setDailyTracksOpen] = useState(false);
  const [dailyTrackDate, setDailyTrackDate] = useState(currentLocalDate);
  const [dailyTrackNumbers, setDailyTrackNumbers] = useState<string[]>([]);
  const [dailyTracksLoading, setDailyTracksLoading] = useState(false);
  const [dailyTracksError, setDailyTracksError] = useState("");
  const normalizedCreateDraft = normalizeCreateRecordDraft(createDraft);
  const normalizedUpdateDraft = normalizeUpdateRecordDraft(updateDraft);

  const changeCreateDraft = (patch: Partial<CreateRecordDraft>) => {
    setCreateDraft((current) => ({
      ...normalizeCreateRecordDraft(current),
      ...patch,
    }));
  };

  const changeUpdateDraft = (patch: Partial<UpdateRecordDraft>) => {
    setUpdateDraft((current) => ({
      ...normalizeUpdateRecordDraft(current),
      ...patch,
    }));
  };

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await listRecordsRequest(api, {
        page,
        paymentType: filter,
      });
      setRecords(payload.items ?? []);
      setMeta(payload.meta ?? { page, limit: 20, total: 0, total_pages: 0 });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  }, [api, filter, page]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const loadDailyTrackNumbers = async (date = dailyTrackDate) => {
    setDailyTracksLoading(true);
    setDailyTracksError("");

    try {
      const payload = await listDailyTrackNumbersRequest(api, date);
      setDailyTrackNumbers(payload.track_numbers ?? []);
    } catch (err) {
      setDailyTrackNumbers([]);
      setDailyTracksError(readableError(err));
    } finally {
      setDailyTracksLoading(false);
    }
  };

  const openDailyTracks = async () => {
    setDailyTracksOpen(true);
    await loadDailyTrackNumbers();
  };

  const changeDailyTrackDate = (date: string) => {
    setDailyTrackDate(date);
    setDailyTrackNumbers([]);
    setDailyTracksError("");
  };

  const createRecord = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const result = buildCreatePayload(normalizedCreateDraft);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSaving("create");
    setError("");
    setNotice("");

    try {
      const record = await createRecordRequest(api, result.payload);
      setCreateDraft(initialRecordDraft);
      setNotice(`Запись создана: ${record.id}`);
      if (page === 1) {
        await loadRecords();
      } else {
        setPage(1);
      }
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving("");
    }
  };

  const updateRecord = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const id = normalizedUpdateDraft.id.trim();
    if (!id) {
      setError("Укажите ID записи.");
      return;
    }

    const result = buildUpdatePayload(normalizedUpdateDraft);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSaving("update");
    setError("");
    setNotice("");

    try {
      const record = await updateRecordRequest(api, id, result.payload);
      setUpdateDraft(initialUpdateRecordDraft);
      setNotice(`Запись обновлена: ${record.id}`);
      await loadRecords();
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving("");
    }
  };

  const selectRecordForUpdate = (record: RecordEntity) => {
    setUpdateDraft({
      id: record.id,
      clientCode: String(record.client_code),
      trackNumbers: record.track_numbers.join("\n"),
      weight: String(record.weight),
      price: totalPriceToUnitPrice(record.price, record.weight),
      payments: paymentsToDraft(record.payments, record.price, record.payment_type),
    });
    setError("");
    setNotice(`Запись выбрана для обновления: ${record.id}`);
  };

  const deleteRecord = async (id: string) => {
    setSaving("delete");
    setError("");
    setNotice("");

    try {
      const record = await deleteRecordRequest(api, id);
      if (normalizedUpdateDraft.id.trim() === record.id) {
        setUpdateDraft(initialUpdateRecordDraft);
      }

      setNotice(`Запись удалена: ${record.id}`);

      if (records.length === 1 && page > 1) {
        setPage(Math.max(1, page - 1));
      } else {
        await loadRecords();
      }
    } catch (err) {
      setError(readableError(err));
    } finally {
      setSaving("");
    }
  };

  return {
    changeCreateDraft,
    changeUpdateDraft,
    createDraft: normalizedCreateDraft,
    createRecord,
    changeDailyTrackDate,
    dailyTrackDate,
    dailyTrackNumbers,
    dailyTracksError,
    dailyTracksLoading,
    dailyTracksOpen,
    error,
    filter,
    loading,
    loadDailyTrackNumbers,
    meta,
    notice,
    page,
    records,
    saving,
    deleteRecord,
    selectRecordForUpdate,
    setDailyTracksOpen,
    setFilter,
    setPage,
    updateDraft: normalizedUpdateDraft,
    updateRecord,
    openDailyTracks,
  };
}

function currentLocalDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeCreateRecordDraft(draft: CreateRecordDraft): CreateRecordDraft {
  const legacyDraft = draft as CreateRecordDraft & {
    paymentType?: keyof PaymentDraft;
  };

  return {
    ...initialRecordDraft,
    ...draft,
    payments: normalizePaymentDraft(draft.payments, {
      amount: draft.price,
      paymentType: legacyDraft.paymentType,
    }),
  };
}

function normalizeUpdateRecordDraft(draft: UpdateRecordDraft): UpdateRecordDraft {
  const legacyDraft = draft as UpdateRecordDraft & {
    paymentType?: keyof PaymentDraft;
  };

  return {
    ...initialUpdateRecordDraft,
    ...draft,
    payments: normalizePaymentDraft(draft.payments, {
      amount: draft.price,
      paymentType: legacyDraft.paymentType,
    }),
  };
}

function normalizePaymentDraft(
  payments?: Partial<PaymentDraft>,
  fallback?: { amount?: string; paymentType?: keyof PaymentDraft },
): PaymentDraft {
  const normalized: PaymentDraft = {
    ...initialPaymentDraft,
    ...payments,
  };

  if (!hasPaymentValues(payments) && fallback?.amount && fallback.paymentType) {
    normalized[fallback.paymentType] = fallback.amount;
  }

  return normalized;
}

function hasPaymentValues(payments?: Partial<PaymentDraft>): boolean {
  return Object.values(payments ?? {}).some((value) => Boolean(value?.trim()));
}

function buildCreatePayload(
  draft: CreateRecordDraft,
): PayloadResult<CreateRecordPayload> {
  const clientCode = Number(draft.clientCode);
  const weight = Number(draft.weight);
  const unitPrice = Number(draft.price);
  const totalPrice = calculateTotalPrice(draft.weight, draft.price);
  const trackNumbers = parseRecordTracks(draft.trackNumbers);
  const payments = buildPaymentsPayload(draft.payments);

  if (!Number.isFinite(clientCode) || clientCode <= 0) {
    return { ok: false, error: "Укажите код клиента." };
  }

  if (trackNumbers.length === 0) {
    return { ok: false, error: "Добавьте хотя бы один трек-номер." };
  }

  if (!Number.isFinite(weight) || weight <= 0) {
    return { ok: false, error: "Укажите вес больше нуля." };
  }

  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    return { ok: false, error: "Укажите цену за единицу веса больше нуля." };
  }

  if (totalPrice === null || totalPrice <= 0) {
    return { ok: false, error: "Итоговая цена должна быть больше нуля." };
  }

  if (payments.length === 0) {
    return { ok: false, error: "Укажите хотя бы одну оплату." };
  }

  if (!isSameAmount(paymentsTotal(payments), totalPrice)) {
    return { ok: false, error: "Сумма оплат должна совпадать с итоговой ценой." };
  }

  return {
    ok: true,
    payload: {
      client_code: clientCode,
      track_numbers: trackNumbers,
      weight,
      price: totalPrice,
      payments,
    },
  };
}

function buildUpdatePayload(
  draft: UpdateRecordDraft,
): PayloadResult<UpdateRecordPayload> {
  const payload: UpdateRecordPayload = {};

  if (draft.clientCode.trim()) {
    const clientCode = Number(draft.clientCode);
    if (!Number.isFinite(clientCode) || clientCode <= 0) {
      return { ok: false, error: "Код клиента должен быть больше нуля." };
    }

    payload.client_code = clientCode;
  }

  if (draft.trackNumbers.trim()) {
    const trackNumbers = parseRecordTracks(draft.trackNumbers);
    if (trackNumbers.length === 0) {
      return { ok: false, error: "Добавьте хотя бы один трек-номер." };
    }

    payload.track_numbers = trackNumbers;
  }

  if (draft.weight.trim()) {
    const weight = Number(draft.weight);
    if (!Number.isFinite(weight) || weight <= 0) {
      return { ok: false, error: "Вес должен быть больше нуля." };
    }

    payload.weight = weight;
  }

  if (draft.price.trim()) {
    const unitPrice = Number(draft.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      return { ok: false, error: "Цена за единицу веса должна быть больше нуля." };
    }

    const totalPrice = calculateTotalPrice(draft.weight, draft.price);
    if (totalPrice === null || totalPrice <= 0) {
      return { ok: false, error: "Укажите вес для расчёта итоговой цены." };
    }

    payload.price = totalPrice;
  }

  const payments = buildPaymentsPayload(draft.payments);
  if (payments.length > 0) {
    const price = payload.price;
    if (price === undefined || !Number.isFinite(price) || price <= 0) {
      return { ok: false, error: "Укажите вес и цену для обновления оплат." };
    }

    if (!isSameAmount(paymentsTotal(payments), price)) {
      return { ok: false, error: "Сумма оплат должна совпадать с итоговой ценой." };
    }

    payload.payments = payments;
  }

  if (Object.keys(payload).length === 0) {
    return { ok: false, error: "Заполните хотя бы одно поле для обновления." };
  }

  return { ok: true, payload };
}

function buildPaymentsPayload(payments: PaymentDraft): RecordPayment[] {
  return Object.entries(payments).flatMap(([paymentType, value]) => {
    if (!value.trim()) {
      return [];
    }

    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0) {
      return [];
    }

    return [
      {
        amount,
        payment_type: paymentType as RecordPayment["payment_type"],
      },
    ];
  });
}

function paymentsTotal(payments: RecordPayment[]): number {
  return payments.reduce((sum, payment) => sum + payment.amount, 0);
}

function isSameAmount(left: number, right: number): boolean {
  return Math.abs(left - right) < 0.000001;
}

function paymentsToDraft(
  payments: RecordPayment[] | undefined,
  price: number,
  fallbackPaymentType: RecordPayment["payment_type"],
): PaymentDraft {
  const draft: PaymentDraft = { cash: "", card: "", kaspiQR: "" };
  const sourcePayments =
    payments && payments.length > 0
      ? payments
      : [{ amount: price, payment_type: fallbackPaymentType }];

  for (const payment of sourcePayments) {
    draft[payment.payment_type] = String(payment.amount);
  }

  return draft;
}
