const { createClient } = supabase;
const _supabase = createClient(window.SCHOOL_CONFIG.supabaseUrl, window.SCHOOL_CONFIG.supabaseAnonKey);

let quill = null;
let galleryFiles = [];    // File baru yang belum diupload
let galleryUrls  = [];    // URL yang sudah tersimpan di DB (saat edit)

// ============================================================
// INISIALISASI QUILL (Full-Screen Article Editor)
// ============================================================
function initQuill() {
  if (quill) return;
  quill = new Quill('#article-editor', {
    theme: 'snow',
    placeholder: 'Mulai menulis isi berita di sini...\n\nKamu bisa tebalkan teks, tambahkan gambar, kutipan, dan lain-lain menggunakan toolbar di atas.',
    modules: {
      toolbar: [
        [{ 'header': [2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ]
    }
  });

  // Handle image insert via URL
  const toolbar = quill.getModule('toolbar');
  toolbar.addHandler('image', () => {
    const url = prompt('Masukkan URL gambar:');
    if (url) {
      const range = quill.getSelection();
      quill.insertEmbed(range ? range.index : 0, 'image', url);
    }
  });
}

// ============================================================
// DOM REFS
// ============================================================
const loginOverlay   = document.getElementById('login-overlay');
const dashboard      = document.getElementById('admin-dashboard');
const articleWriter  = document.getElementById('article-writer');
const loginForm      = document.getElementById('login-form');
const loginError     = document.getElementById('login-error');
const newsList       = document.getElementById('news-list');

// ============================================================
// AUTH
// ============================================================
async function checkSession() {
  const { data: { session } } = await _supabase.auth.getSession();
  if (session) {
    loginOverlay.classList.add('hidden');
    dashboard.classList.remove('hidden');
    initQuill();
    loadNews();
  } else {
    loginOverlay.classList.remove('hidden');
    dashboard.classList.add('hidden');
    articleWriter.classList.add('hidden');
  }
}

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  loginError.classList.add('hidden');
  const btn = document.getElementById('login-btn');
  const label = document.getElementById('login-label');
  label.textContent = 'Masuk...';
  btn.disabled = true;

  const { error } = await _supabase.auth.signInWithPassword({
    email: document.getElementById('email').value,
    password: document.getElementById('password').value
  });

  if (error) {
    loginError.textContent = "Login gagal: " + error.message;
    loginError.classList.remove('hidden');
    label.textContent = 'Masuk';
    btn.disabled = false;
  } else {
    checkSession();
  }
};

async function handleLogout() {
  await _supabase.auth.signOut();
  checkSession();
}

// ============================================================
// ARTICLE WRITER: BUKA & TUTUP
// ============================================================
function openWriter(editData = null) {
  articleWriter.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  // Reset
  galleryFiles = [];
  galleryUrls  = [];
  document.getElementById('writer-id').value = '';
  document.getElementById('writer-existing-cover').value = '';
  document.getElementById('writer-title').value = '';
  document.getElementById('writer-excerpt').value = '';
  document.getElementById('writer-category').value = 'Berita';
  document.getElementById('writer-cover-preview').classList.add('hidden');
  document.getElementById('writer-cover-preview').classList.remove('flex');
  document.getElementById('cover-label').textContent = 'Foto Cover';
  document.getElementById('writer-cover').value = '';
  document.getElementById('publish-label').textContent = 'Simpan & Terbitkan';
  document.getElementById('writer-status').textContent = '';
  document.getElementById('gallery-preview').innerHTML = '';
  document.getElementById('gallery-count').textContent = 'Belum ada foto galeri';
  document.getElementById('gallery-upload').value = '';
  if (quill) quill.root.innerHTML = '';

  // Jika mode Edit
  if (editData) {
    document.getElementById('writer-id').value = editData.id;
    document.getElementById('writer-title').value = editData.title;
    document.getElementById('writer-excerpt').value = editData.excerpt || '';
    document.getElementById('writer-category').value = editData.category;
    document.getElementById('writer-existing-cover').value = editData.image_url || '';
    document.getElementById('publish-label').textContent = 'Update Berita';
    if (quill) quill.root.innerHTML = editData.content || '';

    if (editData.image_url) {
      document.getElementById('writer-cover-img').src = editData.image_url;
      document.getElementById('writer-cover-preview').classList.remove('hidden');
      document.getElementById('writer-cover-preview').classList.add('flex');
      document.getElementById('cover-label').textContent = 'Ganti Cover';
    }

    // Load existing gallery
    if (editData.gallery_images && editData.gallery_images.length > 0) {
      galleryUrls = [...editData.gallery_images];
      renderGalleryPreview();
    }
  }
}

function closeWriter() {
  articleWriter.classList.add('hidden');
  document.body.style.overflow = '';
}

// ============================================================
// COVER FOTO
// ============================================================
document.getElementById('writer-cover').onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById('cover-label').textContent = file.name.substring(0, 20) + '...';
  const reader = new FileReader();
  reader.onload = (ex) => {
    document.getElementById('writer-cover-img').src = ex.target.result;
    document.getElementById('writer-cover-preview').classList.remove('hidden');
    document.getElementById('writer-cover-preview').classList.add('flex');
  };
  reader.readAsDataURL(file);
};

// ============================================================
// GALERI FOTO — MULTI UPLOAD
// ============================================================
document.getElementById('gallery-upload').onchange = (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => { galleryFiles.push(file); });
  renderGalleryPreview();
  e.target.value = ''; // Reset input agar bisa pilih file yang sama lagi
};

