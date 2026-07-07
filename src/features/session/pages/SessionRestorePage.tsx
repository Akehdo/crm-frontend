import { Loader2 } from "lucide-react";

export function SessionRestorePage(): JSX.Element {
  return (
    <div className="center-state">
      <Loader2 className="spin" size={28} />
      <div>
        <h1>Восстанавливаем сессию</h1>
        <p>Проверяем refresh token и обновляем доступ без повторного входа.</p>
      </div>
    </div>
  );
}
