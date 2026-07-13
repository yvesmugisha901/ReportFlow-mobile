# Mobile App – Internal Reporting System

React Native (Expo, JavaScript) client for the Internal Reporting System.
Talks to the existing Express backend — no separate web frontend needed.

## Setup

```bash
cd mobile
npm install
npx expo start
```

Then press:
- `a` to open in Android emulator
- `i` to open in iOS simulator
- Scan the QR code with the **Expo Go** app to run on a physical phone

## Connecting to your backend

Edit `src/constants/config.js` and set `API_BASE_URL` depending on how you're testing:

| Environment              | API_BASE_URL                              |
|---------------------------|--------------------------------------------|
| Android emulator          | `http://10.0.2.2:5000/api`                 |
| iOS simulator             | `http://localhost:5000/api`                |
| Physical phone (same WiFi)| `http://<your-laptop-LAN-IP>:5000/api`     |

Replace `5000` with your Express server's actual port.

> On a physical phone, your laptop and phone **must be on the same WiFi network**,
> and your laptop's firewall must allow inbound connections on that port.

## Matching your backend routes

The API layer in `src/api/` assumes standard REST routes:

- `POST /auth/login` → `{ token, user }`
- `GET /auth/me` → current user
- `GET /reports/mine`
- `POST /reports` (multipart form for file upload)
- `GET /reports/:id`
- `GET /reviews/pending`
- `POST /reviews/:id/decision`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `POST /notifications/register-device`

**Adjust these paths and response shapes in `src/api/*.js` to match your actual backend.**
If your backend uses different field names (e.g. `accessToken` instead of `token`), update
`src/context/AuthContext.js` and `src/api/auth.js` accordingly.

## Project structure

```
mobile/
├── App.js                  # entry point
├── src/
│   ├── api/                 # all backend calls, one file per resource
│   ├── navigation/           # auth stack, role-based tabs, per-role stacks
│   ├── screens/               # organized by role: auth/, employee/, reviewer/, shared/
│   ├── components/            # reusable UI (StatusBadge, ReportCard)
│   ├── context/                # AuthContext (JWT session state)
│   └── constants/               # config.js — API_BASE_URL, roles, statuses
```

## Roles currently wired up

- **Employee**: submit reports (with file attachment), view own report list + detail
- **Reviewer / Approver**: view pending approvals, approve / reject / request changes
- **Admin**: placeholder tab (dashboard screens not yet built — recommend keeping
  admin org-management on the web/desktop side, mobile isn't a great fit for that)

## Not yet implemented (next steps)

- Push notifications (Expo push token registration is stubbed in `src/api/notifications.js`,
  needs `expo-notifications` permission flow wired in `App.js`)
- Admin dashboard/analytics screens
- Pull-to-refresh on list screens
- Offline handling / retry queue for submissions
