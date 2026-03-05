import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { Dialog } from '../components/ui/dialog';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../context/AuthContext';
import { sponsorsService } from '../services/sponsors.service';
import { storageService, validateSponsorImageFile } from '../services/storage.service';
import type { SponsorItem } from '../types/api';

interface SponsorFormState {
  name: string;
  link: string;
  active: boolean;
  order: number;
}

const defaultFormState: SponsorFormState = {
  name: '',
  link: '',
  active: true,
  order: 0
};

type ActiveFilter = '' | 'true' | 'false';

export const AdminSponsorsPage = () => {
  const { logout } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SponsorItem | null>(null);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<SponsorItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [form, setForm] = useState<SponsorFormState>(defaultFormState);

  const isEditing = Boolean(editingItem);
  const isBusy = saving || deletingId !== null || togglingId !== null;

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    [items]
  );

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await sponsorsService.listAdmin({
        active: activeFilter === '' ? undefined : activeFilter === 'true'
      });
      setItems(response.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao carregar patrocinadores.';
      setError(message);
      toast({ title: 'Erro ao carregar patrocinadores', description: message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [activeFilter]);

  const onOpenNew = () => {
    setEditingItem(null);
    setSelectedFile(null);
    setForm(defaultFormState);
    setFormOpen(true);
  };

  const onOpenEdit = (item: SponsorItem) => {
    setEditingItem(item);
    setSelectedFile(null);
    setForm({
      name: item.name,
      link: item.link ?? '',
      active: item.active,
      order: item.order
    });
    setFormOpen(true);
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    try {
      validateSponsorImageFile(file);
      setSelectedFile(file);
      setError(null);
    } catch (err) {
      event.target.value = '';
      setSelectedFile(null);
      const message = err instanceof Error ? err.message : 'Arquivo invalido.';
      setError(message);
      toast({ title: 'Imagem invalida', description: message, variant: 'error' });
    }
  };

  const onSave = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        link: form.link.trim() || undefined,
        active: form.active,
        order: form.order
      };

      if (payload.name.length < 2) {
        throw new Error('O nome deve ter ao menos 2 caracteres.');
      }

      const saved = editingItem
        ? await sponsorsService.update(editingItem.id, payload)
        : await sponsorsService.create(payload);

      if (selectedFile) {
        await storageService.uploadSponsorImage(saved.id, selectedFile);
      }

      toast({
        title: isEditing ? 'Patrocinador atualizado' : 'Patrocinador criado',
        variant: 'success'
      });
      setFormOpen(false);
      setEditingItem(null);
      setSelectedFile(null);
      setForm(defaultFormState);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar patrocinador.';
      setError(message);
      toast({ title: 'Erro ao salvar patrocinador', description: message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onToggleActive = async (item: SponsorItem) => {
    setTogglingId(item.id);
    setError(null);

    try {
      await sponsorsService.update(item.id, { active: !item.active });
      toast({
        title: !item.active ? 'Patrocinador ativado' : 'Patrocinador desativado',
        variant: 'success'
      });
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status.';
      setError(message);
      toast({ title: 'Erro ao atualizar status', description: message, variant: 'error' });
    } finally {
      setTogglingId(null);
    }
  };

  const onDelete = async () => {
    if (!pendingDeleteItem) return;
    setDeletingId(pendingDeleteItem.id);
    setError(null);

    try {
      await sponsorsService.remove(pendingDeleteItem.id);
      toast({ title: 'Patrocinador excluido', variant: 'success' });
      setPendingDeleteItem(null);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir patrocinador.';
      setError(message);
      toast({ title: 'Erro ao excluir patrocinador', description: message, variant: 'error' });
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
      title="Patrocinadores"
      subtitle="Gerencie logos, ordem de exibicao e status dos patrocinadores."
      actions={
        <div className="adm-actions">
          <Link className="adm-btn adm-btn-outline" to="/news">
            Noticias
          </Link>
          <Link className="adm-btn adm-btn-outline" to="/columns">
            Colunas
          </Link>
          <button className="adm-btn adm-btn-primary" onClick={onOpenNew} type="button">
            Novo patrocinador
          </button>
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
            ? `O patrocinador "${pendingDeleteItem.name}" e a imagem vinculada serao removidos permanentemente.`
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
        title="Excluir patrocinador"
      />

      <Dialog
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) {
            setEditingItem(null);
            setSelectedFile(null);
            setForm(defaultFormState);
          }
        }}
        open={formOpen}
        title={isEditing ? 'Editar patrocinador' : 'Novo patrocinador'}
      >
        <form className="adm-form-stack" onSubmit={onSave}>
          <div>
            <label className="adm-label" htmlFor="sponsor-name">
              Nome
            </label>
            <input
              className="adm-field"
              id="sponsor-name"
              minLength={2}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
              value={form.name}
            />
          </div>

          <div>
            <label className="adm-label" htmlFor="sponsor-link">
              Link (opcional)
            </label>
            <input
              className="adm-field"
              id="sponsor-link"
              onChange={(event) => setForm((prev) => ({ ...prev, link: event.target.value }))}
              placeholder="https://example.com"
              type="url"
              value={form.link}
            />
          </div>

          <div className="adm-grid-2">
            <div>
              <label className="adm-label" htmlFor="sponsor-order">
                Ordem
              </label>
              <input
                className="adm-field"
                id="sponsor-order"
                onChange={(event) => setForm((prev) => ({ ...prev, order: Number(event.target.value) || 0 }))}
                step={1}
                type="number"
                value={form.order}
              />
            </div>

            <div>
              <label className="adm-label" htmlFor="sponsor-active">
                Status
              </label>
              <select
                className="adm-field"
                id="sponsor-active"
                onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.value === 'true' }))}
                value={String(form.active)}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="adm-label" htmlFor="sponsor-image">
              Logo (image/* ate 5 MB)
            </label>
            <input
              accept="image/*"
              className="adm-field adm-file-field"
              disabled={saving}
              id="sponsor-image"
              onChange={onFileChange}
              type="file"
            />
            {selectedFile ? <p className="adm-text-note">Imagem pronta para upload: {selectedFile.name}</p> : null}
            {!selectedFile && editingItem?.imageUrl ? (
              <img
                alt={`Logo do patrocinador ${editingItem.name}`}
                className="adm-sponsor-preview"
                src={editingItem.imageUrl}
              />
            ) : null}
          </div>

          <div className="adm-actions adm-submit-row">
            <button className="adm-btn adm-btn-primary" disabled={saving} type="submit">
              {saving ? 'Salvando...' : isEditing ? 'Salvar alteracoes' : 'Criar patrocinador'}
            </button>
          </div>
        </form>
      </Dialog>

      <section className="adm-card">
        <div className="adm-card-body adm-toolbar adm-toolbar-sponsors">
          <select
            className="adm-field"
            onChange={(event) => setActiveFilter(event.target.value as ActiveFilter)}
            value={activeFilter}
          >
            <option value="">Todos os status</option>
            <option value="true">Somente ativos</option>
            <option value="false">Somente inativos</option>
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
          {!loading && !error && sortedItems.length === 0 ? (
            <p className="adm-text-note">Nenhum patrocinador encontrado.</p>
          ) : null}
        </div>

        {!loading && sortedItems.length > 0 ? (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Logo</th>
                  <th>Nome</th>
                  <th>Link</th>
                  <th>Ordem</th>
                  <th>Status</th>
                  <th>Acoes</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.imageUrl ? (
                        <img alt={`Logo ${item.name}`} className="adm-sponsor-thumb" loading="lazy" src={item.imageUrl} />
                      ) : (
                        <span className="adm-text-note">Sem imagem</span>
                      )}
                    </td>
                    <td>{item.name}</td>
                    <td>
                      {item.link ? (
                        <a href={item.link} rel="noopener noreferrer" target="_blank">
                          {item.link}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>{item.order}</td>
                    <td>
                      <span className={`adm-badge ${item.active ? 'adm-badge-published' : 'adm-badge-draft'}`}>
                        {item.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-btn adm-btn-outline" onClick={() => onOpenEdit(item)} type="button">
                          Editar
                        </button>
                        <button
                          className="adm-btn adm-btn-outline"
                          disabled={togglingId === item.id}
                          onClick={() => void onToggleActive(item)}
                          type="button"
                        >
                          {item.active ? 'Desativar' : 'Ativar'}
                        </button>
                        <button
                          className="adm-btn adm-btn-danger"
                          disabled={isBusy}
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
