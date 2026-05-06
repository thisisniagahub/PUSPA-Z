# Data Organisasi PUSPA-Z (Ekstrak 2025)

Dokumen ini mengandungi data yang diekstrak daripada imej-imej rujukan (bermula dengan `photo_`) yang terdapat dalam folder `public/`. Data ini berguna sebagai rujukan untuk membina struktur pangkalan data (database schema), modul pengurusan organisasi, dan carta hierarki di dalam sistem.

## Metadata Ekstrak

| Item | Keterangan |
|---|---|
| **Diekstrak oleh** | Pasukan Pembangunan PUSPA-Z |
| **Tarikh ekstrak** | 6 Mei 2026 |
| **Sumber** | 7 foto fizikal (carta organisasi, carta operasi, senarai institusi, borang permohonan) |
| **Kaedah** | Manual visual transcription daripada imej |
| **Versi data** | Carta Administrasi 2025 |
| **Prisma Models** | `OrganizationMember`, `Institution`, `AidApplication` |

---

## 1. CARTA ADMINISTRASI 2025
*Rujukan: `photo_2026-05-06_10-48-12.jpg`*

**Kepimpinan Tertinggi:**
*   **Pengerusi:** Dato' Dr Narimah Awin
*   **Timbalan Pengerusi:** Datin Noor Khayatee Mohd Adnan

**Setiausaha & Bendahari:**
*   **Setiausaha 1:** Puan Faeza Arashah
*   **Setiausaha 2:** Tuan HJ Mohamad Zaki MD Zakaria
*   **Bendahari:** Puan HJH Shahidah Hashim

**Pemeriksa Kira-Kira:**
*   **Pemeriksa 1:** Puan HJH Mahidah Ibrahim
*   **Pemeriksa 2:** Puan HJH Fariza Hashim

**Penasihat:**
*   **Agama:** Ustaz HJ Mohammad Yodi Tohir
*   **Umum:** Datuk Profesor Emeritus HJ Ismail Hassan

**Ahli Kehormat PUSPA:**
*   **Masjid As Sobirin:** Tuan HJ Zaid Johan
*   **Masjid Al Hidayah Taman Melawati:** Ustaz Dr Mohamad Deen Napiah
*   **Masjid Lama Al Hidayah Taman Melawati:** Tuan HJ Ahmad Hazrin Hashim
*   **Masjid Kampung Klang Gate Baharu:** Tuan HJ Jamal Abdul Nasir Mat Jamil
*   **Pegawai Penyelaras DUN H Kelang:** YB Puan Juwariya Zulkifli
*   **Wakil Majlis MPAJ Zon 1:** Tuan Mohamed Radziff Hasan
*   **Wakil Majlis MPAJ Zon 3:** Puan Rosmayana Abu Rahim
*   **Individu Kehormat:** YB Puan Sri Kalsom Ismail

---

## 2. CARTA OPERASI PUSPA 2025
*Rujukan: `photo_2026-05-06_10-48-08.jpg`*

**Pengurusan Operasi:**
*   **Ketua Pegawai Operasi:** Datin HJH Noor Khayatee Mohd Adnan
*   **Timbalan Pegawai Operasi:** Puan HJH Shahidah Hashim
*   **Pembantu Operasi 1:** Tuan HJ Mohamad Zaki MD Zakaria
*   **Pembantu Operasi 2:** Encik Mohd Izharin Ismail

**Biro-Biro PUSPA:**
*   **Kebajikan:** HJH Nasimah Ahmad, Jumanah Amir, Hasimah Aziz
*   **Lojistik:** Mohd Izharin Ismail, Edi Supandi
*   **Keusahawanan:** HJ Mohamad Zaki MD Zakaria, Megat Shazree Zainal Shukor
*   **Agihan Bulanan:** Jumanah Amir, Hasimah Aziz
*   **Sedekah Jumaat:** Umi Kalthum A Bakar
*   **Pendidikan:** HJH Shahidah Hashim, Raja Nuraini, Raja Hassan
*   **Perhubungan Awam:** HJH Noor Khayatee Mohd Adnan, Farah Kamal Basha, Norsilawati Ishak
*   **Seketariat Acara:** HJH Noor Khayatee Mohd Adnan, HJH Shahidah Hashim, HJ Mohamad Zaki MD Zakaria, Mohd Izharin Ismail, Faeza Arashah

