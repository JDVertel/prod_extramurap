# Extramurapp - Migracion a VPS (API + MySQL)

Este proyecto ahora tiene dos capas:

- Frontend Vue 3 (este repositorio raiz)
- Backend API Node.js + Express + MySQL en la carpeta `backend/`

La migracion se planteo para no romper todo el frontend de una sola vez:

- `src/api/realtimeApi.js` apunta a `api/realtime` en tu backend (compatibilidad temporal para el store actual)
- El login ya usa API REST real (`/api/auth/login`) con JWT
- `fetchUserDataByUid` ahora lee usuarios desde `/api/users/:id`

## 1) Configuracion del Frontend

1. Instala dependencias:

```sh
npm install
```

2. Crea archivo de entorno desde el ejemplo:

```sh
cp .env.example .env
```

3. Ajusta la URL de tu API:

```env
VITE_API_URL=http://localhost:3000/api
```

4. Ejecuta frontend:

```sh
npm run dev
```

## 2) Configuracion del Backend API

1. Entra a backend e instala dependencias:

```sh
cd backend
npm install
```

2. Crea el `.env`:

```sh
cp .env.example .env
```

3. Ejecuta el script SQL en MySQL:

- Archivo: `backend/sql/schema.sql`
- Crea tablas: `users`, `password_reset_tokens`, `rt_nodes`

4. Levanta la API:

```sh
npm run dev
```

La API queda en:

- `http://localhost:3000/api/health`

## 3) Endpoints principales creados

- `POST /api/auth/register-admin`
- `POST /api/auth/login`
- `POST /api/auth/request-password-reset`
- `POST /api/auth/reset-password`
- `GET /api/users/exists/email/:email`
- `GET /api/users/exists/document/:numDocumento`
- `GET /api/users/:id` (requiere JWT)
- `GET/POST/PUT/PATCH/DELETE /api/realtime/*` (requiere JWT)

## 4) Notas para despliegue en VPS

- Usa `PM2` o `systemd` para ejecutar `backend/src/index.js`
- Configura Nginx como reverse proxy para:
	- `/` -> frontend (Vite build o servidor estatico)
	- `/api` -> backend Node
- En produccion cambia obligatoriamente:
	- `JWT_SECRET`
	- `SHOW_RESET_TOKEN_IN_RESPONSE=false`

## 5) Fase siguiente recomendada

Migrar gradualmente los modulos que aun usan el endpoint de compatibilidad realtime hacia endpoints REST especificos (`encuestas`, `agendas`, `ips`, etc.).
