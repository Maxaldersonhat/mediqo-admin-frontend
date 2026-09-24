interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  featuredImage: string | null;
  excerpt: string | null;
  content: string;
  metaTitle: string;
  metaDescription: string;
}

export default function PreviewModal({
  open,
  onClose,
  title,
  featuredImage,
  excerpt,
  content,
  metaTitle,
  metaDescription,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-all">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Article Preview
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
            title="Close Preview"
          >
            ✕
          </button>
        </div>

        {/* Article Body Content */}
        <div className="overflow-y-auto px-8 py-8">
          {/* Featured Image */}
          {featuredImage && (
            <img
              src={featuredImage}
              alt="Featured Header"
              className="mb-8 max-h-[420px] w-full rounded-2xl object-cover shadow-lg"
            />
          )}

          {/* Title */}
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight">
            {title || 'Untitled Article'}
          </h1>

          {/* Excerpt */}
          {excerpt && (
            <p className="mb-8 text-xl font-normal italic text-gray-600 dark:text-gray-300 leading-relaxed border-l-4 border-blue-500 pl-4">
              {excerpt}
            </p>
          )}

          {/* Rendered Content + Embedded Images */}
          <div
            className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 
              [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:text-gray-900 dark:[&_h2]:text-white
              [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:leading-relaxed [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
              [&_a]:text-blue-600 [&_a]:underline dark:[&_a]:text-blue-400
              [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:bg-blue-50/50 dark:[&_blockquote]:bg-gray-800/50 [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:italic [&_blockquote]:rounded-r-xl [&_blockquote]:my-6
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-2xl [&_img]:my-6 [&_img]:shadow-md [&_img]:block [&_img]:mx-auto"
            dangerouslySetInnerHTML={{
              __html: content || '<p class="text-gray-400 italic">No content written yet.</p>',
            }}
          />

          {/* Search Engine Card Preview */}
          <div className="mt-12 rounded-2xl border border-gray-200 bg-gray-50/80 p-5 dark:border-gray-800 dark:bg-gray-800/50">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              Google Search Preview
            </p>
            <p className="truncate text-lg font-medium text-blue-700 hover:underline dark:text-blue-400 cursor-pointer">
              {metaTitle || title || 'Your Article Meta Title'}
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400 mb-1">
              https://mediqo.co.ke/articles/{title ? title.toLowerCase().replace(/\s+/g, '-') : 'article-slug'}
            </p>
            <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
              {metaDescription || excerpt || 'Your search engine snippet description will appear here.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}