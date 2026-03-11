import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { FontSize } from "@tiptap/extension-text-style/font-size";
import { TextStyle } from "@tiptap/extension-text-style/text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { useEffect } from "react";

const FONT_SIZE_STEPS = [14, 16, 18, 20, 24, 28, 32] as const;
const FALLBACK_FONT_SIZE = 16;

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  placeholder?: string;
}

const toolbarButtonClass = (isActive: boolean) =>
  [
    "min-h-9 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors sm:text-sm",
    isActive
      ? "border-primary bg-primary text-primary-foreground"
      : "border-border bg-background text-foreground hover:bg-muted",
  ].join(" ");

const parseFontSize = (value: unknown): number | null => {
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)px$/i);
  if (!match) return null;
  return Number(match[1]);
};

const getCurrentFontSize = (editor: Editor): number => {
  const markAttributes = editor.getAttributes("textStyle");
  const parsed = parseFontSize(markAttributes.fontSize);
  return parsed ?? FALLBACK_FONT_SIZE;
};

const stepFontSize = (editor: Editor, direction: "increase" | "decrease") => {
  const currentSize = getCurrentFontSize(editor);
  const nextSize =
    direction === "increase"
      ? FONT_SIZE_STEPS.find((step) => step > currentSize) ?? FONT_SIZE_STEPS[FONT_SIZE_STEPS.length - 1]
      : [...FONT_SIZE_STEPS].reverse().find((step) => step < currentSize) ?? FONT_SIZE_STEPS[0];

  editor.chain().focus().setFontSize(`${nextSize}px`).run();
};

const normalizeUrl = (rawValue: string): string => {
  const trimmed = rawValue.trim();
  if (!trimmed) return "";

  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

export const RichTextEditor = ({ id = "rich-text-editor", value, onChange, required = false, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontSize,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "<p></p>",
    editorProps: {
      attributes: {
        class: "ProseMirror",
        id,
        "aria-required": String(required),
        "aria-label": "Conteudo da noticia",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const nextValue = value || "<p></p>";
    const currentValue = editor.getHTML();

    if (currentValue !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false });
    }
  }, [editor, value]);

  const applyLink = () => {
    if (!editor) return;

    const previousLink = (editor.getAttributes("link").href as string | undefined) ?? "";
    const input = window.prompt("Informe a URL do link", previousLink);
    if (input === null) return;

    const url = normalizeUrl(input);
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const currentSize = editor ? getCurrentFontSize(editor) : FALLBACK_FONT_SIZE;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      <div className="flex flex-wrap gap-2 border-b border-border bg-muted/30 p-2">
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("bold")))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          type="button"
        >
          Bold
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("italic")))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          type="button"
        >
          Italic
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("underline")))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          type="button"
        >
          Underline
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("heading", { level: 1 })))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
          type="button"
        >
          H1
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("heading", { level: 2 })))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          type="button"
        >
          H2
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("heading", { level: 3 })))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
          type="button"
        >
          H3
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("bulletList")))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          type="button"
        >
          Lista
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("orderedList")))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          type="button"
        >
          Numerada
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("blockquote")))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
          type="button"
        >
          Citacao
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive("link")))}
          disabled={!editor}
          onClick={applyLink}
          type="button"
        >
          Link
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive({ textAlign: "left" })))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
          type="button"
        >
          Esquerda
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive({ textAlign: "center" })))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
          type="button"
        >
          Centro
        </button>
        <button
          className={toolbarButtonClass(Boolean(editor?.isActive({ textAlign: "right" })))}
          disabled={!editor}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
          type="button"
        >
          Direita
        </button>
        <button
          className={toolbarButtonClass(false)}
          disabled={!editor}
          onClick={() => editor && stepFontSize(editor, "decrease")}
          type="button"
        >
          A-
        </button>
        <button
          className={toolbarButtonClass(false)}
          disabled={!editor}
          onClick={() => editor && stepFontSize(editor, "increase")}
          type="button"
        >
          A+
        </button>
        <span className="inline-flex min-h-9 items-center rounded-md border border-border bg-background px-2 text-xs text-muted-foreground sm:text-sm">
          {currentSize}px
        </span>
      </div>

      <EditorContent
        className="adm-rich-editor-content min-h-[300px] px-4 py-3 text-sm leading-7 text-foreground"
        editor={editor}
      />

      {placeholder ? (
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{placeholder}</p>
      ) : null}
    </div>
  );
};


