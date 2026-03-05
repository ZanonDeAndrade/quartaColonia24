import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { Dialog } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../context/AuthContext';
import { columnsService } from '../services/columns.service';
import type { ColumnItem } from '../types/api';

type PublishedFilter = '' | 'true' | 'false';

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '-';
  return parsed.toLocaleDateString('pt-BR');
};

export const AdminColumnsListPage = () => {
  const { logout } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<ColumnItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<ColumnItem | null>(null);
  const [togglingPublishId, setTogglingPublishId] = useState<string | null>(null);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [items]
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await columnsService.listAdmin({
        published: publishedFilter === '' ? undefined : publishedFilter === 'true',
        search: search.trim() || undefined
      });
      setItems(response.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar colunas';
      setError(message);
      toast({ title: 'Erro ao carregar colunas', description: message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [publishedFilter]);

  const onSearch = async () => {
    await load();
  };

  const onTogglePublish = async (item: ColumnItem) => {
    setTogglingPublishId(item.id);
    setError(null);

    try {
      const updated = await columnsService.publish(item.id, !item.published);
      toast({
        title: updated.published ? 'Coluna publicada' : 'Coluna movida para rascunho',
        variant: 'success'
      });
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar publicacao';
      setError(message);
      toast({ title: 'Erro ao alterar publicacao', description: message, variant: 'error' });
    } finally {
      setTogglingPublishId(null);
    }
  };

  const onDelete = async () => {
    if (!pendingDeleteItem) return;

    setDeletingId(pendingDeleteItem.id);

    try {
      await columnsService.remove(pendingDeleteItem.id);
      toast({ title: 'Coluna excluida', variant: 'success' });
      setPendingDeleteItem(null);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir coluna';
      setError(message);
      toast({ title: 'Erro ao excluir coluna', description: message, variant: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  const onLogout = async () => {
    await logout();
    toast({ title: 'Sessao encerrada' });
  };

  return (
    <AdminShell
      title="Colunas"
      subtitle="Gerencie artigos de opiniao e autores."
      actions={
        <div className="adm-actions">
          <Link className="adm-btn adm-btn-outline" to="/news">
            Noticias
          </Link>
          <Link className="adm-btn adm-btn-outline" to="/sponsors">
            Patrocinadores
          </Link>
          <Link className="adm-btn adm-btn-primary" to="/columns/new">
            Nova coluna
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
            ? `A coluna "${pendingDeleteItem.title}" e a imagem vinculada serao removidas permanentemente.`
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
              {deletingId !== null ? 'Excluindo...' : 'Confirmar exclusao'}
            </button>
          </>
        }
        onOpenChange={(open) => {
          if (!open && deletingId === null) {
            setPendingDeleteItem(null);
          }
        }}
        open={pendingDeleteItem !== null}
        title="Excluir coluna"
      />

      <section className="adm-card">
        <div className="adm-card-body adm-toolbar">
          <input
            className="adm-field"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por titulo ou autor"
            value={search}
          />

          <select
            className="adm-field"
            onChange={(event) => setPublishedFilter(event.target.value as PublishedFilter)}
            value={publishedFilter}
          >
            <option value="">Todos status</option>
            <option value="true">Publicados</option>
            <option value="false">Rascunhos</option>
          </select>

          <button className="adm-btn adm-btn-outline" onClick={() => void onSearch()} type="button">
            Buscar
          </button>

          <button className="adm-btn adm-btn-outline" onClick={() => void load()} type="button">
            Atualizar
          </button>
        </div>
      </section>

      <section className="adm-card">
        <div className="adm-card-body">
          {loading ? <p className="adm-text-note">Carregando...</p> : null}
          {error ? <p className="adm-text-error">{error}</p> : null}
          {!loading && !error && sortedItems.length === 0 ? <p className="adm-text-note">Nenhuma coluna encontrada.</p> : null}
        </div>

        {!loading && sortedItems.length > 0 ? (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Titulo</th>
                  <th>Autor</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.id}>
                    <td>{item.title}</td>
                    <td>{item.authorName}</td>
                    <td>
                      <span className={`adm-badge ${item.published ? 'adm-badge-published' : 'adm-badge-draft'}`}>
                        {item.published ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td>{formatDate(item.published ? item.publishedAt : item.createdAt)}</td>
                    <td>
                      <div className="adm-actions">
                        <Link className="adm-btn adm-btn-outline" to={`/columns/${item.id}`}>
                          Editar
                        </Link>
                        <button
                          className="adm-btn adm-btn-outline"
                          disabled={togglingPublishId === item.id}
                          onClick={() => void onTogglePublish(item)}
                          type="button"
                        >
                          {item.published ? 'Despublicar' : 'Publicar'}
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
