<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>MTs Al Hidayah Wattaqwa</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <meta name="description" content="Portfolio siswa programmer di sekolah.">
  <link rel="icon" type="image/png" href="{{ asset('image/logo.jpg') }}">
</head>
<body class="bg-gray-50 text-gray-800 selection:bg-indigo-200">

  <!-- Navbar -->
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <a href="#" class="font-semibold text-indigo-700">Madrasah Tsanawiyah AlhidayahWattaqwa</a>
      <nav class="space-x-6 text-sm">
        <a href="#about" class="hover:text-indigo-600">Profil</a>
        <a href="#skills" class="hover:text-indigo-600">Alamat</a>
        <a href="#projects" class="hover:text-indigo-600">Proyek</a>
        <a href="#achievements" class="hover:text-indigo-600">Prestasi</a>
        <a href="#contact" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">Kontak</a>
      </nav>
    </div>
  </header>

  <!-- Hero -->
    <!-- Hero -->
  <!-- Bagian utama Menampilkan profil singkat -->
  <section class="relative overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
    <div class="max-w-6xl mx-auto px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">

      <!-- Kolom kiri: berisi teks profil -->
      <div>
        <!-- Nama lengkap dari variabel $profile -->
        <h1 class="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight">
          {{ $profile['name'] }}
        </h1>

        <!-- Deskripsi singkat tentang programmer -->
        <p class="mt-6 text-gray-600">
          {{ $profile['summary'] }}
        </p>

        <!-- Tombol/link sosial dan navigasi -->
        <div class="mt-6 flex flex-wrap gap-3">
          <!-- Tombol untuk scroll ke bagian proyek -->
          <a href="#projects"
             class="text-sm px-3 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">
             Lihat Proyek
          </a>
        </div>

        <!-- Menampilkan lokasi pengguna dengan ikon 📍 -->
        <p class="mt-4 text-xs text-gray-500">
          📍 {{ $profile['location'] }}
        </p>
      </div>

      <!-- Kolom kanan: berisi gambar profil -->
      <div class="flex justify-center">
        <!-- Gambar profil diambil dari URL yang disimpan di $profile['photo'] -->
        <img src="{{ $profile['photo'] }}"
             alt="Foto Profil"
             class="w-56 h-56 md:w-72 md:h-72 object-cover rounded-3xl shadow-lg ring-1 ring-gray-200">
        <!-- 
          w-56 h-56        → ukuran gambar (lebar & tinggi) di layar kecil
          md:w-72 md:h-72  → ukuran gambar diperbesar di layar besar
          object-cover     → gambar menyesuaikan proporsinya tanpa distorsi
          rounded-3xl      → sudut gambar dibulatkan lembut
          shadow-lg        → menambahkan bayangan di sekitar gambar
          ring-1 ring-gray-200 → garis tipis di tepi gambar berwarna abu terang
        -->
      </div>
    </div>
  </section>


  <!-- About -->
  <section id="about" class="max-w-6xl mx-auto px-4 py-12 md:py-16">
    <div class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2">
        <h2 class="text-2xl font-bold text-gray-900">Profile</h2>
        <p class="mt-4 text-gray-700">
          Saya siswa yang fokus pada pengembangan web modern. Terbiasa membuat CRUD, integrasi API,
          autentikasi, dan deployment sederhana. Saya percaya belajar lewat proyek nyata.
        </p>
      </div>
      <div class="bg-white rounded-2xl shadow border border-gray-200 p-5">
        <h3 class="font-semibold text-gray-900">Info Singkat</h3>
        <ul class="mt-3 space-y-2 text-sm text-gray-700">
          <li>📧 <a class="underline text-indigo-600 hover:text-indigo-800" href="mailto:{{ $profile['email'] }}">{{ $profile['email'] }}</a></li>
          <li>🏫 Program Keahlian: Rekayasa Perangkat Lunak</li>
          <li>🎯 Minat: Backend & API</li>
        </ul>
      </div>
    </div>
  </section>

  <!-- Skills -->
  <section id="skills" class="max-w-6xl mx-auto px-4 py-12 md:py-16 bg-indigo-50 border-y border-gray-200">
    <h2 class="text-2xl font-bold text-gray-900">Keahlian</h2>
    <div class="mt-6 flex flex-wrap gap-3">
      @foreach($skills as $s)
        <span class="px-3 py-1.5 rounded-full text-sm bg-white border border-gray-300 text-gray-700 shadow-sm">{{ $s }}</span>
      @endforeach
    </div>
  </section>

  <!-- Projects -->
  <section id="projects" class="max-w-6xl mx-auto px-4 py-12 md:py-16">
    <h2 class="text-2xl font-bold text-gray-900">Proyek Pilihan</h2>
    <div class="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      @foreach($projects as $p)
      <article class="group rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-lg transition">
        <h3 class="font-semibold text-lg text-gray-900">{{ $p['title'] }}</h3>
        <p class="mt-2 text-sm text-gray-700">{{ $p['desc'] }}</p>
        <div class="mt-3 flex flex-wrap gap-2">
          @foreach($p['tags'] as $t)
            <span class="text-xs px-2 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-800">{{ $t }}</span>
          @endforeach
        </div>
        <a href="{{ $p['link'] }}" class="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">Detail →</a>
      </article>
      @endforeach
    </div>
  </section>

  <!-- Achievements -->
  <section id="achievements" class="max-w-6xl mx-auto px-4 py-12 md:py-16 bg-indigo-50 border-y border-gray-200">
    <h2 class="text-2xl font-bold text-gray-900">Prestasi</h2>
    <ul class="mt-4 space-y-2 list-disc list-inside text-gray-700">
      @foreach($achievements as $a)
        <li>{{ $a }}</li>
      @endforeach
    </ul>
  </section>

  <!-- Contact -->
<!-- Contact -->
<section id="contact" class="max-w-6xl mx-auto px-4 py-12 md:py-16">
  <div class="rounded-2xl border border-gray-200 bg-white p-6 shadow">
    <h2 class="text-2xl font-bold text-gray-900 flex items-center gap-2">
    Hubungi Saya
    </h2>

    <p class="mt-2 text-gray-700">
      Hubungi kami untuk informasi lebih lanjut.
    </p>

    <!-- Tombol WhatsApp -->
    <a href="https://wa.me/6281234567890" target="_blank"
       class="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-500 transition">
      <i class="fa-brands fa-whatsapp text-xl"></i>
      Kirim Pesan WhatsApp
    </a>
  </div>
</section>


<section id="map" class="max-w-6xl mx-auto px-4 py-12 md:py-16">
 <h2 class="text-2xl font-bold mb-4">Lokasi Sekolah</h2>
 <p>RT.002/RW.004, Pejuang, Kecamatan Medan Satria, Kota Bks, Jawa Barat 17131</p><br> 
  <!-- Pembungkus responsif: rasio 16:9 -->
  <div class="relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow">
    <div class="pt-[56.25%]"></div> <!-- 16:9 aspect ratio -->
    <iframe
      class="absolute inset-0 w-full h-full"
      src="{{ $profile['maps_embed'] }}"
      style="border:0;"
      allowfullscreen=""
      loading="lazy"
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  </div>
</section>


  <footer class="mt-16 py-8 text-center text-sm text-gray-500 border-t border-gray-200">
    © {{ date('Y') }} .
  </footer>
</body>
</html>
