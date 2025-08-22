# API Architecture - Axios + Zustand

## Overview
Restructured the entire API architecture to use **axios** for all HTTP requests and **Zustand** for state management, eliminating fetch-based calls and inconsistencies.

## Structure

### 📁 services/
All API calls use axios with consistent patterns:
- `api.ts` - Base axios instance with interceptors
- `auth.api.ts` - Authentication endpoints  
- `friends.api.ts` - Friends management
- `groups.api.ts` - Groups management
- `notifications.api.ts` - Notifications
- `profile.api.ts` - User profile
- `index.ts` - Centralized exports

### 📁 store/
Zustand stores for state management:
- `auth.store.ts` - Authentication state
- `friends.store.ts` - Friends state
- `groups.store.ts` - Groups state  
- `notifications.store.ts` - Notifications state
- `profile.store.ts` - Profile state
- `index.ts` - Centralized exports

### 📁 hooks/
Debounced hooks that use stores:
- `useApi.ts` - Debounced hooks (useFriends, useGroups, etc.)
- Uses `DEBOUNCE_DELAY.API_CALLS` (5 seconds) to prevent spam

### 📁 constants/
- `config.ts` - All API endpoints and configuration

## Key Features

### ✅ Consistent Axios Usage
- All API calls use the same axios instance
- Automatic token injection via interceptors
- Consistent error handling
- Proper logging for debugging

### ✅ Zustand State Management  
- Centralized state for each domain
- Automatic loading states
- Error handling
- Optimistic updates where appropriate

### ✅ Debouncing
- 5-second cooldown between API calls
- Prevents continuous API spam
- Configurable via `DEBOUNCE_DELAY` constants

### ✅ Clean Imports
```typescript
// Before
import { useGroupsStore } from '../store/groups.store';
import { friendsAPI } from '../services/friends.api';

// After  
import { useGroupsStore } from '../store';
import { friendsAPI } from '../services';
```

### ✅ Type Safety
- Proper TypeScript interfaces
- Consistent response types
- Error type definitions

## Usage Examples

### Using Stores Directly
```typescript
import { useGroupsStore } from '../store';

const { groups, isLoading, fetchGroups, createGroup } = useGroupsStore();
```

### Using Debounced Hooks
```typescript
import { useGroups } from '../hooks/useApi';

const { groups, loading, refetch } = useGroups(); // Auto-debounced
```

### API Services
```typescript
import { groupsAPI } from '../services';

const response = await groupsAPI.createGroup(data);
```

## Migration Benefits

1. **Eliminated Duplication** - No more axios + fetch mixing
2. **Consistent Error Handling** - All errors handled the same way
3. **Better Performance** - Debouncing prevents API spam
4. **Cleaner Code** - Centralized imports and consistent patterns
5. **Type Safety** - Proper TypeScript throughout
6. **Easier Maintenance** - Single source of truth for each domain

## Configuration

All endpoints are centralized in `constants/config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: "https://9180e66ae20a.ngrok-free.app",
  ENDPOINTS: {
    FRIENDS: "/api/mobile/friends",
    GROUPS: "/api/mobile/groups",
    // ... etc
  }
};
```

Debounce settings:
```typescript
export const DEBOUNCE_DELAY = {
  API_CALLS: 5000, // 5 seconds between API calls
  USER_INPUT: 300, // 300ms for user input
};
```