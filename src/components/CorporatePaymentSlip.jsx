import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Paper,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Print, Close, Download } from '@mui/icons-material';
import QRCode from 'qrcode';
import { format, addDays } from 'date-fns';
import { formatAmountInWords } from '../utils/numberToWords';

const CorporatePaymentSlip = ({ payment, property, tenant, open, onClose }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Generate invoice number
  useEffect(() => {
    if (payment) {
      const now = new Date();
      const dateStr = format(now, 'yyyyMMdd');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setInvoiceNumber(`INV-${dateStr}-${randomNum}`);
    }
  }, [payment]);

  // Generate QR code
  useEffect(() => {
    if (payment && invoiceNumber) {
      const qrData = {
        invoiceNumber,
        paymentId: payment.id,
        amount: payment.amount,
        tenantName: payment.tenantName || tenant?.companyName,
        propertyName: payment.propertyName || property?.name,
        dueDate: payment.dueDate,
        organizationId: payment.organizationId,
      };

      QRCode.toDataURL(JSON.stringify(qrData), {
        width: 200,
        margin: 2,
      })
        .then((url) => setQrCodeDataURL(url))
        .catch((err) => console.error('Error generating QR code:', err));
    }
  }, [payment, invoiceNumber, property, tenant]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    
    if (!printWindow) {
      alert('Please allow popups to print the payment slip');
      return;
    }
    
    const slipElement = document.querySelector('.corporate-slip-content');
    if (!slipElement) {
      console.error('Payment slip content not found');
      printWindow.close();
      return;
    }
    
    const slipClone = slipElement.cloneNode(true);
    
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Payment Slip - ${invoiceNumber}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0.5in;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              font-family: 'Arial', 'Helvetica', sans-serif;
              background: white;
              color: black;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              padding: 15px;
            }
            
            .corporate-slip-content {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            
            th, td {
              padding: 8px;
              text-align: left;
              border: 1px solid #ddd;
            }
            
            th {
              background-color: #f5f5f5 !important;
              font-weight: bold;
            }
            
            .header-section {
              background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
              color: white !important;
              padding: 20px !important;
              margin-bottom: 20px !important;
            }
            
            .section-title {
              background-color: #f5f5f5 !important;
              padding: 8px 12px !important;
              margin: 15px 0 10px 0 !important;
              font-weight: bold !important;
              border-left: 4px solid #1976d2 !important;
            }
            
            img {
              max-width: 150px !important;
              height: auto !important;
            }
            
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              body {
                padding: 10mm !important;
              }
              
              .corporate-slip-content {
                page-break-inside: avoid !important;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
            
            @media screen {
              body {
                background: #f5f5f5;
                padding: 20px;
              }
              
              .corporate-slip-content {
                background: white !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                max-width: 210mm !important;
                margin: 0 auto !important;
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body>
          ${slipClone.outerHTML}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  if (!payment) return null;

  const issueDate = new Date();
  const dueDate = payment.dueDate ? new Date(payment.dueDate) : addDays(issueDate, 7);
  const subtotal = payment.amount || 0;
  const lateFee = payment.lateFee || 0;
  const tax = 0; // Can be calculated based on requirements
  const total = subtotal + lateFee + tax;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Typography variant="h6">Corporate Payment Slip</Typography>
        <Box>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
            sx={{ mr: 1 }}
          >
            Print
          </Button>
          <Button
            variant="outlined"
            startIcon={<Close />}
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Paper
          className="corporate-slip-content"
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Header Section */}
          <Box
            className="header-section"
            sx={{
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              color: 'white',
              p: 3,
              mb: 3,
              borderRadius: '4px',
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={8}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  PAYMENT SLIP
                </Typography>
                <Typography variant="h6">
                  {property?.name || payment.propertyName || 'Property Management System'}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Professional Property Management Services
                </Typography>
              </Grid>
              <Grid item xs={4} sx={{ textAlign: 'right' }}>
                <Typography variant="h6" fontWeight="bold">
                  Invoice #
                </Typography>
                <Typography variant="h5" fontFamily="monospace">
                  {invoiceNumber}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Grid container spacing={3}>
            {/* Left Column - Bill To & From */}
            <Grid item xs={12} md={7}>
              {/* Bill From Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  className="section-title"
                  variant="subtitle1"
                  sx={{
                    bgcolor: '#f5f5f5',
                    p: 1,
                    fontWeight: 'bold',
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  BILL FROM (Property Owner/Manager)
                </Typography>
                <Box sx={{ mt: 1, pl: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {property?.name || payment.propertyName || 'Property Management Ltd.'}
                  </Typography>
                  <Typography variant="body2">
                    {property?.address || 'Kampala, Uganda'}
                  </Typography>
                  <Typography variant="body2">
                    Phone: +256 XXX XXX XXX
                  </Typography>
                  <Typography variant="body2">
                    Email: accounts@propertymanagement.com
                  </Typography>
                  <Typography variant="body2">
                    TIN: XXXXXXXXXX (Tax ID Number)
                  </Typography>
                </Box>
              </Box>

              {/* Bill To Section */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  className="section-title"
                  variant="subtitle1"
                  sx={{
                    bgcolor: '#f5f5f5',
                    p: 1,
                    fontWeight: 'bold',
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  BILL TO (Tenant/Company)
                </Typography>
                <Box sx={{ mt: 1, pl: 2 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {tenant?.companyName || payment.tenantName || 'Corporate Tenant'}
                  </Typography>
                  <Typography variant="body2">
                    Contact Person: {tenant?.contactPerson || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Address: {tenant?.address || property?.name || 'N/A'}
                  </Typography>
                  <Typography variant="body2">
                    Phone: {tenant?.phone || '+256 XXX XXX XXX'}
                  </Typography>
                  <Typography variant="body2">
                    Email: {tenant?.email || 'tenant@company.com'}
                  </Typography>
                  <Typography variant="body2">
                    TIN: {tenant?.tin || 'XXXXXXXXXX'}
                  </Typography>
                </Box>
              </Box>

              {/* Property Details */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  className="section-title"
                  variant="subtitle1"
                  sx={{
                    bgcolor: '#f5f5f5',
                    p: 1,
                    fontWeight: 'bold',
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  PROPERTY DETAILS
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5, pl: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Property Name:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {property?.name || payment.propertyName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Space/Unit:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {payment.spaceName || tenant?.spaceName || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Property Type:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {property?.propertyType || 'Commercial'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Floor Area:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {property?.area || 'N/A'} sq ft
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Right Column - Dates & QR */}
            <Grid item xs={12} md={5}>
              {/* Invoice Dates */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  className="section-title"
                  variant="subtitle1"
                  sx={{
                    bgcolor: '#f5f5f5',
                    p: 1,
                    fontWeight: 'bold',
                    borderLeft: '4px solid #1976d2',
                  }}
                >
                  PAYMENT INFORMATION
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5, pl: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Issue Date:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {format(issueDate, 'dd MMM yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Due Date:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {format(dueDate, 'dd MMM yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Billing Period:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {format(issueDate, 'MMMM yyyy')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Payment Terms:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {payment.paymentTerms || 'Net 7 Days'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* QR Code */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ color: '#1976d2' }}
                >
                  Quick Payment Verification
                </Typography>
                {qrCodeDataURL && (
                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 2,
                      border: '2px solid #1976d2',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <img
                      src={qrCodeDataURL}
                      alt="Payment QR Code"
                      style={{ maxWidth: '150px', height: 'auto' }}
                    />
                  </Box>
                )}
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Scan to verify payment details
                </Typography>
              </Box>

              {/* Payment Status */}
              <Box
                sx={{
                  border: '2px solid',
                  borderColor: payment.status === 'paid' ? 'success.main' : 'warning.main',
                  borderRadius: '4px',
                  p: 2,
                  textAlign: 'center',
                  bgcolor: payment.status === 'paid' ? 'success.light' : 'warning.light',
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  STATUS: {payment.status?.toUpperCase() || 'PENDING'}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Charges Breakdown Table */}
          <Box sx={{ mt: 3 }}>
            <Typography
              className="section-title"
              variant="subtitle1"
              sx={{
                bgcolor: '#f5f5f5',
                p: 1,
                fontWeight: 'bold',
                borderLeft: '4px solid #1976d2',
              }}
            >
              CHARGES BREAKDOWN
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell align="right"><strong>Period</strong></TableCell>
                    <TableCell align="right"><strong>Rate</strong></TableCell>
                    <TableCell align="right"><strong>Amount (UGX)</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Monthly Rent</TableCell>
                    <TableCell align="right">{format(issueDate, 'MMMM yyyy')}</TableCell>
                    <TableCell align="right">-</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {subtotal.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  {lateFee > 0 && (
                    <TableRow>
                      <TableCell>Late Payment Fee</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right">-</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                        {lateFee.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell colSpan={3} sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      TOTAL AMOUNT DUE
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#1976d2' }}>
                      UGX {total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Amount in Words */}
          <Box 
            sx={{ 
              mt: 2,
              p: 2,
              border: '2px solid #1976d2',
              borderRadius: '4px',
              bgcolor: '#e3f2fd',
            }}
          >
            <Typography 
              variant="body2" 
              color="text.secondary" 
              fontWeight="bold"
              gutterBottom
            >
              AMOUNT IN WORDS:
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: '#1976d2',
                fontStyle: 'italic',
                letterSpacing: '0.5px',
              }}
            >
              {formatAmountInWords(total)}
            </Typography>
          </Box>

          {/* Payment Method & Transaction ID */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  bgcolor: '#f9f9f9',
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>
                  PAYMENT METHOD:
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {payment.paymentMethod ? payment.paymentMethod.replace('_', ' ') : 'TO BE CONFIRMED'}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  {payment.paymentMethod === 'bank_transfer' && 'Bank Transfer/Deposit'}
                  {payment.paymentMethod === 'mobile_money' && 'Mobile Money (MTN/Airtel)'}
                  {payment.paymentMethod === 'cash' && 'Cash Payment'}
                  {payment.paymentMethod === 'check' && 'Cheque Payment'}
                  {payment.paymentMethod === 'credit_card' && 'Credit/Debit Card'}
                  {payment.paymentMethod === 'online' && 'Online Payment'}
                  {!payment.paymentMethod && 'Payment method pending'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  p: 2,
                  border: payment.transactionId ? '2px solid #4caf50' : '1px solid #e0e0e0',
                  borderRadius: '4px',
                  bgcolor: payment.transactionId ? '#f1f8f4' : '#f9f9f9',
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight="bold" gutterBottom>
                  TRANSACTION/REFERENCE ID:
                </Typography>
                {payment.transactionId ? (
                  <>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 'bold', 
                        fontFamily: 'monospace',
                        color: '#4caf50',
                        letterSpacing: '1px',
                      }}
                    >
                      {payment.transactionId}
                    </Typography>
                    <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                      ✓ Transaction verified
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body1" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                      Not provided yet
                    </Typography>
                    <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                      Please provide reference after payment
                    </Typography>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>

          {/* Payment Instructions */}
          <Box sx={{ mt: 3 }}>
            <Typography
              className="section-title"
              variant="subtitle1"
              sx={{
                bgcolor: '#f5f5f5',
                p: 1,
                fontWeight: 'bold',
                borderLeft: '4px solid #1976d2',
              }}
            >
              PAYMENT INSTRUCTIONS
            </Typography>
            <Grid container spacing={2} sx={{ mt: 0.5, pl: 2 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Bank Transfer Details:
                </Typography>
                <Typography variant="body2">Bank Name: Stanbic Bank Uganda</Typography>
                <Typography variant="body2">Account Name: Property Management Ltd</Typography>
                <Typography variant="body2" fontFamily="monospace">Account Number: 9030008123456</Typography>
                <Typography variant="body2">Swift Code: SBICUGKX</Typography>
                <Typography variant="body2">Branch: Kampala Main Branch</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Mobile Money:
                </Typography>
                <Typography variant="body2">MTN Mobile Money: 0782 XXX XXX</Typography>
                <Typography variant="body2">Airtel Money: 0752 XXX XXX</Typography>
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                  Reference: {invoiceNumber}
                </Typography>
                <Typography variant="caption" color="error.main" display="block" sx={{ mt: 1 }}>
                  * Please include invoice number in payment reference
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Terms and Conditions */}
          <Box sx={{ mt: 3 }}>
            <Typography
              className="section-title"
              variant="subtitle1"
              sx={{
                bgcolor: '#f5f5f5',
                p: 1,
                fontWeight: 'bold',
                borderLeft: '4px solid #1976d2',
              }}
            >
              TERMS & CONDITIONS
            </Typography>
            <Box sx={{ mt: 1, pl: 2 }}>
              <Typography variant="body2" gutterBottom>
                • Payment is due within 7 days of invoice date
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Late payment attracts a penalty of 5% per month on outstanding balance
              </Typography>
              <Typography variant="body2" gutterBottom>
                • Please send proof of payment to: accounts@propertymanagement.com
              </Typography>
              <Typography variant="body2" gutterBottom>
                • For queries, contact: +256 XXX XXX XXX (Mon-Fri, 8AM-5PM)
              </Typography>
              <Typography variant="body2" gutterBottom>
                • This is a computer-generated invoice and does not require a signature
              </Typography>
            </Box>
          </Box>

          {/* Notes Section */}
          {payment.notes && (
            <Box sx={{ mt: 3 }}>
              <Typography
                className="section-title"
                variant="subtitle1"
                sx={{
                  bgcolor: '#f5f5f5',
                  p: 1,
                  fontWeight: 'bold',
                  borderLeft: '4px solid #1976d2',
                }}
              >
                ADDITIONAL NOTES
              </Typography>
              <Box sx={{ mt: 1, pl: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: '4px' }}>
                <Typography variant="body2">{payment.notes}</Typography>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Footer */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Property Management System | Kampala, Uganda
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Phone: +256 XXX XXX XXX | Email: info@propertymanagement.com | Website: www.propertymanagement.com
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Generated on: {format(new Date(), 'dd MMM yyyy HH:mm:ss')}
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default CorporatePaymentSlip;

