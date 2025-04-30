import fetch from 'node-fetch';

const ACCESS_KEY = 'OLMmZ4eei3YzboBOwaxjGQEjDw24F9wjU9by0xO6lcw';

// Test function to verify access key
export const testUnsplashAccess = async () => {
  try {
    const response = await fetch(
      'https://api.unsplash.com/photos/random',
      {
        headers: {
          'Authorization': `Client-ID ${ACCESS_KEY}`
        }
      }
    );

    const text = await response.text();
    console.log('Unsplash Test Response:', {
      status: response.status,
      text: text,
      headers: Object.fromEntries(response.headers.entries())
    });

    return response.ok;
  } catch (error) {
    console.error('Unsplash Test Error:', error);
    return false;
  }
};

// Simple cache to avoid repeated requests
const cache = new Map();

async function unsplashSearch(query) {
  if (cache.has(query)) return cache.get(query);

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape&client_id=${ACCESS_KEY}`,
    { headers: { 'Accept-Version': 'v1' } }
  );

  if (!response.ok) return null;
  const data = await response.json();
  if (!data.results || data.results.length === 0) return null;

  const imageUrl = data.results[Math.floor(Math.random() * data.results.length)].urls.regular;
  cache.set(query, imageUrl);
  return imageUrl;
}

export const getCarImage = async (brand, model) => {
  brand = brand || '';
  model = model || '';
  let queries = [
    `${brand} ${model} car`.trim(),
    `${brand} car`.trim(),
    brand.trim()
  ];

  for (let q of queries) {
    if (!q) continue;
    let imageUrl = await unsplashSearch(q);
    if (imageUrl) return imageUrl;
  }

  // If it's a BMW, use your local BMW image as fallback
  if (brand.toLowerCase() === 'bmw') {
    return '/sddefault.jpg';
  }

  // Fallback to a public image for all other brands
  return 'https://images.unsplash.com/photo-1461632830798-3adb3034e4c8?auto=format&fit=crop&w=800&q=80';
}; 