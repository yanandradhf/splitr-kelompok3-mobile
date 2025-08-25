import React, { useState, useMemo } from 'react';
import { Image, ImageStyle } from 'react-native';
import { getImageUrl, getFallbackAvatar } from '../../utils/imageHelper';

interface UserAvatarProps {
  photoUrl?: string;
  name: string;
  size?: number;
  style?: ImageStyle;
}

const UserAvatar = React.memo(function UserAvatar({ photoUrl, name, size = 50, style }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const { processedPhotoUrl, fallbackAvatar } = useMemo(() => {
    const processed = getImageUrl(photoUrl);
    const fallback = getFallbackAvatar(name, size);
    
    if (__DEV__) {
      console.log('UserAvatar Debug:', {
        originalUrl: photoUrl,
        processedUrl: processed,
        fallbackUrl: fallback,
        name
      });
    }
    
    return { processedPhotoUrl: processed, fallbackAvatar: fallback };
  }, [photoUrl, name, size]);
  
  // Reset error state when photoUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [processedPhotoUrl]);
  
  return (
    <Image 
      source={{ uri: (processedPhotoUrl && !imageError) ? processedPhotoUrl : fallbackAvatar }}
      style={[
        { 
          width: size, 
          height: size, 
          borderRadius: size/2,
          backgroundColor: '#f0f0f0'
        },
        style
      ]}
      onError={() => setImageError(true)}
    />
  );
});

export default UserAvatar;