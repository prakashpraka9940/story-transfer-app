export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter thevai' });
  }

  try {
    const cleanUrl = targetUrl.replace(/\/$/, '');
    
    // Orey nerathula 10 pages (100 stories) parallel-aa fetch panrom
    // Sila WordPress sites 'per_page=100' block pannum, aana multi-page request block pannadhu
    const pagePromises = [];
    for (let p = 1; p <= 10; p++) {
      const url = `${cleanUrl}/wp-json/wp/v2/posts?page=${p}&_embed=true`;
      pagePromises.push(
        fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        }).then(async (response) => {
          if (!response.ok) return [];
          const posts = await response.json();
          return Array.isArray(posts) ? posts : [];
        }).catch(() => [])
      );
    }

    const results = await Promise.all(pagePromises);
    const combinedPosts = results.flat();

    const formattedPosts = combinedPosts.map((p, index) => ({
      id: p.id || index + 1,
      title: p.title?.rendered ? p.title.rendered.replace(/<[^>]+>/g, '').trim() : 'No Title',
      link: p.link || '',
      category: 'Story',
      content: p.content?.rendered || ''
    }));

    if (formattedPosts.length > 0) {
      return res.status(200).json({ success: true, posts: formattedPosts });
    }

    return res.status(404).json({ error: 'Stories edukka mudiyavillai' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
