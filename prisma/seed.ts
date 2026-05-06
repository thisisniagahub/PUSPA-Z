import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PUSPA-Z database...');

  // Clear existing data
  await prisma.aidApplication.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.organizationMember.deleteMany();

  // Seed Organization Members (Carta Admin & Operasi 2025)
  const orgMembers = [
  {
    "name": "Dato' Dr Narimah Awin",
    "role": "Pengerusi",
    "category": "ADMINISTRATION",
    "position": "Pengerusi",
    "order": 1
  },
  {
    "name": "Datin Noor Khayatee Mohd Adnan",
    "role": "Timbalan Pengerusi",
    "category": "ADMINISTRATION",
    "position": "Timbalan Pengerusi",
    "order": 2
  },
  {
    "name": "Puan Faeza Arashah",
    "role": "Setiausaha 1",
    "category": "ADMINISTRATION",
    "position": "Setiausaha 1",
    "order": 3
  },
  {
    "name": "Tuan HJ Mohamad Zaki MD Zakaria",
    "role": "Setiausaha 2",
    "category": "ADMINISTRATION",
    "position": "Setiausaha 2",
    "order": 4
  },
  {
    "name": "Puan HJH Shahidah Hashim",
    "role": "Bendahari",
    "category": "ADMINISTRATION",
    "position": "Bendahari",
    "order": 5
  },
  {
    "name": "Puan HJH Mahidah Ibrahim",
    "role": "Pemeriksa 1",
    "category": "ADMINISTRATION",
    "position": "Pemeriksa Kira-Kira 1",
    "order": 6
  },
  {
    "name": "Puan HJH Fariza Hashim",
    "role": "Pemeriksa 2",
    "category": "ADMINISTRATION",
    "position": "Pemeriksa Kira-Kira 2",
    "order": 7
  },
  {
    "name": "Ustaz HJ Mohammad Yodi Tohir",
    "role": "Penasihat Agama",
    "category": "ADMINISTRATION",
    "position": "Penasihat Agama",
    "order": 8
  },
  {
    "name": "Datuk Profesor Emeritus HJ Ismail Hassan",
    "role": "Penasihat Umum",
    "category": "ADMINISTRATION",
    "position": "Penasihat Umum",
    "order": 9
  },
  {
    "name": "Datin HJH Noor Khayatee Mohd Adnan",
    "role": "Ketua Pegawai Operasi",
    "category": "OPERATIONS",
    "position": "Ketua Pegawai Operasi",
    "order": 1
  },
  {
    "name": "Puan HJH Shahidah Hashim",
    "role": "Timbalan Pegawai Operasi",
    "category": "OPERATIONS",
    "position": "Timbalan Pegawai Operasi",
    "order": 2
  },
  {
    "name": "Tuan HJ Mohamad Zaki MD Zakaria",
    "role": "Pembantu Operasi 1",
    "category": "OPERATIONS",
    "position": "Pembantu Operasi 1",
    "order": 3
  },
  {
    "name": "Encik Mohd Izharin Ismail",
    "role": "Pembantu Operasi 2",
    "category": "OPERATIONS",
    "position": "Pembantu Operasi 2",
    "order": 4
  }
];

  for (const member of orgMembers) {
    await prisma.organizationMember.create({ data: member });
  }
  console.log(`✅ Seeded ${orgMembers.length} organization members`);

  // Seed Institutions
  const institutions = [
  {
    "name": "T Ummi",
    "type": "RUMAH_KEBAJIKAN"
  },
  {
    "name": "Al Faeez",
    "type": "RUMAH_KEBAJIKAN"
  },
  {
    "name": "Kasih Murni",
    "type": "RUMAH_KEBAJIKAN"
  },
  {
    "name": "N Hasanah",
    "type": "RUMAH_KEBAJIKAN"
  },
  {
    "name": "Al Barakh",
    "type": "RUMAH_KEBAJIKAN"
  },
  {
    "name": "Rahoma",
    "type": "RUMAH_KEBAJIKAN"
  },
  {
    "name": "Nur Qaseh",
    "type": "RUMAH_KEBAJIKAN"
  },
  {
    "name": "MT Masjid Al Ridhuan",
    "type": "MAAHAD_TAHFIZ"
  },
  {
    "name": "Baitul Quran",
    "type": "MAAHAD_TAHFIZ"
  },
  {
    "name": "MT Al Itqaan",
    "type": "MAAHAD_TAHFIZ"
  },
  {
    "name": "MT Darul Hidayah",
    "type": "MAAHAD_TAHFIZ"
  },
  {
    "name": "Taman Permata",
    "type": "KAWASAN_AGIHAN"
  },
  {
    "name": "Kampung Fajar",
    "type": "KAWASAN_AGIHAN"
  },
  {
    "name": "Lain-lain Tempat",
    "type": "KAWASAN_AGIHAN"
  }
];

  for (const inst of institutions) {
    await prisma.institution.create({ data: inst });
  }
  console.log(`✅ Seeded ${institutions.length} institutions`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
