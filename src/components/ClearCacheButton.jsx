import React from 'react';
import { Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const ClearCacheButton = ({ variant = 'outlined', size = 'medium', children }) => {
  const { user, logout } = useAuth();

  const handleClearCache = async () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Force refresh the ID token
      if (user) {
        await user.getIdToken(true);
      }
      
      toast.success('Cache cleared! Reloading...');
      
      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Failed to clear cache:', error);
      toast.error('Failed to clear cache. Try logging out and back in.');
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      startIcon={<Refresh />}
      onClick={handleClearCache}
      color="primary"
    >
      {children || 'Clear Cache & Refresh'}
    </Button>
  );
};

export default ClearCacheButton;



