import type { PaymentType } from "../records/types";

export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionTypeFilter = TransactionType | "all";

export type CashTransaction = {
  amount: number;
  created_at: string;
  expense_id?: string | null;
  id: string;
  payment_type: PaymentType;
  record_id?: string | null;
  transaction_type: TransactionType;
  updated_at: string;
};

export type CashSummary = {
  balance: number;
  expense: number;
  income: number;
};

export type ListMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type ListTransactionsResponse = {
  items?: CashTransaction[];
  meta?: ListMeta;
  summary?: CashSummary;
};

export type PaymentFilter = PaymentType | "all";

export const transactionTypeLabels: Record<TransactionType, string> = {
  EXPENSE: "Расход",
  INCOME: "Доход",
};

export const transactionTypeOptions = Object.entries(transactionTypeLabels).map(
  ([value, label]) => ({
    value: value as TransactionType,
    label,
  }),
);

export const initialCashSummary: CashSummary = {
  balance: 0,
  expense: 0,
  income: 0,
};
