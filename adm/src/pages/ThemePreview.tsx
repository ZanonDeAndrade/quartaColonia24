import { AdminShell } from "../components/admin/AdminShell";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/toast";
import { NEWS_STATUS_OPTIONS } from "../constants/news";

export const ThemePreview = () => {
  const { logout } = useAuth();
  const { toast } = useToast();

  const onLogout = async () => {
    await logout();
    toast({ title: "Sessao encerrada" });
  };

  return (
    <AdminShell
      title="Theme Preview"
      subtitle="Comparacao rapida dos tokens compartilhados entre portal e admin."
      topActions={
        <>
          <a className="adm-btn adm-btn-outline" href="http://localhost:5173" rel="noreferrer" target="_blank">
            Ver portal
          </a>
          <button className="adm-btn adm-btn-outline" onClick={() => void onLogout()} type="button">
            Sair
          </button>
        </>
      }
    >
      <section className="adm-card">
        <div className="adm-card-body adm-preview">
          <h1>Heading H1</h1>
          <h2>Heading H2</h2>
          <p>
            Texto base usando <code>--foreground</code> e tipografia compartilhada.
          </p>

          <div className="adm-actions">
            <button className="adm-btn adm-btn-primary" type="button">
              Botao Primario
            </button>
            <button className="adm-btn adm-btn-outline" type="button">
              Botao Outline
            </button>
            <button className="adm-btn adm-btn-danger" type="button">
              Botao Perigo
            </button>
            <span className="adm-badge adm-badge-published">published</span>
            <span className="adm-badge adm-badge-draft">draft</span>
          </div>

          <div className="adm-grid-2">
            <div>
              <label className="adm-label" htmlFor="preview-title">
                Input
              </label>
              <input className="adm-field" defaultValue="Titulo de exemplo" id="preview-title" />
            </div>

            <div>
              <label className="adm-label" htmlFor="preview-status">
                Select
              </label>
              <select className="adm-field" defaultValue="published" id="preview-status">
                {NEWS_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="adm-label" htmlFor="preview-content">
              Textarea
            </label>
            <textarea
              className="adm-field adm-textarea adm-content-field"
              defaultValue="Conteudo de exemplo para validar espacamento, bordas e cor de fundo."
              id="preview-content"
              rows={4}
            />
          </div>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Categoria</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Prefeitura anuncia investimento historico</td>
                <td>Local</td>
                <td>
                  <span className="adm-badge adm-badge-published">published</span>
                </td>
                <td>
                  <div className="adm-actions">
                    <button className="adm-btn adm-btn-outline" type="button">
                      Editar
                    </button>
                    <button className="adm-btn adm-btn-danger" type="button">
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </AdminShell>
  );
};
