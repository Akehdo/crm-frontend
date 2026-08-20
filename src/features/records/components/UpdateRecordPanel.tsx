import { Calculator, FilePenLine, Loader2, Save } from "lucide-react";
import type { FormEvent } from "react";
import { PanelHeader } from "../../../shared/components/PanelHeader";
import {
  calculateTotalPrice,
  formatRecordPrice,
  useEnterNavigation,
} from "../lib/recordForm";
import { paymentTypes, UpdateRecordDraft } from "../types";

type UpdateRecordPanelProps = {
  draft: UpdateRecordDraft;
  saving: boolean;
  onDraftChange: (patch: Partial<UpdateRecordDraft>) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
};

export function UpdateRecordPanel({
  draft,
  saving,
  onDraftChange,
  onSubmit,
}: UpdateRecordPanelProps): JSX.Element {
  const totalPrice = calculateTotalPrice(draft.weight, draft.price);
  const enterNavigation = useEnterNavigation();

  return (
    <div className="panel tools-panel">
      <PanelHeader icon={<FilePenLine size={18} />} title="Обновить запись" />
      <form className="record-form" onSubmit={onSubmit}>
        <label>
          ID записи
          <input
            {...enterNavigation<HTMLInputElement>(0)}
            value={draft.id}
            onChange={(event) => onDraftChange({ id: event.target.value })}
            placeholder="UUID записи"
          />
        </label>

        <div className="record-fields-grid">
          <label>
            Код клиента
            <input
              {...enterNavigation<HTMLInputElement>(1)}
              min="1"
              type="number"
              value={draft.clientCode}
              onChange={(event) =>
                onDraftChange({ clientCode: event.target.value })
              }
            />
          </label>
          <label>
            Вес
            <input
              {...enterNavigation<HTMLInputElement>(2)}
              min="0.01"
              step="0.01"
              type="number"
              value={draft.weight}
              onChange={(event) =>
                onDraftChange({ weight: event.target.value })
              }
            />
          </label>
          <label>
            Цена за единицу веса
            <input
              {...enterNavigation<HTMLInputElement>(3)}
              min="50"
              step="50"
              type="number"
              value={draft.price}
              onChange={(event) => onDraftChange({ price: event.target.value })}
            />
          </label>
          <div className="record-total" aria-live="polite">
            <Calculator aria-hidden="true" size={24} />
            <span>Итоговая цена</span>
            <strong>{formatRecordPrice(totalPrice)}</strong>
          </div>
        </div>

        <fieldset className="payment-fields">
          <legend>Оплата</legend>
          <div className="payment-fields-grid">
            {paymentTypes.map((paymentType) => (
              <label key={paymentType.value}>
                {paymentType.label}
                <input
                  {...enterNavigation<HTMLInputElement>(4 + paymentTypes.indexOf(paymentType))}
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={draft.payments[paymentType.value]}
                  onChange={(event) =>
                    onDraftChange({
                      payments: {
                        ...draft.payments,
                        [paymentType.value]: event.target.value,
                      },
                    })
                  }
                />
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Трек-номера
          <textarea
            {...enterNavigation<HTMLTextAreaElement>(7)}
            rows={7}
            value={draft.trackNumbers}
            onChange={(event) =>
              onDraftChange({ trackNumbers: event.target.value })
            }
            placeholder="Оставьте пустым, чтобы не менять"
          />
        </label>

        <button
          {...enterNavigation<HTMLButtonElement>(8)}
          className="secondary-button"
          disabled={saving}
          type="submit"
        >
          {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
          Обновить
        </button>
      </form>
    </div>
  );
}
