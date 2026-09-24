import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Article, ArticleInput, ArticleStatus, ArticleVisibility } from '../types';
import { createArticle, updateArticle } from '../services/articleService';
import SlugField from './SlugField';
import EditorToolbar from './EditorToolbar';
import StatusPanel from './StatusPanel';
import DocumentMetaPanel from './DocumentMetaPanel';
import SeoPanel from './SeoPanel';
import PreviewModal from '../modals/PreviewModal';

const DOMAIN_PREFIX = 'mediqo.co.ke/articles/';
const AUTOSAVE_DELAY = 1500;

interface Props {
  initialArticle?: Article;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function ArticleEditor({ initialArticle }: Props) {
  const navigate = useNavigate();
  const [articleId, setArticleId] = useState<number | undefined>(initialArticle?.id);
  const [title, setTitle] = useState(initialArticle?.title ?? '');
  const [slug, setSlug] = useState(initialArticle?.slug ?? '');
  const [, setSlugTouched] = useState(!!initialArticle);
  const [content, setContent] = useState(initialArticle?.content ?? '');
  const [status, setStatus] = useState<ArticleStatus>(initialArticle?.status ?? 'DRAFT');
  const [visibility, setVisibility] = useState<ArticleVisibility>(
    initialArticle?.visibility ?? 'PUBLIC'
  );
  const [publishedAt, setPublishedAt] = useState<string | null>(initialArticle?.publishedAt ?? null);
  const [categoryId, setCategoryId] = useState<number | null>(initialArticle?.categoryId ?? null);
  const [featuredImage, setFeaturedImage] = useState<string | null>(initialArticle?.featuredImage ?? null);
  const [excerpt, setExcerpt] = useState<string | null>(initialArticle?.excerpt ?? null);
  const [metaTitle, setMetaTitle] = useState(initialArticle?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(initialArticle?.metaDescription ?? '');
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [previewOpen, setPreviewOpen] = useState(false);

  // Link Modal State & Selection Preservation
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const savedRangeRef = useRef<Range | null>(null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHydratedBody = useRef(false);

  useEffect(() => {
    if (!initialArticle && !metaTitle) setMetaTitle(title);
  }, [title, metaTitle, initialArticle]);

  // Prevent cursor position resets: Hydrate innerHTML ONLY on initial load
  useEffect(() => {
    if (bodyRef.current && !hasHydratedBody.current) {
      bodyRef.current.innerHTML = content;
      hasHydratedBody.current = true;
    }
  }, [content]);

  // Execute formatting actions cleanly inside contentEditable
  const handleFormat = (command: string, value: string | undefined = undefined) => {
    if (command === 'fontSize') {
      // Force browser to generate modern CSS inline styles instead of HTML <font> tags
      document.execCommand('styleWithCSS', false, 'true');
    }

    document.execCommand(command, false, value);

    if (bodyRef.current) {
      setContent(bodyRef.current.innerHTML);
    }
  };

  // Open Link Modal & Save Current Cursor/Text Selection
  const handleInsertLink = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
      setLinkText(sel.toString());
    } else {
      savedRangeRef.current = null;
      setLinkText('');
    }
    setLinkUrl('');
    setIsLinkModalOpen(true);
  };

  // Apply Link on Modal Confirm
  const handleConfirmLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    let formattedUrl = linkUrl.trim();
    if (
      !/^https?:\/\//i.test(formattedUrl) &&
      !formattedUrl.startsWith('#') &&
      !formattedUrl.startsWith('mailto:')
    ) {
      formattedUrl = `https://${formattedUrl}`;
    }

    if (bodyRef.current) {
      bodyRef.current.focus();

      // Restore saved cursor selection
      if (savedRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(savedRangeRef.current);
        }
      }

      const currentSelectionText = window.getSelection()?.toString();

      // If no text was highlighted initially, insert text + link
      if (!currentSelectionText && linkText.trim()) {
        const linkHtml = `<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${linkText.trim()}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        document.execCommand('createLink', false, formattedUrl);
      }

      setContent(bodyRef.current.innerHTML);
    }

    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkText('');
  };

  const UPLOAD_API_URL = import.meta.env.VITE_UPLOAD_API_URL || 'http://localhost:3000/api/upload';

  // Helper function to restore focus and insert uploaded image inside an isolated block
  const insertImageAtCursor = (url: string) => {
    if (!bodyRef.current) return;

    bodyRef.current.focus();

    // Embed image inside a centered block paragraph followed by a fresh empty paragraph
    const imgHtml = `<p style="text-align: center;"><img src="${url}" alt="Article upload" class="max-w-full h-auto my-6 rounded-xl shadow-md inline-block" /></p><p><br></p>`;
    const success = document.execCommand('insertHTML', false, imgHtml);

    // Fallback if execCommand insertHTML fails
    if (!success) {
      document.execCommand('insertImage', false, url);
    }

    // Immediately sync state for save and live preview
    setContent(bodyRef.current.innerHTML);
  };

  const uploadAndEmbedImage = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${UPLOAD_API_URL}/images`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: formData,
      });

      if (res.status === 401) {
        alert('Your session has expired. Please log in again.');
        return;
      }

      if (!res.ok) throw new Error('Upload failed');
      const { url } = await res.json();

