// Centralized API service exports for clean imports
export { authAPI } from './api';

// Feature-based API exports
export { friendsAPI } from '../features/friends/friends.api';
export { groupsAPI } from '../features/groups/groups.api';
export { notificationsAPI } from '../features/notifications/notifications.api';
export { profileAPI } from '../features/profile/profile.api';
export { registerAPI } from '../features/auth/register.api';
export { default as api } from './api';