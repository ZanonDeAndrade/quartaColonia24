import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useToast } from "../components/ui/toast";
import { useAuth } from "../context/AuthContext";

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { user, isAdmin, login } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user && isAdmin) {
    return <Navigate replace to="/news" />;
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ username, password });
      toast({ title: "Login realizado", variant: "success" });
      navigate("/news");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no login");
      toast({ title: "Falha no login", description: "Verifique suas credenciais", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="adm-login-shell">
      <section className="adm-login-card">
        <header className="adm-login-top">
          <h1>Painel Administrativo</h1>
          <p>Acesso restrito para administradores</p>
        </header>

        <div className="adm-login-body">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="adm-label" htmlFor="username">
                Usuario
              </label>
              <input
                id="username"
                className="adm-field"
                onChange={(e) => setUsername(e.target.value)}
                required
                type="text"
                value={username}
              />
            </div>

            <div>
              <label className="adm-label" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                className="adm-field"
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                value={password}
              />
            </div>

            {error ? <p className="adm-text-error">{error}</p> : null}

            <button className="adm-btn adm-btn-primary w-full" disabled={loading} type="submit">
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
};
