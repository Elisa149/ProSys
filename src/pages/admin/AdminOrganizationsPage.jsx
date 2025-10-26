import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Card,
  CardContent,
  Button,
} from '@mui/material';
import {
  SupervisorAccount,
  People,
  AdminPanelSettings,
  ManageAccounts,
  Assessment,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const AdminOrganizationsPage = () => {
  const { userRole } = useAuth();

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <SupervisorAccount color="primary" />
        <Typography variant="h4" component="h1">
          All Organizations
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This page is under development. It will allow super administrators to manage all organizations in the system.
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Planned Features:
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>View all organizations</li>
            <li>Create new organizations</li>
            <li>Edit organization settings</li>
            <li>Manage organization users</li>
            <li>Organization analytics</li>
          </Box>
          
          <Box mt={3}>
            <Button variant="contained" disabled>
              Coming Soon
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminOrganizationsPage;
