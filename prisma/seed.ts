import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categorii
  const electronice = await prisma.category.create({ data: { name: "Electronice" } });

  const telefoane = await prisma.category.create({ data: { name: "Telefoane", parentId: electronice.id } });
  const smartphones = await prisma.category.create({ data: { name: "Smartphone-uri", parentId: telefoane.id } });
  const tablete = await prisma.category.create({ data: { name: "Tablete", parentId: telefoane.id } });

  const laptopuriPC = await prisma.category.create({ data: { name: "Laptopuri & PC", parentId: electronice.id } });
  const laptopuri = await prisma.category.create({ data: { name: "Laptopuri", parentId: laptopuriPC.id } });
  const desktop = await prisma.category.create({ data: { name: "Desktop-uri", parentId: laptopuriPC.id } });

  const tvAudio = await prisma.category.create({ data: { name: "TV & Audio", parentId: electronice.id } });
  const televizoare = await prisma.category.create({ data: { name: "Televizoare", parentId: tvAudio.id } });
  const casti = await prisma.category.create({ data: { name: "Căști", parentId: tvAudio.id } });

  const gaming = await prisma.category.create({ data: { name: "Gaming", parentId: electronice.id } });
  const console = await prisma.category.create({ data: { name: "Console", parentId: gaming.id } });
  const accGaming = await prisma.category.create({ data: { name: "Accesorii Gaming", parentId: gaming.id } });

  const electrocasnice = await prisma.category.create({ data: { name: "Electrocasnice", parentId: electronice.id } });
  const frigidere = await prisma.category.create({ data: { name: "Frigidere", parentId: electrocasnice.id } });
  const masiniSpalat = await prisma.category.create({ data: { name: "Mașini de spălat", parentId: electrocasnice.id } });

  // Taguri
  const nou = await prisma.tag.create({ data: { name: "Nou" } });
  const reducere = await prisma.tag.create({ data: { name: "Reducere" } });
  const popular = await prisma.tag.create({ data: { name: "Popular" } });
  const stocLimitat = await prisma.tag.create({ data: { name: "Stoc Limitat" } });
  const topVanzari = await prisma.tag.create({ data: { name: "Top Vânzări" } });
  const gamingTag = await prisma.tag.create({ data: { name: "Gaming" } });
  const premium = await prisma.tag.create({ data: { name: "Premium" } });

  // SMARTPHONE-URI (10: 4 Apple, 4 Samsung, 2 altele)
  await prisma.product.create({ data: { name: "Apple iPhone 15 Pro 256GB", price: 5999, description: "Chip A17 Pro, camera 48MP, ecran Super Retina XDR 6.1 inch.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: popular.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "Apple iPhone 15 128GB", price: 4499, description: "Chip A16 Bionic, Dynamic Island, USB-C, camera 48MP.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Apple iPhone 14 Pro 128GB", price: 3999, description: "Chip A15 Bionic, Dynamic Island, camera 48MP ProRAW.", categoryId: smartphones.id, tags: { connect: [{ id: reducere.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Apple iPhone SE 3 64GB", price: 2199, description: "Chip A15 Bionic, design compact, Touch ID, 5G.", categoryId: smartphones.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy S24 Ultra 256GB", price: 5499, description: "S Pen integrat, camera 200MP, ecran Dynamic AMOLED 6.8 inch.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: topVanzari.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy S24 128GB", price: 3799, description: "Snapdragon 8 Gen 3, ecran AMOLED 6.2 inch, camera 50MP.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy A55 128GB", price: 1999, description: "Ecran AMOLED, baterie 5000mAh, procesor Exynos 1480.", categoryId: smartphones.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Z Flip5 256GB", price: 4999, description: "Telefon pliabil, ecran Flex 6.7 inch, cover display 3.4 inch.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Google Pixel 8 Pro 128GB", price: 3999, description: "AI integrat, camera profesionala, Android pur.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Xiaomi 14 256GB", price: 3499, description: "Snapdragon 8 Gen 3, camera Leica, incarcare 90W.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });

  // TABLETE (10: 4 Apple, 4 Samsung, 2 altele)
  await prisma.product.create({ data: { name: "Apple iPad Pro 12.9 M2 256GB", price: 6999, description: "Chip M2, ecran Liquid Retina XDR, compatibil Apple Pencil.", categoryId: tablete.id, tags: { connect: [{ id: premium.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Apple iPad Air 5 64GB", price: 3499, description: "Chip M1, ecran Liquid Retina 10.9 inch, Touch ID.", categoryId: tablete.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Apple iPad Mini 6 64GB", price: 2799, description: "Chip A15 Bionic, ecran Liquid Retina 8.3 inch, USB-C.", categoryId: tablete.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Apple iPad 10 64GB", price: 2199, description: "Chip A14 Bionic, ecran 10.9 inch, USB-C, 5G optional.", categoryId: tablete.id, tags: { connect: [{ id: topVanzari.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Tab S9 Ultra 512GB", price: 5999, description: "Ecran AMOLED 14.6 inch, S Pen inclus, Snapdragon 8 Gen 2.", categoryId: tablete.id, tags: { connect: [{ id: premium.id }, { id: nou.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Tab S9 256GB", price: 3799, description: "Ecran AMOLED 11 inch, S Pen inclus, IP68.", categoryId: tablete.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Tab S6 Lite 128GB", price: 1299, description: "Ecran TFT 10.4 inch, S Pen inclus, baterie 7040mAh.", categoryId: tablete.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Tab A9 Plus 128GB", price: 1599, description: "Ecran 11 inch 90Hz, baterie 7040mAh, quad boxe AKG.", categoryId: tablete.id, tags: { connect: [{ id: topVanzari.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Lenovo Tab P12 Pro 256GB", price: 2999, description: "Ecran AMOLED 12.6 inch, Snapdragon 870, stylus inclus.", categoryId: tablete.id, tags: { connect: [{ id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Xiaomi Pad 6 128GB", price: 1799, description: "Ecran 144Hz, Snapdragon 870, baterie 8840mAh.", categoryId: tablete.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });

  // LAPTOPURI (10: 4 Apple, 3 Samsung, 3 altele)
  await prisma.product.create({ data: { name: "Apple MacBook Pro 14 M3 Pro", price: 11999, description: "Chip M3 Pro, ecran Liquid Retina XDR, autonomie 18 ore.", categoryId: laptopuri.id, tags: { connect: [{ id: premium.id }, { id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Apple MacBook Pro 16 M3 Max", price: 16999, description: "Chip M3 Max, ecran 16.2 inch, 36GB RAM unificat.", categoryId: laptopuri.id, tags: { connect: [{ id: premium.id }, { id: nou.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Apple MacBook Air 13 M2", price: 7499, description: "Chip M2, design fanless, ecran Liquid Retina 13.6 inch.", categoryId: laptopuri.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Apple MacBook Air 15 M2", price: 8999, description: "Chip M2, ecran Liquid Retina 15.3 inch, 18 ore autonomie.", categoryId: laptopuri.id, tags: { connect: [{ id: nou.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Book3 Pro 360 16", price: 9499, description: "Intel Core i7 13th, ecran AMOLED touch 16 inch, stylus inclus.", categoryId: laptopuri.id, tags: { connect: [{ id: premium.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Book3 Ultra 16", price: 11499, description: "Intel Core i9, RTX 4050, ecran AMOLED 3K 16 inch.", categoryId: laptopuri.id, tags: { connect: [{ id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Book3 360 13", price: 5999, description: "Intel Core i5 13th, ecran AMOLED touch 13.3 inch, 2 in 1.", categoryId: laptopuri.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "ASUS ROG Zephyrus G14 RTX 4060", price: 7999, description: "AMD Ryzen 9, RTX 4060, ecran 165Hz.", categoryId: laptopuri.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Lenovo ThinkPad X1 Carbon Gen 11", price: 8499, description: "Intel Core i7, ultraportabil, ecran IPS anti-reflexie.", categoryId: laptopuri.id, tags: { connect: [{ id: premium.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "HP Pavilion 15 Intel Core i5", price: 2999, description: "Intel Core i5, 16GB RAM, SSD 512GB.", categoryId: laptopuri.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });

  // DESKTOP-URI (10: 3 Apple, 3 Samsung, 4 altele)
  await prisma.product.create({ data: { name: "Apple iMac 24 M3 8GB 256GB", price: 8999, description: "Chip M3, ecran Retina 4.5K 24 inch, design ultra-subtire.", categoryId: desktop.id, tags: { connect: [{ id: nou.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "Apple iMac 24 M3 16GB 512GB", price: 11499, description: "Chip M3, 16GB RAM, ecran Retina 4.5K, SSD 512GB.", categoryId: desktop.id, tags: { connect: [{ id: nou.id }, { id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Apple Mac Mini M2 256GB", price: 4299, description: "Chip M2, compact, 8GB RAM, doua porturi Thunderbolt 4.", categoryId: desktop.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Samsung All-in-One PC 27 inch", price: 5499, description: "Intel Core i7, ecran 4K 27 inch, 16GB RAM, SSD 512GB.", categoryId: desktop.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Samsung All-in-One PC 24 inch", price: 3999, description: "Intel Core i5, ecran FHD 24 inch, 8GB RAM, SSD 256GB.", categoryId: desktop.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Samsung DeX Station Pro", price: 2999, description: "Mini PC Samsung, Exynos, compatibil DeX, 8GB RAM.", categoryId: desktop.id, tags: { connect: [{ id: nou.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "PC Gaming ASUS RTX 4070 Ti", price: 9999, description: "Intel Core i9, RTX 4070 Ti, 32GB RAM DDR5.", categoryId: desktop.id, tags: { connect: [{ id: gamingTag.id }, { id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "PC Gaming MSI RTX 4060 Ti", price: 6999, description: "Intel Core i7, RTX 4060 Ti, 16GB RAM DDR5.", categoryId: desktop.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Lenovo IdeaCentre AIO 27 inch", price: 4799, description: "Intel Core i7, ecran IPS 27 inch QHD, 16GB RAM.", categoryId: desktop.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "HP EliteDesk 800 G9 Mini", price: 3499, description: "Intel Core i5 12th, 16GB RAM, SSD 512GB, ultracompact.", categoryId: desktop.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });

  // TELEVIZOARE (10: 3 Samsung, 3 LG, 4 altele)
  await prisma.product.create({ data: { name: "Samsung Neo QLED 8K 75 inch", price: 12999, description: "Mini LED 8K, Quantum HDR 64x, Neural Quantum 8K.", categoryId: televizoare.id, tags: { connect: [{ id: premium.id }, { id: nou.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Samsung OLED S95C 65 inch 4K", price: 8999, description: "Panou QD-OLED, Neural Quantum 4K, Dolby Atmos.", categoryId: televizoare.id, tags: { connect: [{ id: premium.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Samsung QLED Q80C 55 inch 4K", price: 4499, description: "Quantum HDR, Direct Full Array, Motion Xcelerator 120Hz.", categoryId: televizoare.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "LG OLED C3 65 inch 4K", price: 7499, description: "Procesor Alpha9 Gen6, Dolby Vision, webOS 23.", categoryId: televizoare.id, tags: { connect: [{ id: premium.id }, { id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "LG OLED B3 55 inch 4K", price: 4999, description: "Panou OLED, 120Hz, HDMI 2.1, compatibil PS5.", categoryId: televizoare.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "LG NanoCell NANO75 65 inch 4K", price: 2999, description: "NanoCell 4K, procesor α5 Gen6, webOS 23.", categoryId: televizoare.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Sony Bravia XR A80L OLED 55 inch", price: 5999, description: "Cognitive XR, Google TV, Acoustic Surface Audio.", categoryId: televizoare.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Sony Bravia X90L LED 65 inch 4K", price: 4299, description: "Full Array LED, XR Motion Clarity, Google TV.", categoryId: televizoare.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Philips OLED 908 65 inch 4K", price: 6999, description: "Ambilight 4 laturi, P5 AI Perfect Engine, Dolby Vision.", categoryId: televizoare.id, tags: { connect: [{ id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Hisense U8K Mini LED 65 inch 4K", price: 3499, description: "Mini LED 144Hz, Dolby Vision IQ, IMAX Enhanced.", categoryId: televizoare.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });

  // CASTI (10: 3 Apple, 3 Samsung, 4 altele)
  await prisma.product.create({ data: { name: "Apple AirPods Pro 2", price: 1299, description: "ANC adaptiv, Transparency Mode, cip H2, USB-C.", categoryId: casti.id, tags: { connect: [{ id: popular.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Apple AirPods 3", price: 899, description: "Sunet spatial, rezistent la apa IPX4, cip H1.", categoryId: casti.id, tags: { connect: [{ id: popular.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Apple AirPods Max", price: 2499, description: "Over-ear premium, ANC, sunet Hi-Fi, cip H1.", categoryId: casti.id, tags: { connect: [{ id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Buds2 Pro", price: 899, description: "ANC inteligent, sunet 360, rezistente IPX7.", categoryId: casti.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Buds FE", price: 499, description: "ANC, autonomie 30 ore cu carcasa, ergonomice.", categoryId: casti.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Buds Live", price: 399, description: "Design bean, ANC, autonomie 21 ore, Dolby Atmos.", categoryId: casti.id, tags: { connect: [{ id: reducere.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Sony WH-1000XM5", price: 1499, description: "Cel mai bun ANC, autonomie 30 ore, sunet Hi-Res.", categoryId: casti.id, tags: { connect: [{ id: topVanzari.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Bose QuietComfort 45", price: 1199, description: "ANC premium, confort over-ear, autonomie 24 ore.", categoryId: casti.id, tags: { connect: [{ id: reducere.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "JBL Tour Pro 2", price: 799, description: "Ecran pe carcasa, ANC, autonomie 40 ore total.", categoryId: casti.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Sennheiser Momentum 4", price: 1399, description: "Sunet audiofil, ANC, autonomie 60 ore, pliabile.", categoryId: casti.id, tags: { connect: [{ id: premium.id }, { id: popular.id }] } } });

  // CONSOLE (10: 3 Sony, 3 Microsoft, 3 Nintendo, 1 altul)
  await prisma.product.create({ data: { name: "PlayStation 5 Slim 1TB", price: 2199, description: "SSD ultra-rapid, ray tracing, controller DualSense.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: topVanzari.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "PlayStation 5 Digital 1TB", price: 1899, description: "Fara unitate optica, SSD NVMe, ray tracing.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "PlayStation 4 Pro 1TB", price: 1299, description: "4K gaming, HDR, biblioteca uriasa de jocuri.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Xbox Series X 1TB", price: 2099, description: "12 teraflops, SSD NVMe, Game Pass Ultimate 3 luni.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Xbox Series S 512GB", price: 1299, description: "Gaming 1440p, 120fps, Game Pass inclus 1 luna.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Xbox One X 1TB", price: 999, description: "4K nativ, HDR, 6 teraflops, compatibil backwards.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Nintendo Switch OLED", price: 1599, description: "Ecran OLED 7 inch, dock TV, autonomie 9 ore.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Nintendo Switch Lite", price: 999, description: "Consola portabila, 5 inch, autonomie 7 ore.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Nintendo Switch V2", price: 1299, description: "Versiune imbunatatita, autonomie 9 ore, dock inclus.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Steam Deck 512GB OLED", price: 2799, description: "PC gaming portabil, ecran OLED 7.4 inch, SteamOS.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: nou.id }, { id: stocLimitat.id }] } } });

  // ACCESORII GAMING (10)
  await prisma.product.create({ data: { name: "Razer DeathAdder V3 HyperSpeed", price: 499, description: "Mouse wireless, senzor Focus Pro 30K, 90 ore autonomie.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Razer BlackWidow V4 Pro", price: 999, description: "Tastatura mecanica, switch-uri Green, RGB Chroma.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Razer Kraken V3 HyperSense", price: 699, description: "Casti gaming cu feedback haptic, THX 7.1, USB.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "SteelSeries Apex Pro TKL", price: 899, description: "Switch-uri OmniPoint reglabile, OLED display, RGB.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "SteelSeries Rival 650 Wireless", price: 599, description: "Mouse wireless dual, senzor TrueMove3+, 24 ore.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Logitech G Pro X Superlight 2", price: 799, description: "Mouse wireless ultra-usor 60g, senzor HERO 25K.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Logitech G915 TKL Wireless", price: 849, description: "Tastatura mecanica slim wireless, switch GL, RGB.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "HyperX Cloud Alpha Wireless", price: 749, description: "Casti gaming wireless, autonomie 300 ore, DTS 7.1.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Corsair K100 RGB Mechanical", price: 999, description: "Tastatura mecanica, switch OPX optice, iCUE wheel.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "ASUS ROG Chakram X Wireless", price: 699, description: "Mouse wireless, joystick analog, senzor 36000 DPI.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: stocLimitat.id }] } } });

  // FRIGIDERE (10: 3 Samsung, 3 LG, 4 altele)
  await prisma.product.create({ data: { name: "Samsung Side by Side 617L NoFrost", price: 3999, description: "SpaceMax, Twin Cooling Plus, clasa A++.", categoryId: frigidere.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Samsung French Door 4 usi 800L", price: 6999, description: "Family Hub, ecran tactil, camera interioara, A++.", categoryId: frigidere.id, tags: { connect: [{ id: premium.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Bespoke 1 usa 400L", price: 2999, description: "Design modular, panouri interschimbabile, A+++.", categoryId: frigidere.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "LG GBB72PZEFN 384L NoFrost", price: 2799, description: "Total No Frost, Door Cooling+, clasa A+++.", categoryId: frigidere.id, tags: { connect: [{ id: topVanzari.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "LG Side by Side 625L InstaView", price: 5499, description: "InstaView Door-in-Door, Craft Ice, compressor Linear.", categoryId: frigidere.id, tags: { connect: [{ id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "LG Combinat 360L NoFrost", price: 2199, description: "No Frost total, Fresh Balancer, clasa A++.", categoryId: frigidere.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "Bosch KGN56XIDR 508L NoFrost", price: 3499, description: "VitaFresh, No Frost, SuperCooling, clasa A++.", categoryId: frigidere.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Whirlpool W7 921I OX 368L", price: 2499, description: "6th Sense Fresh Control, No Frost, A++.", categoryId: frigidere.id, tags: { connect: [{ id: reducere.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Beko RCNE520E40ZXB 502L", price: 2299, description: "HarvestFresh, NeoFrost Dual, clasa A++.", categoryId: frigidere.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Electrolux LNT7ME36X3 367L", price: 2699, description: "TwinTech No Frost, CustomFlex, Holiday Mode, A++.", categoryId: frigidere.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });

  // MASINI DE SPALAT (10: 3 Samsung, 3 Bosch, 4 altele)
  await prisma.product.create({ data: { name: "Samsung WW90T684DLH 9kg 1400rpm", price: 2499, description: "EcoBubble, AI Control, clasa energetica A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: topVanzari.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Samsung WW11BB944DGHS 11kg 1400rpm", price: 3999, description: "Auto Dose, AI Energy, ecoBubble, clasa A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: nou.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "Samsung WD10BB944DGHS 10kg Washer Dryer", price: 4499, description: "Spalare si uscare, AI Control, EcoBubble, clasa E.", categoryId: masiniSpalat.id, tags: { connect: [{ id: nou.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Bosch WAX32EH0BY 10kg 1600rpm", price: 3299, description: "EcoSilence Motor, i-DOS, clasa A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: premium.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Bosch WGB256A40 10kg 1600rpm", price: 3799, description: "i-DOS automat, Home Connect, motor EcoSilence, A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Bosch WAN28282BY 8kg 1400rpm", price: 2199, description: "EcoSilence Drive, VarioDrum, SpeedPerfect, clasa A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });
  await prisma.product.create({ data: { name: "LG F4WR709S2 9kg 1400rpm", price: 2799, description: "AI DD Motor, TurboWash 360, clasa A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Whirlpool FSCR10432 10kg 1400rpm", price: 2599, description: "6th Sense ZEN Direct Drive, FreshCare+, clasa A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: reducere.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Electrolux EW8F1490S 9kg 1400rpm", price: 2899, description: "UltraMix, SteamCare, perfectCare 800, clasa A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Beko WUE8736XST 8kg 1400rpm", price: 1799, description: "SteamCure, AquaTech, ProSmart Motor, clasa A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });

  process.stdout.write("100 produse, 16 categorii si 7 taguri adaugate cu succes!\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());