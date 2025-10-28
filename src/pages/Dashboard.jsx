import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  LinearProgress,
  Paper,
} from '@mui/material';
import {
  Home,
  AttachMoney,
  Receipt,
  TrendingUp,
  Add,
  Payment,
  Person,
} from '@mui/icons-material';
import { format } from 'date-fns';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer as RechartsResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';

import { propertyService, paymentService } from '../services/firebaseService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import { useAuth } from '../contexts/AuthContext';
import PropertySelectorDialog from '../components/PropertySelectorDialog';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userId, userRole, organizationId, hasPermission, hasAnyPermission } = useAuth();
  const [propertyDialog, setPropertyDialog] = React.useState(false);

  // Fetch dashboard data using Firebase with RBAC
  const {
    data: summary,
    isLoading: summaryLoading,
    error: summaryError,
  } = useQuery('dashboard-summary', () => paymentService.getDashboardSummary(userId, userRole, organizationId), {
    enabled: !!userId,
    retry: 3,
    retryDelay: 1000,
    onError: (error) => {
      console.error('Dashboard summary error:', error);
    }
  });

  const {
    data: properties,
    isLoading: propertiesLoading,
  } = useQuery('properties', () => propertyService.getAll(userId, userRole, organizationId), {
    enabled: !!userId
  });

  const {
    data: payments,
    isLoading: paymentsLoading,
  } = useQuery('payments', () => paymentService.getAll(userId, userRole, organizationId), {
    enabled: !!userId
  });

  // Use properties data directly (no need for nested data structure with Firebase)
  const propertiesArray = properties || [];
  const paymentsArray = payments || [];
  
  // Process data for analytics charts - memoized using useMemo
  // These MUST be before the early return to avoid hook order issues
  const paymentMethodData = React.useMemo(() => {
    if (!paymentsArray || paymentsArray.length === 0) {
      return [
        { name: 'Cash', value: 0 },
        { name: 'Mobile Money', value: 0 },
        { name: 'Bank Transfer', value: 0 },
      ];
    }
    
    const methods = {};
    paymentsArray.forEach(payment => {
      const method = payment.paymentMethod || 'cash';
      const displayName = method === 'mobile_money' ? 'Mobile Money' : 
                         method === 'bank_transfer' ? 'Bank Transfer' : 
                         'Cash';
      methods[displayName] = (methods[displayName] || 0) + 1;
    });

    return Object.entries(methods).map(([name, value]) => ({ name, value }));
  }, [paymentsArray]);

  const propertyTypeData = React.useMemo(() => {
    if (!propertiesArray || propertiesArray.length === 0) {
      return [
        { name: 'Buildings', value: 0 },
        { name: 'Land', value: 0 },
      ];
    }

    const types = {
      building: 0,
      land: 0,
    };

    propertiesArray.forEach(property => {
      if (property.type === 'building') types.building++;
      if (property.type === 'land') types.land++;
    });

    return [
      { name: 'Buildings', value: types.building },
      { name: 'Land', value: types.land },
    ];
  }, [propertiesArray]);

  const propertyIncomeData = React.useMemo(() => {
    if (!propertiesArray || propertiesArray.length === 0) {
      return [];
    }

    return propertiesArray
      .map(property => {
        let income = 0;
        if (property.type === 'building' && property.buildingDetails?.floors) {
          income = property.buildingDetails.floors.reduce((floorTotal, floor) => {
            return floorTotal + (floor.spaces?.reduce((spaceTotal, space) => 
              spaceTotal + (space.monthlyRent || 0), 0) || 0);
          }, 0);
        }
        if (property.type === 'land' && property.landDetails?.squatters) {
          income = property.landDetails.squatters.reduce((total, squatter) => 
            total + (squatter.monthlyPayment || 0), 0);
        }
        return {
          name: property.name.length > 20 ? property.name.substring(0, 20) + '...' : property.name,
          income: income,
          spaces: property.type === 'building' 
            ? property.buildingDetails?.floors?.reduce((total, floor) => total + (floor.spaces?.length || 0), 0) || 0
            : property.landDetails?.squatters?.length || 0,
        };
      })
      .sort((a, b) => b.income - a.income)
      .slice(0, 5); // Top 5 properties
  }, [propertiesArray]);

  const chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
  const pieColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  
  // Monthly comparison data will be calculated after dashboardData is created
  
  const createFallbackData = () => {
    const totalSpaces = propertiesArray.reduce((total, property) => {
      if (property.type === 'building' && property.buildingDetails?.floors) {
        return total + property.buildingDetails.floors.reduce((floorTotal, floor) => {
          return floorTotal + (floor.spaces?.length || 0);
        }, 0);
      }
      if (property.type === 'land' && property.landDetails?.squatters) {
        return total + property.landDetails.squatters.length;
      }
      return total;
    }, 0);

    const expectedMonthlyRent = propertiesArray.reduce((total, property) => {
      if (property.type === 'building' && property.buildingDetails?.floors) {
        return total + property.buildingDetails.floors.reduce((floorTotal, floor) => {
          return floorTotal + (floor.spaces?.reduce((spaceTotal, space) => 
            spaceTotal + (space.monthlyRent || 0), 0) || 0);
        }, 0);
      }
      if (property.type === 'land' && property.landDetails?.squatters) {
        return total + property.landDetails.squatters.reduce((squatterTotal, squatter) => 
          squatterTotal + (squatter.monthlyPayment || 0), 0);
      }
      return total;
    }, 0);

    return {
      totalProperties: propertiesArray.length,
      totalSpaces,
      thisMonth: { 
        collected: 0, 
        expected: expectedMonthlyRent, 
        payments: 0, 
        collectionRate: 0 
      },
      lastMonth: { 
        collected: 0, 
        expected: expectedMonthlyRent, 
        payments: 0, 
        collectionRate: 0 
      },
      recentPayments: []
    };
  };

  const dashboardData = summaryError ? createFallbackData() : (summary || {});
  
  // Show warning if using fallback data
  const usingFallbackData = !!summaryError;

  // Calculate monthly comparison data (as regular variable, not useMemo to avoid hook order issues)
  const monthlyComparisonData = (() => {
    if (!dashboardData.thisMonth || !dashboardData.lastMonth) {
      return [
        { name: 'This Month', collected: 0, expected: 0 },
        { name: 'Last Month', collected: 0, expected: 0 },
      ];
    }

    return [
      {
        name: 'This Month',
        collected: dashboardData.thisMonth.collected || 0,
        expected: dashboardData.thisMonth.expected || 0,
      },
      {
        name: 'Last Month',
        collected: dashboardData.lastMonth.collected || 0,
        expected: dashboardData.lastMonth.expected || 0,
      },
    ];
  })();

  // Early return for loading state - MUST be after all hooks
  if (summaryLoading || propertiesLoading || paymentsLoading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const stats = userRole === 'super_admin' ? [
    {
      title: 'Organizations',
      value: dashboardData.totalOrganizations?.toLocaleString?.() || dashboardData.totalOrganizations || 0,
      icon: <Home />,
      color: 'primary',
    },
    {
      title: 'Users',
      value: dashboardData.totalUsers?.toLocaleString?.() || dashboardData.totalUsers || 0,
      icon: <Person />,
      color: 'info',
    },
    {
      title: 'Collected (This Month)',
      value: `UGX ${(dashboardData.systemThisMonthCollected || 0).toLocaleString()}`,
      subtitle: `${dashboardData.systemThisMonthPayments || 0} payments across orgs`,
      icon: <AttachMoney />,
      color: 'success',
    },
    {
      title: 'Potential vs Collected',
      value: `UGX ${(dashboardData.systemThisMonthExpected || 0).toLocaleString()}`,
      subtitle: `${dashboardData.systemCollectionRate || 0}% collected`,
      icon: <TrendingUp />,
      color: (dashboardData.systemCollectionRate || 0) >= 80 ? 'success' : 'warning',
    },
  ] : [
    {
      title: 'Total Properties',
      value: dashboardData.totalProperties || 0,
      icon: <Home />,
      color: 'primary',
    },
    {
      title: 'Total Spaces',
      value: dashboardData.totalSpaces || 0,
      subtitle: 'Rentable units',
      icon: <Person />,
      color: 'info',
    },
    {
      title: 'This Month Collected',
      value: `UGX ${dashboardData.thisMonth?.collected?.toLocaleString() || '0'}`,
      subtitle: `${dashboardData.thisMonth?.payments || 0} payments`,
      icon: <AttachMoney />,
      color: 'success',
    },
    {
      title: 'Monthly Potential',
      value: `UGX ${dashboardData.thisMonth?.expected?.toLocaleString() || '0'}`,
      subtitle: `${dashboardData.thisMonth?.collectionRate || 0}% collected`,
      icon: <TrendingUp />,
      color: (dashboardData.thisMonth?.collectionRate || 0) >= 80 ? 'success' : 'warning',
    },
  ];

  const getCollectionRateColor = (rate) => {
    if (rate >= 90) return 'success';
    if (rate >= 70) return 'warning';
    return 'error';
  };

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title={userRole === 'super_admin' ? 'System Dashboard' : 'Dashboard'}
        subtitle={userRole === 'super_admin' 
          ? "System-wide analytics across all organizations."
          : "Welcome back! Here's what's happening with your properties."}
        icon={<Home color="primary" />}
        actions={[
          userRole === 'super_admin' && (
            <Button
              key="admin-analytics"
              variant="contained"
              startIcon={<TrendingUp />}
              onClick={() => navigate('/app/admin/analytics')}
            >
              System Analytics
            </Button>
          ),
          userRole === 'super_admin' && (
            <Button
              key="admin-orgs"
              variant="outlined"
              startIcon={<Home />}
              onClick={() => navigate('/app/admin/organizations')}
            >
              Organizations
            </Button>
          ),
          userRole === 'super_admin' && (
            <Button
              key="admin-users"
              variant="outlined"
              startIcon={<Person />}
              onClick={() => navigate('/app/admin/users')}
            >
              Users
            </Button>
          ),
          userRole !== 'super_admin' && hasAnyPermission(['properties:create:organization', 'properties:write:all']) && (
            <Button
              key="add-property"
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/app/properties/new')}
            >
              Create Property
            </Button>
          ),
          userRole !== 'super_admin' && (
            <Button
              key="assign-tenants"
              variant="outlined"
              startIcon={<Person />}
              onClick={() => setPropertyDialog(true)}
            >
              Assign Tenants
            </Button>
          ),
        ].filter(Boolean)}
      />

      {/* Property Selector Dialog for Tenant Assignment */}
      <PropertySelectorDialog 
        open={propertyDialog}
        onClose={() => setPropertyDialog(false)}
      />

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: `${stat.color}.light`,
                      color: `${stat.color}.contrastText`,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" fontWeight="bold">
                  {stat.value}
                </Typography>
                {stat.subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Collection Rate Progress */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Monthly Collection Progress
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    UGX {dashboardData.thisMonth?.collected?.toLocaleString() || '0'} collected
                  </Typography>
                  <Typography variant="body2">
                    UGX {dashboardData.thisMonth?.expected?.toLocaleString() || '0'} expected
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(dashboardData.thisMonth?.collectionRate || 0, 100)}
                  color={getCollectionRateColor(dashboardData.thisMonth?.collectionRate || 0)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {dashboardData.thisMonth?.collectionRate || 0}% of expected rent collected this month
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Month Comparison */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Month Comparison
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    This Month
                  </Typography>
                  <Typography variant="h6">
                    UGX {dashboardData.thisMonth?.collected?.toLocaleString() || '0'}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Last Month
                  </Typography>
                  <Typography variant="h6">
                    UGX {dashboardData.lastMonth?.collected?.toLocaleString() || '0'}
                  </Typography>
                </Box>
              </Box>
              {dashboardData.thisMonth?.collected !== undefined && dashboardData.lastMonth?.collected !== undefined && (
                <Box>
                  {dashboardData.thisMonth.collected >= dashboardData.lastMonth.collected ? (
                    <Chip
                      label={`+UGX ${(dashboardData.thisMonth.collected - dashboardData.lastMonth.collected).toLocaleString()} vs last month`}
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      label={`-UGX ${(dashboardData.lastMonth.collected - dashboardData.thisMonth.collected).toLocaleString()} vs last month`}
                      color="error"
                      size="small"
                    />
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Recent Payments
                </Typography>
                <Button
                  size="small"
                  endIcon={<Payment />}
                  onClick={() => navigate('/app/payments')}
                >
                  View All
                </Button>
              </Box>
              
              {dashboardData.recentPayments?.length > 0 ? (
                <List>
                  {dashboardData.recentPayments.map((payment, index) => (
                    <ListItem
                      key={payment.id}
                      divider={index < dashboardData.recentPayments.length - 1}
                    >
                      <ListItemText
                        primary={`${payment.propertyName} - ${payment.tenantName}`}
                        secondary={`${payment.paymentMethod} • ${payment.paymentDate && payment.paymentDate !== 'Invalid Date' ? format(new Date(payment.paymentDate), 'MMM dd, yyyy') : 'N/A'}`}
                      />
                      <ListItemSecondaryAction>
                        <Typography variant="h6" color="success.main">
                          UGX {payment.amount.toLocaleString()}
                        </Typography>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No recent payments found
                  </Typography>
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => navigate('/app/payments')}
                  >
                    Record Payment
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {userRole === 'super_admin' && (
          <>
            {/* System Matrix: Top Organizations */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    🏢 Top Organizations by Collections
                  </Typography>
                  {dashboardData.topOrganizations?.length ? (
                    <List>
                      {dashboardData.topOrganizations.map((org) => (
                        <ListItem key={org.organizationId}>
                          <ListItemText
                            primary={org.organizationId || 'Unknown Org'}
                            secondary={`${org.payments} payments`}
                          />
                          <ListItemSecondaryAction>
                            <Typography variant="subtitle1" color="success.main">
                              UGX {org.collected.toLocaleString()}
                            </Typography>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No data
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* System Matrix: Overdue and Aging */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⏰ Overdue Invoices (Aging)
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">0-30</Typography>
                          <Typography variant="h5">{dashboardData.overdue?.aging?.['0-30'] || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">31-60</Typography>
                          <Typography variant="h5">{dashboardData.overdue?.aging?.['31-60'] || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">61-90</Typography>
                          <Typography variant="h5">{dashboardData.overdue?.aging?.['61-90'] || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">90+</Typography>
                          <Typography variant="h5">{dashboardData.overdue?.aging?.['90+'] || 0}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                  <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
                    Total overdue: {dashboardData.overdue?.count || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* System Matrix: Payment Method Breakdown */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💳 Payment Methods (System-wide)
                  </Typography>
                  <Grid container spacing={2}>
                    {Object.entries(dashboardData.paymentMethodCounts || { cash: 0, mobile_money: 0, bank_transfer: 0 }).map(([method, count]) => (
                      <Grid item xs={12} sm={4} key={method}>
                        <Paper sx={{ p: 2 }} variant="outlined">
                          <Typography variant="subtitle2" color="text.secondary">
                            {method === 'mobile_money' ? 'Mobile Money' : method === 'bank_transfer' ? 'Bank Transfer' : 'Cash'}
                          </Typography>
                          <Typography variant="h5">{count}</Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Analytics Charts Section */}
        {/* Monthly Revenue Comparison Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Monthly Revenue Comparison
              </Typography>
              <RechartsResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                  <Tooltip formatter={(value) => `UGX ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="collected" fill="#00C49F" name="Collected" />
                  <Bar dataKey="expected" fill="#0088FE" name="Expected" />
                </BarChart>
              </RechartsResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Property Income Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💰 Top Properties by Income
              </Typography>
              <RechartsResponsiveContainer width="100%" height={300}>
                <BarChart data={propertyIncomeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tickFormatter={(value) => `${value.toLocaleString()}`} />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value) => `UGX ${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#8884d8" name="Monthly Income" />
                </BarChart>
              </RechartsResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Property Type Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏗️ Property Type Distribution
              </Typography>
              <RechartsResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={propertyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {propertyTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </RechartsResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment Methods Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                💳 Payment Methods Distribution
              </Typography>
              <RechartsResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`payment-cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </RechartsResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Trend Area Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Revenue Trends
              </Typography>
              <RechartsResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                  <Tooltip formatter={(value) => `UGX ${value.toLocaleString()}`} />
                  <Legend />
                  <Area type="monotone" dataKey="collected" stackId="1" stroke="#00C49F" fill="#00C49F" name="Collected" />
                  <Area type="monotone" dataKey="expected" stackId="2" stroke="#0088FE" fill="#0088FE" name="Expected" opacity={0.3} />
                </AreaChart>
              </RechartsResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions for Property Management */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Quick Actions
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {hasAnyPermission(['properties:create:organization', 'properties:write:all']) && (
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<Add />}
                    onClick={() => navigate('/app/properties/new')}
                  >
                    Add New Property
                  </Button>
                )}
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Person />}
                  onClick={() => setPropertyDialog(true)}
                  color="primary"
                >
                  Assign Tenants to Spaces
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Receipt />}
                  onClick={() => navigate('/app/rent')}
                >
                  Manage Rent Agreements
                </Button>
                
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Payment />}
                  onClick={() => navigate('/app/payments')}
                >
                  Record Payments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Property Status Overview */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏠 Property Overview
              </Typography>
              
              {properties.length > 0 ? (
                <List>
                  {properties.slice(0, 3).map((property) => (
                    <ListItem 
                      key={property.id}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'grey.50' },
                        borderRadius: 1,
                        mb: 1,
                      }}
                      onClick={() => navigate(`/app/properties/${property.id}/spaces`)}
                    >
                      <ListItemText
                        primary={property.name}
                        secondary={
                          <Box component="div">
                            <Typography component="span" variant="body2" color="text.secondary">
                              {property.type === 'building' && property.buildingDetails 
                                ? `${property.buildingDetails.totalRentableSpaces || 0} spaces`
                                : property.type === 'land' && property.landDetails
                                ? `${property.landDetails.squatters?.length || 0} squatters`
                                : 'No spaces defined'
                              }
                            </Typography>
                            <Typography component="span" variant="body2" color="success.main" sx={{ display: 'block' }}>
                              UGX {
                                property.type === 'building' && property.buildingDetails
                                  ? (property.buildingDetails.floors?.reduce((total, floor) => {
                                      const floorIncome = floor.spaces?.reduce((spaceTotal, space) => spaceTotal + (space.monthlyRent || 0), 0) || 0;
                                      return total + floorIncome;
                                    }, 0) || 0).toLocaleString()
                                  : property.type === 'land' && property.landDetails
                                  ? (property.landDetails.squatters?.reduce((total, squatter) => total + (squatter.monthlyPayment || 0), 0) || 0).toLocaleString()
                                  : '0'
                              }/month
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Person />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/app/properties/${property.id}/spaces`);
                          }}
                        >
                          Assign
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    No properties found
                  </Typography>
                  {hasAnyPermission(['properties:create:organization', 'properties:write:all']) && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => navigate('/app/properties/new')}
                    >
                      Add First Property
                    </Button>
                  )}
                </Box>
              )}
              
              {properties.length > 3 && (
                <Button
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/app/properties')}
                >
                  View All Properties ({properties.length})
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </ResponsiveContainer>
  );
};

export default Dashboard;
