// config/theme.ts

export const wallpaperCategories = ['Specials', 'Dark', 'Nature', 'City', 'Animal', 'Anime', 'Cafe'];

export const wallpapers = [
  // Specials
  {
    id: 'abstract_waves',
    category: 'Specials',
    lightUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'winter_vibes',
    category: 'Specials',
    lightUrl: 'https://images.unsplash.com/photo-1483921020237-60f381216018?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1477601263568-180e2c6d042e?q=80&w=1920&auto=format&fit=crop&fm=webp', // Fixed URL
  },
  {
    id: 'minimalist_shapes',
    category: 'Specials',
    lightUrl: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1487147264018-f937fba0c817?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },

  // Dark (New Category)
  {
    id: 'midnight_blue',
    category: 'Dark',
    lightUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'deep_space',
    category: 'Dark',
    lightUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'obsidian_waves',
    category: 'Dark',
    lightUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'dark_forest',
    category: 'Dark',
    lightUrl: 'https://images.unsplash.com/photo-1482868497193-e2b3b65e2734?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1482868497193-e2b3b65e2734?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  
  // Nature
  {
    id: 'majestic_mountains',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1443694910004-3567042689f5?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'forest_path',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'ocean_calm',
    category: 'Nature',
    lightUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  
  // City
  {
    id: 'urban_skyline',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'busy_street',
    category: 'City',
    lightUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  
  // Animal
  {
    id: 'cat_portrait',
    category: 'Animal',
    lightUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'dog_friends',
    category: 'Animal',
    lightUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  
  // Anime (Japan/Cyberpunk vibe)
  {
    id: 'japan_street',
    category: 'Anime',
    lightUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'cyberpunk_city',
    category: 'Anime',
    lightUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  
  // Cafe
  {
    id: 'coffee_shop',
    category: 'Cafe',
    lightUrl: 'https://images.unsplash.com/photo-1495474472287-4d713b20e473?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
  {
    id: 'latte_art',
    category: 'Cafe',
    lightUrl: 'https://images.unsplash.com/photo-1511920183353-30b5d92a83da?q=80&w=1920&auto=format&fit=crop&fm=webp',
    darkUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1920&auto=format&fit=crop&fm=webp',
  },
];

export const liveWallpapers = [
  {
    id: 'live:jfKfPfyJRdk',
    name: 'Lofi Girl - Study',
    videoId: 'jfKfPfyJRdk',
    thumbUrl: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg'
  },
  {
    id: 'live:4xDzrJKXOOY',
    name: 'Synthwave Boy',
    videoId: '4xDzrJKXOOY',
    thumbUrl: 'https://img.youtube.com/vi/4xDzrJKXOOY/hqdefault.jpg'
  },
  {
    id: 'live:5wF6V8r7bCA',
    name: 'Cozy Rain',
    videoId: '5wF6V8r7bCA',
    thumbUrl: 'https://img.youtube.com/vi/5wF6V8r7bCA/hqdefault.jpg'
  },
  {
    id: 'live:neV3EPqsZls',
    name: 'Space Walk',
    videoId: 'neV3EPqsZls',
    thumbUrl: 'https://img.youtube.com/vi/neV3EPqsZls/hqdefault.jpg'
  },
  {
    id: 'live:D7kO67X3dCQ',
    name: 'Autumn River',
    videoId: 'D7kO67X3dCQ',
    thumbUrl: 'https://img.youtube.com/vi/D7kO67X3dCQ/hqdefault.jpg'
  },
  {
    id: 'live:S_DfWOZKRZE',
    name: 'Cyberpunk City',
    videoId: 'S_DfWOZKRZE',
    thumbUrl: 'https://img.youtube.com/vi/S_DfWOZKRZE/hqdefault.jpg'
  }
];

export const accentColors = [
  { name: 'Indigo', hex: '#4f46e5', hoverHex: '#4338ca' },
  { name: 'Sky', hex: '#0ea5e9', hoverHex: '#0284c7' },
  { name: 'Rose', hex: '#e11d48', hoverHex: '#be123c' },
  { name: 'Emerald', hex: '#10b981', hoverHex: '#059669' },
  { name: 'Amber', hex: '#f59e0b', hoverHex: '#d97706' },
  { name: 'Violet', hex: '#8b5cf6', hoverHex: '#7c3aed' },
];