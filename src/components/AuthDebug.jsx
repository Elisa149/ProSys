import React from 'react';
import { Box, Paper, Typography, Chip, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Debug component to display authentication state
 * Remove this in production!
 */
const AuthDebug = () => {
  const { user, userRole, organizationId, userPermissions } = useAuth();

  return (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 2, 
        mb: 3, 
        backgroundColor: '#f5f5f5',
        border: '2px solid #ff9800'
      }}
    >
      <Typography variant="h6" gutterBottom color="warning.main">
        🔍 Auth Debug Info (Remove in production!)
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box>
          <Typography variant="body2" component="span" fontWeight="bold">
            User ID: 
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
            {user?.uid || 'Not authenticated'}
          </Typography>
          {user?.uid ? (
            <Chip label="✓ Logged In" color="success" size="small" sx={{ ml: 1 }} />
          ) : (
            <Chip label="✗ Not Logged In" color="error" size="small" sx={{ ml: 1 }} />
          )}
        </Box>

        <Box>
          <Typography variant="body2" component="span" fontWeight="bold">
            Email: 
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
            {user?.email || 'N/A'}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" component="span" fontWeight="bold">
            Role: 
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
            {userRole || 'No role assigned'}
          </Typography>
          {userRole ? (
            <Chip label="✓ Has Role" color="success" size="small" sx={{ ml: 1 }} />
          ) : (
            <Chip label="✗ No Role" color="error" size="small" sx={{ ml: 1 }} />
          )}
        </Box>

        <Box>
          <Typography variant="body2" component="span" fontWeight="bold">
            Organization ID: 
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
            {organizationId || 'Not assigned'}
          </Typography>
          {organizationId ? (
            <Chip label="✓ Has Org" color="success" size="small" sx={{ ml: 1 }} />
          ) : (
            <Chip label="✗ No Org" color="error" size="small" sx={{ ml: 1 }} />
          )}
        </Box>

        <Box>
          <Typography variant="body2" component="span" fontWeight="bold">
            Permissions: 
          </Typography>
          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
            {userPermissions?.length > 0 ? `${userPermissions.length} permissions` : 'No permissions'}
          </Typography>
        </Box>

        {(!user || !userRole || !organizationId) && (
          <Alert severity="error" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Action Required:</strong> You need to be logged in with an assigned role and organization to see properties.
            </Typography>
          </Alert>
        )}

        {user && userRole && organizationId && (
          <Alert severity="success" sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>All Good!</strong> Your authentication is properly configured. If you don't see properties, check the browser console for query logs.
            </Typography>
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default AuthDebug;

