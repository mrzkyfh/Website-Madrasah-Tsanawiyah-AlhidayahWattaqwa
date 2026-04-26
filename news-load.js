async function loadSchoolNews() {
  const { createClient } = supabase;
  const _supabase = createClient(window.SCHOOL_CONFIG.supabaseUrl, window.SCHOOL_CONFIG.supabaseAnonKey);

  // Ambil data berita
  const { data, error } = await _supabase
    .from(window.SCHOOL_CONFIG.newsTable)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Gagal memuat berita:", error);
    return;
  }

  // --- Render di Homepage (Jika ada container-nya) ---
  const homeGrid = document.getElementById('home-news-grid');
  if (homeGrid && data.length > 0) {
    // Ambil 3 berita terbaru saja untuk homepage
    const latestNews = data.slice(0, 3);
    homeGrid.innerHTML = latestNews.map(item => renderNewsCard(item)).join('');
  }

  // --- Render di Halaman Berita (berita.html) ---
  const categoryGrids = {
    'Berita': document.getElementById('grid-berita'),
    'Kegiatan': document.getElementById('grid-kegiatan'),
    'Agenda': document.getElementById('grid-agenda')
  };

  // Reset grids
  Object.values(categoryGrids).forEach(grid => {
    if (grid) grid.innerHTML = '';
  });

  // Isi grids sesuai kategori
  data.forEach(item => {
    const targetGrid = categoryGrids[item.category];
    if (targetGrid) {
      targetGrid.innerHTML += renderNewsCard(item);
    }
  });
}

function renderNewsCard(item) {
  return `
    <article class="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition">
      <div class="bg-[#0F2B5C] text-white text-center py-2 text-xs font-semibold uppercase tracking-wider">
        ${item.category}
      </div>
      <div class="p-4">
        <img src="${item.image_url || '/images/bg-hero.jpg'}" alt="${item.title}" class="w-full h-48 object-cover rounded-lg mb-4">
        <h2 class="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">
          ${item.title}
        </h2>
        <div class="text-xs text-gray-600 line-clamp-3 mb-3">
          ${item.content}
        </div>
        <div class="flex items-center justify-between mt-auto">
          <span class="text-[10px] text-gray-400">${new Date(item.created_at).toLocaleDateString('id-ID')}</span>
          <a href="/detail_berita?slug=${item.slug || item.id}" class="text-xs font-bold text-indigo-600 hover:text-indigo-800">
            Selengkapnya &raquo;
          </a>
        </div>
      </div>
    </article>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  if (typeof supabase !== 'undefined') {
    loadSchoolNews();
  }
});
