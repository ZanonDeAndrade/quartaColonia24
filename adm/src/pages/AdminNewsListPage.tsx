import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminShell } from "../components/admin/AdminShell";
import { Dialog } from "../components/ui/dialog";
import { useToast } from "../components/ui/toast";
import { NEWS_STATUS_LABEL, NEWS_STATUS_OPTIONS } from "../constants/news";
import { useAuth } from "../context/AuthContext";
import { newsService } from "../services/news.service";
import type { NewsItem, NewsStatus } from "../types/api";

export const AdminNewsListPage = () => {
  const { logout } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"" | NewsStatus>("");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<NewsItem | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(items.map((item) => item.category).filter(Boolean))).sort(),
    [items],
  );

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await newsService.listAdmin({
        pageSize: 50,
        status: status || undefined,
        category: category || undefined,
        search: search || undefined,
      });
      setItems(response.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha ao carregar noticias");
      toast({ title: "Erro ao carregar noticias", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [status, category, search]);

  const onTogglePublish = async (item: NewsItem) => {
    try {
      const updated = await newsService.publish(item.id, item.status !== "published");
      toast({
        title: updated.status === "published" ? "Noticia publicada" : "Noticia em rascunho",
        variant: "success",
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar publicacao");
      toast({ title: "Erro ao alterar publicacao", variant: "error" });
    }
  };

  const onDelete = async () => {
    if (!pendingDeleteItem) return;
    setDeletingId(pendingDeleteItem.id);
    try {
      await newsService.remove(pendingDeleteItem.id);
      toast({ title: "Noticia excluida", variant: "success" });
      setPendingDeleteItem(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir noticia");
      toast({ title: "Erro ao excluir noticia", variant: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  const onLogout = async () => {
    await logout();
    toast({ title: "Sessao encerrada" });
  };

  return (
    <AdminShell
      title="Noticias"
      subtitle="Gerencie drafts, publicacoes e edicoes"
      actions={
        <div className="adm-actions">
          <Link className="adm-btn adm-btn-outline" to="/columns">
            Colunas
          </Link>
          <Link className="adm-btn adm-btn-outline" to="/sponsors">
            Patrocinadores
          </Link>
          <Link className="adm-btn adm-btn-primary" to="/news/new">
            Nova noticia
          </Link>
        </div>
      }
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
      <Dialog
        description={
          pendingDeleteItem
            ? `A noticia "${pendingDeleteItem.title}" e a imagem vinculada serao removidas permanentemente.`
            : undefined
        }
        footer={
          <>
            <button
              className="adm-btn adm-btn-outline"
              disabled={deletingId !== null}
              onClick={() => setPendingDeleteItem(null)}
              type="button"
            >
              Cancelar
            </button>
            <button
              className="adm-btn adm-btn-danger"
              disabled={deletingId !== null}
              onClick={() => void onDelete()}
              type="button"
            >
              {deletingId !== null ? "Excluindo..." : "Confirmar exclusao"}
            </button>
          </>
        }
        onOpenChange={(open) => {
          if (!open && deletingId === null) {
            setPendingDeleteItem(null);
          }
        }}
        open={pendingDeleteItem !== null}
        title="Excluir noticia"
      />

      <section className="adm-card">
        <div className="adm-card-body adm-toolbar">
          <input
            className="adm-field"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por titulo ou conteudo"
            value={search}
          />

          <select className="adm-field" onChange={(e) => setStatus(e.target.value as "" | NewsStatus)} value={status}>
            <option value="">Todos status</option>
            {NEWS_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select className="adm-field" onChange={(e) => setCategory(e.target.value)} value={category}>
            <option value="">Todas categorias</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button className="adm-btn adm-btn-outline" onClick={() => void load()} type="button">
            Atualizar
          </button>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-card-body">
          {loading ? <p className="adm-text-note">Carregando...</p> : null}
          {error ? <p className="adm-text-error">{error}</p> : null}
          {!loading && !error && items.length === 0 ? <p className="adm-text-note">Nenhuma noticia encontrada.</p> : null}
        </div>

        {!loading && items.length > 0 ? (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Slug</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.slug}</td>
                    <td>{item.category || "-"}</td>
                    <td>
                      <span className={`adm-badge ${item.status === "published" ? "adm-badge-published" : "adm-badge-draft"}`}>
                        {NEWS_STATUS_LABEL[item.status]}
                      </span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <Link className="adm-btn adm-btn-outline" to={`/news/${item.id}`}>
                          Editar
                        </Link>
                        <button className="adm-btn adm-btn-outline" onClick={() => void onTogglePublish(item)} type="button">
                          {item.status === "published" ? "Despublicar" : "Publicar"}
                        </button>
                        <button
                          className="adm-btn adm-btn-danger"
                          disabled={deletingId === item.id}
                          onClick={() => setPendingDeleteItem(item)}
                          type="button"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </AdminShell>
  );
};
