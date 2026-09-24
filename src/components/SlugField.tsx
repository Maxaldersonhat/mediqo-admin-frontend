import { useEffect, useRef, useState } from 'react';
import { checkSlugAvailability } from '../services/articleService';
import { slugify } from '../lib/slug';

interface Props {
  domainPrefix: string;
  slug: string;
  articleId?: number;
  onChange: (slug: string) => void;
}

type CheckState = 'idle' | 'checking' | 'available' | 'taken';

export default function SlugField({ domainPrefix, slug, articleId, onChange }: Props) {
  const [checkState, setCheckState] = useState<CheckState>('idle');
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!slug) {
      setCheckState('idle');
      return;
    }
    setCheckState('checking');
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const result = await checkSlugAvailability(slug, articleId);
        setCheckState(result.available ? 'available' : 'taken');
        setSuggestion(result.suggested ?? null);
      } catch {
        setCheckState('idle');
      }
    }, 400);
    return () => {
      if (debounceRef.current !== null) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [slug, articleId]);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-gray-400">🔗</span>
        <span>{domainPrefix}</span>
        <input
          value={slug}
          onChange={(e) => onChange(slugify(e.target.value, 80))}
          className="border-b border-transparent bg-transparent font-medium text-gray-700 focus:border-gray-300 focus:outline-none"
        />
        {checkState === 'checking' && <span className="text-xs text-gray-400">checking…</span>}
        {checkState === 'available' && <span title="Slug is available" className="text-emerald-500">✓</span>}
        {checkState === 'taken' && <span title="Slug is taken" className="text-red-500">⚠</span>}
      </div>
      {checkState === 'taken' && suggestion && (
        <button
          type="button"
          onClick={() => onChange(suggestion)}
          className="mt-1 text-xs text-emerald-600 hover:underline"
        >
          Use "{suggestion}" instead
        </button>
      )}
    </div>
  );
}