# SEMAR Future Feature Backlog

## Fokus aktif

Pengembangan runtime saat ini dibatasi pada **Dashboard utama** dan modul **Risk Based Inspection (RBI) → Equipment Master**. Daftar di bawah mencatat fitur dan submenu lain yang masih tercantum di route manifest, fallback navigasi, seeder database, atau halaman Dashboard. Fitur-fitur tersebut disembunyikan dari navigasi dan routing aktif sampai diprioritaskan kembali.

## Backlog pengembangan selanjutnya

### Dashboard — selain halaman utama
- Asset Health Dashboard (`/dashboard/asset`)
- Inspection Dashboard (`/dashboard/inspection`)
- Maintenance Dashboard (`/dashboard/maintenance`)
- Compliance Dashboard (`/dashboard/compliance`)
- Portal, shortcut, KPI, dan widget Dashboard yang mengarahkan ke modul-modul backlog

### Asset Management
- Asset Registry (`/assets/registry`)
- Asset Hierarchy (`/assets/hierarchy`)
- Technical Data (`/assets/technical-data`)
- Documents (`/assets/documents`)
- Import / Export (`/assets/import-export`)
- Categories / Taxonomy (`/assets/categories`)
- Sites dan fasilitas (`/assets/sites`)

### Risk Based Inspection — selain Equipment Master
- Risk Matrix 5×5 (`/risk/matrix`)
- Degradation mechanisms/rates (`/risk/degradation`)
- Integrity Assessment (`/risk/integrity`)
- RBI Reports (`/risk/reports`)
- Risk Assessments (`/risk/assessments`)
- Mitigation Actions (`/risk/mitigation`)

### Inspection Management
- Inspection Plans (`/inspection/plans`)
- Inspection Tasks (`/inspection/tasks`)
- Inspection Types (`/inspection/types`)
- Findings (`/inspection/findings`)
- Inspection Calendar (`/inspection/calendar`)
- Inspection Reports (`/inspection/reports`)

### Analytics & Reliability Intelligence
- Performance (`/analytics/performance`)
- Risk Analysis (`/analytics/risk`)
- Inspection Coverage/Trends (`/analytics/inspection`)
- Maintenance Effectiveness dan MTBF/MTTR (`/analytics/maintenance`)
- Compliance Status (`/analytics/compliance`)
- Analytics Reports (`/analytics/reports`)
- Analytics Dashboard (`/analytics/dashboard`)

### Maintenance Management
- Work Orders (`/maintenance/work-orders`)
- Maintenance Plans (`/maintenance/plans`)
- Maintenance Tasks (`/maintenance/tasks`)
- Resource Allocation (`/maintenance/resources`)
- Maintenance Calendar (`/maintenance/calendar`)
- Maintenance History (`/maintenance/history`)
- Maintenance Schedules (`/maintenance/schedules`)

### Compliance Management
- Standards (`/compliance/standards`)
- Requirements (`/compliance/requirements`)
- Compliance Tasks (`/compliance/tasks`)
- Audits & Reviews (`/compliance/audits`)
- Asset Certifications (`/compliance/certifications`)

### Administration
- Users (`/admin/users`)
- Roles (`/admin/roles`)
- Permissions (`/admin/permissions`)
- System Configuration (`/admin/system-config`)
- Integrations (`/admin/integrations`)
- Single Sign-On (`/admin/sso`)
- Backup & Restore (`/admin/backup-restore`)
- Workflow Engine (`/admin/workflow`)
- Menu Management (`/admin/menu`)
- Module Management (`/admin/modules`)
- Taxonomy (`/admin/taxonomy`)
- Tenant Management (`/admin/tenants`)

### Content, reporting, system utilities, and global search
- Content Types, Content Items, Media Library, Content Categories, Content Tags, dan Content Entry Editor (`/content/*`)
- Report Templates (`/reporting/templates`)
- System Categories (`/system-configuration/categories`)
- Global Search (`/search`)

### Dashboard API dan engineering capabilities lainnya
- Dashboard layout/widget management dan sharing
- Aset lintas area, integrasi enterprise/IoT, observability, dan workflow pendukung modul-modul backlog

## Aturan aktivasi kembali

1. Pilih satu modul/vertical slice dari backlog dan pastikan data model, API, authorization, UI, dan acceptance criteria siap.
2. Aktifkan route, menu seeder/runtime, dan fallback navigasinya secara konsisten dalam perubahan yang sama.
3. Tambahkan contract test menu-route serta verifikasi deep link agar modul yang belum aktif tetap tertutup.
