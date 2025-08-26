import React, { useState, useMemo } from 'react';
import { Image, ImageStyle } from 'react-native';
import { getFallbackAvatar } from '../../utils/imageHelper';

interface UserAvatarProps {
  photoUrl?: string;
  name: string;
  size?: number;
  style?: ImageStyle;
}

const UserAvatar = React.memo(function UserAvatar({ photoUrl, name, size = 50, style }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const fallbackAvatar = useMemo(() => {
    return getFallbackAvatar(name, size);
  }, [name, size]);
  
  // Reset error state when photoUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [photoUrl]);
  
  return (
    <Image 
      source={{ uri: (photoUrl && !imageError) ? photoUrl : fallbackAvatar }}
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