---

## 2b. LETTERHEAD & IDENTITI ORGANISASI
*Rujukan: `photo_2026-05-06_10-47-44.jpg`*

Foto ini menunjukkan letterhead rasmi PUSPA yang mengandungi:
*   **No Pendaftaran ROS:** PPM 024-10-05012022
*   **Email:** salam.puspaKL@gmail.com *(sebahagian visible)*

> *Nota: Foto ini adalah close-up letterhead dan tidak mengandungi data struktur yang perlu diekstrak.*

---

## 3. SENARAI INSTITUSI & KAWASAN BANTUAN
*Rujukan: `photo_2026-05-06_10-48-04.jpg` & `photo_2026-05-06_10-48-00.jpg`*

**Rumah Kebajikan:**
1.  T Ummi
2.  Al Faeez
3.  Kasih Murni
4.  N Hasanah
5.  Al Barakh
6.  Rahoma
7.  Nur Qaseh

**Maahad Tahfiz:**
1.  MT Masjid Al Ridhuan
2.  Baitul Quran
3.  MT Al Itqaan
4.  MT Darul Hidayah

**Kawasan Agihan Makanan Bulanan:**
1.  Taman Permata
2.  Kampung Fajar
3.  Hulu Klang *(dari knowledge base)*
4.  Taman Melawati *(dari knowledge base)*
5.  Klang Gate *(dari knowledge base)*
6.  Gombak *(dari knowledge base)*
7.  Lain-lain Tempat

> *Nota: Item 3–6 ditambah berdasarkan cross-reference dengan data terverifikasi dalam `puspa-knowledge.ts`. Sumber asal menyebut hanya 3 lokasi.*

---

## 4. STRUKTUR DATA BORANG PERMOHONAN BANTUAN
*Rujukan: `photo_2026-05-06_10-47-15.jpg` & `photo_2026-05-06_10-47-40.jpg`*

Berdasarkan borang fizikal "Pertubuhan Urus Peduli Asnaf", berikut adalah skema medan data (data fields) yang perlu ada jika borang ini didigitalkan:

**Maklumat Pemohon:**
*   Nama Penuh (Seperti dalam IC)
*   Alamat Penuh
*   No Telefon / Rumah
*   Status (Berkahwin / Ibu Tunggal / Duda / dll)
*   Pekerjaan (Kerajaan / Swasta / Sendiri / Tidak Bekerja)
*   Kadar Bayaran Sewa Sebulan (RM)
*   Pendapatan Sebulan (RM)
*   Taraf Kesihatan (Sihat / Sakit Kronik / Uzur / OKU)

**Maklumat Pasangan / Maklumat Tambahan:**
*   Nama Penuh Pasangan
*   Hubungan dengan Pemohon
*   Pekerjaan Pasangan & Pendapatan Sebulan
*   Taraf Kesihatan Pasangan

**Maklumat Tanggungan Isi Rumah:**
*   Jadual senarai tanggungan (Nama, Umur, Hubungan/Kad Pengenalan, Status Sekolah/Bekerja)
*   Sumbangan/Pendapatan dari tanggungan (jika ada)

**Maklumat Agensi Lain:**
*   Adakah menerima bantuan daripada institusi/penjagaan lain? (Ya/Tidak, Nyatakan jika Ya)
*   Adakah menerima bantuan kos penjagaan?

**Pengesahan & Kelulusan (Kegunaan Pejabat):**
*   Perakuan pemohon (Tandatangan & Tarikh) → `applicantConsent` + `signedAt`
*   Status Permohonan (Diterima / Tidak Diterima/Ditolak) → `status` + `rejectionReason`
*   Tandatangan PUSPA / Kelulusan PUSPA → `approvedBy` + `approvedAt`

> **Pematuhan PDPA:** Field `applicantConsent` dan `signedAt` telah ditambah ke model `AidApplication` dalam Prisma schema sebagai padanan digital borang fizikal.

---
*Nota: Maklumat ini diekstrak secara visual dan didigitalkan bagi memudahkan pembangunan sistem (Pangkalan Data & UI).*