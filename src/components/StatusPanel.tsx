import type { ArticleStatus, ArticleVisibility, Author } from '../types';

interface Props {
  status: ArticleStatus;
  visibility: ArticleVisibility;
  publishedAt: string | null;
  author: Author | null;
  onChange: (patch: {
    status?: ArticleStatus;
    visibility?: ArticleVisibility;
    publishedAt?: string | null;
  }) => void;
}

export default function StatusPanel({
  status,
  visibility,
  publishedAt,
  author,
  onChange,
}: Props) {
  const isScheduled = status === 'SCHEDULED';

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Status &amp; Visibility
      </h3>

      <div className="space-y-4 text-sm">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="shrink-0 text-gray-600">Visibility</span>

          <select
            value={visibility}
            onChange={(e) =>
              onChange({
                visibility: e.target.value as ArticleVisibility,
              })
            }
            className="w-full min-w-0 rounded-md border border-gray-200 bg-white px-2 py-1.5 font-medium text-emerald-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-auto sm:border-none sm:bg-transparent sm:px-0 sm:py-1 sm:text-right"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="PASSWORD_PROTECTED">Password protected</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="shrink-0 text-gray-600">Publish</span>

          <select
            value={
              status === 'PUBLISHED'
                ? 'IMMEDIATELY'
                : status === 'SCHEDULED'
                  ? 'SCHEDULED'
                  : 'DRAFT'
            }
            onChange={(e) => {
              const v = e.target.value;

              if (v === 'IMMEDIATELY') {
                onChange({
                  status: 'PUBLISHED',
                  publishedAt: new Date().toISOString(),
                });
              } else if (v === 'SCHEDULED') {
                onChange({
                  status: 'SCHEDULED',
                });
              } else {
                onChange({
                  status: 'DRAFT',
                  publishedAt: null,
                });
              }
            }}
            className="w-full min-w-0 rounded-md border border-gray-200 bg-white px-2 py-1.5 font-medium text-emerald-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-auto sm:border-none sm:bg-transparent sm:px-0 sm:py-1 sm:text-right"
          >
            <option value="DRAFT">Save as draft</option>
            <option value="IMMEDIATELY">Immediately</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </div>

        {isScheduled && (
          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <span className="shrink-0 text-gray-600">Date &amp; time</span>

            <input
              type="datetime-local"
              value={publishedAt ? publishedAt.slice(0, 16) : ''}
              onChange={(e) =>
                onChange({
                  publishedAt: e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null,
                })
              }
              className="w-full min-w-0 rounded-md border border-gray-200 px-2 py-1.5 text-xs focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:w-auto"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="shrink-0 text-gray-600">Author</span>

          <span className="flex min-w-0 items-center gap-2 font-medium text-gray-900 sm:max-w-[65%] sm:justify-end">
            {author?.avatarUrl && (
              <img
                src={author.avatarUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
            )}

            <span className="truncate">
              {author?.name ?? 'Unassigned'}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}