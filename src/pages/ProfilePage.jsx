import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Avatar,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  Business,
  Security,
  Notifications,
  Palette,
  Edit,
  PhotoCamera,
  Lock,
  Save,
  Cancel,
  Verified,
  Warning,
} from '@mui/icons-material';
import { updateProfile, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import toast from 'react-hot-toast';

import { useAuth } from '../contexts/AuthContext';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { auth } from '../config/firebase';

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 24 }}>
    {value === index && children}
  </div>
);

const ProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, userRole, organizationId, userData } = useAuth();
  
  const [currentTab, setCurrentTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || userData?.phoneNumber || '',
    photoURL: user?.photoURL || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    monthlyReports: true,
    theme: 'light',
    language: 'en',
  });

  // Update profile mutation
  const updateProfileMutation = useMutation(
    async (data) => {
      if (!user) throw new Error('No user logged in');
      
      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: data.displayName,
        photoURL: data.photoURL,
      });

      // If email changed, update it (requires recent auth)
      if (data.email !== user.email) {
        await updateEmail(user, data.email);
      }

      return data;
    },
    {
      onSuccess: () => {
        toast.success('Profile updated successfully!');
        setEditMode(false);
        queryClient.invalidateQueries('userData');
      },
      onError: (error) => {
        if (error.code === 'auth/requires-recent-login') {
          toast.error('Please log out and log back in to change your email');
        } else {
          toast.error(`Failed to update profile: ${error.message}`);
        }
      },
    }
  );

  // Change password mutation
  const changePasswordMutation = useMutation(
    async ({ currentPassword, newPassword }) => {
      if (!user || !user.email) throw new Error('No user logged in');
      
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
    },
    {
      onSuccess: () => {
        toast.success('Password changed successfully!');
        setChangePasswordOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      },
      onError: (error) => {
        if (error.code === 'auth/wrong-password') {
          toast.error('Current password is incorrect');
        } else {
          toast.error(`Failed to change password: ${error.message}`);
        }
      },
    }
  );

  if (!user) {
    return (
      <ResponsiveContainer>
        <Alert severity="warning">Please log in to view your profile</Alert>
      </ResponsiveContainer>
    );
  }

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handleCancelEdit = () => {
    setProfileData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || userData?.phoneNumber || '',
      photoURL: user?.photoURL || '',
    });
    setEditMode(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      super_admin: 'error',
      org_admin: 'primary',
      property_manager: 'success',
      tenant: 'info',
    };
    return colors[role] || 'default';
  };

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="Profile & Settings"
        subtitle="Manage your account settings and preferences"
        icon={<Person color="primary" />}
      />

      {/* Profile Header Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={profileData.photoURL}
                sx={{
                  width: 100,
                  height: 100,
                  fontSize: '2rem',
                  bgcolor: 'primary.main',
                }}
              >
                {getInitials(profileData.displayName)}
              </Avatar>
              {editMode && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                  size="small"
                >
                  <PhotoCamera fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h5" fontWeight="bold">
                  {user.displayName || 'User'}
                </Typography>
                {user.emailVerified && (
                  <Verified color="primary" fontSize="small" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.email}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Chip
                  label={userRole?.replace('_', ' ').toUpperCase() || 'USER'}
                  color={getRoleBadgeColor(userRole)}
                  size="small"
                />
                {organizationId && (
                  <Chip
                    label="Organization Member"
                    variant="outlined"
                    size="small"
                    icon={<Business />}
                  />
                )}
              </Box>
            </Box>

            {!editMode ? (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isLoading}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Cancel />}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab icon={<Person />} label="Personal Info" />
          <Tab icon={<Security />} label="Security" />
          <Tab icon={<Notifications />} label="Notifications" />
          <Tab icon={<Palette />} label="Preferences" />
        </Tabs>
      </Paper>

      {/* Personal Information Tab */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person /> Personal Details
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                  helperText={!user.emailVerified && "Email not verified"}
                />
                
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  disabled={!editMode}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Phone sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Business /> Organization
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Organization ID"
                      secondary={organizationId || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={userRole?.replace('_', ' ').toUpperCase() || 'Not assigned'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Verified />
                    </ListItemIcon>
                    <ListItemText
                      primary="Account Status"
                      secondary={user.emailVerified ? 'Verified' : 'Not Verified'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Lock /> Password & Authentication
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Lock />
                    </ListItemIcon>
                    <ListItemText
                      primary="Password"
                      secondary="Last changed: Unknown"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setChangePasswordOpen(true)}
                    >
                      Change
                    </Button>
                  </ListItem>
                </List>

                {!user.emailVerified && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Email Not Verified
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Please verify your email address to secure your account.
                    </Typography>
                    <Button variant="outlined" size="small">
                      Resend Verification Email
                    </Button>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Security /> Security Settings
                </Typography>
                <Divider sx={{ my: 2 }} />
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Security />
                    </ListItemIcon>
                    <ListItemText
                      primary="Two-Factor Authentication"
                      secondary="Not enabled"
                    />
                    <Chip label="Coming Soon" size="small" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Notifications Tab */}
      <TabPanel value={currentTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Notifications /> Notification Preferences
            </Typography>
            <Divider sx={{ my: 2 }} />
            
            <List>
              <ListItem>
                <ListItemText
                  primary="Email Notifications"
                  secondary="Receive notifications via email"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                    />
                  }
                  label=""
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Push Notifications"
                  secondary="Receive browser push notifications"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.pushNotifications}
                      onChange={(e) => setPreferences({ ...preferences, pushNotifications: e.target.checked })}
                    />
                  }
                  label=""
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="SMS Notifications"
                  secondary="Receive notifications via SMS"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.smsNotifications}
                      onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                    />
                  }
                  label=""
                />
              </ListItem>
              
              <Divider sx={{ my: 2 }} />
              
              <ListItem>
                <ListItemText
                  primary="Weekly Reports"
                  secondary="Receive weekly summary reports"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.weeklyReports}
                      onChange={(e) => setPreferences({ ...preferences, weeklyReports: e.target.checked })}
                    />
                  }
                  label=""
                />
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary="Monthly Reports"
                  secondary="Receive monthly financial reports"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.monthlyReports}
                      onChange={(e) => setPreferences({ ...preferences, monthlyReports: e.target.checked })}
                    />
                  }
                  label=""
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Preferences Tab */}
      <TabPanel value={currentTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Palette /> Display Preferences
      </Typography>
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={preferences.theme}
                    label="Theme"
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="auto">Auto (System)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Language</InputLabel>
                  <Select
                    value={preferences.language}
                    label="Language"
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  >
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="sw">Swahili</MenuItem>
                    <MenuItem value="lg">Luganda</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Alert severity="info" sx={{ mt: 3 }}>
              Some preferences will take effect after you refresh the page.
      </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Change Password Dialog */}
      <Dialog
        open={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Current Password"
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            margin="normal"
            helperText="Must be at least 6 characters"
          />
          <TextField
            fullWidth
            type="password"
            label="Confirm New Password"
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={changePasswordMutation.isLoading}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default ProfilePage;
