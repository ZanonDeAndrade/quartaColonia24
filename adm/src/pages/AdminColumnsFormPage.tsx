import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AdminShell } from '../components/admin/AdminShell';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../context/AuthContext';
import { columnsService } from '../services/columns.service';
import { storageService, validateColumnImageFile } from '../services/storage.service';

interface FormState {
  title: string;
  authorName: string;
  authorImageUrl: string;
  excerpt: string;
  content: string;
  published: boolean;
}

const defaultFormState: FormState = {
  title: '',
  authorName: '',
  authorImageUrl: '',
  excerpt: '',
  content: '',
  published: false
};

export const AdminColumnsFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { logout } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [columnId, setColumnId] = useState<string | null>(id ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormState);

  const isBusy = saving || uploading;

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await columnsService.getById(id);
        setForm({
          title: data.title,
          authorName: data.authorName,
          authorImageUrl: data.authorImageUrl ?? '',
          excerpt: data.excerpt,
          content: data.content,
          published: data.published
        });
        setColumnId(data.id);
        setImageUrl(data.imageUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar coluna';
        setError(message);
        toast({ title: 'Erro ao carregar coluna', description: message, variant: 'error' });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, isEdit, toast]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      return;
    }

    try {
      validateColumnImageFile(file);
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

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const payload = {
        title: form.title.trim(),
        excerpt: form.excerpt.trim(),
        content: form.content.trim(),
        authorName: form.authorName.trim(),
        authorImageUrl: form.authorImageUrl.trim() || undefined,
        published: form.published
      };

      const saved = isEdit && id ? await columnsService.update(id, payload) : await columnsService.create(payload);

      if (selectedFile) {
        setUploading(true);
        const uploadedImage = await storageService.uploadColumnImage(saved.id, selectedFile);
        setImageUrl(uploadedImage.imageUrl);
      } else {
        setImageUrl(saved.imageUrl);
      }

      setColumnId(saved.id);
      setSelectedFile(null);
      setSuccess('Coluna salva com sucesso.');
      toast({ title: 'Coluna salva com sucesso', variant: 'success' });

      if (!isEdit) {
        navigate(`/columns/${saved.id}`, { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar coluna';
      setError(message);
      toast({ title: 'Erro ao salvar coluna', description: message, variant: 'error' });
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const onTogglePublish = async () => {
    if (!columnId) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await columnsService.publish(columnId, !form.published);
      setForm((previous) => ({ ...previous, published: updated.published }));
      const message = updated.published ? 'Coluna publicada' : 'Coluna movida para rascunho';
      setSuccess(`${message}.`);
      toast({ title: message, variant: 'success' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alterar publicacao';
      setError(message);
      toast({ title: 'Erro ao alterar publicacao', description: message, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await logout();
    toast({ title: 'Sessao encerrada' });
  };

  return (
    <AdminShell
      title={isEdit ? 'Editar coluna' : 'Nova coluna'}
      subtitle="Crie conteudos de Colunas & Opiniao separados do fluxo de noticias."
      actions={
        <div className="adm-actions">
          <Link className="adm-btn adm-btn-outline" to="/columns">
            Voltar
          </Link>
          <Link className="adm-btn adm-btn-outline" to="/news">
            Noticias
          </Link>
          <Link className="adm-btn adm-btn-outline" to="/sponsors">
            Patrocinadores
          </Link>
          {isEdit ? (
            <button className="adm-btn adm-btn-outline" disabled={isBusy} onClick={() => void onTogglePublish()} type="button">
              {form.published ? 'Despublicar' : 'Publicar'}
            </button>
          ) : null}
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
      <section className="adm-card">
        <div className="adm-card-body">
          {loading ? <p className="adm-text-note">Carregando...</p> : null}

          {!loading ? (
            <form className="adm-form-stack" onSubmit={onSubmit}>
              <div>
                <label className="adm-label" htmlFor="title">
                  Titulo
                </label>
                <input
                  className="adm-field"
                  id="title"
                  minLength={10}
                  onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                  required
                  value={form.title}
                />
              </div>

              <div className="adm-grid-2">
                <div>
                  <label className="adm-label" htmlFor="authorName">
                    Autor
                  </label>
                  <input
                    className="adm-field"
                    id="authorName"
                    minLength={3}
                    onChange={(event) => setForm((previous) => ({ ...previous, authorName: event.target.value }))}
                    required
                    value={form.authorName}
                  />
                </div>

                <div>
                  <label className="adm-label" htmlFor="authorImageUrl">
                    Foto do autor (URL opcional)
                  </label>
                  <input
                    className="adm-field"
                    id="authorImageUrl"
                    onChange={(event) => setForm((previous) => ({ ...previous, authorImageUrl: event.target.value }))}
                    placeholder="https://..."
                    type="url"
                    value={form.authorImageUrl}
                  />
                </div>
              </div>

              <div>
                <label className="adm-label" htmlFor="excerpt">
                  Resumo
                </label>
                <textarea
                  className="adm-field adm-textarea"
                  id="excerpt"
                  minLength={20}
                  onChange={(event) => setForm((previous) => ({ ...previous, excerpt: event.target.value }))}
                  required
                  rows={3}
                  value={form.excerpt}
                />
              </div>

              <div>
                <label className="adm-label" htmlFor="content">
                  Conteudo (HTML)
                </label>
                <textarea
                  className="adm-field adm-textarea adm-content-field"
                  id="content"
                  minLength={100}
                  onChange={(event) => setForm((previous) => ({ ...previous, content: event.target.value }))}
                  required
                  rows={12}
                  value={form.content}
                />
              </div>

              <div>
                <label className="adm-label" htmlFor="status">
                  Status
                </label>
                <select
                  className="adm-field"
                  id="status"
                  onChange={(event) => setForm((previous) => ({ ...previous, published: event.target.value === 'true' }))}
                  value={String(form.published)}
                >
                  <option value="false">Rascunho</option>
                  <option value="true">Publicado</option>
                </select>
              </div>

              <div>
                <label className="adm-label" htmlFor="cover">
                  Imagem (image/* ate 5 MB)
                </label>
                <input
                  accept="image/*"
                  className="adm-field adm-file-field"
                  disabled={isBusy}
                  id="cover"
                  onChange={onFileChange}
                  type="file"
                />
                {selectedFile ? <p className="adm-text-note">Imagem pronta para upload: {selectedFile.name}</p> : null}
                {uploading ? <p className="adm-text-note">Enviando imagem para o Firebase Storage...</p> : null}
                {imageUrl ? <img alt={`Imagem da coluna ${form.title || 'sem titulo'}`} className="adm-cover" src={imageUrl} /> : null}
              </div>

              {error ? <p className="adm-text-error">{error}</p> : null}
              {success ? <p className="adm-text-success">{success}</p> : null}

              <div className="adm-actions adm-submit-row">
                <button className="adm-btn adm-btn-primary" disabled={isBusy} type="submit">
                  {uploading ? 'Enviando imagem...' : saving ? 'Salvando...' : 'Salvar coluna'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
};
