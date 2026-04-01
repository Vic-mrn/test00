# Workspace

## Overview

Sistema de Control de Reportes de Mantenimiento — pnpm workspace monorepo using TypeScript.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, TailwindCSS, React Query, react-hook-form, Recharts

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── maintenance-app/    # React + Vite frontend (main app)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Application Features

- Dashboard con estadísticas de reportes (total, pendientes, en proceso, resueltos)
- Lista de reportes con filtros por estado y búsqueda
- Crear reportes de mantenimiento con prioridad, equipo y usuario
- Detalle de reporte con asignación de técnico, cambio de estatus y notas
- Administración de equipos (maquinaria e instalaciones)
- Administración de usuarios (reportadores, técnicos, admins)
- Seguimiento de quién recibió, atiende y resuelve cada reporte
- Tiempo de resolución calculado automáticamente

## Database Schema

- `users` — id, name, email, role (reporter|technician|admin), createdAt
- `equipment` — id, name, location, description, createdAt
- `reports` — id, title, description, status, priority, equipmentId, reportedById, receivedById, assignedToId, resolvedById, notes, timestamps

## API Endpoints

- `GET /api/users` — list users
- `POST /api/users` — create user
- `GET /api/equipment` — list equipment
- `POST /api/equipment` — create equipment
- `GET /api/reports` — list reports (optional filters: status, assignedTo, equipmentId)
- `POST /api/reports` — create report
- `GET /api/reports/:id` — get report detail
- `PATCH /api/reports/:id` — update report (assign, change status, resolve, notes)
- `GET /api/stats` — get statistics

## Codegen

Run: `pnpm --filter @workspace/api-spec run codegen`

## DB migrations (dev)

Run: `pnpm --filter @workspace/db run push`
