import { Boxes, Check, Loader2, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { usePersistedState } from "../../../shared/hooks/usePersistedState";
import { readableError } from "../../../shared/utils/errors";
import { useAuth } from "../context/AuthContext";

type AuthPageProps = {
  sessionMessage: string;
};

export function AuthPage({ sessionMessage }: AuthPageProps): JSX.Element {
  const { login } = useAuth();
  const [email, setEmail] = usePersistedState("crm.auth.email", "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      setPassword("");
    } catch (err) {
      setError(readableError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-layout">
      <section className="auth-copy" aria-label="CRM">
        <div className="brand-mark">
          <Boxes size={30} />
        </div>
        <h1>CRM Parcels</h1>
        <p>
          Рабочая панель для трек-номеров, статусов и быстрых обновлений
          отправлений.
        </p>
        <div className="auth-pill">
          <ShieldCheck size={16} />
          Auto refresh включен
        </div>
      </section>

      <section className="panel auth-panel">
        <form onSubmit={submit}>
          <label>
            Email
            <input
              autoComplete="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="user@example.com"
              required
            />
          </label>

          <label>
            Пароль
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Пароль"
              required
            />
          </label>

          {(error || sessionMessage) && (
            <div className="alert">{error || sessionMessage}</div>
          )}

          <button className="primary-button" disabled={loading} type="submit">
            {loading ? (
              <Loader2 className="spin" size={18} />
            ) : (
              <Check size={18} />
            )}
            Войти
          </button>
        </form>
      </section>
    </main>
  );
}
