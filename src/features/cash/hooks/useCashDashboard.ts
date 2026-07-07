import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import { usePersistedState } from "../../../shared/hooks/usePersistedState";
import { readableError } from "../../../shared/utils/errors";
import { listTransactionsRequest } from "../api/transactionsApi";
import type {
  CashSummary,
  CashTransaction,
  ListMeta,
  PaymentFilter,
  TransactionTypeFilter,
} from "../types";
import { initialCashSummary } from "../types";

export function useCashDashboard() {
  const { api } = useAuth();
  const defaultDateRange = getCurrentMonthRange();
  const [dateFrom, persistDateFrom] = usePersistedState(
    "crm.cash.dateFrom",
    defaultDateRange.dateFrom,
  );
  const [dateTo, persistDateTo] = usePersistedState(
    "crm.cash.dateTo",
    defaultDateRange.dateTo,
  );
  const [paymentFilter, persistPaymentFilter] =
    usePersistedState<PaymentFilter>("crm.cash.paymentFilter", "all");
  const [transactionTypeFilter, persistTransactionTypeFilter] =
    usePersistedState<TransactionTypeFilter>(
      "crm.cash.transactionTypeFilter",
      "all",
    );
  const [page, setPage] = usePersistedState("crm.cash.page", 1);
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [summary, setSummary] = useState<CashSummary>(initialCashSummary);
  const [meta, setMeta] = useState<ListMeta>({
    limit: 20,
    page: 1,
    total: 0,
    total_pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const payload = await listTransactionsRequest(api, {
        dateFrom,
        dateTo,
        page,
        paymentType: paymentFilter,
        transactionType: transactionTypeFilter,
      });

      setTransactions(payload.items ?? []);
      setSummary(payload.summary ?? initialCashSummary);
      setMeta(payload.meta ?? { page, limit: 20, total: 0, total_pages: 0 });
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  }, [api, dateFrom, dateTo, page, paymentFilter, transactionTypeFilter]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const setPaymentFilter = (filter: PaymentFilter) => {
    persistPaymentFilter(filter);
    setPage(1);
  };

  const setTransactionTypeFilter = (filter: TransactionTypeFilter) => {
    persistTransactionTypeFilter(filter);
    setPage(1);
  };

  const setDateFrom = (value: string) => {
    persistDateFrom(value);
    setPage(1);
  };

  const setDateTo = (value: string) => {
    persistDateTo(value);
    setPage(1);
  };

  const resetCurrentMonth = () => {
    const range = getCurrentMonthRange();
    persistDateFrom(range.dateFrom);
    persistDateTo(range.dateTo);
    setPage(1);
  };

  return {
    dateFrom,
    dateTo,
    error,
    loading,
    meta,
    page,
    paymentFilter,
    setPage,
    setDateFrom,
    setDateTo,
    setPaymentFilter,
    setTransactionTypeFilter,
    resetCurrentMonth,
    summary,
    transactionTypeFilter,
    transactions,
  };
}

function getCurrentMonthRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    dateFrom: formatDateInput(firstDay),
    dateTo: formatDateInput(lastDay),
  };
}

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
