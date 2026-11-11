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
    const wpApiUrl = `${cleanUrl}/wp-json/wp/v2/posts?per_page=10&_embed=true`;

    const wpResponse = await fetch(wpApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (wpResponse.ok) {
      const posts = await wpResponse.json();
      const formattedPosts = posts.map((p, index) => ({
        id: p.id || index + 1,
        title: p.title?.rendered ? p.title.rendered.replace(/<[^>]+>/g, '') : 'No Title',
        link: p.link || '',
        category: 'Story',
        content: p.content?.rendered || ''
      }));

      return res.status(200).json({ success: true, posts: formattedPosts });
    }

    const htmlResponse = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const htmlText = await htmlResponse.text();
    return res.status(200).json({ success: true, rawHtml: htmlText });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
