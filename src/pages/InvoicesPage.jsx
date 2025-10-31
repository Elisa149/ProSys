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
  Alert,
  Tooltip,
  Fab,
  InputAdornment,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Receipt,
  Add,
  Edit,
  Visibility,
  Download,
  Payment,
  Warning,
  CheckCircle,
  TrendingUp,
  MonetizationOn,
} from '@mui/icons-material';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { invoiceService, rentService, paymentService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import ClearCacheButton from '../components/ClearCacheButton';
import CorporatePaymentSlip from '../components/CorporatePaymentSlip';
import confirmAction from '../utils/confirmAction';

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

const InvoicesPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, userId, userRole, organizationId } = useAuth();
  
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewInvoiceOpen, setViewInvoiceOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'cash',
    amount: '',
    transactionId: '',
    notes: '',
  });

  const getRefPrefix = (method) => {
    switch (method) {
      case 'cash':
        return 'CSH';
      case 'bank_transfer':
        return 'BNK';
      case 'check':
        return 'CHK';
      case 'online':
        return 'ONL';
      case 'credit_card':
        return 'CRD';
      case 'mobile_money_mtn':
        return 'MTN';
      case 'mobile_money_airtel':
        return 'AIRTEL';
      default:
        return 'PMT';
    }
  };
  
  // Fallback auth
  const effectiveUserId = userId || user?.uid || localStorage.getItem('userId');
  const effectiveUserRole = userRole || localStorage.getItem('userRole');
  const effectiveOrganizationId = organizationId || localStorage.getItem('organizationId');

  // Fetch invoices
  const { 
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery(
    ['invoices', effectiveUserId, effectiveUserRole, effectiveOrganizationId],
    () => invoiceService.getAll(effectiveUserId, effectiveUserRole, effectiveOrganizationId),
    {
      enabled: !!user,
      staleTime: 0,
      refetchOnMount: true,
    }
  );

  // Fetch rent records for generating invoices
  const { 
    data: rentRecords = [],
    isLoading: rentLoading,
  } = useQuery(
    ['rent', effectiveUserId, effectiveUserRole, effectiveOrganizationId],
    () => rentService.getAll(effectiveUserId, effectiveUserRole, effectiveOrganizationId),
    {
      enabled: !!user,
      staleTime: 0,
    }
  );

  // Generate monthly invoices mutation
  const generateInvoicesMutation = useMutation(
    () => invoiceService.generateMonthlyInvoices(effectiveUserId, effectiveUserRole, effectiveOrganizationId),
    {
      onSuccess: (data) => {
        console.log('✅ Successfully generated invoices:', data);
        queryClient.invalidateQueries(['invoices', effectiveUserId, effectiveUserRole, effectiveOrganizationId]);
        toast.success(`Generated ${data?.length || 0} invoices`);
        setGenerateDialogOpen(false);
      },
      onError: (error) => {
        console.error('❌ Error generating invoices:', error);
        console.error('Error details:', {
          message: error?.message,
          code: error?.code,
          stack: error?.stack,
        });
        toast.error(`Failed to generate invoices: ${error?.message || 'Unknown error'}`);
      },
    }
  );

  if (invoicesLoading || rentLoading) {
    return <LoadingSpinner message="Loading invoices..." />;
  }

  if (invoicesError) {
    return (
      <ResponsiveContainer>
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load invoices: {invoicesError.message}
        </Alert>
      </ResponsiveContainer>
    );
  }

  // Calculate stats
  const stats = {
    total: invoices.length,
    pending: invoices.filter(inv => inv.status === 'pending').length,
    partiallyPaid: invoices.filter(inv => inv.status === 'partially_paid').length,
    paid: invoices.filter(inv => inv.status === 'paid').length,
    overdue: invoices.filter(inv => inv.status === 'pending' && new Date(inv.dueDate) < new Date()).length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0),
    totalPaid: invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0),
    totalDue: invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0),
  };

  const getStatusColor = (status, isOverdue) => {
    if (isOverdue) return 'error';
    switch (status) {
      case 'paid': return 'success';
      case 'partially_paid': return 'warning';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setViewInvoiceOpen(true);
  };

  const handleGenerateInvoices = () => {
    if (!confirmAction('Generate invoices for all active rent agreements?')) {
      return;
    }

    generateInvoicesMutation.mutate();
  };

  return (
    <ResponsiveContainer>
      <ResponsiveHeader
        title="Invoice Management"
        subtitle="Manage rent invoices, track payment status, and generate monthly invoices"
        icon={<Receipt color="primary" />}
        actions={[
          <ClearCacheButton key="clear-cache" variant="contained" size="medium" color="primary">
            Fix Data Loading
          </ClearCacheButton>,
          <Button
            key="generate"
            variant="contained"
            startIcon={<Add />}
            onClick={() => setGenerateDialogOpen(true)}
            disabled={generateInvoicesMutation.isLoading}
          >
            Generate Monthly Invoices
          </Button>,
        ]}
      />

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Total Invoices
                </Typography>
              </Box>
              <Typography variant="h4" color="primary.main">
                {stats.total}
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
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6" color="info.main">
                  Partially Paid
                </Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {stats.partiallyPaid}
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
                  Paid
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.paid}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoices Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Invoice #</strong></TableCell>
              <TableCell><strong>Tenant</strong></TableCell>
              <TableCell><strong>Property</strong></TableCell>
              <TableCell><strong>Total Amount</strong></TableCell>
              <TableCell><strong>Paid</strong></TableCell>
              <TableCell><strong>Due</strong></TableCell>
              <TableCell><strong>Due Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Progress</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      No invoices found
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setGenerateDialogOpen(true)}
                      sx={{ mt: 2 }}
                    >
                      Generate Monthly Invoices
                    </Button>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => {
                const isOverdue = invoice.status === 'pending' && new Date(invoice.dueDate) < new Date();
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {invoice.invoiceNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {invoice.tenantName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {invoice.propertyName}
                      </Typography>
                      {invoice.spaceName && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          {invoice.spaceName}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(invoice.totalAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        {formatCurrency(invoice.amountPaid)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'} fontWeight="bold">
                        {formatCurrency(invoice.amountDue)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color={isOverdue ? 'error.main' : 'text.primary'}>
                        {format(invoice.dueDate, 'MMM dd, yyyy')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={invoice.status?.replace('_', ' ') || 'pending'}
                        color={getStatusColor(invoice.status, isOverdue)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.5 }}>
                        <LinearProgress
                          variant="determinate"
                          value={(invoice.amountPaid / invoice.totalAmount) * 100}
                          sx={{ width: '80px', height: 6, borderRadius: 3 }}
                          color={
                            invoice.amountDue <= 0 ? 'success' : 
                            invoice.amountPaid > 0 ? 'warning' : 
                            'error'
                          }
                        />
                        <Typography variant="caption" fontWeight="bold" color="text.secondary">
                          {Math.round((invoice.amountPaid / invoice.totalAmount) * 100)}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Record Payment">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => {
                              setPaymentInvoice(invoice);
                              setPaymentData({
                                paymentMethod: 'cash',
                                amount: invoice.amountDue.toString(),
                                transactionId: '',
                                notes: '',
                              });
                              setPaymentDialogOpen(true);
                            }}
                          >
                            <Payment />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Invoice">
                          <IconButton
                            size="small"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Generate Invoices Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)}>
        <DialogTitle>Generate Monthly Invoices</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This will create invoices for all active rent agreements that don't already have an invoice for the current month.
          </Alert>
          <Typography variant="body2">
            Active rent agreements: {rentRecords.filter(r => r.status === 'active').length}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleGenerateInvoices}
            variant="contained"
            disabled={generateInvoicesMutation.isLoading}
          >
            {generateInvoicesMutation.isLoading ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Invoice Dialog */}
      {selectedInvoice && (
        <CorporatePaymentSlip
          payment={selectedInvoice}
          property={null}
          tenant={null}
          open={viewInvoiceOpen}
          onClose={() => {
            setViewInvoiceOpen(false);
            setSelectedInvoice(null);
          }}
        />
      )}

      {/* Make Payment Dialog */}
      <Dialog open={paymentDialogOpen} onClose={() => setPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {paymentInvoice && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Invoice:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                    {paymentInvoice.invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Tenant:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {paymentInvoice.tenantName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Total Amount:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="info.main">
                    {formatCurrency(paymentInvoice.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Paid Amount:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="success.main">
                    {formatCurrency(paymentInvoice.amountPaid || 0)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Remaining:
                  </Typography>
                  <Typography variant="body1" fontWeight="bold" color="warning.main">
                    {formatCurrency(paymentInvoice.amountDue)}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="caption" color="text.secondary">
                    Payments Made:
                  </Typography>
                  <Typography variant="body2">
                    {(paymentInvoice.paymentIds?.length || 0)} payments
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Payment Method *</InputLabel>
                    <Select
                      value={paymentData.paymentMethod}
                      label="Payment Method *"
                      onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                      <MenuItem value="check">Check</MenuItem>
                      <MenuItem value="online">Online Payment</MenuItem>
                      <MenuItem value="credit_card">Credit Card</MenuItem>
                      <MenuItem value="mobile_money_mtn">Mobile Money MTN</MenuItem>
                      <MenuItem value="mobile_money_airtel">Mobile Money Airtel</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    required
                    label="Payment Amount *"
                    type="number"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">UGX</InputAdornment>,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    New remaining: {formatCurrency((paymentInvoice.amountDue || 0) - parseFloat(paymentData.amount || 0))}
                  </Typography>
                  <Typography variant="caption" color="info.main" sx={{ display: 'block' }}>
                    This will be payment #{(paymentInvoice.paymentIds?.length || 0) + 1}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Payment Reference Number"
                    value={
                      paymentData.transactionId || 
                      `${getRefPrefix(paymentData.paymentMethod)}-${format(new Date(), 'yyMMddHHmm')}-${paymentInvoice.id.slice(-4)}-${String((paymentInvoice.paymentIds?.length || 0) + 1).padStart(2, '0')}`
                    }
                    disabled
                    helperText={`Auto-generated format: ${getRefPrefix(paymentData.paymentMethod)}-YYMMDDHHMM-XXXX-##`}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={3}
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any additional notes (optional)"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
                toast.error('Please enter a valid payment amount');
                return;
              }
              setConfirmationDialogOpen(true);
            }}
          >
            Proceed to Confirmation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={confirmationDialogOpen} onClose={() => setConfirmationDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Confirm Payment
          </Typography>
        </DialogTitle>
        <DialogContent>
          {paymentInvoice && (
            <Box sx={{ mt: 1 }}>
              {/* Balance Information */}
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Balance Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Total Invoice
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {formatCurrency(paymentInvoice.totalAmount)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Already Paid
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">
                      {formatCurrency(paymentInvoice.amountPaid || 0)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Current Balance
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                      {formatCurrency(paymentInvoice.amountDue)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      This Payment
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      {formatCurrency(parseFloat(paymentData.amount))}
                    </Typography>
                    {/* Percentage Covered */}
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Covers:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold" 
                        color="info.main"
                      >
                        {Math.round((parseFloat(paymentData.amount) / paymentInvoice.totalAmount) * 100)}% of invoice
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Balance After Payment:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color={parseFloat(paymentInvoice.amountDue) - parseFloat(paymentData.amount) <= 0 ? 'success.main' : 'warning.main'}>
                    {formatCurrency(parseFloat(paymentInvoice.amountDue) - parseFloat(paymentData.amount))}
                  </Typography>
                  {parseFloat(paymentInvoice.amountDue) - parseFloat(paymentData.amount) <= 0 && (
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                      ✓ This payment will fully settle the invoice (100% coverage)
                    </Typography>
                  )}
                  {parseFloat(paymentInvoice.amountDue) - parseFloat(paymentData.amount) > 0 && (
                    <Typography variant="caption" color="info.main" display="block" sx={{ mt: 0.5 }}>
                      ℹ This payment covers {Math.round((parseFloat(paymentData.amount) / paymentInvoice.totalAmount) * 100)}% of the total invoice
                    </Typography>
                  )}
                </Box>
              </Paper>

              {/* Payment Details */}
              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Payment Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Invoice:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                      {paymentInvoice.invoiceNumber}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Tenant:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {paymentInvoice.tenantName}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Payment Amount:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      {formatCurrency(parseFloat(paymentData.amount))}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Payment Method:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {paymentData.paymentMethod.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Payment Reference:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                      {paymentData.transactionId || `${getRefPrefix(paymentData.paymentMethod)}-${format(new Date(), 'yyMMddHHmm')}-${paymentInvoice.id.slice(-4)}-${String((paymentInvoice.paymentIds?.length || 0) + 1).padStart(2, '0')}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Installment Number:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      #{paymentInvoice.paymentIds?.length ? (paymentInvoice.paymentIds.length + 1) : 1}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Alert severity="info" sx={{ mt: 2 }}>
                Please verify the balance information and payment details before confirming.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              try {
                const amount = parseFloat(paymentData.amount);
                const paymentRef = paymentData.transactionId || `${getRefPrefix(paymentData.paymentMethod)}-${format(new Date(), 'yyMMddHHmm')}-${paymentInvoice.id.slice(-4)}-${String((paymentInvoice.paymentIds?.length || 0) + 1).padStart(2, '0')}`;

                // Create payment record
                const newPayment = {
                  invoiceId: paymentInvoice.id,
                  rentId: paymentInvoice.rentId,
                  propertyId: paymentInvoice.propertyId || (rentRecords.find(r => r.id === paymentInvoice.rentId)?.propertyId) || '',
                  tenantName: paymentInvoice.tenantName,
                  propertyName: paymentInvoice.propertyName,
                  amount: amount,
                  paymentMethod: paymentData.paymentMethod,
                  transactionId: paymentRef,
                  notes: paymentData.notes,
                  installmentNumber: (paymentInvoice.paymentIds?.length || 0) + 1,
                  status: 'completed',
                  paymentDate: new Date(),
                  userId: effectiveUserId,
                  organizationId: effectiveOrganizationId,
                };

                await paymentService.create(newPayment, effectiveUserId, effectiveUserRole, effectiveOrganizationId);

                // Update invoice with payment
                const updatedAmountPaid = (paymentInvoice.amountPaid || 0) + amount;
                const updatedAmountDue = paymentInvoice.totalAmount - updatedAmountPaid;
                const newStatus = updatedAmountDue <= 0 ? 'paid' : updatedAmountPaid > 0 ? 'partially_paid' : 'pending';

                await invoiceService.update(paymentInvoice.id, {
                  amountPaid: updatedAmountPaid,
                  amountDue: updatedAmountDue,
                  status: newStatus,
                  paymentIds: [...(paymentInvoice.paymentIds || []), `payment_${Date.now()}`],
                });

                toast.success(`Payment of ${formatCurrency(amount)} recorded successfully`);
                setConfirmationDialogOpen(false);
                setPaymentDialogOpen(false);
                setPaymentInvoice(null);
                setPaymentData({
                  paymentMethod: 'cash',
                  amount: '',
                  transactionId: '',
                  notes: '',
                });
                queryClient.invalidateQueries(['invoices']);
                queryClient.invalidateQueries(['payments']);
              } catch (error) {
                console.error('Payment error:', error);
                toast.error(`Failed to record payment: ${error.message}`);
              }
            }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </ResponsiveContainer>
  );
};

export default InvoicesPage;