function renderGalleryPreview() {
  const container = document.getElementById('gallery-preview');
  const total = galleryUrls.length + galleryFiles.length;
  document.getElementById('gallery-count').textContent =
    total > 0 ? `${total} foto terpilih` : 'Belum ada foto galeri';

  container.innerHTML = '';

  // Tampilkan URL yang sudah ada (dari DB)
  galleryUrls.forEach((url, i) => {
    const div = document.createElement('div');
    div.className = 'relative group';
    div.innerHTML = `
      <img src="${url}" class="w-20 h-20 object-cover rounded-lg border-2 border-indigo-200">
      <button type="button" onclick="removeGalleryUrl(${i})"
        class="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-xs
               hidden group-hover:flex items-center justify-center">
        ✕
      </button>`;
    container.appendChild(div);
  });

  // Tampilkan file baru (belum diupload)
  galleryFiles.forEach((file, i) => {
    const reader = new FileReader();
    reader.onload = (ex) => {
      const div = document.createElement('div');
      div.className = 'relative group';
      div.id = `gallery-file-${i}`;
      div.innerHTML = `
        <img src="${ex.target.result}" class="w-20 h-20 object-cover rounded-lg border-2 border-green-300">
        <div class="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-[9px] text-center
                    rounded-b-lg py-0.5">Baru</div>
        <button type="button" onclick="removeGalleryFile(${i})"
          class="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-xs
                 hidden group-hover:flex items-center justify-center">
          ✕
        </button>`;
      container.appendChild(div);
    };
    reader.readAsDataURL(file);
  });
}

function removeGalleryUrl(index) {
  galleryUrls.splice(index, 1);
  renderGalleryPreview();
}
function removeGalleryFile(index) {
  galleryFiles.splice(index, 1);
  renderGalleryPreview();
}

function clearCover() {
  document.getElementById('writer-cover').value = '';
  document.getElementById('cover-label').textContent = 'Foto Cover';
  document.getElementById('writer-cover-preview').classList.add('hidden');
  document.getElementById('writer-cover-preview').classList.remove('flex');
  document.getElementById('writer-existing-cover').value = '';
}

// ============================================================
// SIMPAN ARTIKEL
// ============================================================
async function saveArticle() {
  const id       = document.getElementById('writer-id').value;
  const title    = document.getElementById('writer-title').value.trim();
  const excerpt  = document.getElementById('writer-excerpt').value.trim();
  const category = document.getElementById('writer-category').value;
  const content  = quill ? quill.root.innerHTML : '';
  const fileInput = document.getElementById('writer-cover');
  const existingCover = document.getElementById('writer-existing-cover').value;

  // Validasi
  if (!title) {
    document.getElementById('writer-title').focus();
    setStatus('⚠️ Judul tidak boleh kosong!');
    return;
  }
  if (!quill || !quill.getText().trim()) {
    setStatus('⚠️ Isi berita tidak boleh kosong!');
    return;
  }

  // Loading
  const publishBtn = document.getElementById('publish-btn');
  const publishLabel = document.getElementById('publish-label');
  publishBtn.disabled = true;
  publishLabel.textContent = 'Menyimpan...';
  setStatus('Sedang menyimpan...');

  let imageUrl = existingCover;

  // ===== Upload Foto Galeri Baru =====
  setStatus('Mengupload foto galeri...');
  const uploadedGallery = [...galleryUrls]; // Mulai dari URL yang sudah ada
  for (const file of galleryFiles) {
    const ext  = file.name.split('.').pop();
    const path = `news/gallery-${Date.now()}-${Math.random().toString(36).substr(2,5)}.${ext}`;
    const { error: upErr } = await _supabase.storage.from('news').upload(path, file);
    if (upErr) {
      setStatus('❌ Gagal upload galeri: ' + upErr.message);
      publishBtn.disabled = false;
      publishLabel.textContent = id ? 'Update Berita' : 'Simpan & Terbitkan';
      return;
    }
    const { data: pub } = _supabase.storage.from('news').getPublicUrl(path);
    uploadedGallery.push(pub.publicUrl);
  }

  // Upload cover jika ada
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const ext = file.name.split('.').pop();
    const path = `news/${Date.now()}-${Math.random().toString(36).substr(2,6)}.${ext}`;
    const { error: upErr } = await _supabase.storage.from('news').upload(path, file);
    if (upErr) {
      setStatus('❌ Gagal upload foto: ' + upErr.message);
      publishBtn.disabled = false;
      publishLabel.textContent = 'Simpan & Terbitkan';
      return;
    }
    const { data: pub } = _supabase.storage.from('news').getPublicUrl(path);
    imageUrl = pub.publicUrl;
  }

  const payload = {
    title,
    category,
    content,
    image_url: imageUrl || null,
    gallery_images: uploadedGallery,
    author: 'Admin'
  };

  let result;
  if (id) {
    // Update — jangan ganti slug
    result = await _supabase.from(window.SCHOOL_CONFIG.newsTable).update(payload).eq('id', id);
  } else {
    // Insert — buat slug baru
    payload.slug = slugify(title) + '-' + Date.now().toString(36);
    result = await _supabase.from(window.SCHOOL_CONFIG.newsTable).insert([payload]);
  }

  publishBtn.disabled = false;
  publishLabel.textContent = id ? 'Update Berita' : 'Simpan & Terbitkan';

  if (result.error) {
    setStatus('❌ Gagal: ' + result.error.message);
  } else {
    setStatus('✅ Berhasil disimpan!');
    setTimeout(() => {
      closeWriter();
      loadNews();
    }, 800);
  }
}

