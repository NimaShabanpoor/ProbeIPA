# Absenzenverwaltung

Web-App zur digitalen Verwaltung von Schülerabsenzen mit drei Rollen: **Admin**, **Lehrperson** und **Schüler**.

## Schnellstart mit Docker Desktop

```bash
docker compose up --build
```

Die App läuft unter [http://localhost:3000](http://localhost:3000).

Beim ersten Start werden automatisch Demo-Daten erstellt.

## Lokale Entwicklung (ohne Docker)

```bash
npm install
```

Erstelle eine `.env` Datei:

```env
JWT_SECRET=dein-geheimer-schluessel
DATABASE_PATH=./data/app.db
```

```bash
npm run dev
```

## Anmeldung

Ein einziges Login für alle Rollen — die Rolle wird automatisch erkannt:

| Rolle   | E-Mail             | Passwort |
|---------|--------------------|----------|
| Admin   | admin@schule.ch    | demo123  |
| Lehrer  | mueller@schule.ch  | demo123  |
| Schüler | lukas@schule.ch    | demo123  |

## Architektur (einfach erklärt)

```
Login (/) → JWT-Cookie → Dashboard je nach Rolle
                ↓
         SQLite-Datenbank (better-sqlite3)
```

- **`src/lib/db.ts`** — Datenbank-Verbindung und alle SQL-Abfragen
- **`src/lib/auth.ts`** — Login-Session mit JWT-Cookie
- **`src/app/api/`** — REST-API für Formulare
- **`src/app/`** — Seiten (Server Components laden Daten direkt aus der DB)

## Technologie

- Next.js 16, SQLite (better-sqlite3), JWT-Auth, Tailwind CSS, Docker
