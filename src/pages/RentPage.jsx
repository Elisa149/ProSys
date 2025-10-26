import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  Tooltip,
  Fab,
} from '@mui/material';
import {
  Receipt,
  Add,
  Payment,
  Person,
  Home,
  Warning,
  CheckCircle,
  TrendingUp,
  MonetizationOn,
  Edit,
  Visibility,
  Download,
  Email,
  Phone,
  Apartment,
  Terrain,
  LocationOn,
} from '@mui/icons-material';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

import { propertyService, rentService, paymentService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import ResponsiveTable from '../components/common/ResponsiveTable';
import PropertySelectorDialog from '../components/PropertySelectorDialog';
import PaymentReceipt from '../components/PaymentReceipt';
import ClearCacheButton from '../components/ClearCacheButton';

// Helper functions
const formatCurrency = (amount) => {
  try {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  } catch (error) {
    return `UGX ${(amount || 0).toLocaleString()}`;
  }
};

const getStatusColor = (status, isOverdue = false) => {
  if (isOverdue) return 'error';
  switch (status) {
    case 'active': return 'success';
    case 'terminated': return 'default';
    case 'pending': return 'warning';
    default: return 'default';
  }
};

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ paddingTop: 24 }}>
    {value === index && children}
  </div>
);

const RentPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, userId, userRole, organizationId } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [propertyDialog, setPropertyDialog] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRent, setSelectedRent] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [lastCreatedPayment, setLastCreatedPayment] = useState(null);
  
  const [newPayment, setNewPayment] = useState({
    rentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    transactionId: '',
    notes: '',
  });

  // Debug logging - EXTENSIVE
  console.log('💰 RentPage mounted');
  console.log('👤 Auth Context:', { 
    userId: user?.uid, 
    userRole, 
    organizationId,
    hasUser: !!user,
    hasUserId: !!userId,
    hasUserRole: !!userRole,
    hasOrganizationId: !!organizationId
  });
  console.log('💾 localStorage:', {
    role: localStorage.getItem('userRole'),
    orgId: localStorage.getItem('organizationId'),
    userId: localStorage.getItem('userId')
  });
  
  // EMERGENCY FALLBACK: If no auth context loaded, try localStorage
  const effectiveUserId = userId || user?.uid || localStorage.getItem('userId');
  const effectiveUserRole = userRole || localStorage.getItem('userRole');
  const effectiveOrganizationId = organizationId || localStorage.getItem('organizationId');
  
  console.log('🔧 Effective Auth (with fallbacks):', {
    effectiveUserId,
    effectiveUserRole,
    effectiveOrganizationId
  });

  // Fetch properties - USE EFFECTIVE AUTH WITH FALLBACKS
  const { 
    data: properties = [], 
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery(
    ['rent-properties', effectiveUserId, effectiveUserRole, effectiveOrganizationId],
    () => {
      console.log('🔄 Fetching properties for rent page:', { 
        userId: effectiveUserId, 
        userRole: effectiveUserRole, 
        organizationId: effectiveOrganizationId 
      });
      return propertyService.getAll(effectiveUserId, effectiveUserRole, effectiveOrganizationId);
    },
    {
      enabled: !!user,
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: (data) => {
        console.log('✅ Properties loaded:', data?.length || 0);
        if (data?.length > 0) {
          console.log('📊 Sample property:', data[0]);
        }
      },
      onError: (err) => {
        console.error('❌ Error fetching properties:', err);
      },
    }
  );

  // Fetch rent records - USE EFFECTIVE AUTH WITH FALLBACKS
  const { 
    data: rentRecords = [],
    isLoading: rentLoading,
    error: rentError,
  } = useQuery(
    ['rent', effectiveUserId, effectiveUserRole, effectiveOrganizationId],
    () => {
      console.log('🔄 Fetching rent records:', { 
        userId: effectiveUserId, 
        userRole: effectiveUserRole, 
        organizationId: effectiveOrganizationId 
      });
      return rentService.getAll(effectiveUserId, effectiveUserRole, effectiveOrganizationId);
    },
    {
      enabled: !!user,
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: (data) => {
        console.log('✅ Rent records loaded:', data?.length || 0);
        if (data?.length > 0) {
          console.log('📊 Sample rent record:', data[0]);
        }
      },
      onError: (err) => {
        console.error('❌ Error fetching rent records:', err);
      },
    }
  );

  // Fetch payments - USE EFFECTIVE AUTH WITH FALLBACKS
  const { 
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useQuery(
    ['payments', effectiveUserId, effectiveUserRole, effectiveOrganizationId],
    () => {
      console.log('🔄 Fetching payments:', { 
        userId: effectiveUserId, 
        userRole: effectiveUserRole, 
        organizationId: effectiveOrganizationId 
      });
      return paymentService.getAll(effectiveUserId, effectiveUserRole, effectiveOrganizationId);
    },
    {
      enabled: !!user,
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: (data) => {
        console.log('✅ Payments loaded:', data?.length || 0);
        if (data?.length > 0) {
          console.log('📊 Sample payment:', data[0]);
        }
      },
      onError: (err) => {
        console.error('❌ Error fetching payments:', err);
      },
    }
  );

  // Delete rent mutation
  const deleteRentMutation = useMutation(
    (rentId) => rentService.delete(rentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rent');
        queryClient.invalidateQueries('properties');
        toast.success('Rent agreement deleted successfully');
      },
      onError: (error) => {
        toast.error(`Failed to delete rent agreement: ${error.message}`);
      },
    }
  );

  // Create payment mutation
  const createPaymentMutation = useMutation(
    (paymentData) => {
      console.log('💳 Creating payment:', paymentData);
      return paymentService.create(paymentData, user?.uid, userRole, organizationId);
    },
    {
      onSuccess: (newPayment) => {
        console.log('✅ Payment created successfully:', newPayment);
        queryClient.invalidateQueries(['payments', user?.uid, userRole, organizationId]);
        queryClient.invalidateQueries(['rent', user?.uid, userRole, organizationId]);
        toast.success('Payment recorded successfully!');
        setPaymentDialogOpen(false);
        
        // Store the created payment for receipt
        setLastCreatedPayment({
          ...newPayment,
          tenantName: selectedRent?.tenantName,
          propertyName: selectedRent?.propertyName,
        });
        setReceiptDialogOpen(true);
        
        resetPaymentForm();
      },
      onError: (error) => {
        console.error('❌ Failed to create payment:', error);
        toast.error(`Failed to record payment: ${error.message}`);
      },
    }
  );

  if (rentLoading || propertiesLoading || paymentsLoading) {
    return <LoadingSpinner message="Loading rent management data..." />;
  }

  if (rentError || propertiesError || paymentsError) {
    return (
      <ResponsiveContainer>
        <Alert severity="error" sx={{ m: 2, mb: 2 }}>
          Failed to load rent management data: {rentError?.message || propertiesError?.message || paymentsError?.message}
        </Alert>
        <Alert severity="info" sx={{ m: 2 }}>
          <strong>Quick Fix:</strong> Click the "Fix Data Loading" button at the top, or log out and log back in.
        </Alert>
      </ResponsiveContainer>
    );
  }
  
  // Show helpful alert if no data is loading but we have no records
  const showNoDataAlert = !rentLoading && !propertiesLoading && !paymentsLoading && 
                          rentRecords.length === 0 && properties.length === 0;

  // Calculate stats from real data
  const today = new Date();
  
  const enrichedRentRecords = rentRecords.map(rent => {
    // Calculate if overdue
    const nextDueDate = new Date(today.getFullYear(), today.getMonth(), rent.paymentDueDate || 1);
    if (nextDueDate < today && nextDueDate.getMonth() === today.getMonth()) {
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
    }
    
    const daysUntilDue = differenceInDays(nextDueDate, today);
    const isOverdue = daysUntilDue < 0;
    const daysOverdue = isOverdue ? Math.abs(daysUntilDue) : 0;
    
    // Calculate outstanding (simplified - would need payment tracking)
    const outstandingAmount = isOverdue ? rent.monthlyRent : 0;
    
    return {
      ...rent,
      nextDueDate,
      daysUntilDue,
      isOverdue,
      daysOverdue,
      outstandingAmount,
    };
  });

  const overdueRents = enrichedRentRecords.filter(rent => rent.isOverdue);
  
  // Calculate stats
  const currentMonthPayments = payments.filter(p => {
    const paymentDate = new Date(p.paymentDate);
    return paymentDate.getMonth() === today.getMonth() && 
           paymentDate.getFullYear() === today.getFullYear();
  });
  
  const totalCollected = currentMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const monthlyTarget = enrichedRentRecords.reduce((sum, r) => sum + (r.monthlyRent || 0), 0);
  const collectionRate = monthlyTarget > 0 ? Math.round((totalCollected / monthlyTarget) * 100) : 0;
  const overdueAmount = overdueRents.reduce((sum, r) => sum + (r.outstandingAmount || 0), 0);
  
  const stats = {
    totalCollected,
    monthlyTarget,
    collectionRate,
    overdueAmount,
    activeLeases: enrichedRentRecords.filter(r => r.status === 'active').length,
    totalProperties: properties.length,
  };

  // Handle functions
  const resetPaymentForm = () => {
    setNewPayment({
      rentId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      transactionId: '',
      notes: '',
    });
    setSelectedRent(null);
  };

  const handleRecordPayment = () => {
    if (!newPayment.rentId || !newPayment.amount) {
      toast.error('Please select a rent agreement and enter amount');
      return;
    }
    
    // Only send fields that are allowed by the backend validation schema
    const paymentData = {
      rentId: newPayment.rentId,
      propertyId: selectedRent?.propertyId,
      amount: parseFloat(newPayment.amount),
      paymentDate: newPayment.paymentDate,
      paymentMethod: newPayment.paymentMethod,
      transactionId: newPayment.transactionId || '',
      notes: newPayment.notes || '',
      lateFee: 0,
      status: 'completed',
    };
    
    createPaymentMutation.mutate(paymentData);
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <ResponsiveContainer>
      {showNoDataAlert && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            🔍 No Data Found - Your Auth Context May Need Refresh
          </Typography>
          <Typography variant="body2" paragraph>
            Your account is properly configured in the database, but the browser may have cached old authentication data.
          </Typography>
          <Typography variant="body2" paragraph>
            <strong>Solutions (try in order):</strong>
          </Typography>
          <ol style={{ marginLeft: 20 }}>
            <li>Click the <strong>"Fix Data Loading"</strong> button above ⬆️</li>
            <li>Or refresh your browser (Ctrl+R / Cmd+R)</li>
            <li>Or log out and log back in</li>
            <li>Check browser console (F12) for detailed logs</li>
          </ol>
          <Typography variant="body2">
            <strong>Your Auth Context:</strong> Role: {effectiveUserRole || 'Not Set'}, 
            Org ID: {effectiveOrganizationId || 'Not Set'}
          </Typography>
        </Alert>
      )}
      
      <ResponsiveHeader
        title="Rent Management"
        subtitle="Manage rent agreements, track payments, and monitor collections"
        icon={<Receipt color="primary" />}
        actions={[
          <ClearCacheButton key="clear-cache" variant="contained" size="medium" color="primary">
            Fix Data Loading
          </ClearCacheButton>,
          <Button
            key="create-property"
            variant="outlined"
            startIcon={<Home />}
            onClick={() => navigate('/app/properties/new')}
          >
            Create Property
          </Button>,
          <Button
            key="record-payment"
            variant="outlined"
            startIcon={<Payment />}
            onClick={() => setPaymentDialogOpen(true)}
          >
            Record Payment
          </Button>,
          <Button
            key="assign-tenant"
            variant="contained"
            startIcon={<Add />}
            onClick={() => setPropertyDialog(true)}
          >
            Assign New Tenant
          </Button>,
        ]}
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Monthly Collections
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(stats.totalCollected)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={(stats.totalCollected / stats.monthlyTarget) * 100}
                  sx={{ flexGrow: 1, mr: 1, height: 8, borderRadius: 4 }}
                  color="success"
                />
                <Typography variant="body2" color="text.secondary">
                  {Math.round((stats.totalCollected / stats.monthlyTarget) * 100)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  Overdue Amount
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(stats.overdueAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {overdueRents.length} overdue payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Home sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Active Leases
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {stats.activeLeases}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                of {stats.totalProperties} properties
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Collection Rate
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.collectionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This month
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Receipt />
                Rent Agreements
                <Chip size="small" label={enrichedRentRecords.length} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Payment />
                Payment History
                <Chip size="small" label={payments.length} />
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning />
                Overdue Payments
                <Chip size="small" label={overdueRents.length} color="error" />
              </Box>
            }
          />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={currentTab} index={0}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Tenant</strong></TableCell>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Monthly Rent</strong></TableCell>
                <TableCell><strong>Lease Period</strong></TableCell>
                <TableCell><strong>Next Due</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Outstanding</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrichedRentRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No rent agreements found
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setPropertyDialog(true)}
                        sx={{ mt: 2 }}
                      >
                        Assign First Tenant
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                enrichedRentRecords.map((rent) => (
                  <TableRow key={rent.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getInitials(rent.tenantName)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {rent.tenantName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {rent.tenantEmail || rent.tenantPhone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {rent.propertyName}
                      </Typography>
                      {rent.spaceName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {rent.spaceName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(rent.monthlyRent)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {rent.leaseStart && format(new Date(rent.leaseStart), 'MMM yyyy')}
                        {rent.leaseEnd && ` - ${format(new Date(rent.leaseEnd), 'MMM yyyy')}`}
                        {!rent.leaseEnd && ' - Ongoing'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={rent.isOverdue ? 'error.main' : 'text.primary'}
                        fontWeight={rent.isOverdue ? 'bold' : 'normal'}
                      >
                        {format(rent.nextDueDate, 'MMM dd, yyyy')}
                        {rent.isOverdue && (
                          <Typography variant="caption" color="error.main" display="block">
                            {rent.daysOverdue} days overdue
                          </Typography>
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={rent.status}
                        color={getStatusColor(rent.status, rent.isOverdue)}
                        size="small"
                        variant={rent.isOverdue ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={rent.outstandingAmount > 0 ? 'error.main' : 'success.main'}
                        fontWeight="bold"
                      >
                        {formatCurrency(rent.outstandingAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Property">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/app/properties/${rent.propertyId}`)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Record Payment">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={() => {
                              setSelectedRent(rent);
                              setNewPayment(prev => ({
                                ...prev,
                                rentId: rent.id,
                                amount: rent.outstandingAmount || rent.monthlyRent,
                              }));
                              setPaymentDialogOpen(true);
                            }}
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage Space">
                          <IconButton 
                            size="small"
                            onClick={() => navigate(`/app/properties/${rent.propertyId}/spaces`)}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={currentTab} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Tenant</strong></TableCell>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Transaction ID</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No payments recorded yet
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.paymentDate && format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {payment.tenantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.propertyName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.paymentMethod?.replace('_', ' ') || 'cash'}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {payment.transactionId || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={currentTab} index={2}>
        {overdueRents.length === 0 ? (
          <Alert severity="success" sx={{ display: 'flex', alignItems: 'center' }}>
            <CheckCircle sx={{ mr: 1 }} />
            No overdue payments! All tenants are up to date.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {overdueRents.map((rent) => (
              <Grid item xs={12} md={6} key={rent.id}>
                <Card sx={{ border: '2px solid', borderColor: 'error.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                          <Person />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" color="error.main">
                            {rent.tenantName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {rent.propertyName}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={`${rent.daysOverdue} days overdue`}
                        color="error"
                        size="small"
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Outstanding Amount
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {formatCurrency(rent.outstandingAmount)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" color="text.secondary">
                          Due Date
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          {format(rent.nextDueDate, 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        startIcon={<Payment />}
                        onClick={() => {
                          setSelectedRent(rent);
                          setNewPayment(prev => ({
                            ...prev,
                            rentId: rent.id,
                            amount: rent.outstandingAmount,
                          }));
                          setPaymentDialogOpen(true);
                        }}
                      >
                        Record Payment
                      </Button>
                      {rent.tenantPhone && (
                        <IconButton
                          size="small"
                          href={`tel:${rent.tenantPhone}`}
                          color="primary"
                        >
                          <Phone />
                        </IconButton>
                      )}
                      {rent.tenantEmail && (
                        <IconButton
                          size="small"
                          href={`mailto:${rent.tenantEmail}`}
                          color="primary"
                        >
                          <Email />
                        </IconButton>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Property Selector Dialog for New Tenant Assignment */}
      <PropertySelectorDialog 
        open={propertyDialog}
        onClose={() => setPropertyDialog(false)}
        title="Select Property to Assign Tenant"
      />

      {/* Payment Receipt Dialog */}
      <PaymentReceipt
        payment={lastCreatedPayment}
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
      />

      {/* Record Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Rent Agreement *</InputLabel>
                <Select
                  value={newPayment.rentId}
                  label="Rent Agreement *"
                  onChange={(e) => {
                    const selectedRentRecord = enrichedRentRecords.find(r => r.id === e.target.value);
                    setSelectedRent(selectedRentRecord);
                    setNewPayment(prev => ({ 
                      ...prev, 
                      rentId: e.target.value,
                      amount: selectedRentRecord?.monthlyRent || ''
                    }));
                  }}
                >
                  {enrichedRentRecords.map(rent => (
                    <MenuItem key={rent.id} value={rent.id}>
                      {rent.tenantName} - {rent.propertyName} ({rent.spaceName || 'N/A'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Amount *"
                type="number"
                value={newPayment.amount}
                onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Payment Date *"
                type="date"
                value={newPayment.paymentDate}
                onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={newPayment.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <MenuItem value="cash">Cash</MenuItem>
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="check">Check</MenuItem>
                  <MenuItem value="online">Online Payment</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Transaction ID / Reference"
                value={newPayment.transactionId}
                onChange={(e) => setNewPayment(prev => ({ ...prev, transactionId: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRecordPayment}
            variant="contained"
          >
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="record payment"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setPaymentDialogOpen(true)}
      >
        <Payment />
      </Fab>
    </ResponsiveContainer>
  );
};

export default RentPage;

