# Keycloak Authentication

## 📋 ภาพรวม

โปรเจคนี้ใช้ Keycloak สำหรับระบบ Authentication โดยมีคุณสมบัติ:

- ✅ บังคับ Login ก่อนเข้าใช้งาน
- ✅ Auto refresh token เมื่อหมดอายุ
- ✅ Axios interceptor แนบ token อัตโนมัติ
- ✅ Logout ผ่านหน้าเว็บ

---

## ⚙️ การตั้งค่า

### 1. Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```env
VITE_KEYCLOAK_URL=http://your-keycloak-server:8080
VITE_REALM=your-realm
VITE_CLIENT_ID=your-client-id
VITE_API_URL=http://your-api-server/api
```

> ⚠️ **สำคัญ:** ต้องใช้ prefix `VITE_` เพื่อให้ Vite expose ตัวแปรไปยัง frontend

### 2. Keycloak Client Settings

ใน Keycloak Admin Console ให้ตั้งค่า Client:

| Setting               | Value                     |
| --------------------- | ------------------------- |
| Root URL              | `http://localhost:5173`   |
| Valid redirect URIs   | `http://localhost:5173/*` |
| Web origins           | `http://localhost:5173`   |
| Client authentication | Off (public client)       |

---

## 📁 โครงสร้างไฟล์

```
src/
├── config/
│   └── keycloak.ts          # Keycloak configuration
├── lib/
│   └── apiClient.ts         # Axios instance พร้อม auto-token
├── hooks/
│   └── useApi.ts            # Hook สำหรับเรียก API
├── components/
│   └── KeycloakLoading.tsx  # Loading component
└── main.tsx                 # ReactKeycloakProvider wrapper
```

---

## 🔑 การใช้งาน

### ดึงข้อมูล Token

```tsx
import { useKeycloak } from '@react-keycloak/web';

function MyComponent() {
  const { keycloak } = useKeycloak();

  // Access Token (ใช้ส่งไป API)
  console.log(keycloak.token);

  // ข้อมูลผู้ใช้
  console.log(keycloak.tokenParsed);
}
```

### เรียก API พร้อม Token

```tsx
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { get, post } = useApi();

  const fetchData = async () => {
    // Token ถูกแนบอัตโนมัติ!
    const response = await get('/users');
    console.log(response.data);
  };

  const createUser = async () => {
    const response = await post('/users', { name: 'John' });
    console.log(response.data);
  };
}
```

### Logout

```tsx
import { useKeycloak } from '@react-keycloak/web';

function LogoutButton() {
  const { keycloak } = useKeycloak();

  const handleLogout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## 🔐 Token Types

| Token         | Property                | ใช้ทำอะไร                     |
| ------------- | ----------------------- | ----------------------------- |
| Access Token  | `keycloak.token`        | ส่งไป API (อายุ ~5 นาที)      |
| Refresh Token | `keycloak.refreshToken` | ขอ token ใหม่ (อายุ ~30 นาที) |
| ID Token      | `keycloak.idToken`      | ข้อมูลผู้ใช้                  |

---

## 🧪 ทดสอบใน Bruno/Postman

1. เปิด Browser Console (F12) แล้วพิมพ์:

   ```javascript
   copy(keycloak.token);
   ```

2. ใน Bruno/Postman เพิ่ม Header:
   ```
   Authorization: Bearer <paste_token>
   ```

---

## ❓ Troubleshooting

### ไม่ redirect ไปหน้า Login

- ตรวจสอบว่า Keycloak server ทำงานอยู่
- ตรวจสอบ URL ใน `.env` ถูกต้อง
- รีสตาร์ท dev server หลังแก้ `.env`

### CORS Error

- ตรวจสอบ Web origins ใน Keycloak ตรงกับ URL ของ frontend

### Token หมดอายุ

- Token จะ refresh อัตโนมัติ แต่ถ้าหมดอายุทั้งหมด จะถูก redirect ไปหน้า login
