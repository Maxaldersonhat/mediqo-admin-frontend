interface Props {
  slugUrl: string;
  metaTitle: string;
  metaDescription: string;
  onChange: (patch: { metaTitle?: string; metaDescription?: string }) => void;
}

function CounterLabel({ value, max }: { value: number; max: number }) {
  const over = value > max;
  return (
    <span className={`text-xs ${over ? 'text-red-500' : 'text-gray-400'}`}>
      {value}/{max}
    </span>
  );
}

export default function SeoPanel({ slugUrl, metaTitle, metaDescription, onChange }: Props) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        SEO Optimization
      </h3>

      <div className="space-y-4 text-sm">
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-gray-600">Meta Title</label>
            <CounterLabel value={metaTitle.length} max={70} />
          </div>
          <input
            value={metaTitle}
            onChange={(e) => onChange({ metaTitle: e.target.value })}
            maxLength={90}
            className="w-full rounded-md border border-gray-200 px-3 py-2"
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="text-gray-600">Meta Description</label>
            <CounterLabel value={metaDescription.length} max={160} />
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
            rows={4}
            maxLength={220}
            className="w-full resize-none rounded-md border border-gray-200 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-2 block text-gray-600">Search Preview</label>
          <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
            <p className="truncate text-xs text-gray-500">{slugUrl}</p>
            <p className="truncate text-base text-blue-700">
              {metaTitle || 'Your meta title will appear here'}
            </p>
            <p className="line-clamp-2 text-sm text-gray-600">
              {metaDescription || 'Your meta description will appear here.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}