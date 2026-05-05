import axios from 'axios';

const GITHUB_API = 'https://api.github.com';

function getTokens(): string[] {
  const tokens = process.env.GITHUB_TOKENS || '';
  return tokens.split(',').filter(Boolean);
}

let tokenIndex = 0;
function getNextToken(): string {
  const tokens = getTokens();
  if (tokens.length === 0) return '';
  const token = tokens[tokenIndex % tokens.length];
  tokenIndex = (tokenIndex + 1) % tokens.length;
  return token;
}

function headers() {
  const token = getNextToken();
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (token) h['Authorization'] = `token ${token}`;
  return h;
}

/** 获取 Trending 仓库（通过搜索高星项目模拟） */
export async function fetchTrendingRepositories(page = 1, perPage = 100) {
  const since = new Date();
  since.setDate(since.getDate() - 7);

  const { data } = await axios.get(`${GITHUB_API}/search/repositories`, {
    headers: headers(),
    params: {
      q: `created:>${since.toISOString().split('T')[0]} stars:>50`,
      sort: 'stars',
      order: 'desc',
      page,
      per_page: perPage,
    },
  });
  return data.items || [];
}

/** 获取单个仓库详情 */
export async function fetchRepository(owner: string, repo: string) {
  const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: headers(),
  });
  return data;
}

/** 获取 README 内容 */
export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
      headers: headers(),
    });
    if (data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch {
    return null;
  }
}

/** 获取语言统计 */
export async function fetchLanguages(owner: string, repo: string) {
  try {
    const { data } = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
      headers: headers(),
    });
    return data;
  } catch {
    return null;
  }
}

/** 按关键词搜索 */
export async function searchRepositories(query: string, page = 1, perPage = 100) {
  const { data } = await axios.get(`${GITHUB_API}/search/repositories`, {
    headers: headers(),
    params: { q: query, sort: 'stars', order: 'desc', page, per_page: perPage },
  });
  return data.items || [];
}
