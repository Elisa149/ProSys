import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  FormHelperText,
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

import { propertyService, rentService, paymentService, invoiceService } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ResponsiveContainer from '../components/common/ResponsiveContainer';
import ResponsiveHeader from '../components/common/ResponsiveHeader';
import ResponsiveTable from '../components/common/ResponsiveTable';
import PropertySelectorDialog from '../components/PropertySelectorDialog';
import PaymentReceipt from '../components/PaymentReceipt';
import RentReceipt from '../components/RentReceipt';
import CorporatePaymentSlip from '../components/CorporatePaymentSlip';
import ClearCacheButton from '../components/ClearCacheButton';
import confirmAction from '../utils/confirmAction';

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

// Helpers to render payment listing as requested
const formatDateTime = (date) => {
  try {
    const d = new Date(date);
    return {
      date: format(d, 'MM/dd/yyyy'),
      time: format(d, 'hh:mm:ss a'),
    };
  } catch (e) {
    return { date: '-', time: '-' };
  }
};

const getInvoiceNumber = (payment) => {
  try {
    if (payment.invoiceNumber) return payment.invoiceNumber;
    const d = new Date(payment.paymentDate || Date.now());
    const y = format(d, 'yyyy');
    const m = format(d, 'MM');
    const dd = format(d, 'dd');
    const tail = (payment.id || '').toString().slice(-4).padStart(4, '0');
    return `INV-${y}-${m}-${dd}-${tail}`;
  } catch (e) {
    return 'INV-NA';
  }
};

