# 📱 SPLITR Mobile - Struktur Proyek

## 🎯 Overview
Proyek React Native dengan Expo Router menggunakan file-based routing dan TypeScript.

## 📁 Struktur Folder

### 🔧 **Root Level**
```
splitr-mobile/
├── app/                    # 🚀 Main application routes (Expo Router)
├── assets/                 # 🖼️ Static assets (images, fonts)
├── components/             # 🧩 Reusable UI components
├── constants/              # 📋 App constants & configurations
├── hooks/                  # 🎣 Custom React hooks
├── services/               # 🌐 API & external services
├── store/                  # 🗄️ State management
├── types/                  # 📝 TypeScript type definitions
├── package.json           # 📦 Dependencies & scripts
└── tsconfig.json          # ⚙️ TypeScript configuration
```

### 🚀 **App Directory (Routing)**
```
app/
├── _layout.tsx            # 🏠 Root layout (Stack Navigator)
├── +not-found.tsx         # ❌ 404 error page
│
├── (public)/              # 🌍 Public routes (no auth required)
│   ├── _layout.tsx        # Layout untuk public routes
│   ├── splash.tsx         # Splash screen
│   └── onboarding/        # Onboarding flow
│       ├── _layout.tsx
│       ├── index.tsx      # Step 1
│       ├── step-2.tsx     # Step 2
│       ├── step-3.tsx     # Step 3
│       └── terms/
│           └── index.tsx  # Terms & conditions
│
├── (auth)/                # 🔐 Authentication routes
│   ├── _layout.tsx        # Layout untuk auth routes
│   ├── login.tsx          # Login screen
│   ├── forgot-password/   # Forgot password flow
│   │   ├── index.tsx      # Request reset
│   │   └── success.tsx    # Success confirmation
│   └── register/          # Registration flow
│       ├── _layout.tsx
│       ├── index.tsx      # Basic info
│       ├── email.tsx      # Email verification
│       ├── otp.tsx        # OTP verification
│       ├── credentials.tsx # Username & password
│       └── set-pin.tsx    # Set PIN
│
├── (tabs)/                # 📱 Main app with bottom tabs
│   ├── _layout.tsx        # Tab navigator (4 tabs)
│   ├── home/              # 🏠 Beranda
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Home dashboard
│   │   └── split/         # Split bill features
│   │       ├── index.tsx  # Create split
│   │       ├── edit.tsx   # Edit split
│   │       ├── choose-my-bill.tsx
│   │       └── confirm.tsx
│   ├── monitoring/        # 📊 Monitoring
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # Monitoring dashboard
│   │   ├── group/
│   │   │   └── [id].tsx   # Group detail (dynamic route)
│   │   └── transaction/
│   │       └── [id].tsx   # Transaction detail
│   ├── riwayat/           # 📋 History
│   │   ├── _layout.tsx
│   │   ├── index.tsx      # History list
│   │   └── detail/
│   │       └── [id].tsx   # History detail
│   └── profile/           # 👤 Profile
│       ├── _layout.tsx
│       ├── index.tsx      # Profile main
│       ├── edit.tsx       # Edit profile
│       ├── settings.tsx   # App settings
│       ├── change-password.tsx
│       └── change-pin.tsx
│
└── (modals)/              # 🔄 Modal screens
    ├── _layout.tsx        # Modal presentation
    ├── enter-pin.tsx      # PIN entry modal
    ├── pick-date.tsx      # Date picker modal
    └── pick-my-bill.tsx   # Bill selection modal
```

### 🧩 **Components Directory**
```
components/
├── layout/
│   └── Screen.tsx         # Base screen wrapper with SafeArea
└── ui/
    ├── Button.tsx         # Custom button component
    ├── Input.tsx          # Custom input component
    └── Card.tsx           # Card container component
```

### 🌐 **Services Directory**
```
services/
├── api.ts                 # API client & endpoints
└── storage.ts             # Local storage utilities
```

### 🗄️ **Store Directory**
```
store/
└── auth.store.ts          # Authentication state management
```

### 📋 **Constants Directory**
```
constants/
├── colors.ts              # App color palette
└── routes.ts              # Route constants
```

### 📝 **Types Directory**
```
types/
└── domain.d.ts            # Domain type definitions
```

## 🎨 **Design System**

### 🎨 **Colors**
- **Primary Orange**: `#FF8736` (Active tab, buttons)
- **Background**: `#FFFFFF`
- **Text**: `#222222`

### 📱 **Navigation**
- **Bottom Tabs**: 4 tabs dengan Ionicons
  - 🏠 **Beranda** (home icon)
  - 📊 **Monitoring** (bar-chart icon)
  - 📋 **Riwayat** (document-text icon)
  - 👤 **Profil** (person icon)

## 🚀 **Routing Patterns**

### 📍 **Route Groups**
- `(public)` - Routes tanpa autentikasi
- `(auth)` - Routes untuk login/register
- `(tabs)` - Main app dengan bottom navigation
- `(modals)` - Modal presentations

### 🔗 **Dynamic Routes**
- `[id].tsx` - Dynamic parameter routes
- Contoh: `/monitoring/group/123` → `group/[id].tsx`

### 🎯 **Layout Hierarchy**
```
Root Layout (_layout.tsx)
├── Public Layout
├── Auth Layout
├── Tabs Layout
│   ├── Home Layout
│   ├── Monitoring Layout
│   ├── Riwayat Layout
│   └── Profile Layout
└── Modals Layout
```

## 🛠️ **Development Guidelines**

### 📝 **File Naming**
- `_layout.tsx` - Layout files
- `index.tsx` - Default route in folder
- `[id].tsx` - Dynamic routes
- `+not-found.tsx` - Error pages

### 🎯 **Component Structure**
- Setiap screen menggunakan `Screen` wrapper
- UI components di `components/ui/`
- Layout components di `components/layout/`

### 🔄 **State Management**
- Global state di `store/`
- API calls di `services/`
- Types di `types/`

## 🚀 **Getting Started**

### 📦 **Installation**
```bash
npm install
```

### 🏃 **Run Development**
```bash
npm start
```

### 📱 **Navigation Flow**
1. **Splash** (5 detik) → **Auth/Login**
2. **Login** → **Tabs/Beranda**
3. **Register** → Multi-step flow → **Login**

## 👥 **Team Collaboration**

### 🎯 **Folder Ownership**
- **Frontend Team**: `app/`, `components/`
- **Backend Team**: `services/`, `types/`
- **UI/UX Team**: `constants/colors.ts`, `components/ui/`

### 📋 **Development Rules**
1. Setiap screen harus menggunakan `Screen` wrapper
2. Warna menggunakan constants dari `colors.ts`
3. API calls hanya melalui `services/api.ts`
4. State global di `store/`
5. Types harus didefinisikan di `types/`

### 🔄 **Git Workflow**
- `main` - Production ready
- `develop` - Development branch
- `feature/[nama-fitur]` - Feature branches
- `fix/[nama-bug]` - Bug fix branches

## ✅ **Ready for Collaboration**
Struktur ini sudah siap untuk:
- ✅ Multi-developer collaboration
- ✅ Clean architecture
- ✅ Scalable routing
- ✅ Type safety
- ✅ Consistent UI components