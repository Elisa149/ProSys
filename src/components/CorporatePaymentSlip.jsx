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
              padding: 10px;
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
              margin: 15px 0;
            }
            
            th, td {
              padding: 10px;
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
              padding: 15px !important;
              margin-bottom: 20px !important;
              border-radius: 4px !important;
            }
            
            img {
              max-width: 120px !important;
              height: auto !important;
              display: block;
              margin: 0 auto;
            }
            
            .MuiPaper-root {
              background: white !important;
            }
            
            .MuiTypography-root {
              color: #333 !important;
            }
            
            .MuiBox-root {
              margin-bottom: 12px !important;
            }
            
            .MuiDivider-root {
              margin: 15px 0 !important;
              border-color: #333 !important;
            }
            
            /* Grid styling */
            .MuiGrid-container {
              margin: 0 !important;
            }
            
            /* Table container */
            .MuiTableContainer-root {
              margin-bottom: 20px !important;
              border: 1px solid #ddd !important;
              border-radius: 4px !important;
            }
            
            /* Amount box */
            .MuiBox-root {
              border: 3px solid #1976d2 !important;
              border-radius: 8px !important;
              padding: 20px !important;
              background: #f0f8ff !important;
              margin-bottom: 20px !important;
            }
            
            /* Notes box */
            .MuiBox-root {
              background: #fff9e6 !important;
              border: 1px solid #ffd700 !important;
              border-radius: 4px !important;
              padding: 15px !important;
            }
            
            @media print {
              @page {
                size: A4 portrait;
                margin: 12mm;
              }
              
              html, body {
                width: 210mm;
                height: 297mm;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              
              body {
                padding: 0 !important;
              }
              
              .corporate-slip-content {
                padding: 15px !important;
                margin: 0 !important;
                background: white !important;
                font-size: 12px !important;
              }
              
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              
              /* Ensure table borders print */
              table, th, td {
                border: 1px solid #333 !important;
                border-collapse: collapse !important;
              }
              
              /* Keep sections together */
              .MuiBox-root {
                page-break-inside: avoid !important;
              }
              
              /* Keep table together */
              .MuiTableContainer-root {
                page-break-inside: avoid !important;
              }
              
              /* Keep receipt on one page if possible */
              .corporate-slip-content {
                page-break-after: avoid !important;
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
            p: 2,
            border: '1px solid #e0e0e0',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Company Header */}
          <Box sx={{ textAlign: 'center', mb: 3, pb: 2 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {property?.name || payment.propertyName || 'Property Management Ltd.'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {property?.name || payment.propertyName || 'Property Management System'}
            </Typography>
            <Typography variant="body2">Kampala, Uganda</Typography>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              {tenant?.email || 'info@propertymanagement.com'}
            </Typography>
            <Typography variant="caption" display="block">
              {payment.propertyName || 'accounts@propertymanagement.com'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Document Title in Box */}
          <Box sx={{ border: '1px solid #333', p: 1.5, mb: 2, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold">
              RENT RECEIPT
            </Typography>
          </Box>

          {/* Reference Numbers */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold">
              {invoiceNumber}
            </Typography>
          </Box>

          {/* Received From */}
          <Typography variant="body2" fontWeight="bold" gutterBottom>
            RECEIVED FROM: {tenant?.companyName || payment.tenantName || 'Corporate Tenant'}
          </Typography>

          {/* Description */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              Description of payment:
            </Typography>
            <Typography variant="body2">
              Monthly rent payment for {format(issueDate, 'MMMM yyyy')} - Property: {property?.name || payment.propertyName || 'N/A'}
              {payment.spaceName && ` - Space: ${payment.spaceName}`}
            </Typography>
          </Box>

          {/* Payment Details */}
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              PAYMENT DETAILS
            </Typography>
            <Box sx={{ border: '1px solid #333', p: 2 }}>
              <Typography variant="body2" align="left" gutterBottom>
                Amount:
              </Typography>
              <Typography variant="h6" fontWeight="bold" align="left" sx={{ 
                textDecoration: 'underline',
                mb: 2
              }}>
                USh {total.toLocaleString()}
              </Typography>
              <Typography variant="body2" align="left" gutterBottom>
                Amount in words:
              </Typography>
              <Typography variant="body2" fontWeight="bold" align="left" sx={{ 
                textDecoration: 'underline',
                textTransform: 'uppercase'
              }}>
                {formatAmountInWords(total)}
              </Typography>
            </Box>
          </Box>

          {/* Status Checkboxes */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Quantity received according to order:
              {' □ YES  ■ NO'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Damages:
              {' ■ YES  □ NO'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              Payment received:
              {' ■ YES  □ NO'}
            </Typography>
          </Box>

          {/* QR Code */}
          {qrCodeDataURL && (
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img src={qrCodeDataURL} alt="QR Code" style={{ width: '100px', height: 'auto' }} />
            </Box>
          )}

          {/* Footer Table */}
          <TableContainer sx={{ mb: 2 }}>
            <Table size="small" sx={{ border: '1px solid #333' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #333', textAlign: 'center' }}>DATE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #333', textAlign: 'center' }}>M.O.P</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #333', textAlign: 'center' }}>AMOUNT</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #333', textAlign: 'center' }}>TRANS ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #333', textAlign: 'center' }}>NAME</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', border: '1px solid #333', textAlign: 'center' }}>SIGN</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ border: '1px solid #333', textAlign: 'center' }}>
                    {format(issueDate, 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #333', textAlign: 'center', textTransform: 'uppercase' }}>
                    {payment.paymentMethod ? 
                      payment.paymentMethod === 'mobile_money_mtn' ? 'Mobile Money MTN' :
                      payment.paymentMethod === 'mobile_money_airtel' ? 'Mobile Money Airtel' :
                      payment.paymentMethod.replace('_', ' ') 
                      : 'Cash'}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #333', textAlign: 'center' }}>
                    USh {total.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #333', textAlign: 'center' }}>
                    {payment.transactionId || '-'}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #333', textAlign: 'center' }}>
                    {tenant?.companyName || payment.tenantName || '-'}
                  </TableCell>
                  <TableCell sx={{ border: '1px solid #333' }}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default CorporatePaymentSlip;

