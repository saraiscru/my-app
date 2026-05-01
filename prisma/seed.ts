import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Categorii parinte
  const electronice = await prisma.category.create({ data: { name: "Electronice" } });

  // Subcategorii Telefoane
  const telefoane = await prisma.category.create({ data: { name: "Telefoane", parentId: electronice.id } });
  const smartphones = await prisma.category.create({ data: { name: "Smartphone-uri", parentId: telefoane.id } });
  const tablete = await prisma.category.create({ data: { name: "Tablete", parentId: telefoane.id } });

  // Subcategorii Laptopuri
  const laptopuriPC = await prisma.category.create({ data: { name: "Laptopuri & PC", parentId: electronice.id } });
  const laptopuri = await prisma.category.create({ data: { name: "Laptopuri", parentId: laptopuriPC.id } });
  const desktop = await prisma.category.create({ data: { name: "Desktop-uri", parentId: laptopuriPC.id } });

  // Subcategorii TV & Audio
  const tvAudio = await prisma.category.create({ data: { name: "TV & Audio", parentId: electronice.id } });
  const televizoare = await prisma.category.create({ data: { name: "Televizoare", parentId: tvAudio.id } });
  const casti = await prisma.category.create({ data: { name: "Căști", parentId: tvAudio.id } });

  // Subcategorii Gaming
  const gaming = await prisma.category.create({ data: { name: "Gaming", parentId: electronice.id } });
  const console = await prisma.category.create({ data: { name: "Console", parentId: gaming.id } });
  const accGaming = await prisma.category.create({ data: { name: "Accesorii Gaming", parentId: gaming.id } });

  // Subcategorii Electrocasnice
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

  // Produse - Smartphone-uri
  await prisma.product.create({ data: { name: "Apple iPhone 15 Pro 256GB", price: 5999, description: "Cel mai puternic iPhone cu chip A17 Pro, camera 48MP si ecran Super Retina XDR 6.1 inch.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: popular.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy S24 Ultra 256GB", price: 5499, description: "Flagship Samsung cu S Pen integrat, camera 200MP si ecran Dynamic AMOLED 6.8 inch.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: topVanzari.id }, { id: premium.id }] } } });
  await prisma.product.create({ data: { name: "Google Pixel 8 Pro 128GB", price: 3999, description: "Smartphone Google cu AI integrat, camera profesionala si Android pur.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Xiaomi 14 256GB", price: 3499, description: "Telefon flagship Xiaomi cu Snapdragon 8 Gen 3 si camera Leica.", categoryId: smartphones.id, tags: { connect: [{ id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy A55 128GB", price: 1999, description: "Telefon mid-range Samsung cu ecran AMOLED si baterie 5000mAh.", categoryId: smartphones.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });

  // Produse - Tablete
  await prisma.product.create({ data: { name: "Apple iPad Pro 12.9 M2 256GB", price: 6999, description: "Tableta profesionala Apple cu chip M2, ecran Liquid Retina XDR si compatibila cu Apple Pencil.", categoryId: tablete.id, tags: { connect: [{ id: premium.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Galaxy Tab S9 256GB", price: 3799, description: "Tableta Android premium cu ecran AMOLED 11 inch si S Pen inclus.", categoryId: tablete.id, tags: { connect: [{ id: nou.id }, { id: reducere.id }] } } });

  // Produse - Laptopuri
  await prisma.product.create({ data: { name: "Apple MacBook Pro 14 M3 Pro", price: 11999, description: "Laptop profesional Apple cu chip M3 Pro, ecran Liquid Retina XDR si autonomie 18 ore.", categoryId: laptopuri.id, tags: { connect: [{ id: premium.id }, { id: nou.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "ASUS ROG Zephyrus G14 RTX 4060", price: 7999, description: "Laptop gaming premium cu AMD Ryzen 9, RTX 4060 si ecran 165Hz.", categoryId: laptopuri.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Lenovo ThinkPad X1 Carbon Gen 11", price: 8499, description: "Laptop business ultraportabil cu Intel Core i7 si ecran IPS anti-reflexie.", categoryId: laptopuri.id, tags: { connect: [{ id: premium.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "HP Pavilion 15 Intel Core i5", price: 2999, description: "Laptop accesibil pentru uz zilnic cu Intel Core i5, 16GB RAM si SSD 512GB.", categoryId: laptopuri.id, tags: { connect: [{ id: reducere.id }, { id: topVanzari.id }] } } });

  // Produse - Desktop-uri
  await prisma.product.create({ data: { name: "PC Gaming ASUS RTX 4070 Ti", price: 9999, description: "Desktop gaming performant cu Intel Core i9, RTX 4070 Ti si 32GB RAM DDR5.", categoryId: desktop.id, tags: { connect: [{ id: gamingTag.id }, { id: premium.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "iMac 24 M3 8GB 256GB", price: 8999, description: "Desktop all-in-one Apple cu chip M3, ecran Retina 4.5K 24 inch si design ultra-subtire.", categoryId: desktop.id, tags: { connect: [{ id: nou.id }, { id: premium.id }] } } });

  // Produse - Televizoare
  await prisma.product.create({ data: { name: "LG OLED C3 65 inch 4K", price: 7499, description: "Televizor OLED premium cu procesor Alpha9 Gen6, Dolby Vision si webOS 23.", categoryId: televizoare.id, tags: { connect: [{ id: premium.id }, { id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Samsung Neo QLED 8K 75 inch", price: 12999, description: "Televizor 8K cu tehnologie Mini LED, Quantum HDR 64x si procesor Neural Quantum 8K.", categoryId: televizoare.id, tags: { connect: [{ id: premium.id }, { id: nou.id }, { id: stocLimitat.id }] } } });
  await prisma.product.create({ data: { name: "Sony Bravia XR A80L OLED 55 inch", price: 5999, description: "Televizor OLED Sony cu procesor Cognitive XR, Google TV si Acoustic Surface Audio.", categoryId: televizoare.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });

  // Produse - Casti
  await prisma.product.create({ data: { name: "Sony WH-1000XM5", price: 1499, description: "Casti wireless cu cea mai buna anulare a zgomotului, autonomie 30 ore si sunet Hi-Res.", categoryId: casti.id, tags: { connect: [{ id: topVanzari.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Apple AirPods Pro 2", price: 1299, description: "Casti in-ear Apple cu ANC adaptiv, Transparency Mode si cip H2.", categoryId: casti.id, tags: { connect: [{ id: popular.id }, { id: nou.id }] } } });
  await prisma.product.create({ data: { name: "Bose QuietComfort 45", price: 1199, description: "Casti over-ear Bose cu anulare activa a zgomotului si confort premium.", categoryId: casti.id, tags: { connect: [{ id: reducere.id }, { id: premium.id }] } } });

  // Produse - Console
  await prisma.product.create({ data: { name: "PlayStation 5 Slim 1TB", price: 2199, description: "Consola Sony de ultima generatie cu SSD ultra-rapid, ray tracing si controller DualSense.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: topVanzari.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "Xbox Series X 1TB", price: 2099, description: "Consola Microsoft cu 12 teraflops, SSD NVMe si Game Pass Ultimate inclus 3 luni.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Nintendo Switch OLED", price: 1599, description: "Consola hibrid Nintendo cu ecran OLED 7 inch, dock TV si autonomie 9 ore.", categoryId: console.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });

  // Produse - Accesorii Gaming
  await prisma.product.create({ data: { name: "Razer DeathAdder V3 HyperSpeed", price: 499, description: "Mouse gaming wireless cu senzor Focus Pro 30K, 90 ore autonomie si design ergonomic.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: popular.id }] } } });
  await prisma.product.create({ data: { name: "SteelSeries Apex Pro TKL", price: 899, description: "Tastatura gaming mecanica cu switch-uri OmniPoint reglabile si OLED display.", categoryId: accGaming.id, tags: { connect: [{ id: gamingTag.id }, { id: nou.id }] } } });

  // Produse - Frigidere
  await prisma.product.create({ data: { name: "Samsung Side by Side 617L NoFrost", price: 3999, description: "Frigider Side by Side cu tehnologie SpaceMax, Twin Cooling Plus si clasa energetica A++.", categoryId: frigidere.id, tags: { connect: [{ id: popular.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "LG GBB72PZEFN 384L NoFrost", price: 2799, description: "Frigider combinat LG cu tehnologie Total No Frost, door cooling si clasa A+++.", categoryId: frigidere.id, tags: { connect: [{ id: topVanzari.id }, { id: nou.id }] } } });

  // Produse - Masini de spalat
  await prisma.product.create({ data: { name: "Samsung WW90T684DLH 9kg 1400rpm", price: 2499, description: "Masina de spalat Samsung cu tehnologie EcoBubble, AI Control si clasa energetica A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: topVanzari.id }, { id: reducere.id }] } } });
  await prisma.product.create({ data: { name: "Bosch WAX32EH0BY 10kg 1600rpm", price: 3299, description: "Masina de spalat Bosch cu motor EcoSilence, i-DOS si clasa energetica A.", categoryId: masiniSpalat.id, tags: { connect: [{ id: premium.id }, { id: nou.id }] } } });

  process.stdout.write("28 produse, 16 categorii si 7 taguri adaugate cu succes!\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());