const getCashRef = (payment, sequenceIndex) => {
  try {
    const d = new Date(payment.paymentDate || Date.now());
    const ts = format(d, 'yyMMddHHmm');
    const rand = ((payment.id || '').toString().slice(-4) || Math.floor(Math.random() * 10000).toString()).padStart(4, '0');
    const seq = String((sequenceIndex || 0) + 1).padStart(2, '0');
    return `CSH-${ts}-${rand}-${seq}`;
  } catch (e) {
    return 'CSH-NA';
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
  const [rentReceiptDialogOpen, setRentReceiptDialogOpen] = useState(false);
  const [lastCreatedPayment, setLastCreatedPayment] = useState(null);
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [invoicePeriodDialogOpen, setInvoicePeriodDialogOpen] = useState(false);
  const [invoiceRentContext, setInvoiceRentContext] = useState(null);
  const [availableBillingPeriods, setAvailableBillingPeriods] = useState([]);
  const [invoicePeriodSelection, setInvoicePeriodSelection] = useState({ month: null, year: null });
  const [invoiceCreationLoading, setInvoiceCreationLoading] = useState(false);
  const invoiceDialogToastShownRef = useRef(false);
  
  const [newPayment, setNewPayment] = useState({
    invoiceId: '',
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

  // Fetch invoices - USE EFFECTIVE AUTH WITH FALLBACKS
  const { 
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery(
    ['invoices', effectiveUserId, effectiveUserRole, effectiveOrganizationId],
    () => {
      console.log('🔄 Fetching invoices:', { 
        userId: effectiveUserId, 
        userRole: effectiveUserRole, 
        organizationId: effectiveOrganizationId 
      });
      return invoiceService.getAll(effectiveUserId, effectiveUserRole, effectiveOrganizationId);
    },
    {
      enabled: !!user,
      staleTime: 0,
      refetchOnMount: true,
      onSuccess: (data) => {
        console.log('✅ Invoices loaded:', data?.length || 0);
        if (data?.length > 0) {
          console.log('📊 Sample invoice:', data[0]);
        }
      },
      onError: (err) => {
        console.error('❌ Error fetching invoices:', err);
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
        queryClient.invalidateQueries(['invoices', user?.uid, userRole, organizationId]);
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

  const getExistingBillingPeriods = useCallback((rentId) => {
    const periodSet = new Set();
    if (!rentId) return periodSet;

    invoices
      .filter(inv => inv.rentId === rentId)
      .forEach(inv => {
        let month = typeof inv.billingMonth === 'number' ? inv.billingMonth : undefined;
        let year = typeof inv.billingYear === 'number' ? inv.billingYear : undefined;

        if (month === undefined || year === undefined) {
          const referenceDate = inv.invoiceDate instanceof Date
            ? inv.invoiceDate
            : inv.createdAt instanceof Date
              ? inv.createdAt
              : inv.dueDate instanceof Date
                ? inv.dueDate
                : null;

          if (referenceDate && !Number.isNaN(referenceDate.getTime())) {
            month = referenceDate.getMonth();
            year = referenceDate.getFullYear();
          }
        }

        if (month !== undefined && year !== undefined) {
          periodSet.add(`${year}-${month}`);
        }
      });

    return periodSet;
  }, [invoices]);

  const buildLeasePeriodOptions = useCallback((rent) => {
    if (!rent) return [];
    const today = new Date();

    const leaseStartSource = rent.leaseStart || rent.startDate || rent.createdAt;
    let leaseStartDate = leaseStartSource ? new Date(leaseStartSource) : new Date(today.getFullYear(), today.getMonth(), 1);
    if (Number.isNaN(leaseStartDate.getTime())) {
      leaseStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    leaseStartDate = new Date(leaseStartDate.getFullYear(), leaseStartDate.getMonth(), 1);

    const leaseEndSource = rent.leaseEnd || rent.endDate;
    let leaseEndDate = leaseEndSource ? new Date(leaseEndSource) : null;
    if (!leaseEndDate || Number.isNaN(leaseEndDate.getTime())) {
      leaseEndDate = new Date(today.getFullYear(), today.getMonth() + 12, 1);
    } else {
      leaseEndDate = new Date(leaseEndDate.getFullYear(), leaseEndDate.getMonth(), 1);
    }

    if (leaseEndDate < leaseStartDate) {
      leaseEndDate = new Date(leaseStartDate);
    }

    const usedPeriods = getExistingBillingPeriods(rent.id);
    const options = [];
    const cursor = new Date(leaseStartDate);
    let guard = 0;

    while (cursor <= leaseEndDate && guard < 240) {
      const month = cursor.getMonth();
      const year = cursor.getFullYear();
      const key = `${year}-${month}`;

      options.push({
        key,
        month,
        year,
        label: format(cursor, 'MMMM yyyy'),
        disabled: usedPeriods.has(key),
      });

      cursor.setMonth(cursor.getMonth() + 1);
      guard += 1;
    }

    return options;
  }, [getExistingBillingPeriods]);

  const formatLeasePeriod = useCallback((rent) => {
    if (!rent) return 'N/A';
    const startSource = rent.leaseStart || rent.startDate || rent.createdAt;
    const endSource = rent.leaseEnd || rent.endDate;

    const startDate = startSource ? new Date(startSource) : null;
    const endDate = endSource ? new Date(endSource) : null;

    const startLabel = startDate && !Number.isNaN(startDate.getTime()) ? format(startDate, 'MMM yyyy') : 'N/A';
    const endLabel = endDate && !Number.isNaN(endDate.getTime()) ? format(endDate, 'MMM yyyy') : 'Ongoing';
    return `${startLabel} - ${endLabel}`;
  }, []);

  useEffect(() => {
    if (invoiceRentContext && invoicePeriodDialogOpen) {
      const options = buildLeasePeriodOptions(invoiceRentContext);
      setAvailableBillingPeriods(options);

      setInvoicePeriodSelection((prev) => {
        const currentKey = prev && prev.year !== null && prev.month !== null
          ? `${prev.year}-${prev.month}`
          : null;
        const currentValid = currentKey
          ? options.some(option => option.key === currentKey && !option.disabled)
          : false;

        if (currentValid) {
          return prev;
        }

        const firstAvailable = options.find(option => !option.disabled);
        if (firstAvailable) {
          return { month: firstAvailable.month, year: firstAvailable.year };
        }

        return { month: null, year: null };
      });

      if (!invoiceDialogToastShownRef.current) {
        if (options.length === 0) {
          toast.error('No billing periods available for this lease.');
          invoiceDialogToastShownRef.current = true;
        } else if (options.every(option => option.disabled)) {
          toast.error('All billing periods for this lease already have invoices.');
          invoiceDialogToastShownRef.current = true;
        }
      }
    }
  }, [invoiceRentContext, invoicePeriodDialogOpen, invoices, buildLeasePeriodOptions]);

  // Early return conditions - AFTER all hooks are called
  if (rentLoading || propertiesLoading || paymentsLoading || invoicesLoading) {
    return <LoadingSpinner message="Loading rent management data..." />;
  }

  if (rentError || propertiesError || paymentsError || invoicesError) {
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
      invoiceId: '',
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
    if (!newPayment.invoiceId || !newPayment.amount) {
      toast.error('Please select an invoice and enter amount');
      return;
    }
    
    // Only send fields that are allowed by the backend validation schema
    const paymentData = {
      invoiceId: newPayment.invoiceId,
      rentId: newPayment.rentId,
      propertyId: selectedRent?.propertyId,
      organizationId: effectiveOrganizationId, // CRITICAL: Must include organizationId for queries to work
      tenantName: selectedRent?.tenantName, // For display on payments page
      propertyName: selectedRent?.propertyName, // For display on payments page
      amount: parseFloat(newPayment.amount),
      paymentDate: newPayment.paymentDate,
      paymentMethod: newPayment.paymentMethod,
      transactionId: newPayment.transactionId || '',
      notes: newPayment.notes || '',
      lateFee: 0,
      status: 'completed',
    };
    
    const amountLabel = Number.isFinite(paymentData.amount)
      ? ` of UGX ${paymentData.amount.toLocaleString()}`
      : '';
    const tenantLabel = selectedRent?.tenantName ? ` for ${selectedRent.tenantName}` : '';
    if (!confirmAction(`Record payment${amountLabel}${tenantLabel}?`)) {
      return;
    }

    createPaymentMutation.mutate(paymentData);
  };

  const openInvoiceDialogForRent = (rent) => {
    if (!rent) return;
    invoiceDialogToastShownRef.current = false;
    setInvoiceRentContext(rent);
    setInvoicePeriodDialogOpen(true);
  };

  const closeInvoiceDialog = () => {
    setInvoicePeriodDialogOpen(false);
    setInvoiceRentContext(null);
    setAvailableBillingPeriods([]);
    setInvoicePeriodSelection({ month: null, year: null });
    invoiceDialogToastShownRef.current = false;
  };

  const handleInvoicePeriodSelect = (event) => {
    const value = event.target.value;
    if (!value) {
      setInvoicePeriodSelection({ month: null, year: null });
      return;
    }
    const [yearStr, monthStr] = value.split('-');
    const parsedMonth = Number(monthStr);
    const parsedYear = Number(yearStr);
    if (!Number.isNaN(parsedMonth) && !Number.isNaN(parsedYear)) {
      setInvoicePeriodSelection({ month: parsedMonth, year: parsedYear });
    }
  };

  const handleInvoiceCreation = async () => {
    if (!invoiceRentContext) return;
    if (invoicePeriodSelection.month === null || invoicePeriodSelection.year === null) {
      toast.error('Select a billing period to continue.');
      return;
    }

    const selectionKey = `${invoicePeriodSelection.year}-${invoicePeriodSelection.month}`;
    const selectedOption = availableBillingPeriods.find(option => option.key === selectionKey);

    if (!selectedOption) {
      toast.error('Selected billing period is no longer available.');
      return;
    }

    if (selectedOption.disabled) {
      toast.error('Selected billing period already has an invoice.');
      return;
    }

    try {
      setInvoiceCreationLoading(true);

      const billingDate = new Date(invoicePeriodSelection.year, invoicePeriodSelection.month, 1);
      const lastDayOfMonth = new Date(invoicePeriodSelection.year, invoicePeriodSelection.month + 1, 0).getDate();
      const dueDay = invoiceRentContext.paymentDueDate || 1;
      const dueDate = new Date(
        invoicePeriodSelection.year,
        invoicePeriodSelection.month,
        Math.min(dueDay, lastDayOfMonth)
      );
      const invoiceNumber = `INV-${format(billingDate, 'yyyyMM')}-${(invoiceRentContext.id || '').toString().slice(-4).padStart(4, '0')}`;

      const invoicePayload = {
        rentId: invoiceRentContext.id,
        invoiceNumber,
        tenantName: invoiceRentContext.tenantName,
        tenantId: invoiceRentContext.tenantId || null,
        propertyName: invoiceRentContext.propertyName,
        propertyId: invoiceRentContext.propertyId,
        spaceName: invoiceRentContext.spaceName,
        organizationId: invoiceRentContext.organizationId || effectiveOrganizationId || null,
        invoiceDate: new Date(),
        totalAmount: invoiceRentContext.monthlyRent,
        amountDue: invoiceRentContext.monthlyRent,
        amountPaid: 0,
        dueDate,
        status: 'pending',
        description: `Monthly rent for ${invoiceRentContext.propertyName}${invoiceRentContext.spaceName ? ` - ${invoiceRentContext.spaceName}` : ''} (${format(billingDate, 'MMMM yyyy')})`,
        billingMonth: invoicePeriodSelection.month,
        billingYear: invoicePeriodSelection.year,
        billingPeriodLabel: format(billingDate, 'MMMM yyyy'),
      };

      const result = await invoiceService.create(
        invoicePayload,
        effectiveUserId,
        effectiveUserRole,
        effectiveOrganizationId
      );

      if (result) {
        toast.success(`Invoice generated for ${invoiceRentContext.tenantName}`);
        queryClient.invalidateQueries(['invoices', effectiveUserId, effectiveUserRole, effectiveOrganizationId]);
        queryClient.invalidateQueries(['invoices']);
        closeInvoiceDialog();
      }
    } catch (error) {
      toast.error(`Failed to generate invoice: ${error.message}`);
    } finally {
      setInvoiceCreationLoading(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const selectedBillingKey = invoicePeriodSelection.year !== null && invoicePeriodSelection.month !== null
    ? `${invoicePeriodSelection.year}-${invoicePeriodSelection.month}`
    : '';
  const selectedBillingOption = selectedBillingKey
    ? availableBillingPeriods.find(option => option.key === selectedBillingKey)
    : null;
  const selectionDisabled = selectedBillingOption ? selectedBillingOption.disabled : false;

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
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => openInvoiceDialogForRent(rent)}
                        >
                          Generate Invoice
                        </Button>
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
                <TableCell><strong>Payment Details</strong></TableCell>
                <TableCell><strong>Invoice & Supplier</strong></TableCell>
                <TableCell><strong>Amount & Method</strong></TableCell>
                <TableCell><strong>Installment</strong></TableCell>
                <TableCell><strong>Payment Date</strong></TableCell>
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
                payments.map((payment, idx) => {
                  const cashRef = getCashRef(payment, idx);
                  const invoiceNum = getInvoiceNumber(payment);
                  const supplier = payment.tenantName || payment.propertyName || '—';
                  const dt = formatDateTime(payment.paymentDate);
                  return (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {cashRef}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Paid by: {user?.displayName || 'PM ADMIN'} ({payment.userId || effectiveUserId || '—'})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {invoiceNum}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {supplier}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(payment.amount)}
                        </Typography>
                        <Chip
                          label={payment.paymentMethod?.replace('_', ' ') || 'cash'}
                          size="small"
                          variant="outlined"
                          sx={{ mt: 0.5 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          Payment #{idx + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{dt.date}</Typography>
                        <Typography variant="caption" color="text.secondary" display="block">{dt.time}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="View Receipt">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setLastCreatedPayment(payment);
                                setReceiptDialogOpen(true);
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rent Receipt">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setLastCreatedPayment(payment);
                                setRentReceiptDialogOpen(true);
                              }}
                            >
                              <Receipt />
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

      {/* Invoice Billing Period Dialog */}
      <Dialog
        open={invoicePeriodDialogOpen}
        onClose={(event, reason) => {
          if (invoiceCreationLoading) {
            return;
          }
          closeInvoiceDialog();
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Select Billing Period</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose the month and year within the lease period to invoice {invoiceRentContext?.tenantName || 'this tenant'}.
          </Typography>
          <FormControl
            fullWidth
            margin="normal"
            disabled={availableBillingPeriods.length === 0}
          >
            <InputLabel>Billing Period *</InputLabel>
            <Select
              value={selectedBillingKey}
              label="Billing Period *"
              onChange={handleInvoicePeriodSelect}
              displayEmpty
              renderValue={(value) => {
                if (!value) {
                  return (
                    <Typography variant="body2" color="text.secondary">
                      Select billing period
                    </Typography>
                  );
                }
                const option = availableBillingPeriods.find(opt => opt.key === value);
                return option ? option.label : value;
              }}
            >
              <MenuItem value="" disabled>
                Select billing period
              </MenuItem>
              {availableBillingPeriods.map(option => (
                <MenuItem key={option.key} value={option.key} disabled={option.disabled}>
                  {option.label}
                  {option.disabled && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      (Invoiced)
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
            {availableBillingPeriods.length === 0 && (
              <FormHelperText error>
                No billing periods are available for this lease. Confirm the lease dates.
              </FormHelperText>
            )}
            {availableBillingPeriods.length > 0 && availableBillingPeriods.every(option => option.disabled) && (
              <FormHelperText error>
                All billing periods for this lease already have invoices.
              </FormHelperText>
            )}
          </FormControl>
          {invoiceRentContext && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Lease period: {formatLeasePeriod(invoiceRentContext)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeInvoiceDialog} disabled={invoiceCreationLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleInvoiceCreation}
            variant="contained"
            disabled={invoiceCreationLoading || !selectedBillingKey || selectionDisabled}
          >
            {invoiceCreationLoading ? 'Generating...' : 'Generate Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

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

      {/* Rent Receipt Dialog */}
      <RentReceipt
        payment={lastCreatedPayment}
        open={rentReceiptDialogOpen}
        onClose={() => setRentReceiptDialogOpen(false)}
      />

      {/* Invoice Dialog */}
      <CorporatePaymentSlip
        payment={invoiceData}
        property={null}
        tenant={null}
        open={invoiceDialogOpen}
        onClose={() => setInvoiceDialogOpen(false)}
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
                    // Find matching invoice for this rent agreement
                    const matchingInvoice = invoices.find(inv => inv.rentId === e.target.value && inv.status !== 'paid');
                    setNewPayment(prev => ({ 
                      ...prev, 
                      rentId: e.target.value,
                      invoiceId: matchingInvoice?.id || '',
                      amount: matchingInvoice?.amountDue || selectedRentRecord?.monthlyRent || ''
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
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Invoice *</InputLabel>
                <Select
                  value={newPayment.invoiceId}
                  label="Invoice *"
                  onChange={(e) => {
                    const selectedInvoice = invoices.find(inv => inv.id === e.target.value);
                    setNewPayment(prev => ({ 
                      ...prev, 
                      invoiceId: e.target.value,
                      amount: selectedInvoice?.amountDue || ''
                    }));
                  }}
                  disabled={!newPayment.rentId}
                >
                  {invoices
                    .filter(inv => inv.rentId === newPayment.rentId && inv.status !== 'paid')
                    .map(invoice => (
                      <MenuItem key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {formatCurrency(invoice.amountDue)} due
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
                  <MenuItem value="mobile_money_mtn">Mobile Money MTN</MenuItem>
                  <MenuItem value="mobile_money_airtel">Mobile Money Airtel</MenuItem>
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

