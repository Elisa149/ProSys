import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Button, Alert } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { propertyService, rentService, paymentService } from '../services/firebaseService';
import { userService } from '../services/firebaseService';

const DiagnosticPage = () => {
  const { user, userId, userRole, organizationId } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [rentRecords, setRentRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      console.log('🔍 DiagnosticPage - Loading data...');
      console.log('👤 Auth Context:', { userId, userRole, organizationId });
      
      try {
        // Get user profile from Firestore
        if (userId) {
          const profile = await userService.getProfile(userId);
          console.log('📋 User Profile from Firestore:', profile);
          setUserProfile(profile);
        }

        // Get properties
        const props = await propertyService.getAll(userId, userRole, organizationId);
        console.log('🏠 Properties:', props);
        setProperties(props);

        // Get rent records
        const rents = await rentService.getAll(userId, userRole, organizationId);
        console.log('💰 Rent Records:', rents);
        setRentRecords(rents);

        // Get payments
        const pays = await paymentService.getAll(userId, userRole, organizationId);
        console.log('💳 Payments:', pays);
        setPayments(pays);
      } catch (error) {
        console.error('❌ Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    }
  }, [user, userId, userRole, organizationId]);

  const handleRefreshAuth = async () => {
    try {
      // Force refresh the ID token
      await user.getIdToken(true);
      // Reload the page to re-fetch auth context
      window.location.reload();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    }
  };

  if (loading) {
    return <Typography>Loading diagnostic data...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Diagnostic Page
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This page shows your authentication context and data access. Check the browser console for detailed logs.
      </Alert>

      <Button 
        variant="contained" 
        onClick={handleRefreshAuth}
        sx={{ mb: 3 }}
      >
        Refresh Authentication & Reload
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔐 Firebase Auth Context
          </Typography>
          <Typography><strong>User ID:</strong> {userId || 'NOT LOADED'}</Typography>
          <Typography><strong>Email:</strong> {user?.email || 'NOT LOADED'}</Typography>
          <Typography><strong>Display Name:</strong> {user?.displayName || 'NOT LOADED'}</Typography>
          <Typography><strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 AuthContext State
          </Typography>
          <Typography><strong>User Role:</strong> {userRole || 'NOT LOADED'}</Typography>
          <Typography><strong>Organization ID:</strong> {organizationId || 'NOT LOADED'}</Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📄 Firestore User Profile
          </Typography>
          {userProfile ? (
            <>
              <Typography><strong>Role ID:</strong> {userProfile.roleId || 'NOT SET'}</Typography>
              <Typography><strong>Organization ID:</strong> {userProfile.organizationId || 'NOT SET'}</Typography>
              <Typography><strong>Status:</strong> {userProfile.status || 'NOT SET'}</Typography>
              <Typography><strong>Permissions:</strong> {userProfile.permissions?.length || 0} permissions</Typography>
              <Typography><strong>Email:</strong> {userProfile.email}</Typography>
            </>
          ) : (
            <Typography color="error">Profile not found in Firestore!</Typography>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Data Access Results
          </Typography>
          <Typography><strong>Properties:</strong> {properties.length} found</Typography>
          <Typography><strong>Rent Records:</strong> {rentRecords.length} found</Typography>
          <Typography><strong>Payments:</strong> {payments.length} found</Typography>
        </CardContent>
      </Card>

      {rentRecords.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💰 Sample Rent Records
            </Typography>
            {rentRecords.slice(0, 3).map((rent, index) => (
              <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography><strong>Tenant:</strong> {rent.tenantName}</Typography>
                <Typography><strong>Property:</strong> {rent.propertyName}</Typography>
                <Typography><strong>Monthly Rent:</strong> UGX {rent.monthlyRent?.toLocaleString()}</Typography>
                <Typography><strong>Status:</strong> {rent.status}</Typography>
                <Typography><strong>Organization ID:</strong> {rent.organizationId}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔧 Troubleshooting Steps
          </Typography>
          <Typography component="div">
            <ol>
              <li>Click "Refresh Authentication & Reload" button above</li>
              <li>If still no data, check that your Firestore profile has:<br />
                  - roleId: 'property_manager', 'org_admin', or 'super_admin'<br />
                  - organizationId: 'SVRDIbZ3ir7TmWfWWyXh'<br />
                  - status: 'active'
              </li>
              <li>Check browser console for detailed logs</li>
              <li>Try logging out and logging back in</li>
            </ol>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DiagnosticPage;
