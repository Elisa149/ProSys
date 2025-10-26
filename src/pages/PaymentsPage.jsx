import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
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
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Avatar,
  Tooltip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Payment,
  Search,
  FilterList,
  MonetizationOn,
  TrendingUp,
  Receipt,
  CalendarToday,
  Visibility,
  Download,
  Print,
  CheckCircle,
  Warning,
  Home,
  Person,
  Business,
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import toast from 'react-hot-toast';

import { paymentService, propertyService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import ResponsiveTable from '../components/common/ResponsiveTable';
import PaymentReceipt from '../components/PaymentReceipt';
import CorporatePaymentSlip from '../components/CorporatePaymentSlip';
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

const getPaymentMethodColor = (method) => {
  const colors = {
    cash: 'success',
    bank_transfer: 'primary',
    check: 'info',
    online: 'secondary',
    credit_card: 'warning',
    other: 'default',
  };
  return colors[method] || 'default';
};

const getStatusColor = (status) => {
  const colors = {
    completed: 'success',
    pending: 'warning',
    failed: 'error',
    refunded: 'default',
  };
  return colors[status] || 'default';
};

const PaymentsPage = () => {
  const navigate = useNavigate();
  const { hasPermission, user, userId, userRole, organizationId } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [corporateSlipOpen, setCorporateSlipOpen] = useState(false);

  // Debug logging - EXTENSIVE
  console.log('💳 PaymentsPage mounted');
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
      refetchInterval: 30000, // Refresh every 30 seconds
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

  // Fetch properties for filter - USE EFFECTIVE AUTH WITH FALLBACKS
  const { 
    data: properties = [],
    isLoading: propertiesLoading,
    error: propertiesError,
  } = useQuery(
    ['payment-properties', effectiveUserId, effectiveUserRole, effectiveOrganizationId],
    () => {
      console.log('🔄 Fetching properties for payments page:', { 
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
        console.log('✅ Properties for filter loaded:', data?.length || 0);
      },
      onError: (err) => {
        console.error('❌ Error fetching properties:', err);
      },
    }
  );

  // Show helpful alert if no data is loading but we have no records
  const showNoDataAlert = !paymentsLoading && !propertiesLoading && 
                          payments.length === 0 && properties.length === 0;

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        payment.tenantName?.toLowerCase().includes(searchLower) ||
        payment.propertyName?.toLowerCase().includes(searchLower) ||
        payment.transactionId?.toLowerCase().includes(searchLower);

      // Property filter
      const matchesProperty = filterProperty === 'all' || payment.propertyId === filterProperty;

      // Payment method filter
      const matchesMethod = filterMethod === 'all' || payment.paymentMethod === filterMethod;

      // Status filter
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;

      // Date range filter
      const paymentDate = new Date(payment.paymentDate);
      const matchesDateRange = dateRange.start && dateRange.end
        ? isWithinInterval(paymentDate, {
            start: new Date(dateRange.start),
            end: new Date(dateRange.end),
          })
        : true;

      return matchesSearch && matchesProperty && matchesMethod && matchesStatus && matchesDateRange;
    });
  }, [payments, searchQuery, filterProperty, filterMethod, filterStatus, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalWithFees = filteredPayments.reduce((sum, p) => sum + (p.amount || 0) + (p.lateFee || 0), 0);
    const totalFees = filteredPayments.reduce((sum, p) => sum + (p.lateFee || 0), 0);
    const completed = filteredPayments.filter(p => p.status === 'completed').length;
    const pending = filteredPayments.filter(p => p.status === 'pending').length;
    
    const byMethod = {};
    filteredPayments.forEach(p => {
      byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + (p.amount || 0);
    });

    return {
      total,
      totalWithFees,
      totalFees,
      count: filteredPayments.length,
      completed,
      pending,
      byMethod,
    };
  }, [filteredPayments]);

  // Early returns MUST come AFTER all hooks have been called
  if (paymentsLoading || propertiesLoading) {
    return <LoadingSpinner message="Loading payments..." />;
  }

  if (paymentsError || propertiesError) {
    return (
      <ResponsiveContainer>
        <Alert severity="error" sx={{ m: 2, mb: 2 }}>
          Failed to load payments data: {paymentsError?.message || propertiesError?.message}
        </Alert>
        <Alert severity="info" sx={{ m: 2 }}>
          <strong>Quick Fix:</strong> Click the "Fix Data Loading" button at the top, or log out and log back in.
        </Alert>
      </ResponsiveContainer>
    );
  }

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsDialogOpen(true);
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setReceiptDialogOpen(true);
  };

  const handleViewCorporateSlip = (payment) => {
    setSelectedPayment(payment);
    setCorporateSlipOpen(true);
  };

  const handleExport = () => {
    // Create CSV export
    const headers = ['Date', 'Tenant', 'Property', 'Amount', 'Method', 'Status', 'Transaction ID'];
    const rows = filteredPayments.map(p => [
      format(new Date(p.paymentDate), 'yyyy-MM-dd'),
      p.tenantName || '',
      p.propertyName || '',
      p.amount || 0,
      p.paymentMethod || '',
      p.status || '',
      p.transactionId || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Payments exported successfully');
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
        title="Payment Tracking"
        subtitle="Track and manage all rental payments"
        icon={<Payment color="primary" />}
        actions={[
          <ClearCacheButton key="clear-cache" variant="contained" size="medium" color="primary">
            Fix Data Loading
          </ClearCacheButton>,
          <Button
            key="export"
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExport}
            disabled={filteredPayments.length === 0}
          >
            Export
          </Button>,
          hasPermission('payments:create:organization') && (
            <Button
              key="record-payment"
              variant="outlined"
              startIcon={<Payment />}
              onClick={() => navigate('/app/rent')}
            >
              Record Payment
            </Button>
          ),
        ].filter(Boolean)}
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Total Collected
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {formatCurrency(stats.total)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                From {stats.count} payments
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
                  Late Fees
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {formatCurrency(stats.totalFees)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Additional charges
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6" color="success.main">
                  Completed
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Successful payments
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Warning sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6" color="warning.main">
                  Pending
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting confirmation
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FilterList sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search payments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Property</InputLabel>
              <Select
                value={filterProperty}
                label="Property"
                onChange={(e) => setFilterProperty(e.target.value)}
              >
                <MenuItem value="all">All Properties</MenuItem>
                {properties.map(property => (
                  <MenuItem key={property.id} value={property.id}>
                    {property.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                value={filterMethod}
                label="Method"
                onChange={(e) => setFilterMethod(e.target.value)}
              >
                <MenuItem value="all">All Methods</MenuItem>
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="credit_card">Credit Card</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              label="From Date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={1.5}>
            <TextField
              fullWidth
              label="To Date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Payments Table */}
      <Paper>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">
            Payment History ({filteredPayments.length})
          </Typography>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Date</strong></TableCell>
                <TableCell><strong>Tenant</strong></TableCell>
                <TableCell><strong>Property</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Late Fee</strong></TableCell>
                <TableCell><strong>Method</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Transaction ID</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Box sx={{ py: 4 }}>
                      <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No payments found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your filters or date range
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {payment.paymentDate && format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                          {payment.tenantName?.charAt(0) || 'T'}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {payment.tenantName || 'Unknown'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Home sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {payment.propertyName || 'Unknown Property'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color={payment.lateFee > 0 ? 'warning.main' : 'text.secondary'}
                        fontWeight={payment.lateFee > 0 ? 'bold' : 'normal'}
                      >
                        {payment.lateFee > 0 ? formatCurrency(payment.lateFee) : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH'}
                        color={getPaymentMethodColor(payment.paymentMethod)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payment.status?.toUpperCase() || 'COMPLETED'}
                        color={getStatusColor(payment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {payment.transactionId || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.5}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewDetails(payment)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Corporate Invoice">
                          <IconButton 
                            size="small"
                            color="primary"
                            onClick={() => handleViewCorporateSlip(payment)}
                          >
                            <Business />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print Receipt">
                          <IconButton 
                            size="small"
                            onClick={() => handleViewReceipt(payment)}
                          >
                            <Print />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Payment Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment Details</DialogTitle>
        <DialogContent>
          {selectedPayment && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Payment ID
                  </Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {selectedPayment.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Date
                  </Typography>
                  <Typography variant="body2">
                    {selectedPayment.paymentDate && format(new Date(selectedPayment.paymentDate), 'MMMM dd, yyyy')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Tenant
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {selectedPayment.tenantName || 'Unknown'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Property
                  </Typography>
                  <Typography variant="body2">
                    {selectedPayment.propertyName || 'Unknown Property'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Amount
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(selectedPayment.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Late Fee
                  </Typography>
                  <Typography variant="h6" color={selectedPayment.lateFee > 0 ? 'warning.main' : 'text.secondary'}>
                    {formatCurrency(selectedPayment.lateFee || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body2">
                    {selectedPayment.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={selectedPayment.status?.toUpperCase() || 'COMPLETED'}
                      color={getStatusColor(selectedPayment.status)}
                      size="small"
                    />
                  </Box>
                </Grid>
                {selectedPayment.transactionId && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Transaction ID
                    </Typography>
                    <Typography variant="body2" fontFamily="monospace">
                      {selectedPayment.transactionId}
                    </Typography>
                  </Grid>
                )}
                {selectedPayment.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2">
                      {selectedPayment.notes}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Total Amount
                  </Typography>
                  <Typography variant="h5" color="primary.main">
                    {formatCurrency((selectedPayment.amount || 0) + (selectedPayment.lateFee || 0))}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={() => {
              setReceiptDialogOpen(true);
            }}
          >
            Print Receipt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Receipt Dialog */}
      <PaymentReceipt
        payment={selectedPayment}
        open={receiptDialogOpen}
        onClose={() => setReceiptDialogOpen(false)}
      />

      {/* Corporate Payment Slip Dialog */}
      <CorporatePaymentSlip
        payment={selectedPayment}
        property={properties.find(p => p.id === selectedPayment?.propertyId)}
        tenant={null} // Can be fetched if tenant data is available
        open={corporateSlipOpen}
        onClose={() => setCorporateSlipOpen(false)}
      />
    </ResponsiveContainer>
  );
};

export default PaymentsPage;
