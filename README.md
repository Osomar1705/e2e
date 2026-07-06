# UberClone Frontend — CS2031 DBP 2026-1

Frontend React + TypeScript para integración E2E con el backend [cs2031-2026-1-week14-e2e-2](https://github.com/CS2031-DBP/cs2031-2026-1-week14-e2e-2).

## Requisitos

- Node.js 18+
- Backend corriendo en `http://localhost:8080`

## Configuración

```bash
npm install
cp .env.example .env   # opcional; el default apunta a localhost:8080
```

Variables de entorno:

| Variable | Default | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base del backend |

## Desarrollo

```bash
# Terminal 1 — backend (en el repo del backend)
./mvnw spring-boot:run

# Terminal 2 — frontend
npm run dev
```

Abre `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Cuentas de demo

| Email | Password | Rol |
|---|---|---|
| `ana@uber.com` | `pass123` | PASSENGER |
| `carlos@uber.com` | `pass123` | DRIVER |

## Pantallas

- **Login / Registro** — autenticación JWT con selector de rol
- **Dashboard pasajero** — lista de viajes y botón para pedir viaje
- **Solicitar viaje** — conductores disponibles + formulario origen/destino
- **Detalle pasajero** — polling en vivo, calificación al completar
- **Dashboard conductor** — viajes pendientes, viaje activo con completar
- **Detalle conductor** — completar viaje en curso
- **Historial** — tabla filtrable por estado (ambos roles)