function setStatus(msg) {
  document.getElementById('writer-status').textContent = msg;
}

// ============================================================
// LOAD DAFTAR BERITA
// ============================================================
async function loadNews() {
  const { data, error } = await _supabase
    .from(window.SCHOOL_CONFIG.newsTable)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    newsList.innerHTML = `<div class="p-8 text-center text-red-400">Gagal memuat: ${error.message}</div>`;
    return;
  }

  // Update stats
  document.getElementById('news-count').textContent = `${data.length} Artikel`;
  document.getElementById('stat-total').textContent = data.length;
  document.getElementById('stat-kegiatan').textContent = data.filter(d => d.category === 'Kegiatan').length;
  document.getElementById('stat-agenda').textContent = data.filter(d => d.category === 'Agenda').length;

  if (data.length === 0) {
    newsList.innerHTML = `
      <div class="p-16 text-center">
        <div class="text-6xl mb-4">📝</div>
        <h3 class="text-xl font-bold text-slate-700 mb-2">Belum Ada Artikel</h3>
        <p class="text-slate-400 mb-6 text-sm">Klik tombol "Tulis Berita" di atas untuk mulai.</p>
        <button onclick="openWriter()" class="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition">
          Tulis Berita Pertama
        </button>
      </div>`;
    return;
  }

  const categoryColor = {
    'Berita': 'bg-blue-50 text-blue-700',
    'Kegiatan': 'bg-amber-50 text-amber-700',
    'Agenda': 'bg-emerald-50 text-emerald-700'
  };

  newsList.innerHTML = data.map(item => `
    <div class="p-5 flex items-start gap-4 hover:bg-slate-50 transition group">
      <div class="w-24 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100">
        <img src="${item.image_url || '/images/logo.jpg'}" 
             class="w-full h-full object-cover"
             onerror="this.src='/images/logo.jpg'" />
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-[10px] px-2 py-0.5 rounded-full ${categoryColor[item.category] || 'bg-slate-100 text-slate-600'} font-bold uppercase">
            ${item.category}
          </span>
          <span class="text-[10px] text-slate-400">
            ${new Date(item.created_at).toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'})}
          </span>
        </div>
        <h4 class="font-bold text-slate-900 leading-snug line-clamp-2 mb-1">${item.title}</h4>
        <p class="text-xs text-slate-400 line-clamp-1">
          ${item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Tidak ada isi'}
        </p>
      </div>
      <div class="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
        <button onclick="editNews('${item.id}')"
          class="px-3 py-1.5 text-xs rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium flex items-center gap-1">
          <i class="fa-solid fa-pen text-[10px]"></i> Edit
        </button>
        <button onclick="deleteNews('${item.id}')"
          class="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium flex items-center gap-1">
          <i class="fa-solid fa-trash text-[10px]"></i> Hapus
        </button>
      </div>
    </div>
  `).join('');
}

// ============================================================
// EDIT & DELETE
// ============================================================
window.editNews = async (id) => {
  const { data, error } = await _supabase
    .from(window.SCHOOL_CONFIG.newsTable)
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    alert("Gagal memuat: " + (error?.message || 'Data tidak ditemukan'));
    return;
  }
  openWriter(data);
};

window.deleteNews = async (id) => {
  if (!confirm("Hapus artikel ini?\n\nTindakan ini tidak bisa dibatalkan.")) return;
  const { error } = await _supabase
    .from(window.SCHOOL_CONFIG.newsTable)
    .delete()
    .eq('id', id);
  if (error) alert("Gagal hapus: " + error.message);
  else loadNews();
};

// ============================================================
// UTILS
// ============================================================
function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80);
}

// ============================================================
// KEYBOARD SHORTCUT: ESC untuk tutup writer
// ============================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !articleWriter.classList.contains('hidden')) {
    if (confirm('Tutup editor? Perubahan yang belum disimpan akan hilang.')) {
      closeWriter();
    }
  }
});

// ============================================================
// START
// ============================================================
checkSession();
