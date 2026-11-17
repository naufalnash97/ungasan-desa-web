# 00 — Alur Kerja Agent (agency-agents)

Proyek ini dikerjakan dengan pola *agency*: setiap dokumen dan setiap lapisan kode punya **agent pemilik** yang diambil dari repo [`naufalnash97/agency-agents`](https://github.com/naufalnash97/agency-agents) (commit `b37b5bb`). File persona agent disalin ke `.claude/agents/` sehingga bisa dipanggil langsung di Claude Code:

```bash
# di root repo ini
claude
> Aktifkan agent "Backend Architect" dan review docs/05-BSD.md
```

## Peta agent → artefak

| Langkah | Artefak | Agent pemilik (persona) | File agent | Reviewer |
|---|---|---|---|---|
| 1 | PRD — Product Requirement | 🧭 **Product Manager** | `product-manager.md` | Senior Project Manager |
| 2 | TRD — Technical Requirement | **Software Architect** | `engineering-software-architect.md` | Backend Architect |
| 3 | AFD — App Flow | **UX Architect** | `design-ux-architect.md` | Accessibility Auditor |
| 4 | DBD — Design Brief | **UI Designer** | `design-ui-designer.md` | UX Architect |
| 5 | BSD — Backend Schema | **Backend Architect** + **Database Optimizer** | `engineering-backend-architect.md`, `engineering-database-optimizer.md` | Code Reviewer |
| 6 | IPD — Implementation Plan | **Senior Project Manager** | `project-manager-senior.md` | Product Manager |
| 7 | Database (Drizzle + seed) | Database Optimizer | `engineering-database-optimizer.md` | Backend Architect |
| 8 | Backend (REST `/api/v1`) | Backend Architect | `engineering-backend-architect.md` | Code Reviewer |
| 9 | Frontend (Next.js) | **Frontend Developer** | `engineering-frontend-developer.md` | UI Designer, Accessibility Auditor |
| 10 | DevOps (Docker, CI) | **DevOps Automator** | `engineering-devops-automator.md` | Software Architect |
| 11 | README & dokumentasi | **Technical Writer** | `engineering-technical-writer.md` | Product Manager |
| 12 | QA akhir | **Code Reviewer** + **Reality Checker** | `engineering-code-reviewer.md`, `testing-reality-checker.md` | — |

## Urutan serah-terima (handoff)

```
Product Manager ──PRD──▶ Software Architect ──TRD──▶ UX Architect ──AFD──▶ UI Designer ──DBD──┐
                                                                                               ▼
Senior PM ◀──IPD── Backend Architect + DB Optimizer ◀──BSD───────────────────────────────────────┘
    │
    ├─▶ Database Optimizer  → src/db/schema.ts, src/db/seed.ts, drizzle/*.sql
    ├─▶ Backend Architect   → src/app/api/v1/**
    ├─▶ Frontend Developer  → src/app/**, src/components/**
    ├─▶ DevOps Automator    → Dockerfile, docker-compose.yml, .github/workflows/ci.yml
    └─▶ Code Reviewer + Reality Checker → gate sebelum merge ke main
```

Aturan handoff (diambil dari "Critical Rules" masing-masing agent):

1. **Problem dulu, baru solusi** (Product Manager) — tiap fitur di PRD punya masalah warga yang jelas.
2. **Kontrak API dikunci sebelum frontend menyentuhnya** (Backend Architect — *API Contract Governance*).
3. **Migrasi selalu maju dan bisa diulang** (Database Optimizer).
4. **Aksesibilitas WCAG 2.1 AA adalah syarat rilis, bukan bonus** (Accessibility Auditor).
5. **Bukti, bukan klaim** (Reality Checker) — "selesai" berarti build hijau + halaman dirender + data seed tampil.

## Prompt standar per agent

```text
Kamu adalah <Nama Agent> dari .claude/agents/<file>.md.
Konteks: website Desa Ungasan (lihat docs/01-PRD.md).
Input: <dokumen sebelumnya>.
Output: <dokumen/kode tujuan>, ikuti format deliverable di persona-mu.
Batasan: open-source only, Bahasa Indonesia, WCAG 2.1 AA.
```
