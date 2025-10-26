import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  AdminPanelSettings,
  Save,
  Refresh,
  Security,
  Email,
  Notifications,
  Storage,
  Backup,
  Restore,
  Settings,
  Add,
  Delete,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid';
import ResponsiveHeader from '../../components/common/ResponsiveHeader';
import toast from 'react-hot-toast';

const SystemSettingsPage = () => {
  const { userRole } = useAuth();
  const [settings, setSettings] = useState({
    // System Configuration
    systemName: 'ProSys Property Management',
    systemVersion: '1.0.0',
    maintenanceMode: false,
    debugMode: false,
    
    // Security Settings
    passwordMinLength: 8,
    passwordRequireSpecial: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    loginAttempts: 5,
    
    // Email Settings
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: 'noreply@prosys.com',
    fromName: 'ProSys System',
    
    // Notification Settings
    emailNotifications: true,
    systemAlerts: true,
    maintenanceAlerts: true,
    securityAlerts: true,
    
    // Storage Settings
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
    autoBackup: true,
    backupFrequency: 'daily',
    
    // Feature Flags
    enableRegistration: true,
    enableGoogleAuth: true,
    enableReports: true,
    enableAnalytics: true,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    setDialogType('reset');
    setOpenDialog(true);
  };

  const handleBackup = () => {
    setDialogType('backup');
    setOpenDialog(true);
  };

  const handleRestore = () => {
    setDialogType('restore');
    setOpenDialog(true);
  };

  const confirmAction = () => {
    setOpenDialog(false);
    if (dialogType === 'reset') {
      toast.success('Settings reset to defaults');
    } else if (dialogType === 'backup') {
      toast.success('Backup created successfully');
    } else if (dialogType === 'restore') {
      toast.success('Settings restored from backup');
    }
  };

  if (userRole !== 'super_admin') {
    return (
      <ResponsiveContainer>
        <Alert severity="error">
          You do not have permission to view this page. Only super administrators can access system settings.
        </Alert>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="System Settings"
        subtitle="Configure system-wide settings, security policies, and feature flags."
        icon={<AdminPanelSettings color="primary" />}
        actions={[
          <Button
            key="reset"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleResetSettings}
          >
            Reset
          </Button>,
          <Button
            key="save"
            variant="contained"
            startIcon={<Save />}
            onClick={handleSaveSettings}
            disabled={loading}
          >
            Save Settings
          </Button>,
        ]}
      />

      <ResponsiveCardGrid>
        {/* System Configuration */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Settings color="primary" />
              <Typography variant="h6">System Configuration</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="System Name"
                  value={settings.systemName}
                  onChange={(e) => handleSettingChange('systemName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Version"
                  value={settings.systemVersion}
                  onChange={(e) => handleSettingChange('systemVersion', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Backup Frequency</InputLabel>
                  <Select
                    value={settings.backupFrequency}
                    label="Backup Frequency"
                    onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                    />
                  }
                  label="Maintenance Mode"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.debugMode}
                      onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
                    />
                  }
                  label="Debug Mode"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Security color="primary" />
              <Typography variant="h6">Security Settings</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Password Min Length"
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Session Timeout (minutes)"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Login Attempts"
                  type="number"
                  value={settings.loginAttempts}
                  onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.passwordRequireSpecial}
                      onChange={(e) => handleSettingChange('passwordRequireSpecial', e.target.checked)}
                    />
                  }
                  label="Require Special Characters"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                    />
                  }
                  label="Two-Factor Authentication"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Email Settings */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Email color="primary" />
              <Typography variant="h6">Email Settings</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Host"
                  value={settings.smtpHost}
                  onChange={(e) => handleSettingChange('smtpHost', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Port"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => handleSettingChange('smtpPort', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Username"
                  value={settings.smtpUser}
                  onChange={(e) => handleSettingChange('smtpUser', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="SMTP Password"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => handleSettingChange('smtpPassword', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Email"
                  value={settings.fromEmail}
                  onChange={(e) => handleSettingChange('fromEmail', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="From Name"
                  value={settings.fromName}
                  onChange={(e) => handleSettingChange('fromName', e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Notifications color="primary" />
              <Typography variant="h6">Notification Settings</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.systemAlerts}
                      onChange={(e) => handleSettingChange('systemAlerts', e.target.checked)}
                    />
                  }
                  label="System Alerts"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.maintenanceAlerts}
                      onChange={(e) => handleSettingChange('maintenanceAlerts', e.target.checked)}
                    />
                  }
                  label="Maintenance Alerts"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.securityAlerts}
                      onChange={(e) => handleSettingChange('securityAlerts', e.target.checked)}
                    />
                  }
                  label="Security Alerts"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Storage Settings */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Storage color="primary" />
              <Typography variant="h6">Storage Settings</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max File Size (MB)"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoBackup}
                      onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    />
                  }
                  label="Auto Backup"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Allowed File Types
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {settings.allowedFileTypes.map((type, index) => (
                    <Chip
                      key={index}
                      label={type}
                      onDelete={() => {
                        const newTypes = settings.allowedFileTypes.filter((_, i) => i !== index);
                        handleSettingChange('allowedFileTypes', newTypes);
                      }}
                      size="small"
                    />
                  ))}
                  <Chip
                    label="+ Add"
                    onClick={() => {
                      const newType = prompt('Enter file type:');
                      if (newType) {
                        handleSettingChange('allowedFileTypes', [...settings.allowedFileTypes, newType]);
                      }
                    }}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Settings color="primary" />
              <Typography variant="h6">Feature Flags</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableRegistration}
                      onChange={(e) => handleSettingChange('enableRegistration', e.target.checked)}
                    />
                  }
                  label="Enable Registration"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableGoogleAuth}
                      onChange={(e) => handleSettingChange('enableGoogleAuth', e.target.checked)}
                    />
                  }
                  label="Google Authentication"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableReports}
                      onChange={(e) => handleSettingChange('enableReports', e.target.checked)}
                    />
                  }
                  label="Reports Module"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.enableAnalytics}
                      onChange={(e) => handleSettingChange('enableAnalytics', e.target.checked)}
                    />
                  }
                  label="Analytics Module"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Backup & Restore */}
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Backup color="primary" />
              <Typography variant="h6">Backup & Restore</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Backup />}
                  onClick={handleBackup}
                >
                  Create Backup
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Restore />}
                  onClick={handleRestore}
                >
                  Restore Backup
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </ResponsiveCardGrid>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>
          {dialogType === 'reset' && 'Reset Settings'}
          {dialogType === 'backup' && 'Create Backup'}
          {dialogType === 'restore' && 'Restore Backup'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {dialogType === 'reset' && 'Are you sure you want to reset all settings to their default values?'}
            {dialogType === 'backup' && 'This will create a backup of all current system settings.'}
            {dialogType === 'restore' && 'This will restore settings from the selected backup file.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={confirmAction} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default SystemSettingsPage;