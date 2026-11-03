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

- Frontend: `http://localhost:3002`
- Backend: `http://localhost:4073`
- Health: `http://localhost:4073/health`
- PostgreSQL host port: `5434`
- Redis host port: `6381`

Frontend dan backend memakai bind mount sehingga edit source terbaca container. Anonymous volume `/app/node_modules` menjaga dependency dan cache Vite terisolasi dari sinkronisasi filesystem host. Named volume menjaga Go modules dan Go build cache. Source `/app` tetap bind mount.

Watcher hot reload memakai mode native (inotify), bukan polling. Ini disengaja: polling pada bind mount Windows membuat chokidar/Air men-stat ribuan file lewat filesystem 9p Docker Desktop setiap interval; pada beban tersebut 9p dapat jenuh (`ls /app/src` memburuk dari 0,13 dtk menjadi 20–75 dtk), Vite masuk `D state`, dan seluruh request lewat Vite (termasuk proxy `/api`) timeout 10–47 dtk. Jika HMR tidak terdeteksi di mesin Anda, refresh manual adalah jalur cepat; polling bisa dinyalakan sementara lewat `.env` (`CHOKIDAR_USEPOLLING=true`, `CHOKIDAR_INTERVAL=2000`) dengan kesadaran risiko di atas.

Cold start pertama dapat lebih lama karena dependency install dan Go compilation. Reload berikutnya memakai cache.

## Command harian

```powershell
# Recreate setelah Dockerfile/compose/dependency berubah
docker compose -f docker-compose.dev.yml up -d --build

# Source-only edit tidak memerlukan rebuild image
docker compose -f docker-compose.dev.yml logs -f backend frontend

# Quality gates dalam container
docker exec semar-frontend pnpm check

# Atau jalankan gate frontend satu per satu
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
- CPU Vite tinggi / request lewat Vite (HTML, proxy `/api`) lambat atau timeout: cek apakah polling watcher menyala (`docker exec semar-frontend env | grep CHOKIDAR`). Polling pada bind mount Windows dapat menjenuhkan filesystem 9p Docker Desktop dan membuat Vite stuck `D state`; matikan polling dan refresh manual.
- Tabel/API timeout padahal backend sehat: uji backend langsung (`curl http://localhost:4073/health`). Bila backend cepat tetapi endpoint lewat Vite lambat, penyebabnya ada di watcher/filesystem Vite, bukan backend.
- Transisi frontend lambat di Windows: pastikan volume `/app/node_modules` tercantum setelah bind mount `./frontend:/app`; dependency/cache tidak boleh ikut dipantulkan ke host. Proyek saat ini menggunakan Vite (cache di `node_modules/.vite`), bukan Next.js.
- Air rebuild tanpa berhenti / CPU backend tinggi: pastikan `poll = false` di `.air.toml` dan `exclude_dir` mencakup folder non-source; recreate service setelah mengubah `.air.toml`.
