import { FilePenLine, Loader2, Save } from "lucide-react";
import type { FormEvent } from "react";
import { PanelHeader } from "../../../shared/components/PanelHeader";
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
  return (
    <div className="panel tools-panel">
      <PanelHeader icon={<FilePenLine size={18} />} title="Обновить запись" />
      <form className="record-form" onSubmit={onSubmit}>
        <label>
          ID записи
          <input
            value={draft.id}
            onChange={(event) => onDraftChange({ id: event.target.value })}
            placeholder="UUID записи"
          />
        </label>

        <div className="record-fields-grid">
          <label>
            Код клиента
            <input
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
            Цена
            <input
              min="0.01"
              step="0.01"
              type="number"
              value={draft.price}
              onChange={(event) => onDraftChange({ price: event.target.value })}
            />
          </label>
        </div>

        <fieldset className="payment-fields">
          <legend>Оплата</legend>
          <div className="payment-fields-grid">
            {paymentTypes.map((paymentType) => (
              <label key={paymentType.value}>
                {paymentType.label}
                <input
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
            rows={7}
            value={draft.trackNumbers}
            onChange={(event) =>
              onDraftChange({ trackNumbers: event.target.value })
            }
            placeholder="Оставьте пустым, чтобы не менять"
          />
        </label>

        <button className="secondary-button" disabled={saving} type="submit">
          {saving ? <Loader2 className="spin" size={18} /> : <Save size={18} />}
          Обновить
        </button>
      </form>
    </div>
  );
}
