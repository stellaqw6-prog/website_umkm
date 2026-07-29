import "dotenv/config";
import { db, pool } from "./index";
import {
  users,
  categories,
  products,
  testimonials,
  faqs,
  blogPosts,
  banners,
  promotions,
  siteSettings,
} from "./schema";
import { hashPassword } from "../lib/auth";

async function seed() {
  console.log("🌱 Mulai seeding database...");

  // ==================== ADMIN & CONTOH USER ====================
  const adminPassword = await hashPassword("admin123");
  const customerPassword = await hashPassword("customer123");

  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin UMKM Store",
      email: "admin@umkmstore.id",
      passwordHash: adminPassword,
      role: "superadmin",
      membership: "platinum",
      emailVerified: true,
    })
    .onConflictDoNothing()
    .returning();

  await db
    .insert(users)
    .values({
      name: "Budi Santoso",
      email: "customer@umkmstore.id",
      passwordHash: customerPassword,
      role: "customer",
      membership: "gold",
      emailVerified: true,
    })
    .onConflictDoNothing();

  console.log("✅ User admin & contoh customer dibuat (lihat kredensial di akhir log)");

  // ==================== KATEGORI ====================
  const categoryData = [
    { name: "Fashion", slug: "fashion", description: "Batik, tenun, dan busana khas Nusantara", sortOrder: 1 },
    { name: "Makanan", slug: "makanan", description: "Camilan dan makanan olahan UMKM", sortOrder: 2 },
    { name: "Minuman", slug: "minuman", description: "Kopi, teh, dan minuman tradisional", sortOrder: 3 },
    { name: "Kerajinan", slug: "kerajinan", description: "Kerajinan tangan pengrajin lokal", sortOrder: 4 },
    { name: "Aksesoris", slug: "aksesoris", description: "Perhiasan dan aksesoris khas daerah", sortOrder: 5 },
    { name: "Dekorasi", slug: "dekorasi", description: "Dekorasi dan perlengkapan rumah", sortOrder: 6 },
  ];

  const insertedCategories = await db.insert(categories).values(categoryData).onConflictDoNothing().returning();

  // Ambil ulang semua kategori (kalau sudah ada sebelumnya, onConflictDoNothing tidak me-return)
  const allCategories = insertedCategories.length > 0 ? insertedCategories : await db.select().from(categories);
  const categoryBySlug = Object.fromEntries(allCategories.map((c) => [c.slug, c.id]));

  console.log(`✅ ${allCategories.length} kategori tersedia`);

  // ==================== PRODUK ====================
  const productData = [
    {
      name: "Batik Tulis Madura Premium",
      slug: "batik-tulis-madura-premium",
      description:
        "Batik tulis asli Madura dengan motif klasik, dikerjakan tangan oleh pengrajin berpengalaman selama lebih dari 20 tahun. Bahan katun premium yang adem dan nyaman dipakai.",
      price: "350000",
      compareAtPrice: "500000",
      sku: "BTK-001",
      stock: 45,
      categoryId: categoryBySlug["fashion"],
      images: ["https://images.unsplash.com/photo-1609587312208-cea54be969e7?w=800&h=1000&fit=crop"],
      isFeatured: true,
      isBestSeller: true,
      rating: "4.90",
      reviewCount: 234,
      weight: 300,
    },
    {
      name: "Keripik Singkong Balado Pedas",
      slug: "keripik-singkong-balado-pedas",
      description: "Keripik singkong renyah dengan bumbu balado pedas manis khas rumahan, tanpa pengawet.",
      price: "25000",
      compareAtPrice: "35000",
      sku: "KRP-002",
      stock: 200,
      categoryId: categoryBySlug["makanan"],
      images: ["https://images.unsplash.com/photo-1613919113640-257aaec5e6be?w=800&h=1000&fit=crop"],
      isFeatured: true,
      isBestSeller: true,
      rating: "4.80",
      reviewCount: 567,
      weight: 200,
    },
    {
      name: "Tas Anyaman Rotan Natural",
      slug: "tas-anyaman-rotan-natural",
      description: "Tas anyaman rotan handmade dengan finishing natural, cocok untuk gaya kasual maupun formal.",
      price: "185000",
      compareAtPrice: "250000",
      sku: "TAS-003",
      stock: 30,
      categoryId: categoryBySlug["kerajinan"],
      images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&h=1000&fit=crop"],
      isFeatured: true,
      isTrending: true,
      rating: "4.70",
      reviewCount: 189,
      weight: 450,
    },
    {
      name: "Kopi Arabika Gayo 250gr",
      slug: "kopi-arabika-gayo-250gr",
      description: "Biji kopi arabika pilihan dari dataran tinggi Gayo, Aceh. Medium roast dengan aroma khas.",
      price: "75000",
      compareAtPrice: "95000",
      sku: "KOP-004",
      stock: 120,
      categoryId: categoryBySlug["minuman"],
      images: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&h=1000&fit=crop"],
      isFeatured: true,
      rating: "4.90",
      reviewCount: 432,
      weight: 250,
    },
    {
      name: "Kain Tenun NTT Premium",
      slug: "kain-tenun-ntt-premium",
      description: "Kain tenun ikat asli Nusa Tenggara Timur dengan motif tradisional, ditenun manual selama berminggu-minggu.",
      price: "450000",
      compareAtPrice: "600000",
      sku: "TNN-005",
      stock: 18,
      categoryId: categoryBySlug["fashion"],
      images: ["https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=800&h=1000&fit=crop"],
      isFeatured: true,
      isBestSeller: true,
      rating: "4.80",
      reviewCount: 156,
      weight: 400,
    },
    {
      name: "Madu Hutan Sumatera 500ml",
      slug: "madu-hutan-sumatera-500ml",
      description: "Madu murni hasil panen hutan Sumatera, tanpa campuran gula, langsung dari peternak lebah lokal.",
      price: "120000",
      compareAtPrice: "150000",
      sku: "MDU-006",
      stock: 80,
      categoryId: categoryBySlug["makanan"],
      images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&h=1000&fit=crop"],
      isFeatured: true,
      isTrending: true,
      rating: "4.70",
      reviewCount: 321,
      weight: 600,
    },
    {
      name: "Kerajinan Perak Celuk Bali",
      slug: "kerajinan-perak-celuk-bali",
      description: "Perhiasan perak handmade dari pengrajin Celuk, Bali, dengan detail ukiran yang halus.",
      price: "275000",
      compareAtPrice: "350000",
      sku: "PRK-007",
      stock: 25,
      categoryId: categoryBySlug["aksesoris"],
      images: ["https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?w=800&h=1000&fit=crop"],
      isTrending: true,
      rating: "4.90",
      reviewCount: 98,
      weight: 50,
    },
    {
      name: "Abon Sapi Premium 250gr",
      slug: "abon-sapi-premium-250gr",
      description: "Abon sapi gurih dengan tekstur lembut, dibuat dari daging sapi pilihan tanpa pengawet.",
      price: "55000",
      compareAtPrice: "70000",
      sku: "ABN-008",
      stock: 150,
      categoryId: categoryBySlug["makanan"],
      images: ["https://images.unsplash.com/photo-1603073163308-9654c3fb70b5?w=800&h=1000&fit=crop"],
      rating: "4.60",
      reviewCount: 654,
      weight: 250,
    },
    {
      name: "Vas Keramik Motif Etnik",
      slug: "vas-keramik-motif-etnik",
      description: "Vas keramik buatan tangan dengan motif etnik khas Kasongan, Yogyakarta.",
      price: "165000",
      compareAtPrice: "210000",
      sku: "VAS-009",
      stock: 40,
      categoryId: categoryBySlug["dekorasi"],
      images: ["https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&h=1000&fit=crop"],
      rating: "4.60",
      reviewCount: 87,
      weight: 800,
    },
    {
      name: "Teh Herbal Rempah Nusantara",
      slug: "teh-herbal-rempah-nusantara",
      description: "Racikan teh herbal dari rempah pilihan Nusantara, cocok diminum hangat untuk menjaga stamina.",
      price: "42000",
      compareAtPrice: "55000",
      sku: "TEH-010",
      stock: 95,
      categoryId: categoryBySlug["minuman"],
      images: ["https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&h=1000&fit=crop"],
      isTrending: true,
      rating: "4.50",
      reviewCount: 143,
      weight: 150,
    },
  ];

  const insertedProducts = await db.insert(products).values(productData).onConflictDoNothing().returning();
  console.log(`✅ ${insertedProducts.length || productData.length} produk tersedia`);

  // ==================== TESTIMONI ====================
  await db
    .insert(testimonials)
    .values([
      { name: "Sari Dewi", role: "Pelanggan Setia", content: "Produk UMKM di sini benar-benar berkualitas! Saya sudah belanja berkali-kali dan selalu puas.", rating: 5 },
      { name: "Budi Santoso", role: "Pembeli Tersertifikasi", content: "Harga terjangkau tapi kualitas premium. Sangat mendukung UMKM lokal Indonesia.", rating: 5 },
      { name: "Anita Wijaya", role: "Reseller", content: "Sebagai reseller, saya sangat terbantu dengan produk-produk di sini. Margin bagus dan produk laris manis.", rating: 5 },
      { name: "Rahmat Hidayat", role: "Pelanggan Baru", content: "Awalnya ragu belanja online, tapi setelah coba di UMKM Store, saya jadi ketagihan.", rating: 4 },
      { name: "Dewi Lestari", role: "Ibu Rumah Tangga", content: "Suka banget dengan variasi produknya. Dari makanan, fashion, sampai dekorasi rumah ada semua.", rating: 5 },
    ])
    .onConflictDoNothing();
  console.log("✅ Testimoni ditambahkan");

  // ==================== FAQ ====================
  await db
    .insert(faqs)
    .values([
      { question: "Apa itu UMKM Store?", answer: "UMKM Store adalah platform digital yang menghubungkan pelanggan dengan produk-produk berkualitas dari UMKM di seluruh Indonesia.", category: "Umum", sortOrder: 1 },
      { question: "Bagaimana cara berbelanja di UMKM Store?", answer: "Buat akun, pilih produk, tambahkan ke keranjang, lalu lakukan pembayaran melalui metode yang tersedia.", category: "Pemesanan", sortOrder: 2 },
      { question: "Apakah produk di UMKM Store original?", answer: "Ya, semua produk 100% original dan langsung dari pengrajin/produsen dengan kurasi ketat.", category: "Produk", sortOrder: 3 },
      { question: "Berapa lama pengiriman?", answer: "Pengiriman memakan waktu 2-7 hari kerja tergantung lokasi, bekerja sama dengan ekspedisi terpercaya.", category: "Pengiriman", sortOrder: 4 },
      { question: "Bagaimana kebijakan retur dan refund?", answer: "Tersedia garansi retur 7 hari sejak produk diterima jika rusak, cacat, atau tidak sesuai pesanan.", category: "Pengembalian", sortOrder: 5 },
    ])
    .onConflictDoNothing();
  console.log("✅ FAQ ditambahkan");

  // ==================== BLOG ====================
  await db
    .insert(blogPosts)
    .values([
      {
        title: "Tips Memilih Produk UMKM Berkualitas untuk Bisnis Anda",
        slug: "tips-memilih-produk-umkm-berkualitas",
        excerpt: "Pelajari cara memilih produk UMKM yang tepat untuk bisnis Anda dengan panduan lengkap.",
        content: "Memilih produk UMKM berkualitas membutuhkan ketelitian. Perhatikan bahan baku, reputasi penjual, dan ulasan pembeli sebelumnya sebelum memutuskan membeli dalam jumlah besar.",
        coverImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop",
        category: "Bisnis",
        authorId: admin?.id,
        isPublished: true,
        publishedAt: new Date("2026-01-15"),
      },
      {
        title: "Kisah Sukses: UMKM Lokal Tembus Pasar Internasional",
        slug: "kisah-sukses-umkm-lokal-tembus-pasar-internasional",
        excerpt: "Bagaimana UMKM Indonesia berhasil menembus pasar global dengan strategi digital.",
        content: "Digitalisasi membuka peluang UMKM lokal untuk menjangkau pembeli di luar negeri. Studi kasus ini membahas strategi yang berhasil diterapkan oleh pelaku UMKM tenun asal NTT.",
        coverImage: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop",
        category: "Inspirasi",
        authorId: admin?.id,
        isPublished: true,
        publishedAt: new Date("2026-01-12"),
      },
      {
        title: "Tren Produk UMKM 2026: Peluang Bisnis Menjanjikan",
        slug: "tren-produk-umkm-2026",
        excerpt: "Simak prediksi tren produk UMKM yang akan booming di tahun 2026.",
        content: "Produk ramah lingkungan, makanan sehat, dan kerajinan custom diprediksi menjadi tren utama UMKM sepanjang 2026 berdasarkan pola pencarian dan pembelian pelanggan.",
        coverImage: "https://images.unsplash.com/photo-1553729459-afe8f8e20a61?w=800&h=500&fit=crop",
        category: "Tren",
        authorId: admin?.id,
        isPublished: true,
        publishedAt: new Date("2026-01-08"),
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Artikel blog ditambahkan");

  // ==================== BANNER ====================
  await db
    .insert(banners)
    .values([
      { title: "Flash Sale Gajian 25%", subtitle: "Diskon spesial untuk semua kategori", image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200&h=500&fit=crop", link: "/promo", sortOrder: 1 },
      { title: "Koleksi Batik Terbaru", subtitle: "Motif eksklusif dari pengrajin lokal", image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&h=500&fit=crop", link: "/produk?kategori=fashion", sortOrder: 2 },
    ])
    .onConflictDoNothing();
  console.log("✅ Banner ditambahkan");

  // ==================== PROMOSI ====================
  await db
    .insert(promotions)
    .values([
      {
        code: "GAJIAN25",
        type: "percentage",
        value: "25",
        minPurchase: "150000",
        usageLimit: 500,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-01-31"),
        description: "Diskon 25% untuk pembelian minimal Rp150.000",
      },
      {
        code: "ONGKIRGRATIS",
        type: "free_shipping",
        value: "0",
        minPurchase: "100000",
        usageLimit: 1000,
        startDate: new Date("2026-01-01"),
        endDate: new Date("2026-02-15"),
        description: "Gratis ongkir untuk pembelian minimal Rp100.000",
      },
    ])
    .onConflictDoNothing();
  console.log("✅ Promo ditambahkan");

  // ==================== SITE SETTINGS ====================
  const existingSettings = await db.select().from(siteSettings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(siteSettings).values({
      siteName: "UMKM Store",
      siteDescription: "Platform digital produk UMKM berkualitas dari seluruh Indonesia",
      phone: "+6281234567890",
      email: "info@umkmstore.id",
      whatsapp: "+6281234567890",
    });
    console.log("✅ Pengaturan situs dibuat");
  }

  console.log("\n🎉 Seeding selesai!\n");
  console.log("=== Kredensial Login ===");
  console.log("Admin    -> email: admin@umkmstore.id     | password: admin123");
  console.log("Customer -> email: customer@umkmstore.id  | password: customer123");
  console.log("⚠️  Ganti password ini setelah login pertama kali di lingkungan produksi.\n");
}

seed()
  .catch((err) => {
    console.error("❌ Seeding gagal:", err);
    process.exit(1);
  })
  .finally(async () => {
    await pool.end();
  });
