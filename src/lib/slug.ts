export function slugify(input: string, maxLength: number = 60): string {
  const slug = input
    .toString()
    .normalize('NFKD') 
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (slug.length <= maxLength) return slug;

  const truncated = slug.slice(0, maxLength);
  const lastDash = truncated.lastIndexOf('-');
  return lastDash > 20 ? truncated.slice(0, lastDash) : truncated;
}

export function isValidSlugFormat(slug: string): boolean {
  return /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug);
}