# 🛡️ DEAWARE-FN

> ระบบ **Smart Attendance & Employee Management** — Frontend สำหรับจัดการการเข้า-ออกงานพนักงาน พร้อมระบบ AI ตรวจจับใบหน้าแบบ Real-time

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite_(Rolldown)-7.2.5-646CFF?logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1.18-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Keycloak-26.2.3-4D4D4D?logo=keycloak&logoColor=white" />
</p>

---

## 📋 สารบัญ

- [ภาพรวมโปรเจค](#-ภาพรวมโปรเจค)
- [ฟีเจอร์หลัก](#-ฟีเจอร์หลัก)
- [สถาปัตยกรรมระบบ](#-สถาปัตยกรรมระบบ)
- [ข้อกำหนดเบื้องต้น](#-ข้อกำหนดเบื้องต้น)
- [การติดตั้งและตั้งค่า](#-การติดตั้งและตั้งค่า)
- [การรันโปรเจค](#-การรันโปรเจค)
- [Environment Variables](#-environment-variables)
- [โครงสร้างโปรเจค](#-โครงสร้างโปรเจค)
- [หน้าและ Routes](#-หน้าและ-routes)
- [ระบบ Real-time AI Feed](#-ระบบ-real-time-ai-feed-websocket)
- [ระบบ Authentication](#-ระบบ-authentication-keycloak)
- [เทคโนโลยีที่ใช้](#-เทคโนโลยีที่ใช้)
- [คำสั่งที่ใช้งาน](#-คำสั่งที่ใช้งาน)
- [การแก้ไขปัญหา](#-การแก้ไขปัญหา)
- [ทีมพัฒนา](#-ทีมพัฒนา)

---

## 🌐 ภาพรวมโปรเจค

**DEAWARE** เป็นระบบจัดการการเข้า-ออกงานของพนักงานแบบอัจฉริยะ โดยใช้กล้อง AI ตรวจจับใบหน้าเพื่อบันทึกเวลาเข้า-ออกงานอัตโนมัติ Frontend นี้พัฒนาด้วย **React + TypeScript + Vite** พร้อม UI ระดับ Premium (Glassmorphism, Dark/Light Mode) และระบบแจ้งเตือนแบบ Real-time ผ่าน WebSocket

### การทำงานของระบบ

```
กล้อง AI ──► Backend (Go/gRPC) ──► WebSocket ──► Frontend (React)
                  │                                    │
                  ▼                                    ▼
              PostgreSQL                        Toast แจ้งเตือน
              (บันทึกข้อมูล)                   + Live Activity Feed
```

---

## ✨ ฟีเจอร์หลัก

### 🏠 หน้าหลัก (Dashboard)

- **Profile Card** — แสดงข้อมูลส่วนตัว ดึงจาก Keycloak Token
- **Quick Actions** — ปุ่มลัดสำหรับฟีเจอร์ต่างๆ
- **สถิติภาพรวม** — จำนวนเข้างาน สาย ขาดงาน แบบเรียลไทม์

### 📊 ประวัติการเข้างาน (Attendance)

- **ตารางบันทึก** — แสดงข้อมูลเข้า-ออกงานรายวัน พร้อมรูปภาพ Check-in/Check-out
- **ตัวกรอง** — กรองตามช่วงวันที่ด้วย Date Range Picker
- **Export CSV** — ส่งออกข้อมูลเป็นไฟล์ CSV ด้วย PapaParse

### 👥 จัดการพนักงาน (Employees) — Admin Only

- **รายชื่อพนักงาน** — ดูข้อมูลทั้งหมด เพิ่ม/แก้ไข/ตรวจสอบ
- **Dashboard รายบุคคล** — ดูสถิติเฉพาะคน กราฟ Recharts วิเคราะห์รายเดือน
- **KPI Dashboard** — ภาพรวมผลงานรายทีม พร้อมแผนภูมิ

### 📡 Real-time AI Activity Feed — Admin Only

- **WebSocket** — เชื่อมต่อกับ Backend AI เพื่อรับข้อมูล Check-in/Check-out แบบสด
- **Toast แจ้งเตือน** — แสดง Notification ตรงกลางบนหน้าจอเมื่อตรวจจับได้
- **LIVE Pill Button** — ปุ่มสถานะสีเขียว (Live Pulse) ใน Header
- **Activity Drawer** — เปิดดูรายการกิจกรรมล่าสุดทั้งหมด

### 🎨 UI/UX Premium

- **Glassmorphism Design** — เอฟเฟกต์ Blur/Frosted Glass ทั่ว UI
- **Dark / Light Mode** — สลับธีมได้ทันที (บันทึกลง LocalStorage)
- **Micro-animations** — Hover effects, ปุ่ม Press effects, Chart animations
- **Responsive Layout** — รองรับทุกขนาดหน้าจอ (Sidebar ย่อ/ขยาย)

### ⚙️ Settings

- **แก้ไขข้อมูลส่วนตัว** — เปลี่ยนชื่อ, อัปโหลดรูปโปรไฟล์
- **ส่งอีเมล** — ส่งอีเมลจากหน้ารายละเอียดพนักงาน

---

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│                        DEAWARE-FN                           │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐│
│  │ Keycloak │   │   REST   │   │WebSocket │   │  File    ││
│  │  Auth    │   │   API    │   │  (AI)    │   │ Storage  ││
│  │ :8080    │   │  :3001   │   │  :8080   │   │  :8887   ││
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘│
│       │              │              │              │       │
│       ▼              ▼              ▼              ▼       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Vite Dev Server (:5173)                  │  │
│  │   Proxy: /auth → :8080  /api → :3001  /files → :8887 │  │
│  └──────────────────────────────────────────────────────┘  │
│       │                                                     │
│       ▼                                                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Application                        │  │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────────────┐    │  │
│  │  │ Zustand │  │ React    │  │ useAttendance    │    │  │
│  │  │ (Auth)  │  │ Query    │  │ Socket (WS)      │    │  │
│  │  └─────────┘  └──────────┘  └──────────────────┘    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 ข้อกำหนดเบื้องต้น

| โปรแกรม             | เวอร์ชันขั้นต่ำ | หมายเหตุ                            |
| ------------------- | --------------- | ----------------------------------- |
| **Node.js**         | 18.0+           | LTS แนะนำ                           |
| **Bun** (แนะนำ)     | 1.0+            | ใช้แทน npm ได้ เร็วกว่า             |
| **Git**             | 2.0+            | จัดการ version control              |
| **Keycloak Server** | 20.0+           | ต้องรันแยกต่างหาก                   |
| **Backend API**     | —               | REST API (Go) ที่ port 3001         |
| **AI Backend**      | —               | WebSocket + gRPC (Go) ที่ port 8080 |

### ตรวจสอบเวอร์ชัน

```bash
node --version    # ≥ 18.0
bun --version     # ≥ 1.0 (ถ้าใช้ Bun)
git --version     # ≥ 2.0
```

---

## 📦 การติดตั้งและตั้งค่า

### ขั้นตอนที่ 1: Clone โปรเจค

```bash
git clone <repository-url>
cd DEAWARE-FN
```

### ขั้นตอนที่ 2: ติดตั้ง Dependencies

```bash
# ใช้ Bun (แนะนำ — เร็วกว่า npm 3-5 เท่า)
bun install

# หรือใช้ npm
npm install
```

### ขั้นตอนที่ 3: สร้างไฟล์ Environment

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

หากไม่มีไฟล์ `.env.example` ให้สร้างไฟล์ `.env` ใหม่:

```env
# ──── Keycloak Authentication ────
VITE_KEYCLOAK_URL=/auth
VITE_REALM=DEAWARE
VITE_CLIENT_ID=DEAWARE

# ──── Backend API ────
VITE_API_URL=/api

# ──── AI WebSocket (Real-time Feed) ────
VITE_WS_URL=ws://100.108.35.28:8080/ws
```

### ขั้นตอนที่ 4: ตรวจสอบ Proxy ใน `vite.config.ts`

ปรับ `target` ให้ตรงกับ Server ที่รันจริง:

```typescript
server: {
  proxy: {
    '/api/': {
      target: 'http://localhost:3001/',    // Backend REST API
      changeOrigin: true,
      secure: false,
    },
    '/auth/': {
      target: 'http://localhost:8080/',    // Keycloak Server
      changeOrigin: true,
      secure: false,
    },
    '/files/': {
      target: 'http://localhost:8887/',    // File Storage Server
      changeOrigin: true,
      secure: false,
      rewrite: (path) => path.replace(/^\/files/, ''),
    },
  },
}
```

---

## 🚀 การรันโปรเจค

### ⚠️ ก่อนรัน Frontend — ต้องเตรียม Backend ก่อน

**Services ที่ต้องรันก่อน (เรียงลำดับ):**

```
1. Keycloak Server       →  port 8080  (Authentication)
2. Backend REST API      →  port 3001  (ข้อมูลพนักงาน/Attendance)
3. AI WebSocket Server   →  port 8080  (Real-time Face Detection)
4. File Storage Server   →  port 8887  (รูปภาพ/ไฟล์)
```

### Development Mode

```bash
# ใช้ Bun (แนะนำ)
bun run dev

# หรือใช้ npm
npm run dev
```

เปิดเบราว์เซอร์: **http://localhost:5173**

> 💡 ระบบจะบังคับ Login ผ่าน Keycloak ก่อนแสดงหน้าจอ

### Production Build

```bash
# Build
bun run build    # หรือ npm run build

# Preview build ก่อน Deploy
bun run preview  # หรือ npm run preview
```

---

## 🔑 Environment Variables

| ตัวแปร              | คำอธิบาย                    | ค่าเริ่มต้น | ตัวอย่าง                     |
| ------------------- | --------------------------- | ----------- | ---------------------------- |
| `VITE_KEYCLOAK_URL` | URL ของ Keycloak Server     | `/auth`     | `http://localhost:8081/auth` |
| `VITE_REALM`        | ชื่อ Realm ใน Keycloak      | `DEAWARE`   | `DEAWARE`                    |
| `VITE_CLIENT_ID`    | Client ID ใน Keycloak       | `DEAWARE`   | `DEAWARE`                    |
| `VITE_API_URL`      | URL ของ Backend REST API    | `/api`      | `http://localhost:3001`      |
| `VITE_WS_URL`       | URL ของ AI WebSocket Server | —           | `ws://100.108.35.28:8080/ws` |

---

## 📁 โครงสร้างโปรเจค

```
DEAWARE-FN/
├── public/                          # Static assets
├── src/
│   ├── @types/                      # TypeScript type definitions
│   ├── assets/                      # Images, SVGs
│   ├── components/
│   │   ├── common/                  # Shared components
│   │   │   ├── AttendanceCard.tsx    #   การ์ดแสดงข้อมูลเข้า-ออกงาน
│   │   │   ├── AttendanceDeviceCard.tsx  #   การ์ดอุปกรณ์ตรวจจับ
│   │   │   ├── CreateEmployeeDialog.tsx  #   ฟอร์มเพิ่มพนักงานใหม่
│   │   │   ├── ErrorPage.tsx        #   หน้า Error
│   │   │   ├── ExportData.tsx       #   ปุ่มส่งออก CSV
│   │   │   └── LoadingPage.tsx      #   หน้า Loading
│   │   ├── filter/                  # Filter components (DateRange, etc.)
│   │   ├── layouts/
│   │   │   ├── MainLayout.tsx       #   Layout หลัก (Header + Sidebar)
│   │   │   ├── Sidebar.tsx          #   เมนูด้านข้าง + Settings
│   │   │   ├── Livedata.tsx         #   ปุ่ม LIVE AI + Activity Drawer
│   │   │   └── SettingContent.tsx   #   หน้า Settings (Profile, Upload)
│   │   └── ui/                      # Shadcn/ui components (Button, Card, etc.)
│   │       └── attendance-toast.tsx  #   Toast แจ้งเตือน AI Detection
│   ├── config/
│   │   ├── keycloak.ts              # Keycloak client configuration
│   │   └── fetctWithAuth.ts         # Authenticated fetch wrapper
│   ├── hooks/
│   │   ├── useAttendanceSocket.ts   # ★ WebSocket hook (Real-time AI)
│   │   ├── useAttendance.ts         #   ข้อมูล Attendance ของตัวเอง
│   │   ├── useAttendanceHistory.ts  #   ประวัติ Attendance
│   │   ├── useEmployee.ts           #   CRUD พนักงาน
│   │   ├── useEmployeeById.ts       #   ดึงข้อมูลพนักงานรายคน
│   │   ├── useEmployeeAnalysis.ts   #   วิเคราะห์สถิติพนักงาน
│   │   ├── useEmployeeAttendanceHistory.ts  #   ประวัติเข้างานรายคน
│   │   ├── useProfile.ts            #   Profile ของ User
│   │   ├── useTheme.ts              #   Dark/Light Mode
│   │   └── use-mobile.ts            #   ตรวจจับ Mobile viewport
│   ├── lib/
│   │   ├── apiClient.ts             # Axios instance + interceptors
│   │   ├── attendance.ts            # Attendance API functions
│   │   ├── attendance-icons.tsx     # ไอคอนสำหรับ Attendance
│   │   ├── date.ts                  # Date utility functions
│   │   ├── helper.ts               # General helpers
│   │   ├── itemMenu.ts             # Navigation menu items
│   │   └── utils.ts                # cn() utility
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── HomePage.tsx         # ★ หน้าหลัก (Dashboard)
│   │   │   └── _components/         #   ProfileCard, TransectionButton
│   │   ├── AttendanceMe/
│   │   │   └── AttendanceMePage.tsx  # ★ ประวัติเข้างานของตัวเอง
│   │   ├── Employee/
│   │   │   ├── EmployeesPage.tsx    # ★ รายชื่อพนักงาน (Admin)
│   │   │   ├── KpiDashboardPage.tsx # ★ KPI Dashboard (Admin)
│   │   │   └── DashboardKpi.tsx     #   KPI components
│   │   └── employeeId/
│   │       ├── EmployeeIdpage.tsx    # ★ รายละเอียดพนักงานรายคน
│   │       ├── Dashboard_Id.tsx     #   Dashboard เฉพาะคน
│   │       └── EmailDialog.tsx      #   ส่งอีเมล
│   ├── routes/
│   │   └── AppRoutes.tsx            # Route definitions
│   ├── stores/
│   │   └── authStore.ts             # Zustand store (Auth state)
│   ├── fonts/                       # Custom fonts
│   ├── App.tsx                      # Root component + Toaster
│   ├── main.tsx                     # Entry point + Keycloak Provider
│   └── index.css                    # Global styles + Design tokens
├── .env                             # Environment variables (ไม่ commit)
├── .gitignore                       # Git ignore rules
├── index.html                       # HTML entry point
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite + Proxy configuration
└── README.md                        # 📄 เอกสารนี้
```

---

## 🗺️ หน้าและ Routes

| Route            | หน้า               | สิทธิ์ | คำอธิบาย                     |
| ---------------- | ------------------ | ------ | ---------------------------- |
| `/`              | `HomePage`         | ทุกคน  | Dashboard หลัก, Profile Card |
| `/attendance`    | `AttendanceMePage` | ทุกคน  | ประวัติเข้า-ออกงานของตัวเอง  |
| `/employees`     | `EmployeesPage`    | Admin  | รายชื่อพนักงานทั้งหมด        |
| `/employees/kpi` | `KpiDashboardPage` | Admin  | KPI Dashboard                |
| `/employees/:id` | `EmployeeIdPage`   | Admin  | ข้อมูลพนักงานรายบุคคล        |

---

## 📡 ระบบ Real-time AI Feed (WebSocket)

### การทำงาน

```
กล้อง AI ตรวจจับใบหน้า
        │
        ▼
AI Backend (Go + gRPC)
        │
        ▼ บันทึกลง PostgreSQL
        │
        ▼ ส่ง JSON ผ่าน WebSocket
        │
   ┌────┴────┐
   │ Browser │
   └────┬────┘
        │
        ▼
useAttendanceSocket.ts (Hook)
        │
        ├── อัปเดต React Query Cache ('live-activity')
        │
        └── ยิง Toast แจ้งเตือน (react-hot-toast)
```

### รูปแบบ JSON ที่รับจาก WebSocket

```json
{
  "user_name": "Thanasan",
  "status": "update_check_out",
  "checked_at": "12:57:52",
  "record_id": "c9605235-631b-4f39-b095-d54ba9a31862",
  "confidence": "0.57"
}
```

| Field        | Type     | คำอธิบาย                                  |
| ------------ | -------- | ----------------------------------------- |
| `user_name`  | `string` | ชื่อพนักงานที่ตรวจจับได้                  |
| `status`     | `string` | `update_check_in` หรือ `update_check_out` |
| `checked_at` | `string` | เวลาที่ตรวจจับ (HH:mm:ss)                 |
| `record_id`  | `string` | UUID ของ Record                           |
| `confidence` | `string` | ค่าความมั่นใจของ AI (0-1)                 |

### ไฟล์ที่เกี่ยวข้อง

| ไฟล์                                     | หน้าที่                                                     |
| ---------------------------------------- | ----------------------------------------------------------- |
| `src/hooks/useAttendanceSocket.ts`       | Hook หลัก — จัดการ WebSocket connection, reconnect, cleanup |
| `src/components/ui/attendance-toast.tsx` | แสดง Toast notification เมื่อ AI ตรวจพบ                     |
| `src/components/layouts/Livedata.tsx`    | ปุ่ม LIVE AI + Drawer แสดง Activity Feed                    |
| `.env` → `VITE_WS_URL`                   | URL ของ WebSocket Server                                    |

---

## 🔐 ระบบ Authentication (Keycloak)

### ขั้นตอนการตั้งค่า Keycloak

1. **ติดตั้งและรัน Keycloak Server**
2. **สร้าง Realm** ชื่อ `DEAWARE`
3. **สร้าง Client** ชื่อ `DEAWARE`
   - Access Type: `public`
   - Valid Redirect URIs: `http://localhost:5173/*`
   - Web Origins: `http://localhost:5173`
4. **สร้าง Roles:**
   - `admin` — เข้าถึงจัดการพนักงาน, KPI, Live Feed
   - `user` — เข้าถึงหน้าตัวเอง (Home, Attendance)
5. **อัปเดต `.env`** ให้ตรงกับค่าที่ตั้ง

### การทำงานใน Frontend

```
main.tsx
  └── ReactKeycloakProvider (initOptions: login-required)
        └── App.tsx
              └── AppRoutes.tsx (ตรวจสอบ keycloak.authenticated)
                    └── MainLayout → Pages
```

- **บังคับ Login** ก่อนเข้าใช้งาน (`onLoad: 'login-required'`)
- **Token** ถูกส่งไปพร้อม API Requests (Axios interceptor)
- **Role Check** ใช้ `keycloak.hasRealmRole('admin')` เพื่อตรวจสอบสิทธิ์ Admin

---

## 🛠️ เทคโนโลยีที่ใช้

### Core

| เทคโนโลยี       | เวอร์ชัน | หน้าที่                 |
| --------------- | -------- | ----------------------- |
| React           | 19.2.0   | UI Framework            |
| TypeScript      | 5.9.3    | Type Safety             |
| Vite (Rolldown) | 7.2.5    | Build Tool & Dev Server |

### UI & Styling

| เทคโนโลยี                | หน้าที่                  |
| ------------------------ | ------------------------ |
| Tailwind CSS 4.1.18      | Utility-first CSS        |
| Radix UI                 | Accessible UI Primitives |
| Lucide React             | Icon Library             |
| class-variance-authority | CSS Variants             |
| tw-animate-css           | CSS Animations           |

### State Management & Data Fetching

| เทคโนโลยี            | หน้าที่                |
| -------------------- | ---------------------- |
| TanStack React Query | Server State / Caching |
| Zustand              | Client State (Auth)    |
| Axios                | HTTP Client            |

### Authentication

| เทคโนโลยี           | หน้าที่                |
| ------------------- | ---------------------- |
| Keycloak JS 26.2.3  | SSO Authentication     |
| @react-keycloak/web | React Keycloak Adapter |

### Utilities

| เทคโนโลยี        | หน้าที่                 |
| ---------------- | ----------------------- |
| react-hot-toast  | Toast Notifications     |
| Recharts         | แผนภูมิ/กราฟข้อมูล      |
| date-fns         | จัดการวันที่            |
| PapaParse        | Parse/Export CSV        |
| React Router DOM | Client-side Routing     |
| Immer            | Immutable State Updates |

---

## 📝 คำสั่งที่ใช้งาน

| คำสั่ง                 | คำอธิบาย                             |
| ---------------------- | ------------------------------------ |
| `bun run dev`          | รันโปรเจคในโหมด Development (HMR)    |
| `bun run build`        | สร้าง Production Build               |
| `bun run preview`      | Preview Production Build ก่อน Deploy |
| `bun run lint`         | ตรวจสอบโค้ดด้วย ESLint               |
| `bun run format`       | จัดรูปแบบโค้ดด้วย Prettier           |
| `bun run format:check` | ตรวจสอบรูปแบบโค้ดด้วย Prettier       |

> 💡 สามารถใช้ `npm run` แทน `bun run` ได้ทุกคำสั่ง

---

## 🐛 การแก้ไขปัญหา

### ❌ โปรเจครันไม่ได้

```bash
# 1. ลบ dependencies เก่าแล้วติดตั้งใหม่
rm -rf node_modules dist bun.lockb
bun install

# 2. ตรวจสอบไฟล์ .env
cat .env
```

### ❌ Keycloak Login ไม่ทำงาน

- ตรวจสอบว่า Keycloak Server รันอยู่ที่ port ที่กำหนด
- ตรวจ `VITE_KEYCLOAK_URL`, `VITE_REALM`, `VITE_CLIENT_ID` ใน `.env`
- ตรวจ Redirect URIs ใน Keycloak Admin Console
- ดู Console ในเบราว์เซอร์ว่ามี error "Unsafe attempt to load URL" หรือไม่ → ตรวจ Proxy

### ❌ WebSocket ไม่เชื่อมต่อ / แจ้งเตือนไม่ขึ้น

- ตรวจว่า `VITE_WS_URL` ใน `.env` ถูกต้อง
- ตรวจว่า AI Backend (`ws://IP:8080/ws`) รันอยู่และเปิดรับการเชื่อมต่อจากภายนอก (`0.0.0.0`)
- ตรวจ Firewall ของเครื่อง AI Backend
- ดู Console → ถ้าเห็น `✅ Attendance WebSocket Connected` แสดงว่าเชื่อมต่อสำเร็จ
- ถ้าเห็น `⚠️ WebSocket Closed. Reconnecting...` แสดงว่ากำลังพยายามเชื่อมต่อใหม่ทุก 5 วินาที

### ❌ WebSocket เชื่อมต่อซ้ำซ้อน (Leaking)

- ตรวจว่า `useAttendanceSocket()` ถูกเรียกเพียง **1 ครั้ง** ใน `Livedata.tsx`
- ระบบมี `isMounted` guard และ cleanup function ป้องกันการ leak อยู่แล้ว
- ถ้ารีเฟรชหน้าแล้วตัวเลข total กลับเป็น 1 แสดงว่าระบบทำงานปกติ

### ❌ Port 5173 ถูกใช้งานแล้ว

- Vite จะเลือก port ถัดไปโดยอัตโนมัติ (5174, 5175, ...)
- หรือกำหนดเองใน `vite.config.ts` → `server: { port: 3000 }`

---

## 📄 License

โปรเจคนี้เป็นส่วนหนึ่งของระบบ DEAWARE — Smart Attendance Management System

## 👥 ทีมพัฒนา

พัฒนาโดย **DEAWARE Development Team**

---

> 📅 อัปเดตล่าสุด: 29 มีนาคม 2026
