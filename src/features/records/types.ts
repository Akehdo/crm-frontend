export type PaymentType = "kaspiQR" | "card" | "cash";
export type PaymentFilter = PaymentType | "all";
export type PaymentDraft = Record<PaymentType, string>;

export type RecordPayment = {
  amount: number;
  payment_type: PaymentType;
};

export type CreateRecordDraft = {
  clientCode: string;
  trackNumbers: string;
  weight: string;
  price: string;
  payments: PaymentDraft;
};

export type UpdateRecordDraft = CreateRecordDraft & {
  id: string;
};

export type RecordEntity = {
  id: string;
  client_code: number;
  track_numbers: string[];
  weight: number;
  price: number;
  payment_type: PaymentType;
  payments: RecordPayment[];
  created_at: string;
  updated_at: string;
};

export type ListMeta = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type ListRecordsResponse = {
  items?: RecordEntity[];
  meta?: ListMeta;
};

export type CreateRecordPayload = {
  client_code: number;
  track_numbers: string[];
  weight: number;
  price: number;
  payment_type?: PaymentType;
  payments: RecordPayment[];
};

export type UpdateRecordPayload = Partial<CreateRecordPayload>;

export const paymentTypeLabels: Record<PaymentType, string> = {
  kaspiQR: "Kaspi QR",
  card: "Карта",
  cash: "Наличные",
};

export const paymentTypes = Object.entries(paymentTypeLabels).map(
  ([value, label]) => ({
    value: value as PaymentType,
    label,
  }),
);

export const initialPaymentDraft: PaymentDraft = {
  kaspiQR: "",
  card: "",
  cash: "",
};

export const initialRecordDraft: CreateRecordDraft = {
  clientCode: "",
  trackNumbers: "",
  weight: "",
  price: "",
  payments: initialPaymentDraft,
};

export const initialUpdateRecordDraft: UpdateRecordDraft = {
  id: "",
  clientCode: "",
  trackNumbers: "",
  weight: "",
  price: "",
  payments: initialPaymentDraft,
};
