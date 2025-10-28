import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import { propertyService, paymentService, rentService, userService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

const QuickDataCheck = () => {
  const { userId, userRole, organizationId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const checkData = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      console.log('🔍 Checking data with:', { userId, userRole, organizationId });

      // Fetch all data
      const [properties, payments, rent, userProfile] = await Promise.all([
        propertyService.getAll(userId, userRole, organizationId),
        paymentService.getAll(userId, userRole, organizationId),
        rentService.getAll(userId, userRole, organizationId),
        userId ? userService.getProfile(userId) : Promise.resolve(null),
      ]);

      const summary = {
        properties: properties || [],
        payments: payments || [],
        rent: rent || [],
        userProfile,
        counts: {
          properties: properties?.length || 0,
          payments: payments?.length || 0,
          rent: rent?.length || 0,
        },
      };

      console.log('📊 Data Check Results:', summary);
      setResults(summary);
    } catch (err) {
      console.error('❌ Error checking data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔍 Quick Data Check
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This page checks what data exists in your Firestore database for your account.
        <br />
        Click the button below to fetch and display your data.
      </Alert>

      <Button
        variant="contained"
        onClick={checkData}
        disabled={loading}
        size="large"
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Check Database Data'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error}
        </Alert>
      )}

      {results && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Summary
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Properties" secondary={results.counts.properties} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Payments" secondary={results.counts.payments} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Rent Records" secondary={results.counts.rent} />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {results.properties.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🏠 Properties ({results.properties.length})
                </Typography>
                {results.properties.slice(0, 3).map((prop) => (
                  <Box key={prop.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography><strong>Name:</strong> {prop.name}</Typography>
                    <Typography><strong>Type:</strong> {prop.type}</Typography>
                    <Typography><strong>Location:</strong> {prop.location?.district}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {results.payments.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💳 Payments ({results.payments.length})
                </Typography>
                {results.payments.slice(0, 3).map((payment) => (
                  <Box key={payment.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography><strong>Amount:</strong> UGX {payment.amount?.toLocaleString()}</Typography>
                    <Typography><strong>Tenant:</strong> {payment.tenantName}</Typography>
                    <Typography><strong>Date:</strong> {payment.createdAt?.toLocaleDateString()}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {results.rent.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  💰 Rent Records ({results.rent.length})
                </Typography>
                {results.rent.slice(0, 3).map((rent) => (
                  <Box key={rent.id} sx={{ mb: 2, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography><strong>Tenant:</strong> {rent.tenantName}</Typography>
                    <Typography><strong>Monthly Rent:</strong> UGX {rent.monthlyRent?.toLocaleString()}</Typography>
                    <Typography><strong>Status:</strong> {rent.status}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {results.counts.properties === 0 && results.counts.payments === 0 && results.counts.rent === 0 && (
            <Alert severity="warning">
              ⚠️ No data found in your database. You need to add data first:
              <br />
              1. Go to Properties → Create Property
              <br />
              2. Add spaces to your property
              <br />
              3. Create rent agreements
              <br />
              4. Record payments
            </Alert>
          )}
        </Box>
      )}

      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔧 Auth Context
          </Typography>
          <Typography><strong>User ID:</strong> {userId || 'Not loaded'}</Typography>
          <Typography><strong>User Role:</strong> {userRole || 'Not loaded'}</Typography>
          <Typography><strong>Organization ID:</strong> {organizationId || 'Not loaded'}</Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default QuickDataCheck;


