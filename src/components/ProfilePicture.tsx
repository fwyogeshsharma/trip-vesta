import React, { useState, useEffect } from 'react';
import { getImageBytesFromFileId } from '@/services/tripService';
import { User } from 'lucide-react';

interface ProfilePictureProps {
  profilePic?: {
    _id: string;
    file?: {
      file?: string;
    };
  } | string | null;
  userName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  refreshKey?: string | number; // Add this to force refresh when needed
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  profilePic,
  userName = 'User',
  className = '',
  size = 'md',
  refreshKey
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  useEffect(() => {
    if (!profilePic) {
      setImageUrl(null);
      return;
    }

    const loadProfilePicture = async () => {
      setLoading(true);
      setError(false);

      try {
        let fileId: string | null = null;

        // Handle different API response structures
        if (typeof profilePic === 'string') {
          // Old format: profile_pic is just a string ID
          fileId = profilePic;
        } else if (typeof profilePic === 'object' && profilePic._id) {
          // New format: profile_pic is an object with _id
          fileId = profilePic._id;
        }

        if (fileId) {
          console.log('Loading profile picture for fileId:', fileId);
          const imageData = await getImageBytesFromFileId(fileId);
          if (imageData) {
            console.log('Profile picture loaded successfully');
            setImageUrl(imageData);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error loading profile picture:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadProfilePicture();
  }, [profilePic, refreshKey]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className} animate-pulse bg-gray-200 rounded-full flex items-center justify-center`}>
        <User className={`${iconSizeClasses[size]} text-gray-400`} />
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center`}>
        <User className={`${iconSizeClasses[size]} text-gray-500`} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`${userName} profile picture`}
      className={`${sizeClasses[size]} ${className} object-cover rounded-full border border-gray-200`}
      onError={() => setError(true)}
    />
  );
};

export default ProfilePicture;