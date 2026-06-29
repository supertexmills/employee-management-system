export function escapeRegex(term) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildTextSearchFilter(term, fields) {
  const trimmed = term?.trim();
  if (!trimmed) return {};

  const pattern = new RegExp(escapeRegex(trimmed), "i");
  return { $or: fields.map((field) => ({ [field]: pattern })) };
}

export function paginate(query) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}
