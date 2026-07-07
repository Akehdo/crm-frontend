import { CreateRecordPanel } from "../components/CreateRecordPanel";
import { RecordMessages } from "../components/RecordMessages";
import { RecordTablePanel } from "../components/RecordTablePanel";
import { UpdateRecordPanel } from "../components/UpdateRecordPanel";
import { useRecordsDashboard } from "../hooks/useRecordsDashboard";

export function RecordsPage(): JSX.Element {
  const records = useRecordsDashboard();

  return (
    <main className="dashboard">
      <header className="topbar">
        <div>
          <div className="eyebrow">Создание и обновление записей</div>
          <h1>Записи</h1>
        </div>
      </header>

      <section className="two-column-grid">
        <CreateRecordPanel
          draft={records.createDraft}
          saving={records.saving === "create"}
          onDraftChange={records.changeCreateDraft}
          onSubmit={records.createRecord}
        />
        <UpdateRecordPanel
          draft={records.updateDraft}
          saving={records.saving === "update"}
          onDraftChange={records.changeUpdateDraft}
          onSubmit={records.updateRecord}
        />
      </section>

      <RecordMessages error={records.error} notice={records.notice} />

      <RecordTablePanel
        filter={records.filter}
        loading={records.loading}
        meta={records.meta}
        page={records.page}
        records={records.records}
        saving={records.saving}
        setFilter={records.setFilter}
        setPage={records.setPage}
        onDelete={records.deleteRecord}
        onUpdateSelect={records.selectRecordForUpdate}
      />
    </main>
  );
}
