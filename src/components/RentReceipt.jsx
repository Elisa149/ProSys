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

const RentReceipt = ({ payment, open, onClose }) => {
  const [qrCodeDataURL, setQrCodeDataURL] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Generate receipt number when component mounts
  useEffect(() => {
    if (payment) {
      // Generate receipt number: RCP-YYYYMMDD-HHMMSS-XXXX
      const now = new Date();
      const dateStr = format(now, 'yyyyMMdd');
      const timeStr = format(now, 'HHmmss');
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      setReceiptNumber(`RCP-${dateStr}-${timeStr}-${randomNum}`);
    }
  }, [payment]);

  // Generate QR code (PMSR2 compact schema)
  useEffect(() => {
    if (payment && receiptNumber) {
      // PMSR2 payload example:
      // PMSR2;typ=rent;org=<orgId>;inv=<receiptNumber>;pid=<paymentId>;amt=<amount>;ccy=UGX;dt=<ISO_DATE>;mtd=<method>;ten=<tenant>;prop=<property>;txn=<transactionId>
      const isoDate = payment.paymentDate ? new Date(payment.paymentDate).toISOString() : new Date().toISOString();
      const sanitize = (val) => String(val ?? '')
        .replace(/[\n\r]/g, ' ')
        .replace(/[;]/g, ' ')
        .trim();

      const qrString = [
        'PMSR2',
        `typ=rent`,
        `org=${sanitize(payment.organizationId)}`,
        `inv=${sanitize(receiptNumber)}`,
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
  }, [payment, receiptNumber]);

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups to print the receipt');
      return;
    }
    
    // Get the receipt content
    const receiptElement = document.querySelector('.rent-receipt-content');
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
          <title>Rent Receipt - ${receiptNumber}</title>
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
              font-family: 'Arial', 'Helvetica', sans-serif;
              background: white;
              color: black;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              padding: 10px;
            }
            
            /* Receipt Container */
            .rent-receipt-content,
            .rent-receipt-paper {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 auto !important;
              padding: 15px !important;
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
            footer:not(.rent-receipt-footer),
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
              
              .rent-receipt-content,
              .rent-receipt-paper {
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
              
              .rent-receipt-content,
              .rent-receipt-paper {
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
        <Typography variant="h6">Rent Receipt</Typography>
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
          className="rent-receipt-content rent-receipt-paper"
          elevation={0}
          sx={{
            p: 2,
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
            position: 'relative',
            maxWidth: '210mm', // A4 width
            '@media print': {
              maxWidth: '100%',
              p: 1.5,
              boxShadow: 'none',
              border: 'none',
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
          {/* Company Header */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 1.5,
            }}
          >
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1rem', md: '1.1rem' },
                '@media print': {
                  fontSize: '1rem',
                },
              }}
            >
              Property Management System
            </Typography>
            <Typography 
              variant="body2"
              sx={{
                fontSize: '0.85rem',
                '@media print': {
                  fontSize: '0.75rem',
                },
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
              }}
            >
              Caretaker: +256 XXX XXX XXX Email: info@propertymanagement.com
            </Typography>
          </Box>

          {/* RENT RECEIPT Title */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 2,
              position: 'relative',
            }}
          >
            <Typography 
              variant="h4" 
              fontWeight="bold"
              sx={{
                fontSize: { xs: '1.8rem', md: '2rem' },
                '@media print': {
                  fontSize: '1.8rem',
                },
                textDecoration: 'underline',
              }}
            >
              RENT RECEIPT
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {/* Payee (Left) */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.5, 
                    textDecoration: 'underline',
                    fontSize: '0.95rem',
                  }}
                >
                  PAYEE INFORMATION
                </Typography>
                
                <Box sx={{ mb: 0.8 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Name:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '18px',
                      mb: 0.5,
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {payment.propertyName || 'Property Management System'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 0.8 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Address:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '18px',
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      Kampala, Uganda
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Payer (Right) */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 1.5 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 0.5, 
                    textDecoration: 'underline',
                    fontSize: '0.95rem',
                  }}
                >
                  PAYER INFORMATION
                </Typography>
                
                <Box sx={{ mb: 0.8 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Name:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '18px',
                      mb: 0.5,
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {payment.tenantName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 0.8 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.8rem' }}
                  >
                    Address:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '18px',
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                      {payment.propertyName || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* Payment Details Section (full width) */}
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  mb: 1.5,
                  border: '1px solid #000',
                  p: 1,
                }}
              >
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  sx={{ 
                    mb: 1, 
                    textDecoration: 'underline',
                    fontSize: '0.95rem',
                  }}
                >
                  PAYMENT DETAILS
                </Typography>
                
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Date:
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: '1px solid #000',
                        minHeight: '16px',
                        px: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {paymentDateFormatted}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Time:
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: '1px solid #000',
                        minHeight: '16px',
                        px: 0.5,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                        {paymentTime}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Receipt:
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: '1px solid #000',
                        minHeight: '16px',
                        px: 0.5,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}
                      >
                        {receiptNumber}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Payment Method */}
                <Box sx={{ mt: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem', mb: 0.5 }}
                  >
                    Payment Methend:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {['cash', 'cheque', 'bank_card', 'mobile_money_mtn', 'mobile_money_airtel'].map((method) => (
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
                            }}
                          />
                        }
                        label={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.65rem',
                            }}
                          >
                            {method === 'bank_card' ? 'BANK CARD' :
                             method === 'mobile_money_mtn' ? 'MOBILE MONEY MTN' : 
                             method === 'mobile_money_airtel' ? 'MOBILE MONEY AIRTEL' : 
                             method.toUpperCase()}
                          </Typography>
                        }
                        sx={{ m: 0 }}
                      />
                    ))}
                  </Box>
                </Box>

                {/* Rent For The Period */}
                <Box sx={{ mt: 1.5 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Rent for the period:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '16px',
                      px: 0.5,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                      {format(paymentDate, 'MMMM yyyy')}
                    </Typography>
                  </Box>
                </Box>

                {/* Amount */}
                <Box sx={{ mt: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Amount:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '16px',
                      px: 0.5,
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      UGX {payment.amount?.toLocaleString() || '0'}
                    </Typography>
                  </Box>
                </Box>

                {/* Amount in Words */}
                <Box sx={{ mt: 1 }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Amount in Words:
                  </Typography>
                  <Box
                    sx={{
                      border: '1px solid #000',
                      minHeight: '28px',
                      px: 0.5,
                      py: 0.3,
                      bgcolor: '#f9f9f9',
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontSize: '0.7rem',
                        fontStyle: 'italic',
                      }}
                    >
                      {formatAmountInWords(payment.amount || 0)}
                    </Typography>
                  </Box>
                </Box>

                {/* Transaction ID */}
                {payment.transactionId && (
                  <Box sx={{ mt: 1 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ fontSize: '0.75rem' }}
                    >
                      Transaction ID:
                    </Typography>
                    <Box
                      sx={{
                        borderBottom: '1px solid #000',
                        minHeight: '16px',
                        px: 0.5,
                      }}
                    >
                      <Typography 
                        variant="body2" 
                        sx={{ fontSize: '0.7rem', fontFamily: 'monospace' }}
                      >
                        {payment.transactionId}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Person Responsible */}
                <Box sx={{ mt: 1.5, position: 'relative' }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: '0.75rem' }}
                  >
                    Person Responsible:
                  </Typography>
                  <Box
                    sx={{
                      borderBottom: '1px solid #000',
                      minHeight: '28px',
                      px: 0.5,
                      mb: 0.3,
                    }}
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ fontSize: '0.6rem', position: 'absolute', right: 0, top: '50%' }}
                  >
                    signature
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Notes and Description row under Payment Details */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {/* Important Notes */}
                  <Box 
                    sx={{ 
                      mb: 1.5,
                      border: '1px solid #000',
                      p: 1,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 0.5, 
                        textDecoration: 'underline',
                        fontSize: '0.95rem',
                      }}
                    >
                      IMPORTANT NOTES:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                      • This receipt serves as proof of Payment
                    </Typography>
                    <Box sx={{ borderBottom: '1px dashed #000', minHeight: '12px', mb: 0.3 }} />
                    <Box sx={{ borderBottom: '1px dashed #000', minHeight: '12px', mb: 0.3 }} />
                    <Box sx={{ borderBottom: '1px dashed #000', minHeight: '12px' }} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  {/* Description */}
                  <Box 
                    sx={{ 
                      border: '1px solid #000',
                      p: 1,
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 0.5, 
                        textDecoration: 'underline',
                        fontSize: '0.95rem',
                      }}
                    >
                      DESCRIPTION:
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                      Monthly rent payment
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.7rem', mb: 0.3 }}>
                      {payment.tenantName || 'N/A'}
                    </Typography>
                    <Box sx={{ borderBottom: '1px solid #000', minHeight: '12px' }} />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Footer */}
          <Box 
            className="rent-receipt-footer"
            sx={{ 
              textAlign: 'center', 
              mt: 2, 
              pt: 1, 
              borderTop: '1px solid #e0e0e0',
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.65rem' }}
            >
              Generated by Property Management System | Caretaker: +256 XXX XXX XXX | Email: info@propertymanagement.com
            </Typography>
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default RentReceipt;

