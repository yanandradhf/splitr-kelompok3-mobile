# 📁 Folder Structure

## 🏗️ Architecture Overview
```
splitr-mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication screens
│   ├── (modals)/          # Modal screens (Profile, Groups, etc)
│   ├── (public)/          # Public screens (Onboarding, Splash)
│   └── (tabs)/            # Tab navigation screens
├── components/            # Reusable UI components
│   ├── ui/               # Core UI components
│   ├── layout/           # Layout components
│   └── unused/           # Deprecated components
├── features/             # Feature-based modules
│   ├── auth/            # Authentication logic
│   ├── profile/         # Profile management
│   ├── groups/          # Groups functionality
│   ├── friends/         # Friends management
│   └── notifications/   # Notifications system
├── constants/           # App constants & config
├── hooks/              # Custom React hooks
├── services/           # Core API services
├── store/             # Global state management
├── types/             # TypeScript definitions
└── utils/             # Utility functions
```

## 🎯 Key Principles
- **Feature-based organization** for better scalability
- **Separation of concerns** between UI and business logic
- **Consistent naming conventions** across all files
- **Modular architecture** for easy maintenance

## 📱 Navigation Structure
- **Tabs**: Home (main screen)
- **Modals**: Profile, Groups, Notifications, Add-Friend
- **Auth**: Login, Register, Forgot Password
- **Public**: Onboarding, Splash, Terms

## 🔧 Import Patterns
```typescript
// Features (recommended)
import { useAuthStore } from '@/features/auth';
import { useProfileStore } from '@/features/profile';

// Components
import { Button, Input } from '@/components/ui';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Constants & Utils
import { COLORS, FONTS } from '@/constants/theme';
import { validateEmail } from '@/utils/validation';
```