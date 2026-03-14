# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (opens QR code for Expo Go)
npm start

# Start targeting a specific platform
npm run ios
npm run android
npm run web

# Type check
npx tsc --noEmit
```

There is no linter or test suite configured yet.

## Architecture

**Shovot** is a C2C marketplace app (like OLX/eBay) for Uzbekistan, built with Expo SDK 55, React Native 0.83, TypeScript, and Expo Router v3 (file-based routing).

### Navigation structure

Expo Router drives all navigation. The root `app/_layout.tsx` checks AsyncStorage for an auth token on mount and redirects to either `/login` or `/(tabs)/home`. All screens use `headerShown: false` — headers are built manually inside each screen.

```
/login              → phone entry
/verify             → OTP (demo code: 1234)
/(tabs)/home        → listing feed
/(tabs)/search      → search + results
/(tabs)/sell        → create listing (full-screen, acts as modal)
/(tabs)/chat        → conversation list
/(tabs)/profile     → user profile + logout
/listing/[id]       → listing detail
/chat/[id]          → chat thread
```

### Auth

Auth is mock-only right now. The key `@shovot_auth` in AsyncStorage holds a userId string. Writing any value to that key = authenticated; removing it = logged out. `hooks/useAuth.ts` wraps this but is **not currently used** by the screens — `app/_layout.tsx` reads AsyncStorage directly. When wiring up real Supabase auth, replace the AsyncStorage check in `_layout.tsx` with a Supabase session listener.

### Data layer

All data is mock. `data/mockData.ts` exports:
- `mockListings` — 14 listings with Uzbek cities and som prices
- `mockUsers` — 4 profiles with Uzbek names
- `mockConversations` — 3 conversations linking listings + users
- `mockMessages` — keyed by conversation id
- `CURRENT_USER_ID` / `CURRENT_USER` — hardcoded to `user-1` (Jasur Toshmatov)

`lib/supabase.ts` exports a configured Supabase client reading from `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `.env`. The client is set up but **not called anywhere** — all screens use mock data directly. When connecting Supabase, replace mock data imports with Supabase queries using this client.

### Design system

- Primary: `#2563EB` (blue)
- All screens derive `bg`, `textColor`, `subColor`, etc. from `useColorScheme()` inline — there is no shared theme context
- Prices: always formatted via `lib/formatPrice.ts` → `"2 500 000 so'm"`
- Relative times: `lib/timeAgo.ts`
- Dark mode is fully supported on every screen

### Database schema (Supabase — not yet connected)

Tables: `profiles`, `listings`, `saved_listings`, `conversations`, `messages`. See the SQL in the original spec or infer from `types/index.ts`, which mirrors the schema exactly.
