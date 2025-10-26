import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Assessment,
  Download,
  Refresh,
  FilterList,
  TrendingUp,
  TrendingDown,
  People,
  Home,
  Receipt,
  Payment,
  Business,
  Visibility,
  GetApp,
  Share,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from 'react-query';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ResponsiveContainer from '../../components/common/ResponsiveContainer';
import ResponsiveCardGrid from '../../components/common/ResponsiveCardGrid';
import ResponsiveHeader from '../../components/common/ResponsiveHeader';
import ResponsiveTable from '../../components/common/ResponsiveTable';
import toast from 'react-hot-toast';

const SystemReportsPage = () => {
  const { userRole } = useAuth();
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('30');
  const [organizationFilter, setOrganizationFilter] = useState('all');
  const [openExportDialog, setOpenExportDialog] = useState(false);

  // Mock data for system reports
  const systemStats = {
    totalUsers: 1247,
    activeUsers: 1156,
    totalOrganizations: 23,
    totalProperties: 1847,
    totalRevenue: 2847392,
    monthlyGrowth: 12.5,
    userGrowth: 8.3,
    propertyGrowth: 15.2,
  };

  const organizationStats = [
    { id: 'org1', name: 'Metro Properties', users: 156, properties: 234, revenue: 456789 },
    { id: 'org2', name: 'Urban Realty', users: 89, properties: 145, revenue: 234567 },
    { id: 'org3', name: 'City Management', users: 234, properties: 456, revenue: 678901 },
    { id: 'org4', name: 'Downtown Holdings', users: 67, properties: 98, revenue: 123456 },
  ];

  const userActivityData = [
    { date: '2024-01-01', logins: 234, newUsers: 12, activeUsers: 189 },
    { date: '2024-01-02', logins: 267, newUsers: 8, activeUsers: 201 },
    { date: '2024-01-03', logins: 289, newUsers: 15, activeUsers: 215 },
    { date: '2024-01-04', logins: 312, newUsers: 23, activeUsers: 238 },
    { date: '2024-01-05', logins: 298, newUsers: 18, activeUsers: 256 },
  ];

  const handleExportReport = () => {
    setOpenExportDialog(true);
  };

  const handleDownloadReport = (format) => {
    setOpenExportDialog(false);
    toast.success(`Downloading ${selectedReport} report in ${format} format`);
  };

  if (userRole !== 'super_admin') {
    return (
      <Alert severity="error">
        You do not have permission to view this page. Only super administrators can access system reports.
      </Alert>
    );
  }

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="System Reports"
        subtitle="Cross-organization reports and analytics for system-wide insights."
        icon={<Assessment color="primary" />}
        actions={[
          <Button
            key="refresh"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => toast.info('Refreshing reports...')}
          >
            Refresh
          </Button>,
          <Button
            key="export"
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportReport}
          >
            Export Report
          </Button>,
        ]}
      />

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={selectedReport}
                  label="Report Type"
                  onChange={(e) => setSelectedReport(e.target.value)}
                >
                  <MenuItem value="overview">System Overview</MenuItem>
                  <MenuItem value="users">User Analytics</MenuItem>
                  <MenuItem value="organizations">Organization Performance</MenuItem>
                  <MenuItem value="revenue">Revenue Analysis</MenuItem>
                  <MenuItem value="activity">Activity Reports</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <MenuItem value="7">Last 7 days</MenuItem>
                  <MenuItem value="30">Last 30 days</MenuItem>
                  <MenuItem value="90">Last 90 days</MenuItem>
                  <MenuItem value="365">Last year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={organizationFilter}
                  label="Organization"
                  onChange={(e) => setOrganizationFilter(e.target.value)}
                >
                  <MenuItem value="all">All Organizations</MenuItem>
                  {organizationStats.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                fullWidth
                onClick={() => toast.info('Applying filters...')}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* System Overview Cards */}
      {selectedReport === 'overview' && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Users
                    </Typography>
                    <Typography variant="h4">
                      {systemStats.totalUsers.toLocaleString()}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUp color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                        +{systemStats.userGrowth}%
                      </Typography>
                    </Box>
                  </Box>
                  <People color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Organizations
                    </Typography>
                    <Typography variant="h4">
                      {systemStats.totalOrganizations}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUp color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                        +5.2%
                      </Typography>
                    </Box>
                  </Box>
                  <Business color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Properties
                    </Typography>
                    <Typography variant="h4">
                      {systemStats.totalProperties.toLocaleString()}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUp color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                        +{systemStats.propertyGrowth}%
                      </Typography>
                    </Box>
                  </Box>
                  <Home color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom>
                      Total Revenue
                    </Typography>
                    <Typography variant="h4">
                      ${(systemStats.totalRevenue / 1000000).toFixed(1)}M
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <TrendingUp color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                        +{systemStats.monthlyGrowth}%
                      </Typography>
                    </Box>
                  </Box>
                  <Payment color="primary" sx={{ fontSize: 40 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Organization Performance Table */}
      {selectedReport === 'organizations' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Organization Performance
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Organization</TableCell>
                    <TableCell align="right">Users</TableCell>
                    <TableCell align="right">Properties</TableCell>
                    <TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Growth</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {organizationStats.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Business color="primary" />
                          <Typography variant="body2">{org.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">{org.users}</TableCell>
                      <TableCell align="right">{org.properties}</TableCell>
                      <TableCell align="right">${org.revenue.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label="+12.5%"
                          color="success"
                          size="small"
                          icon={<TrendingUp />}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* User Activity Chart */}
      {selectedReport === 'activity' && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Activity Trends
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Logins</TableCell>
                    <TableCell align="right">New Users</TableCell>
                    <TableCell align="right">Active Users</TableCell>
                    <TableCell align="right">Activity Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userActivityData.map((day, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(day.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">{day.logins}</TableCell>
                      <TableCell align="right">{day.newUsers}</TableCell>
                      <TableCell align="right">{day.activeUsers}</TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end">
                          <LinearProgress
                            variant="determinate"
                            value={(day.activeUsers / 300) * 100}
                            sx={{ width: 60, mr: 1 }}
                          />
                          <Typography variant="body2">
                            {((day.activeUsers / 300) * 100).toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Export Dialog */}
      <Dialog open={openExportDialog} onClose={() => setOpenExportDialog(false)}>
        <DialogTitle>Export Report</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Choose the format for your {selectedReport} report:
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => handleDownloadReport('PDF')}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => handleDownloadReport('Excel')}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={() => handleDownloadReport('CSV')}
            >
              CSV
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExportDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default SystemReportsPage;
