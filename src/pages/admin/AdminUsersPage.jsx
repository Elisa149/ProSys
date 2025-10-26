import React, { useState, useMemo } from 'react';
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
  InputAdornment,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  People,
  Search,
  FilterList,
  Edit,
  Block,
  CheckCircle,
  Cancel,
  Refresh,
  AdminPanelSettings,
  Business,
  Assignment,
  Visibility,
  Download,
  Upload,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/firebaseService';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import ResponsiveHeader from '../../components/common/ResponsiveHeader';
import toast from 'react-hot-toast';

// Role definitions
const ROLE_DEFINITIONS = {
  super_admin: {
    displayName: 'Super Administrator',
    color: 'error',
    icon: <AdminPanelSettings />,
  },
  org_admin: {
    displayName: 'Organization Administrator',
    color: 'warning',
    icon: <Business />,
  },
  property_manager: {
    displayName: 'Property Manager',
    color: 'info',
    icon: <Assignment />,
  },
  financial_viewer: {
    displayName: 'Financial Viewer',
    color: 'success',
    icon: <Visibility />,
  },
};

const AdminUsersPage = () => {
  const { userRole } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch all users
  const { data: allUsers, isLoading, error, refetch } = useQuery(
    'allUsers',
    () => userService.getAllUsers(),
    {
      enabled: userRole === 'super_admin',
      onError: (err) => toast.error(`Failed to fetch users: ${err.message}`),
    }
  );

  // Filter users based on search and filters
  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    
    return allUsers.filter(user => {
      const matchesSearch = user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      const matchesRole = roleFilter === 'all' || user.roleId === roleFilter;
      
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [allUsers, searchTerm, statusFilter, roleFilter]);

  // Group users by status
  const pendingUsers = filteredUsers.filter(u => u.status === 'pending');
  const activeUsers = filteredUsers.filter(u => u.status === 'active');
  const rejectedUsers = filteredUsers.filter(u => u.status === 'rejected');

  // Mutation for updating user status
  const updateUserStatusMutation = useMutation(
    ({ userId, status, roleId, organizationId }) => 
      userService.updateUserStatus(userId, status, roleId, organizationId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('allUsers');
        setOpenEditDialog(false);
        setSelectedUser(null);
        toast.success('User updated successfully');
      },
      onError: (err) => toast.error(`Failed to update user: ${err.message}`),
    }
  );

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedUser(null);
  };

  const handleUpdateUser = async (formData) => {
    if (!selectedUser) return;
    
    await updateUserStatusMutation.mutateAsync({
      userId: selectedUser.id,
      status: formData.status,
      roleId: formData.roleId,
      organizationId: formData.organizationId,
    });
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderUserTable = (users, title) => (
    <ResponsiveTable stickyHeader maxHeight={600}>
      <TableHead>
        <TableRow>
          <TableCell>User</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Role</TableCell>
          <TableCell>Organization</TableCell>
          <TableCell>Joined</TableCell>
          <TableCell>Last Login</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} align="center">
              <Typography variant="body2" color="textSecondary" sx={{ py: 2 }}>
                No users found.
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar>{user.displayName ? user.displayName[0] : user.email[0]}</Avatar>
                  <Typography variant="body2">{user.displayName || 'N/A'}</Typography>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip
                  label={user.status}
                  color={
                    user.status === 'active'
                      ? 'success'
                      : user.status === 'pending'
                      ? 'warning'
                      : 'error'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={ROLE_DEFINITIONS[user.roleId]?.displayName || 'N/A'}
                  color={ROLE_DEFINITIONS[user.roleId]?.color || 'default'}
                  size="small"
                  variant="outlined"
                  icon={ROLE_DEFINITIONS[user.roleId]?.icon}
                />
              </TableCell>
              <TableCell>{user.organizationId || 'N/A'}</TableCell>
              <TableCell>
                {user.createdAt ? format(user.createdAt, 'MMM dd, yyyy') : 'N/A'}
              </TableCell>
              <TableCell>
                {user.lastLoginAt ? format(user.lastLoginAt, 'MMM dd, yyyy') : 'Never'}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Edit User">
                  <IconButton color="primary" onClick={() => handleEditUser(user)}>
                    <Edit />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </ResponsiveTable>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  if (userRole !== 'super_admin') {
    return (
      <Alert severity="error">
        You do not have permission to view this page. Only super administrators can manage all users.
      </Alert>
    );
  }

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="All Users"
        subtitle="Manage all users across the system. View user details, update roles, and monitor activity."
        icon={<People color="primary" />}
        actions={[
          <Button
            key="export"
            variant="outlined"
            startIcon={<Download />}
            onClick={() => toast.info('Export functionality coming soon')}
          >
            Export
          </Button>,
          <Button
            key="refresh"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => refetch()}
          >
            Refresh
          </Button>,
        ]}
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role"
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="super_admin">Super Admin</MenuItem>
                  <MenuItem value="org_admin">Org Admin</MenuItem>
                  <MenuItem value="property_manager">Property Manager</MenuItem>
                  <MenuItem value="financial_viewer">Financial Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                {filteredUsers.length} users found
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="user status tabs" sx={{ mb: 3 }}>
        <Tab label={`All Users (${filteredUsers.length})`} />
        <Tab label={`Pending (${pendingUsers.length})`} />
        <Tab label={`Active (${activeUsers.length})`} />
        <Tab label={`Rejected (${rejectedUsers.length})`} />
      </Tabs>

      {/* User Tables */}
      {selectedTab === 0 && renderUserTable(filteredUsers, 'All Users')}
      {selectedTab === 1 && renderUserTable(pendingUsers, 'Pending Users')}
      {selectedTab === 2 && renderUserTable(activeUsers, 'Active Users')}
      {selectedTab === 3 && renderUserTable(rejectedUsers, 'Rejected Users')}

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <EditUserForm
              user={selectedUser}
              onSubmit={handleUpdateUser}
              onCancel={handleCloseEditDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </ResponsiveContainer>
  );
};

// Edit User Form Component
const EditUserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    status: user.status || 'pending',
    roleId: user.roleId || '',
    organizationId: user.organizationId || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          User: {user.displayName || user.email}
        </Typography>
        
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            label="Status"
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={formData.roleId}
            label="Role"
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
          >
            {Object.entries(ROLE_DEFINITIONS).map(([roleId, roleDef]) => (
              <MenuItem key={roleId} value={roleId}>
                {roleDef.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Organization ID"
          value={formData.organizationId}
          onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
          helperText="Enter organization ID if applicable"
        />

        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            Update User
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default AdminUsersPage;
