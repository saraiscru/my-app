## Instalare locală

### Cerințe

- Node.js 18+
- MySQL 8+
- Cont Clerk (gratuit)
- Cont Cloudinary (gratuit)

### Pași

**1. Clonează repo-ul**
```bash
git clone https://github.com/saraiscru/my-app
cd my-app
```

**2. Instalează dependențele**
```bash
npm install
```

**3. Creează baza de date MySQL**
```bash
mysql -u root -p -e "CREATE DATABASE techzone;"
```

**4. Creează fișierul `.env`**
```bash
cp .env.example .env
```
Completează valorile din `.env` (vezi fisierul .env.example)

**5. Rulează migrările**
```bash
npx prisma migrate deploy
```

**6. Populează baza de date cu date inițiale**
```bash
npx prisma db seed
```

**7. Pornește serverul**
```bash
npm run dev
```

Accesează `http://localhost:3000`

## Deploy pe Vercel

1. Conectează repo-ul la Vercel
2. Adaugă variabilele din `.env` în **Settings** → **Environment Variables**
4. Redeploy


## Structura proiectului

```
app/
  admin/          ← zona de administrare
    products/     ← management produse
    categories/   ← management categorii
    tags/         ← management taguri
  api/            ← route handlers
  components/     ← componente reutilizabile
  login/          ← pagina de login (Clerk)
  register/       ← pagina de înregistrare (Clerk)
  products/       ← pagini publice produse
prisma/
  schema.prisma   ← schema bazei de date
  migrations/     ← migrări
  seed.ts         ← date inițiale
```
