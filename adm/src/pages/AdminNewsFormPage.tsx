import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "../components/admin/AdminShell";
import { useToast } from "../components/ui/toast";
import { OTHER_CATEGORY_VALUE, NEWS_CATEGORIES, NEWS_STATUS_OPTIONS } from "../constants/news";
import { useAuth } from "../context/AuthContext";
import { newsService } from "../services/news.service";
import { storageService, validateNewsImageFile } from "../services/storage.service";
import type { NewsItem, NewsStatus } from "../types/api";

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string;
  status: NewsStatus;
}

const toFormState = (news: NewsItem): FormState => ({
  title: news.title,
  slug: news.slug,
  excerpt: news.excerpt ?? "",
  content: news.content,
  tags: news.tags.join(", "),
  status: news.status,
});

const hydrateCategoryFields = (category: string | null | undefined) => {
  const raw = (category ?? "").trim();
  if (!raw) {
    return {
      selected: "",
      custom: "",
    };
  }

  if (NEWS_CATEGORIES.includes(raw)) {
    return {
      selected: raw,
      custom: "",
    };
  }

  return {
    selected: OTHER_CATEGORY_VALUE,
    custom: raw,
  };
};

export const AdminNewsFormPage = () => {
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
  const [newsId, setNewsId] = useState<string | null>(id ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [categorySelection, setCategorySelection] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    tags: "",
    status: "draft",
  });

  const tagsArray = useMemo(
    () =>
      form.tags
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.tags],
  );

  const isBusy = saving || uploading;

  useEffect(() => {
    if (!isEdit || !id) return;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await newsService.getById(id);
        const categoryFields = hydrateCategoryFields(data.category);

        setForm(toFormState(data));
        setCategorySelection(categoryFields.selected);
        setCustomCategory(categoryFields.custom);
        setNewsId(data.id);
        setImageUrl(data.imageUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar noticia");
        toast({ title: "Erro ao carregar noticia", variant: "error" });
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
      validateNewsImageFile(file);
      setSelectedFile(file);
      setError(null);
    } catch (err) {
      event.target.value = "";
      setSelectedFile(null);
      const message = err instanceof Error ? err.message : "Arquivo invalido.";
      setError(message);
      toast({ title: "Imagem invalida", description: message, variant: "error" });
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const resolvedCategory =
      categorySelection === OTHER_CATEGORY_VALUE ? customCategory.trim() : categorySelection.trim();

    if (!resolvedCategory) {
      const message = "Categoria obrigatoria. Selecione uma categoria para salvar.";
      setError(message);
      toast({ title: "Categoria obrigatoria", description: "Selecione uma categoria.", variant: "error" });
      return;
    }

    setSaving(true);

    try {
      const payload: {
        title: string;
        slug?: string;
        excerpt: string;
        content: string;
        category: string;
        tags: string[];
        status: NewsStatus;
      } = {
        title: form.title,
        slug: form.slug.trim() || undefined,
        excerpt: form.excerpt,
        content: form.content,
        category: resolvedCategory,
        tags: tagsArray,
        status: form.status,
      };

      const saved = isEdit && id ? await newsService.update(id, payload) : await newsService.create(payload);

      if (selectedFile) {
        setUploading(true);
        const uploadedImage = await storageService.uploadNewsImage(saved.id, selectedFile);
        setImageUrl(uploadedImage.imageUrl);
      } else {
        setImageUrl(saved.imageUrl);
      }

      setNewsId(saved.id);
      setSelectedFile(null);
      setSuccess("Noticia salva com sucesso.");
      toast({ title: "Noticia salva com sucesso", variant: "success" });

      if (!isEdit) {
        navigate(`/news/${saved.id}`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar noticia");
      toast({ title: "Erro ao salvar noticia", variant: "error" });
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const onTogglePublish = async () => {
    if (!newsId) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await newsService.publish(newsId, form.status !== "published");
      setForm((previous) => ({ ...previous, status: updated.status }));
      const message = updated.status === "published" ? "Noticia publicada" : "Noticia movida para rascunho";
      setSuccess(`${message}.`);
      toast({ title: message, variant: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar publicacao");
      toast({ title: "Erro ao alterar publicacao", variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await logout();
    toast({ title: "Sessao encerrada" });
  };

  return (
    <AdminShell
      title={isEdit ? "Editar noticia" : "Nova noticia"}
      subtitle="Use o mesmo padrao editorial do portal para publicar materias."
      actions={
        <div className="adm-actions">
          <Link className="adm-btn adm-btn-outline" to="/columns">
            Colunas
          </Link>
          <Link className="adm-btn adm-btn-outline" to="/sponsors">
            Patrocinadores
          </Link>
          <Link className="adm-btn adm-btn-outline" to="/news">
            Voltar
          </Link>
          {isEdit ? (
            <button className="adm-btn adm-btn-outline" disabled={isBusy} onClick={() => void onTogglePublish()} type="button">
              {form.status === "published" ? "Despublicar" : "Publicar"}
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
                  id="title"
                  className="adm-field"
                  onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                  required
                  value={form.title}
                />
              </div>

              <div>
                <label className="adm-label" htmlFor="slug">
                  Slug
                </label>
                <input
                  id="slug"
                  className="adm-field"
                  onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
                  placeholder="gerado-automaticamente-se-vazio"
                  value={form.slug}
                />
              </div>

              <div>
                <label className="adm-label" htmlFor="excerpt">
                  Resumo
                </label>
                <textarea
                  id="excerpt"
                  className="adm-field adm-textarea"
                  onChange={(event) => setForm((previous) => ({ ...previous, excerpt: event.target.value }))}
                  rows={3}
                  value={form.excerpt}
                />
              </div>

              <div>
                <label className="adm-label" htmlFor="content">
                  Conteudo
                </label>
                <textarea
                  id="content"
                  className="adm-field adm-textarea adm-content-field"
                  onChange={(event) => setForm((previous) => ({ ...previous, content: event.target.value }))}
                  required
                  rows={12}
                  value={form.content}
                />
              </div>

              <div className="adm-grid-2">
                <div>
                  <label className="adm-label" htmlFor="category">
                    Categoria
                  </label>
                  <select
                    id="category"
                    className="adm-field"
                    onChange={(event) => {
                      const next = event.target.value;
                      setCategorySelection(next);
                      if (next !== OTHER_CATEGORY_VALUE) {
                        setCustomCategory("");
                      }
                    }}
                    required
                    value={categorySelection}
                  >
                    <option value="">Selecione uma categoria</option>
                    {NEWS_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                    <option value={OTHER_CATEGORY_VALUE}>Outra</option>
                  </select>
                </div>

                <div>
                  <label className="adm-label" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    className="adm-field"
                    onChange={(event) =>
                      setForm((previous) => ({ ...previous, status: event.target.value as NewsStatus }))
                    }
                    value={form.status}
                  >
                    {NEWS_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {categorySelection === OTHER_CATEGORY_VALUE ? (
                <div>
                  <label className="adm-label" htmlFor="customCategory">
                    Categoria personalizada
                  </label>
                  <input
                    id="customCategory"
                    className="adm-field"
                    onChange={(event) => setCustomCategory(event.target.value)}
                    placeholder="Digite a categoria"
                    required
                    value={customCategory}
                  />
                </div>
              ) : null}

              <div>
                <label className="adm-label" htmlFor="tags">
                  Tags (separadas por virgula)
                </label>
                <input
                  id="tags"
                  className="adm-field"
                  onChange={(event) => setForm((previous) => ({ ...previous, tags: event.target.value }))}
                  value={form.tags}
                />
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
                {imageUrl ? (
                  <img
                    alt={`Imagem da noticia ${form.title || "sem titulo"}`}
                    className="adm-cover"
                    src={imageUrl}
                  />
                ) : null}
              </div>

              {error ? <p className="adm-text-error">{error}</p> : null}
              {success ? <p className="adm-text-success">{success}</p> : null}

              <div className="adm-actions adm-submit-row">
                <button className="adm-btn adm-btn-primary" disabled={isBusy} type="submit">
                  {uploading ? "Enviando imagem..." : saving ? "Salvando..." : "Salvar noticia"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </section>
    </AdminShell>
  );
};
