import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person,
  Email,
  Schedule,
  Refresh,
  AdminPanelSettings,
  People,
  Phone,
  CalendarToday,
  Edit,
  Block,
  ExpandMore,
  Security,
  Assignment,
  Business,
  Visibility,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/firebaseService';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import LoadingSpinner from '../components/common/LoadingSpinner';
import confirmAction from '../utils/confirmAction';

const UserRoleAssignmentPage = () => {
  const { user, hasPermission, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(0);
  const [assignDialog, setAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('');
  const [expandedRole, setExpandedRole] = useState(false);

  // Role definitions with descriptions
  const ROLE_DEFINITIONS = {
    super_admin: {
      name: 'Super Administrator',
      description: 'Full system access with all permissions',
      color: 'error',
      icon: <AdminPanelSettings />,
      permissions: [
        'System administration and configuration',
        'Manage all organizations and users',
        'Full access to all properties and data',
        'Create and manage roles',
        'System-wide reports and analytics'
      ]
    },
    org_admin: {
      name: 'Organization Administrator',
      description: 'Full access within assigned organization',
      color: 'warning',
      icon: <Business />,
      permissions: [
        'Manage users within organization',
        'Full access to organization properties',
        'Manage tenants and payments',
        'Organization settings and configuration',
        'Organization reports and analytics'
      ]
    },
    property_manager: {
      name: 'Property Manager',
      description: 'Manage assigned properties and tenants',
      color: 'info',
      icon: <Assignment />,
      permissions: [
        'Manage assigned properties only',
        'Handle tenant relationships',
        'Process rent payments',
        'Generate property reports',
        'Limited to assigned properties'
      ]
    },
    financial_viewer: {
      name: 'Financial Viewer',
      description: 'Read-only access to financial data',
      color: 'success',
      icon: <Visibility />,
      permissions: [
        'View financial reports (read-only)',
        'Access payment history',
        'View property financial data',
        'Generate financial analytics',
        'No write permissions'
      ]
    }
  };

  // Fetch all users
  const {
    data: allUsers = [],
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useQuery('all-users', userService.getAllUsers, {
    enabled: isAdmin(),
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch pending users
  const {
    data: pendingUsers = [],
    isLoading: pendingLoading,
  } = useQuery('pending-users', () => userService.getUsersByStatus('pending'), {
    enabled: isAdmin(),
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch active users
  const {
    data: activeUsers = [],
    isLoading: activeLoading,
  } = useQuery('active-users', () => userService.getUsersByStatus('active'), {
    enabled: isAdmin(),
    retry: 3,
    retryDelay: 1000,
  });

  // Approve user mutation
  const approveUserMutation = useMutation(
    ({ userId, roleId, organizationId }) =>
      userService.updateUserStatus(userId, 'active', roleId, organizationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-users');
        queryClient.invalidateQueries('pending-users');
        queryClient.invalidateQueries('active-users');
        setAssignDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
        setSelectedOrg('');
      },
    }
  );

  // Reject user mutation
  const rejectUserMutation = useMutation(
    (userId) => userService.updateUserStatus(userId, 'rejected'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-users');
        queryClient.invalidateQueries('pending-users');
        queryClient.invalidateQueries('active-users');
      },
    }
  );

  // Update user role mutation
  const updateRoleMutation = useMutation(
    ({ userId, roleId }) => userService.updateUserRole(userId, roleId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('all-users');
        queryClient.invalidateQueries('active-users');
        setAssignDialog(false);
        setSelectedUser(null);
        setSelectedRole('');
      },
    }
  );

  const handleAssignRole = (user) => {
    setSelectedUser(user);
    setSelectedRole(user.roleId || '');
    setSelectedOrg(user.organizationId || '');
    setAssignDialog(true);
  };

  const handleApproveUser = () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    const userLabel = selectedUser?.displayName || selectedUser?.email || 'this user';
    if (!confirmAction(`Approve ${userLabel} with the selected role?`)) {
      return;
    }
    
    approveUserMutation.mutate({
      userId: selectedUser.id,
      roleId: selectedRole,
      organizationId: selectedOrg || 'system',
    });
  };

  const handleRejectUser = (userId) => {
    if (!confirmAction('Reject this user access request?')) {
      return;
    }

    rejectUserMutation.mutate(userId);
  };

  const handleUpdateRole = () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    const userLabel = selectedUser?.displayName || selectedUser?.email || 'this user';
    if (!confirmAction(`Update role for ${userLabel}?`)) {
      return;
    }
    
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      roleId: selectedRole,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'rejected': return <Cancel />;
      default: return <Person />;
    }
  };

  if (!isAdmin()) {
    return (
      <Box p={3}>
        <Alert severity="error">
          You don't have permission to access this page. Only administrators can assign user roles.
        </Alert>
      </Box>
    );
  }

  const tabs = [
    { label: 'Pending Users', count: pendingUsers.length },
    { label: 'Active Users', count: activeUsers.length },
    { label: 'All Users', count: allUsers.length },
  ];

  const getCurrentUsers = () => {
    switch (selectedTab) {
      case 0: return pendingUsers;
      case 1: return activeUsers;
      case 2: return allUsers;
      default: return [];
    }
  };

  const currentUsers = getCurrentUsers();
  const isLoading = usersLoading || pendingLoading || activeLoading;

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          User Role Assignment
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => {
            refetchUsers();
            queryClient.invalidateQueries('pending-users');
            queryClient.invalidateQueries('active-users');
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Role Definitions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Roles
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(ROLE_DEFINITIONS).map(([roleId, role]) => (
              <Grid item xs={12} md={6} key={roleId}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {role.icon}
                      <Typography variant="subtitle1" fontWeight="bold">
                        {role.name}
                      </Typography>
                      <Chip 
                        label={roleId} 
                        size="small" 
                        color={role.color}
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {role.description}
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Permissions:
                    </Typography>
                    <List dense>
                      {role.permissions.map((permission, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Security fontSize="small" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={permission}
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="fullWidth"
        >
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              label={`${tab.label} (${tab.count})`}
              icon={<People />}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Current Role</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <LoadingSpinner />
                </TableCell>
              </TableRow>
            ) : currentUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {user.displayName || 'No Name'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {user.id.substring(0, 8)}...
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email fontSize="small" />
                      {user.email}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(user.status)}
                      label={user.status}
                      color={getStatusColor(user.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {user.roleId ? (
                      <Chip
                        label={ROLE_DEFINITIONS[user.roleId]?.name || user.roleId}
                        color={ROLE_DEFINITIONS[user.roleId]?.color || 'default'}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No role assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.organizationId || 'Not assigned'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CalendarToday fontSize="small" />
                      {user.createdAt ? format(user.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title="Assign/Update Role">
                        <IconButton
                          size="small"
                          onClick={() => handleAssignRole(user)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      {user.status === 'pending' && (
                        <Tooltip title="Reject User">
                          <IconButton
                            size="small"
                            onClick={() => handleRejectUser(user.id)}
                            color="error"
                          >
                            <Block />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Role Assignment Dialog */}
      <Dialog
        open={assignDialog}
        onClose={() => setAssignDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedUser?.status === 'pending' ? 'Approve User' : 'Update User Role'}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box>
              <Box mb={2}>
                <Typography variant="h6" gutterBottom>
                  User Information
                </Typography>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar sx={{ width: 48, height: 48 }}>
                    {selectedUser.displayName?.charAt(0) || selectedUser.email?.charAt(0) || 'U'}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {selectedUser.displayName || 'No Name'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                    <Chip
                      icon={getStatusIcon(selectedUser.status)}
                      label={selectedUser.status}
                      color={getStatusColor(selectedUser.status)}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <FormControl fullWidth margin="normal">
                <InputLabel>Role</InputLabel>
                <Select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  label="Role"
                >
                  {Object.entries(ROLE_DEFINITIONS).map(([roleId, role]) => (
                    <MenuItem key={roleId} value={roleId}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {role.icon}
                        <Box>
                          <Typography variant="body1">{role.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedUser.status === 'pending' && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Organization</InputLabel>
                  <Select
                    value={selectedOrg}
                    onChange={(e) => setSelectedOrg(e.target.value)}
                    label="Organization"
                  >
                    <MenuItem value="system">System (Default)</MenuItem>
                    <MenuItem value="org1">Organization 1</MenuItem>
                    <MenuItem value="org2">Organization 2</MenuItem>
                  </Select>
                </FormControl>
              )}

              {selectedRole && ROLE_DEFINITIONS[selectedRole] && (
                <Box mt={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Role Permissions:
                  </Typography>
                  <List dense>
                    {ROLE_DEFINITIONS[selectedRole].permissions.map((permission, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Security fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={permission}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={selectedUser?.status === 'pending' ? handleApproveUser : handleUpdateRole}
            variant="contained"
            disabled={!selectedRole || approveUserMutation.isLoading || updateRoleMutation.isLoading}
          >
            {selectedUser?.status === 'pending' ? 'Approve User' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRoleAssignmentPage;

