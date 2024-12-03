import { supabase } from './supabase';
import type { DirectoryItem, BlogPost } from './supabase';

export async function performSearch(query: string, resultsContainer: HTMLElement) {
  const searchTerm = query.trim().toLowerCase();
  
  if (!searchTerm || searchTerm.length < 2) {
    resultsContainer.innerHTML = '<p class="text-center text-gray-500">Start typing to search...</p>';
    return;
  }

  try {
    const [{ data: directory = [] }, { data: posts = [] }] = await Promise.all([
      supabase
        .from('directory_items')
        .select('*')
        .textSearch('title', searchTerm, { config: 'english' })
        .order('created_at', { ascending: false }),
      supabase
        .from('blog_posts')
        .select('*')
        .textSearch('title', searchTerm, { config: 'english' })
        .order('published_date', { ascending: false })
    ]);

    const results = [
      ...directory.map((item: DirectoryItem) => ({
        type: 'directory' as const,
        id: item.id,
        data: item
      })),
      ...posts.map((post: BlogPost) => ({
        type: 'post' as const,
        id: post.id,
        data: post
      }))
    ];

    resultsContainer.innerHTML = results.length ? results
      .map(result => `
        <a
          href="/${result.type === 'directory' ? 'directory' : 'blog'}/${result.id}"
          class="block p-4 hover:bg-gray-50 rounded-lg"
        >
          <h3 class="font-semibold">${result.data.title}</h3>
          <p class="text-sm text-gray-600">${result.data.description}</p>
          <span class="text-xs text-gray-500 mt-1 inline-block">
            ${result.type === 'directory' ? 'Directory' : 'Blog'}
          </span>
        </a>
      `)
      .join('') : '<p class="text-center text-gray-500">No results found</p>';
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = '<p class="text-center text-red-500">An error occurred while searching</p>';
  }
}