      // Embed image directly into editor canvas
      insertImageAtCursor(url);
    } catch {
      alert('Failed to upload image. Please try again.');
    }
  };

  // Handle Drag & Drop and Paste image embedding
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) uploadAndEmbedImage(file);
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          uploadAndEmbedImage(file);
        }
      }
    }
  };

  const buildPayload = useCallback(
    (): ArticleInput => ({
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      visibility,
      metaTitle,
      metaDescription,
      categoryId,
      authorId: initialArticle?.authorId ?? null,
      publishedAt,
    }),
    [
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      status,
      visibility,
      metaTitle,
      metaDescription,
      categoryId,
      publishedAt,
      initialArticle,
    ]
  );

  const save = useCallback(async () => {
    if (!title.trim()) return;
    setSaveState('saving');
    try {
      if (articleId) {
        await updateArticle(articleId, buildPayload());
      } else {
        const created = await createArticle(buildPayload());
        setArticleId(created.id);
        navigate(`/posts/${created.id}/edit`, { replace: true });
      }
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [articleId, buildPayload, navigate, title]);

  useEffect(() => {
    if (!title.trim()) return;
    if (autosaveTimer.current) {
      clearTimeout(autosaveTimer.current);
    }
    autosaveTimer.current = setTimeout(save, AUTOSAVE_DELAY);
    return () => {
      if (autosaveTimer.current) {
        clearTimeout(autosaveTimer.current);
      }
    };
  }, [title, slug, content, excerpt, featuredImage, categoryId, metaTitle, metaDescription, save]);

  const handlePublish = async () => {
    setStatus('PUBLISHED');
    const now = new Date().toISOString();
    setPublishedAt(now);
    setSaveState('saving');
    try {
      const payload = { ...buildPayload(), status: 'PUBLISHED' as ArticleStatus, publishedAt: now };
      if (articleId) {
        await updateArticle(articleId, payload);
      } else {
        const created = await createArticle(payload);
        setArticleId(created.id);
        navigate(`/posts/${created.id}/edit`, { replace: true });
      }
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  };

  const saveLabel =
    saveState === 'saving'
      ? 'Saving to cloud…'
      : saveState === 'saved'
      ? 'Saved securely just now'
      : saveState === 'error'
      ? 'Failed to save'
      : '';

  return (
    <div className="flex h-full overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-gray-400">
            <Link
              to="/posts"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Health Articles
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span>
              Editing: <em className="text-gray-900 dark:text-white font-bold not-italic">{title || 'New Insight'}</em>
            </span>
            {saveLabel && (
              <>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span
                  className={`flex items-center gap-1 ${
                    saveState === 'error' ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {saveState === 'saved' && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {saveLabel}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewOpen(true)}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Preview
            </button>
            <button
              onClick={save}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Publish Post
            </button>
          </div>
        </div>

        <div className="px-8 py-8 max-w-4xl mx-auto">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter health article title..."
            className="mb-4 w-full border-none text-4xl font-extrabold text-gray-900 placeholder-gray-300 focus:outline-none dark:bg-gray-900 dark:text-white dark:placeholder-gray-600"
          />

          <SlugField
            domainPrefix={DOMAIN_PREFIX}
            slug={slug}
            articleId={articleId}
            onChange={(s) => {
              setSlugTouched(true);
              setSlug(s);
            }}
          />

          <div className="mt-8 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <EditorToolbar
              onFormat={handleFormat}
              onInsertLink={handleInsertLink}
              onUploadImage={uploadAndEmbedImage}
            />
            <div
              ref={bodyRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => setContent((e.target as HTMLDivElement).innerHTML)}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="min-h-[500px] px-8 py-6 text-gray-800 dark:text-gray-200 focus:outline-none 
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:bg-blue-50/50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:rounded-r-xl 
                [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-blue-900 dark:[&_h2]:text-blue-300 
                [&_h3]:text-xl [&_h3]:font-bold 
                [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 
                [&_a]:text-blue-600 [&_a]:underline 
                [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl [&_img]:my-6 [&_img]:shadow-md [&_img]:inline-block"
              data-placeholder="Start writing medical insights…"
            />
          </div>
        </div>
      </div>

      <aside className="w-80 shrink-0 space-y-5 overflow-y-auto border-l border-blue-50 bg-blue-50/30 p-5 dark:border-gray-800 dark:bg-gray-900/50">
        <StatusPanel
          status={status}
          visibility={visibility}
          publishedAt={publishedAt}
          author={initialArticle?.author ?? null}
          onChange={(patch) => {
            if (patch.status !== undefined) setStatus(patch.status);
            if (patch.visibility !== undefined) setVisibility(patch.visibility);
            if (patch.publishedAt !== undefined) setPublishedAt(patch.publishedAt);
          }}
        />
        <DocumentMetaPanel
          categoryId={categoryId}
          featuredImage={featuredImage}
          excerpt={excerpt}
          onChange={(patch) => {
            if (patch.categoryId !== undefined) setCategoryId(patch.categoryId);
            if (patch.featuredImage !== undefined) setFeaturedImage(patch.featuredImage);
            if (patch.excerpt !== undefined) setExcerpt(patch.excerpt);
          }}
        />
        <SeoPanel
          slugUrl={`${DOMAIN_PREFIX}${slug || 'your-slug'}`}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          onChange={(patch) => {
            if (patch.metaTitle !== undefined) setMetaTitle(patch.metaTitle);
            if (patch.metaDescription !== undefined) setMetaDescription(patch.metaDescription);
          }}
        />
      </aside>

      {/* Insert Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Insert Hyperlink</h4>
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmLink} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Link Text
                </label>
                <input
                  type="text"
                  placeholder="e.g. Read full study"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Target URL
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!linkUrl.trim()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={title}
        featuredImage={featuredImage}
        excerpt={excerpt}
        content={content}
        metaTitle={metaTitle}
        metaDescription={metaDescription}
      />
    </div>
  );
}