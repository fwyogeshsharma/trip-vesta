import React, { useState, useEffect } from 'react';
import { getImageBytesFromFileId } from '@/services/tripService';
import { Building } from 'lucide-react';

interface CompanyLogoProps {
  fileId?: string | null;
  companyName?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({
  fileId,
  companyName = 'Company',
  className = '',
  size = 'md'
}) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  useEffect(() => {
    if (!fileId) {
      setLogoUrl(null);
      return;
    }

    const loadLogo = async () => {
      setLoading(true);
      setError(false);

      try {
        const imageData = await getImageBytesFromFileId(fileId);
        setLogoUrl(imageData);
      } catch (err) {
        console.error('Error loading company logo:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadLogo();
  }, [fileId]);

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} ${className} animate-pulse bg-gray-200 rounded flex items-center justify-center`}>
        <Building className="w-3 h-3 text-gray-400" />
      </div>
    );
  }

  if (error || !logoUrl) {
    return (
      <div className={`${sizeClasses[size]} ${className} bg-gray-100 border border-gray-200 rounded flex items-center justify-center`}>
        <Building className="w-3 h-3 text-gray-500" />
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`${companyName} logo`}
      className={`${sizeClasses[size]} ${className} object-contain rounded border border-gray-200`}
      onError={() => setError(true)}
    />
  );
};

export default CompanyLogo;