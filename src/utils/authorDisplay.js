import axiosInstance from './axiosInstance';
import { getUser, storeUser } from './tokenManager';

const authorProfileCache = new Map();

/** Subtitle under post author name (position, company, or role). */
export function getAuthorSubtitle(author, authorId) {
  const enriched = enrichPostAuthor(author, authorId);
  if (!enriched || typeof enriched !== 'object') return 'Professional';

  const position =
    enriched.jobTitle || enriched.job_title || enriched.title || null;
  const company = enriched.companyName || enriched.company_name || null;
  const role = enriched.role;

  if (role === 'recruiter' || company) {
    if (position && company) return `${position} at ${company}`;
    if (position) return position;
    if (company) return company;
  }

  if (position) return position;
  if (role && role !== 'recruiter') return role;

  return 'Professional';
}

/** Merge recruiter fields from API shapes and the signed-in user (own posts). */
export function enrichPostAuthor(author, authorId) {
  if (!author || typeof author !== 'object') return author;

  const currentUser = getUser();
  const isOwnPost =
    currentUser?.id != null &&
    authorId != null &&
    String(currentUser.id) === String(authorId);

  const fromSelf = isOwnPost
    ? {
        role: currentUser.role,
        jobTitle: currentUser.jobTitle || currentUser.job_title || null,
        companyName: currentUser.company_name || currentUser.companyName || null,
      }
    : {};

  const cached = authorId != null ? authorProfileCache.get(String(authorId)) : null;

  return {
    ...author,
    ...cached,
    ...fromSelf,
    role: author.role ?? cached?.role ?? fromSelf.role ?? null,
    jobTitle:
      author.jobTitle ??
      author.job_title ??
      cached?.jobTitle ??
      fromSelf.jobTitle ??
      null,
    companyName:
      author.companyName ??
      author.company_name ??
      cached?.companyName ??
      fromSelf.companyName ??
      null,
  };
}

async function fetchOwnProfileIfNeeded() {
  const currentUser = getUser();
  if (!currentUser?.id) return null;

  const hasRecruiterFields =
    currentUser.job_title ||
    currentUser.jobTitle ||
    currentUser.company_name ||
    currentUser.companyName;
  if (hasRecruiterFields) return null;

  try {
    const { data } = await axiosInstance.get('/auth/user/profile');
    const row = data?.data ?? data;
    if (!row || typeof row !== 'object') return null;

    const profile = {
      role: row.role ?? currentUser.role ?? null,
      jobTitle: row.job_title ?? row.jobTitle ?? null,
      companyName: row.company_name ?? row.companyName ?? null,
    };

    const merged = {
      ...currentUser,
      role: profile.role,
      job_title: profile.jobTitle,
      jobTitle: profile.jobTitle,
      company_name: profile.companyName,
      companyName: profile.companyName,
    };
    storeUser(merged);
    authorProfileCache.set(String(currentUser.id), profile);
    return profile;
  } catch {
    return null;
  }
}

async function fetchAuthorProfileSummary(userId) {
  const id = String(userId);
  if (authorProfileCache.has(id)) {
    return authorProfileCache.get(id);
  }

  const endpoints = [
    `/api/users/${id}/profile`,
    `/api/connections/users/${id}/profile`,
  ];

  for (const url of endpoints) {
    try {
      const { data } = await axiosInstance.get(url);
      const row = data?.data ?? data;
      if (!row || typeof row !== 'object') continue;

      const profile = {
        role: row.role ?? null,
        jobTitle: row.job_title ?? row.jobTitle ?? row.title ?? null,
        companyName: row.company_name ?? row.companyName ?? null,
      };
      authorProfileCache.set(id, profile);
      return profile;
    } catch {
      /* try next endpoint */
    }
  }

  authorProfileCache.set(id, null);
  return null;
}

function authorNeedsHydration(author) {
  if (!author) return true;
  return !(
    author.jobTitle ||
    author.job_title ||
    author.companyName ||
    author.company_name
  );
}

/** Fill missing recruiter author fields from profile API (works with older post payloads). */
export async function hydratePostsAuthors(posts = []) {
  if (!Array.isArray(posts) || posts.length === 0) return posts;

  const normalized = posts.map((post) => ({
    ...post,
    author: enrichPostAuthor(post.author, post.authorId),
    repostedBy: post.repostedBy
      ? enrichPostAuthor(post.repostedBy, post.repostedBy.id)
      : null,
  }));

  const idsToFetch = [
    ...new Set(
      normalized
        .flatMap((post) => {
          const ids = [];
          if (post.authorId && authorNeedsHydration(post.author)) {
            ids.push(String(post.authorId));
          }
          if (post.repostedBy?.id && authorNeedsHydration(post.repostedBy)) {
            ids.push(String(post.repostedBy.id));
          }
          return ids;
        }),
    ),
  ];

  const currentUser = getUser();
  const ownPostNeedsHydration = normalized.some(
    (post) =>
      currentUser?.id != null &&
      ((String(post.authorId) === String(currentUser.id) &&
        authorNeedsHydration(post.author)) ||
        (String(post.repostedBy?.id) === String(currentUser.id) &&
          authorNeedsHydration(post.repostedBy))),
  );

  if (ownPostNeedsHydration) {
    await fetchOwnProfileIfNeeded();
  }

  if (idsToFetch.length > 0) {
    await Promise.all(idsToFetch.map((id) => fetchAuthorProfileSummary(id)));
  }

  return normalized.map((post) => ({
    ...post,
    author: enrichPostAuthor(post.author, post.authorId),
    repostedBy: post.repostedBy
      ? enrichPostAuthor(post.repostedBy, post.repostedBy.id)
      : null,
  }));
}

export function normalizePost(post) {
  if (!post) return post;
  return {
    ...post,
    author: enrichPostAuthor(post.author, post.authorId),
  };
}

export async function normalizePostsPayload(data) {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data.posts)) {
    return {
      ...data,
      posts: await hydratePostsAuthors(data.posts.map(normalizePost)),
    };
  }

  if (data.post) {
    const [post] = await hydratePostsAuthors([normalizePost(data.post)]);
    return { ...data, post };
  }

  return data;
}
