import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { Print, Close } from '@mui/icons-material';
import QRCode from 'qrcode';
import { format } from 'date-fns';
import { formatAmountInWords } from '../utils/numberToWords';

const PaymentReceipt = ({ payment, open, onClose }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Generate invoice number when component mounts
  useEffect(() => {
    if (payment) {
      // Generate invoice number: INV-YYYYMMDD-HHMMSS-XXXX
      const now = new Date();
      const dateStr = format(now, 'yyyyMMdd');
      const timeStr = format(now, 'HHmmss');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setInvoiceNumber(`INV-${dateStr}-${timeStr}-${randomNum}`);
    }
  }, [payment]);

  // Generate QR code (PMSR2 compact schema)
  useEffect(() => {
    if (payment && invoiceNumber) {
      const isoDate = payment.paymentDate ? new Date(payment.paymentDate).toISOString() : new Date().toISOString();
      const sanitize = (val) => String(val ?? '')
        .replace(/[\n\r]/g, ' ')
        .replace(/[;]/g, ' ')
        .trim();

      const qrString = [
        'PMSR2',
        `typ=payment`,
        `org=${sanitize(payment.organizationId)}`,
        `inv=${sanitize(invoiceNumber)}`,
        `pid=${sanitize(payment.id)}`,
        `amt=${sanitize(payment.amount)}`,
        `ccy=UGX`,
        `dt=${sanitize(isoDate)}`,
        `mtd=${sanitize(payment.paymentMethod || 'cash')}`,
        `ten=${sanitize(payment.tenantName)}`,
        `prop=${sanitize(payment.propertyName)}`,
        payment.transactionId ? `txn=${sanitize(payment.transactionId)}` : null,
      ].filter(Boolean).join(';');

      QRCode.toDataURL(qrString, {
        width: 150,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })
        .then((url) => {
          setQrCodeDataURL(url);
        })
        .catch((err) => {
          console.error('Error generating QR code:', err);
        });
    }
  }, [payment, invoiceNumber]);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups to print the receipt');
      return;
    }
    
    // Get the receipt content
    const receiptElement = document.querySelector('.receipt-content');
    if (!receiptElement) {
      console.error('Receipt content not found');
      printWindow.close();
      return;
    }
    
    // Clone the receipt content
    const receiptClone = receiptElement.cloneNode(true);
    
    // Create the print HTML with comprehensive styling
    const printHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Receipt - ${invoiceNumber}</title>
          <style>
            /* Page Setup for A4 */
            @page {
              size: A4 portrait;
              margin: 0.4in 0.5in;
            }
            
            /* Reset and Base Styles */
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
              background: white;
              color: black;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              padding: 10px;
            }
            
            /* Receipt Container */
            .receipt-content,
            .receipt-paper {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 10px !important;
              background: white !important;
              border: none !important;
              box-shadow: none !important;
              position: relative !important;
            }
            
            /* Ensure all text is black */
            .MuiTypography-root,
            p, span, div, h1, h2, h3, h4, h5, h6 {
              color: black !important;
            }
            
            /* Header with green background */
            .MuiBox-root[style*="background"] {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* QR Code */
            img {
              max-width: 120px !important;
              height: auto !important;
              display: block !important;
              margin: 0 auto !important;
            }
            
            /* Grid Layout */
            .MuiGrid-container {
              display: flex !important;
              flex-wrap: wrap !important;
            }
            
            .MuiGrid-item {
              flex-basis: 50% !important;
              max-width: 50% !important;
              padding: 8px !important;
            }
            
            /* Checkboxes */
            .MuiCheckbox-root {
              width: 14px !important;
              height: 14px !important;
              display: inline-block !important;
              margin-right: 4px !important;
            }
            
            .MuiSvgIcon-root {
              width: 14px !important;
              height: 14px !important;
            }
            
            /* Borders and Lines */
            [style*="border"] {
              border: 1px solid #000 !important;
            }
            
            [style*="borderBottom"] {
              border-bottom: 1px solid #000 !important;
            }
            
            /* Hide everything else on the page */
            .MuiDialog-root,
            .MuiDialog-paper,
            .MuiDialogTitle-root,
            .MuiDialogActions-root,
            .MuiBackdrop-root,
            button,
            .MuiButton-root,
            nav,
            header,
            footer:not(.receipt-footer),
            .MuiAppBar-root,
            .MuiDrawer-root {
              display: none !important;
            }
            
            /* Print Media Query */
            @media print {
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
              }
              
              body {
                padding: 0 !important;
                width: 210mm !important;
                max-width: 210mm !important;
              }
              
              .receipt-content,
              .receipt-paper {
                width: 100% !important;
                padding: 8px !important;
                page-break-inside: avoid !important;
              }
              
              /* Ensure colors print */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* No page breaks inside important elements */
              .MuiGrid-item,
              .MuiBox-root {
                page-break-inside: avoid !important;
              }
            }
            
            /* Screen Preview (before printing) */
            @media screen {
              body {
                background: #f5f5f5;
                padding: 20px;
              }
              
              .receipt-content,
              .receipt-paper {
                background: white !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
                max-width: 210mm !important;
                margin: 0 auto !important;
              }
            }
          </style>
        </head>
        <body>
          ${receiptClone.outerHTML}
          <script>
            // Auto-print when page loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Optional: close window after printing
                // Uncomment the next line if you want the window to close automatically
                // window.onafterprint = function() { window.close(); };
              }, 500);
            };
          </script>
        </body>
      </html>
    `;
    
    // Write the HTML to the new window
    printWindow.document.open();
    printWindow.document.write(printHTML);
    printWindow.document.close();
  };

  if (!payment) return null;

  const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date();
  const paymentTime = format(paymentDate, 'HH:mm:ss');
  const paymentDateFormatted = format(paymentDate, 'yyyy-MM-dd');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Payment Receipt</Typography>
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
          className="receipt-content receipt-paper"
          elevation={0}
          sx={{
            p: 1.5,
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            position: 'relative',
            maxWidth: '210mm', // A4 width
            minHeight: '280mm', // Slightly less than A4 height for margin
            '@media print': {
              maxWidth: '100%',
              minHeight: 'auto', // Let content determine height
              maxHeight: '100%',
              p: 1,
              boxShadow: 'none',
              border: 'none',
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '6px',
              backgroundColor: '#4caf50',
            },
          }}
        >
          {/* QR Top-Left */}
          {qrCodeDataURL && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                p: 0.6,
                border: '2px solid #e0e0e0',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
                '@media print': { top: 6, left: 6, p: 0.4 },
              }}
            >
              <img src={qrCodeDataURL} alt="Payment QR Code" style={{ maxWidth: '90px', height: 'auto' }} />
            </Box>
          )}
          {/* Property Title */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 1,
              '@media print': {
                mb: 0.8,
              },
            }}
          >
            <Typography 
              variant="h5" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                '@media print': {
                  fontSize: '1.1rem',
                },
                mb: 0.3,
              }}
            >
              {payment.propertyName || 'Property Management System'}
            </Typography>
            <Typography 
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                '@media print': {
                  fontSize: '0.75rem',
                },
                mb: 0.3,
              }}
            >
              Kampala, Uganda
            </Typography>
            <Typography 
              variant="body2"
              sx={{
                fontSize: '0.75rem',
                '@media print': {
                  fontSize: '0.65rem',
                },
                mb: 0.3,
              }}
            >
              Caretaker: +256 XXX XXX XXX | Email: info@propertymanagement.com
            </Typography>
          </Box>

          {/* Header */}
          <Box
            sx={{
              backgroundColor: '#26a69a',
              color: 'white',
              p: 1,
              mb: 1.5,
              textAlign: 'center',
              borderRadius: '4px',
              '@media print': {
                p: 0.8,
                mb: 1,
              },
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.3rem', md: '1.6rem' },
                '@media print': {
                  fontSize: '1.4rem',
                },
              }}
            >
              RENT RECEIPT
            </Typography>
          </Box>

          <Grid container spacing={1.5}>
            {/* Payee (Left) */}
            <Grid item xs={12} md={6}>
              {/* Payee Information */}
              <Box sx={{ mb: 1.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.4, 
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    '@media print': {
                      fontSize: '0.8rem',
                    },
                  }}
                >
                  PAYEE INFORMATION
                </Typography>
                <Box sx={{ mb: 0.8 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    NAME:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '14px',
                      mb: 0.3,
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {payment.propertyName || 'Property Management System'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    ADDRESS:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '14px',
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      Kampala, Uganda
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Payer (Right) */}
            <Grid item xs={12} md={6}>
              {/* Payer Information */}
              <Box sx={{ mb: 1.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.4, 
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    '@media print': {
                      fontSize: '0.8rem',
                    },
                  }}
                >
                  PAYER INFORMATION
                </Typography>
                <Box sx={{ mb: 0.8 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    NAME:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '14px',
                      mb: 0.3,
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {payment.tenantName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    ADDRESS:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '14px',
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {payment.propertyName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Payment Details (full width) */}
            <Grid item xs={12}>
              <Box sx={{ mb: 1.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.4, 
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    '@media print': {
                      fontSize: '0.8rem',
                    },
                  }}
                >
                  PAYMENT DETAILS
                </Typography>
                
                <Grid container spacing={0.8} sx={{ mb: 0.8 }}>
                  <Grid item xs={4}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      RECEIPT #:
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: '1px solid #000',
                        minHeight: '14px',
                        px: 0.5,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        fontFamily="monospace"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        {invoiceNumber}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      DATE:
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: '1px solid #000',
                        minHeight: '14px',
                        px: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        {paymentDateFormatted}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.7rem' }}
                    >
                      TIME:
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: '1px solid #000',
                        minHeight: '14px',
                        px: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        {paymentTime}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Grid container spacing={0.8}>
                  {/* Payment Method */}
                  <Grid item xs={6}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 0.3,
                        fontSize: '0.7rem',
                      }}
                    >
                      Payment Method:
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.15 }}>
                      {['cash', 'cheque', 'credit_card', 'bank_transfer', 'online', 'mobile_money_mtn', 'mobile_money_airtel'].map((method) => (
                        <FormControlLabel
                          key={method}
                          control={
                            <Checkbox
                              checked={payment.paymentMethod === method}
                              size="small"
                              sx={{ 
                                '& .MuiSvgIcon-root': { 
                                  fontSize: '0.7rem' 
                                },
                                py: 0,
                              }}
                            />
                          }
                          label={
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                textTransform: 'capitalize',
                                fontSize: '0.6rem',
                              }}
                            >
                              {method === 'mobile_money_mtn' ? 'Mobile Money MTN' : method === 'mobile_money_airtel' ? 'Mobile Money Airtel' : method.replace('_', ' ')}
                            </Typography>
                          }
                          sx={{ m: 0, py: 0 }}
                        />
                      ))}
                    </Box>
                  </Grid>

                  {/* Rent Specifics */}
                  <Grid item xs={6}>
                    <Box sx={{ mb: 0.4 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        RENT FOR THE PERIOD:
                      </Typography>
                      <Box
                        sx={{
                          borderBottom: '1px solid #000',
                          minHeight: '14px',
                          px: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                          {format(paymentDate, 'MMMM yyyy')}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 0.4 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        AMOUNT:
                      </Typography>
                      <Box
                        sx={{
                          borderBottom: '1px solid #000',
                          minHeight: '14px',
                          px: 0.5,
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          sx={{ fontSize: '0.7rem' }}
                        >
                          UGX {payment.amount?.toLocaleString() || '0'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 0.4 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        AMOUNT IN WORDS:
                      </Typography>
                      <Box
                        sx={{
                          border: '1px solid #000',
                          minHeight: '24px',
                          px: 0.5,
                          py: 0.3,
                          bgcolor: '#f9f9f9',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontSize: '0.65rem',
                            fontStyle: 'italic',
                            fontWeight: 'bold',
                          }}
                        >
                          {formatAmountInWords(payment.amount || 0)}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 0.4 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        PROPERTY TYPE:
                      </Typography>
                      <Box
                        sx={{
                          borderBottom: '1px solid #000',
                          minHeight: '14px',
                          px: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                          Rental Property
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ mb: 0.4 }}>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        LOCATION:
                      </Typography>
                      <Box
                        sx={{
                          borderBottom: '1px solid #000',
                          minHeight: '14px',
                          px: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                          {payment.propertyName || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography 
                        variant="body2" 
                        fontWeight="bold"
                        sx={{ fontSize: '0.7rem' }}
                      >
                        CITY, STATE, ZIP:
                      </Typography>
                      <Box
                        sx={{
                          borderBottom: '1px solid #000',
                          minHeight: '14px',
                          px: 0.5,
                        }}
                      >
                        <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                          Kampala, Uganda
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Transaction ID Section */}
                {payment.transactionId && (
                  <Box sx={{ mt: 0.8, pt: 0.8, borderTop: '1px solid #ddd' }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.7rem', mb: 0.4 }}
                    >
                      TRANSACTION/REFERENCE ID:
                    </Typography>
                    <Box
                      sx={{
                        border: '2px solid #4caf50',
                        borderRadius: '4px',
                        minHeight: '20px',
                        px: 0.8,
                        py: 0.4,
                        bgcolor: '#f1f8f4',
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.68rem',
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          color: '#4caf50',
                          letterSpacing: '0.3px',
                        }}
                      >
                        {payment.transactionId}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Notes + Description row under Payment Details */}
            <Grid item xs={12}>
              <Grid container spacing={1.5}>
                <Grid item xs={12} md={6}>
                  {/* Important Notes */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 0.4, 
                        textDecoration: 'underline',
                        fontSize: '0.9rem',
                        '@media print': {
                          fontSize: '0.8rem',
                        },
                      }}
                    >
                      IMPORTANT NOTES
                    </Typography>
                    <Box
                      sx={{
                        border: '1px solid #000',
                        minHeight: '60px',
                        p: 1,
                        backgroundColor: '#f9f9f9',
                        '@media print': {
                          minHeight: '55px',
                          p: 0.8,
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                        • This receipt serves as proof of payment for rent
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                        • Please keep this receipt for your records
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                        • For any queries, contact the property management office
                      </Typography>
                      {payment.notes && (
                        <>
                          <Divider sx={{ my: 0.3 }} />
                          <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                            Additional Notes:
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                            {payment.notes}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  {/* Description */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 0.4, 
                        textDecoration: 'underline',
                        fontSize: '0.9rem',
                        '@media print': {
                          fontSize: '0.8rem',
                        },
                      }}
                    >
                      DESCRIPTION
                    </Typography>
                    <Box
                      sx={{
                        border: '1px solid #000',
                        minHeight: '60px',
                        p: 1,
                        backgroundColor: '#f9f9f9',
                        '@media print': {
                          minHeight: '55px',
                          p: 0.8,
                        },
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        Monthly rent payment for {payment.propertyName || 'property'} 
                        for the period of {format(paymentDate, 'MMMM yyyy')}. 
                        Payment method: {payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH'}.
                        {payment.lateFee > 0 && (
                          <> Late fee of UGX {payment.lateFee.toLocaleString()} included.</>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} md={6}>

              {/* Important Notes */}
              <Box sx={{ mb: 1.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.4, 
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    '@media print': {
                      fontSize: '0.8rem',
                    },
                  }}
                >
                  IMPORTANT NOTES
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #000',
                    minHeight: '60px',
                    p: 1,
                    backgroundColor: '#f9f9f9',
                    '@media print': {
                      minHeight: '55px',
                      p: 0.8,
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                    • This receipt serves as proof of payment for rent
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                    • Please keep this receipt for your records
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                    • For any queries, contact the property management office
                  </Typography>
                  {payment.notes && (
                    <>
                      <Divider sx={{ my: 0.3 }} />
                      <Typography variant="body2" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>
                        Additional Notes:
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                        {payment.notes}
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {/* Description */}
              <Box sx={{ mb: 1.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.4, 
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    '@media print': {
                      fontSize: '0.8rem',
                    },
                  }}
                >
                  DESCRIPTION
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #000',
                    minHeight: '60px',
                    p: 1,
                    backgroundColor: '#f9f9f9',
                    '@media print': {
                      minHeight: '55px',
                      p: 0.8,
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: '0.7rem' }}>
                    Monthly rent payment for {payment.propertyName || 'property'} 
                    for the period of {format(paymentDate, 'MMMM yyyy')}. 
                    Payment method: {payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'CASH'}.
                    {payment.lateFee > 0 && (
                      <> Late fee of UGX {payment.lateFee.toLocaleString()} included.</>
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Signature */}
              <Box>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.4, 
                    textDecoration: 'underline',
                    fontSize: '0.9rem',
                    '@media print': {
                      fontSize: '0.8rem',
                    },
                  }}
                >
                  PERSON RESPONSIBLE
                </Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.4,
                    fontSize: '0.75rem',
                  }}
                >
                  SIGNATURE:
                </Typography>
                <Box
                  sx={{
                    borderBottom: '1px solid #000',
                    minHeight: '28px',
                    px: 0.5,
                    mb: 0.8,
                    '@media print': {
                      minHeight: '24px',
                    },
                  }}
                />
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem' }}
                >
                  Property Management System
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Footer */}
          <Box 
            className="receipt-footer"
            sx={{ 
              textAlign: 'center', 
              mt: 1.5, 
              pt: 0.8, 
              borderTop: '1px solid #e0e0e0',
              '@media print': {
                mt: 0.8,
                pt: 0.4,
              },
            }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.65rem', display: 'block', mb: 0.4 }}
            >
              Generated by Property Management System
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.65rem' }}
            >
              Caretaker: +256 XXX XXX XXX | Email: info@propertymanagement.com
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentReceipt;
