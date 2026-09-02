# Development Workflow

## Prasyarat Windows

- Docker Desktop berjalan dengan Linux containers.
- Docker CLI tersedia di `C:\Users\Engineer\AppData\Local\Programs\DockerCLI`.
- Compose plugin tersedia di `%USERPROFILE%\.docker\cli-plugins`.
- Buka terminal baru setelah PATH user berubah.

Validasi:

```powershell
docker version
docker compose version
docker context show
```

Context yang diharapkan untuk Docker Desktop adalah `desktop-linux`.

## Menjalankan development stack

```powershell
docker compose -f docker-compose.dev.yml up -d --build
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs -f backend frontend
```

Endpoint:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4072`
- Health: `http://localhost:4072/health`
- PostgreSQL host port: `5433`
- Redis host port: `6380`

Frontend dan backend memakai bind mount sehingga edit source terbaca container. Vite dan Air memakai polling untuk kompatibilitas bind mount Windows; Air rebuild binary Go. Named volume menjaga `node_modules`, pnpm store, Go modules, dan Go build cache agar tidak tercampur dengan host.

Cold start pertama dapat lebih lama karena dependency install dan Go compilation. Reload berikutnya memakai cache.

## Command harian

```powershell
# Recreate setelah Dockerfile/compose/dependency berubah
docker compose -f docker-compose.dev.yml up -d --build

# Source-only edit tidak memerlukan rebuild image
docker compose -f docker-compose.dev.yml logs -f backend frontend

# Quality gates dalam container
docker exec semar-frontend pnpm exec tsc -p tsconfig.app.json --noEmit
docker exec semar-frontend pnpm test -- --run
docker exec semar-frontend pnpm build
docker exec semar-backend go test ./...

# Stop tanpa menghapus database/cache
docker compose -f docker-compose.dev.yml down
```

Jangan gunakan `down -v` kecuali memang ingin menghapus database dan seluruh dependency cache.

## Production-like stack

`docker-compose.yml` memakai image production: frontend dibangun menjadi static assets dan dilayani Nginx, backend menjalankan binary. Tidak ada source hot reload pada mode ini.

## Troubleshooting

- Perubahan tidak terbaca: cek `docker compose ... logs`, lalu pastikan bind mount terlihat di `docker inspect`.
- Frontend proxy `ECONNREFUSED` saat startup awal: tunggu backend healthy; compose dev menahan startup frontend sampai health backend lulus.
- Port bentrok: hentikan stack lama sebelum menjalankan compose dev karena nama container dan port sama.
- CPU Vite tinggi: polling interval sudah 1000 ms dan direktori dependency/build diabaikan; jangan mount host `node_modules`.
- Setelah perubahan `.air.toml` atau compose: recreate service terkait.
