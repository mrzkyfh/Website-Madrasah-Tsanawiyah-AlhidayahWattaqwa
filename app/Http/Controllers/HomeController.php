<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index()
    {
        $profile = [
            'name' => 'MTs Al Hidayah Wattaqwa',
            'role' => 'Full-Stack Developer (Siswa SMK Informatika)',
            'summary' => 'Suka ngoprek Laravel, REST API, dan Flutter. Aktif di ekstrakurikuler RPL & ikut lomba LKS.',
            'location' => 'RT.002/RW.004, Pejuang, Kecamatan Medan Satria, Kota Bks, Jawa Barat 17131',
            'email' => 'mtsaw@sekolah.sch.id',
            'github' => 'https://github.com/username',
            'linkedin' => 'https://www.linkedin.com/in/username',
            'photo' => asset('image/logo.jpg'),
            'maps_embed' => 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15866.174806587462!2d106.98074371386839!3d-6.191754168520264!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698b95ab3f0bff%3A0x8906dc871a59001a!2sAl%20hidayah%20wattaqwa!5e0!3m2!1sid!2sid!4v1762515818011!5m2!1sid!2sid" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade'
        ];

        $skills = [
            'Laravel', 'PHP', 'MySQL', 'REST API', 'Blade', 'Tailwind CSS',
            'JavaScript', 'Git/GitHub', 'Docker (basic)'
        ];

        $projects = [
            [
                'title' => 'Sistem Perpustakaan Sekolah',
                'desc'  => 'CRUD buku, peminjaman, laporan PDF, autentikasi.',
                'tags'  => ['Laravel', 'MySQL', 'Blade'],
                'link'  => '#'
            ],
            [
                'title' => 'E-Commerce Makanan Sehat',
                'desc'  => 'Cart, checkout Midtrans sandbox, ongkir (RajaOngkir).',
                'tags'  => ['Laravel', 'API', 'Tailwind'],
                'link'  => '#'
            ],
            [
                'title' => 'Aplikasi Absensi Kelas',
                'desc'  => 'Scan QR dan rekap CSV untuk wali kelas.',
                'tags'  => ['Laravel', 'JS', 'QR'],
                'link'  => '#'
            ],
        ];

        $achievements = [
            'Juara 2 LKS Web Technology tingkat kota (2024)',
            'Kontributor open-source kecil di GitHub (pull request diterima)',
            'Koordinator web OSIS 2024/2025'
        ];

        return view('home', compact('profile', 'skills', 'projects', 'achievements'));
    }
}
