import { ArrowRightLeft, Loader2 } from "lucide-react";
import type { FormEvent } from "react";
import { PanelHeader } from "../../../shared/components/PanelHeader";
import {
  PaymentType,
  paymentTypeLabels,
  paymentTypes,
} from "../../records/types";
import type { CashTransferDraft } from "../types";

type CashTransferPanelProps = {
  draft: CashTransferDraft;
  saving: boolean;
  onDraftChange: (patch: Partial<CashTransferDraft>) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function CashTransferPanel({
  draft,
  saving,
  onDraftChange,
  onSubmit,
}: CashTransferPanelProps): JSX.Element {
  return (
    <div className="panel tools-panel">
      <PanelHeader
        icon={<ArrowRightLeft size={18} />}
        title="Перевод между кассами"
      />
      <form className="record-form" onSubmit={onSubmit}>
        <div className="record-fields-grid">
          <label>
            Из кассы
            <select
              value={draft.fromPaymentType}
              onChange={(event) =>
                onDraftChange({
                  fromPaymentType: event.target.value as PaymentType,
                })
              }
            >
              {paymentTypes.map((paymentType) => (
                <option
                  key={paymentType.value}
                  value={paymentType.value}
                >
                  {paymentType.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            В кассу
            <select
              value={draft.toPaymentType}
              onChange={(event) =>
                onDraftChange({
                  toPaymentType: event.target.value as PaymentType,
                })
              }
            >
              {paymentTypes.map((paymentType) => (
                <option
                  key={paymentType.value}
                  value={paymentType.value}
                >
                  {paymentType.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          Сумма
          <input
            min="0.01"
            step="0.01"
            type="number"
            value={draft.amount}
            onChange={(event) => onDraftChange({ amount: event.target.value })}
            onWheel={(event) => event.currentTarget.blur()}
          />
        </label>

        <button
          className="primary-button"
          disabled={saving || draft.fromPaymentType === draft.toPaymentType}
          type="submit"
        >
          {saving ? (
            <Loader2 className="spin" size={18} />
          ) : (
            <ArrowRightLeft size={18} />
          )}
          Перевести
        </button>
      </form>
    </div>
  );
}
