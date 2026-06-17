# Absenzenverwaltung

Web-App zur digitalen Verwaltung von Schülerabsenzen mit drei Rollen: **Admin**, **Lehrperson** und **Schüler**.

## Funktionen

### Admin-Dashboard
- Lehrpersonen anlegen (eigene Logins)
- Schüler anlegen und Klassen zuweisen
- Klassen erstellen und Lehrpersonen zuweisen

### Lehrer-Dashboard
- Nur die eigenen zugewiesenen Klassen sehen
- Absenzen erfassen (Anwesend, Abwesend, Verspätet)
- Absenzen **entschuldigen** (mit Begründung)
- Absenzen **abschliessen**

### Schüler-Dashboard
- Eigene Klassen und Absenzen einsehen

## Schnellstart

```bash
npm install
npm run db:setup
npm run dev
```

Die App läuft unter [http://localhost:3000](http://localhost:3000).

## Demo-Zugänge

| Rolle   | E-Mail             | Passwort |
|---------|--------------------|----------|
| Admin   | admin@schule.ch    | demo123  |
| Lehrer  | mueller@schule.ch  | demo123  |
| Lehrer  | meier@schule.ch    | demo123  |
| Schüler | lukas@schule.ch    | demo123  |
| Schüler | sara@schule.ch     | demo123  |

## Rollen-Workflow

1. **Admin** legt Lehrpersonen, Schüler und Klassen an
2. **Lehrperson** erfasst und bearbeitet Absenzen in den zugewiesenen Klassen
3. **Schüler** sehen ihre eigenen Absenzen

## Technologie

- Next.js 16, Prisma 7, SQLite, JWT-Auth, Tailwind CSS
