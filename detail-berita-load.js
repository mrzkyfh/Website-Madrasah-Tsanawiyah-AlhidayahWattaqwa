async function loadDetailNews() {
  const debugEl = document.getElementById('debug-info');

  // Cek SCHOOL_CONFIG
  if (!window.SCHOOL_CONFIG) {
    debugEl.textContent = "❌ site-config.js tidak termuat!";
    showError();
    return;
  }

  // Ambil slug dari URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');
  debugEl.textContent = `🔍 Slug: "${slug}" | DB: ${window.SCHOOL_CONFIG.supabaseUrl.substring(8,35)}...`;

  if (!slug) {
    debugEl.textContent = "❌ Tidak ada ?slug= di URL!";
    showError();
    return;
  }

  const { createClient } = supabase;
  const _supabase = createClient(window.SCHOOL_CONFIG.supabaseUrl, window.SCHOOL_CONFIG.supabaseAnonKey);

  // Cari via slug
  let { data: news, error } = await _supabase
    .from(window.SCHOOL_CONFIG.newsTable)
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  debugEl.textContent += ` | Slug: ${news ? '✅' : '❌'} ${error ? error.message : ''}`;

  // Fallback via ID
  if (!news) {
    const { data: newsById, error: errId } = await _supabase
      .from(window.SCHOOL_CONFIG.newsTable)
      .select('*')
      .eq('id', slug)
      .maybeSingle();
    news = newsById;
    debugEl.textContent += ` | ID: ${news ? '✅' : '❌'} ${errId ? errId.message : ''}`;
  }

  if (!news) {
    const { data: allNews } = await _supabase
      .from(window.SCHOOL_CONFIG.newsTable)
      .select('id, slug, title')
      .limit(5);
    debugEl.textContent += ` | DB: ${allNews?.length || 0} artikel`;
    showError();
    return;
  }

  // Isi halaman — hanya akses elemen yang ADA di HTML
  try {
    const el = (id) => document.getElementById(id);
    const setMeta = (id, attr, val) => { const m = el(id); if (m) m.setAttribute(attr, val); };

    // ===== Update SEO Dinamis per Artikel =====
    const siteUrl = 'https://mts-alhidayahwattaqwa.pages.dev';
    const articleUrl = `${siteUrl}/detail_berita?slug=${slug}`;
    const excerpt = news.content
      ? news.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
      : `Baca berita ${news.title} di MTs Al Hidayah Wattaqwa.`;

    document.title = `${news.title} | MTs Al Hidayah Wattaqwa`;
    setMeta('meta-desc',    'content', excerpt);
    setMeta('og-title',     'content', `${news.title} | MTs Al Hidayah Wattaqwa`);
    setMeta('og-desc',      'content', excerpt);
    setMeta('og-image',     'content', news.image_url || `${siteUrl}/images/logo.jpg`);
    setMeta('canonical-url','href',    articleUrl);

    if (el('news-title'))          el('news-title').textContent          = news.title;
    if (el('breadcrumb-title'))    el('breadcrumb-title').textContent    = news.title;
    if (el('breadcrumb-category')) el('breadcrumb-category').textContent = news.category;
    if (el('news-date'))           el('news-date').textContent           = new Date(news.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
    if (el('news-author'))         el('news-author').textContent         = news.author || 'Admin';
    if (el('news-content'))        el('news-content').innerHTML          = news.content || '';
    if (el('news-caption'))        el('news-caption').textContent        = `Dokumentasi ${news.category} di MTs Al Hidayah Wattaqwa.`;

    // ===== GALERI FOTO =====
    if (news.gallery_images && news.gallery_images.length > 0 && el('gallery-section')) {
      const grid = el('gallery-grid');
      grid.innerHTML = news.gallery_images.map((url, i) => `
        <div class="aspect-square overflow-hidden rounded-xl cursor-pointer hover:opacity-90 transition shadow-sm"
             onclick="openLightbox(${i})">
          <img src="${url}" class="w-full h-full object-cover hover:scale-105 transition duration-300"
               alt="Foto ${i+1}">
        </div>
      `).join('');
      el('gallery-section').classList.remove('hidden');

      // Simpan URL ke window untuk lightbox
      window._galleryUrls = news.gallery_images;
      window._lightboxIndex = 0;
    }

    if (el('news-image')) {
      if (news.image_url) {
        el('news-image').src = news.image_url;
      } else {
        el('news-image').classList.add('hidden');
      }
    }

    // Tampilkan artikel, sembunyikan loading
    if (el('news-detail'))    el('news-detail').classList.remove('hidden');
    if (el('loading-state'))  el('loading-state').classList.add('hidden');
    debugEl.classList.add('hidden');

  } catch (err) {
    debugEl.textContent += ` | ❌ Error render: ${err.message}`;
    console.error(err);
  }
}

function showError() {
  const ls = document.getElementById('loading-state');
  const es = document.getElementById('error-state');
  if (ls) ls.classList.add('hidden');
  if (es) es.classList.remove('hidden');
}

// ===== LIGHTBOX =====
function openLightbox(index) {
  const lb = document.getElementById('lightbox');
  if (!lb || !window._galleryUrls) return;
  window._lightboxIndex = index;
  document.getElementById('lightbox-img').src = window._galleryUrls[index];
  document.getElementById('lightbox-counter').textContent = `${index + 1} / ${window._galleryUrls.length}`;
  lb.classList.remove('hidden');
  lb.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  lb.classList.add('hidden');
  lb.classList.remove('flex');
  document.body.style.overflow = '';
}

function moveLightbox(direction) {
  const total = window._galleryUrls.length;
  window._lightboxIndex = (window._lightboxIndex + direction + total) % total;
  openLightbox(window._lightboxIndex);
}

// Navigasi lightbox dengan keyboard
document.addEventListener('keydown', (e) => {
  const lb = document.getElementById('lightbox');
  if (!lb || lb.classList.contains('hidden')) return;
  if (e.key === 'ArrowRight') moveLightbox(1);
  if (e.key === 'ArrowLeft')  moveLightbox(-1);
  if (e.key === 'Escape')     closeLightbox();
});

document.addEventListener("DOMContentLoaded", loadDetailNews);
