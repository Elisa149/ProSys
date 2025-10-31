# 🧾 Rent Receipt Feature

## Overview

A new handwritten-style rent receipt component has been added to the Property Management System. This receipt format follows a traditional two-column layout with detailed payee and payer information, perfect for printing and record-keeping.

## 📍 Locations

The Rent Receipt component is now available in two pages:

### **1. Payments Page** (`/app/payments`)
- **Location**: Actions column in payment history table
- **Icon**: 🧾 Green Receipt icon
- **Tooltip**: "Rent Receipt"
- **Action**: Opens RentReceipt dialog

### **2. Rent Management Page** (`/app/rent`)
- **Location**: Actions column in payment history table
- **Icon**: 🧾 Green Receipt icon  
- **Tooltip**: "Rent Receipt"
- **Action**: Opens RentReceipt dialog

## 🎨 Design Features

### **Layout Structure**

The receipt follows a traditional handwritten-style format:

#### **Header Section**
- Property Management System title
- Kampala, Uganda location
- Caretaker contact information
- Large underlined "RENT RECEIPT" title

#### **Left Column - Payee & Payment Information**

**Payee Information:**
- Name: Property name or Property Management System
- Address: Kampala, Uganda

**Payer Information:**
- Name: Tenant name
- Address: Property name

**Payment Details Box:**
- Date: Payment date (YYYY-MM-DD)
- Time: Payment time (HH:mm:ss)
- Receipt #: Auto-generated receipt number (RCP-YYYYMMDD-HHMMSS-XXXX)
- Payment Method checkboxes:
  - ✓ Cash
  - ✓ Cheque
  - ✓ Bank Card
  - ✓ Mobile Money MTN
  - ✓ Mobile Money Airtel
- Rent for the period: Month and year
- Amount: Amount in UGX
- Amount in Words: Converted to text
- Transaction ID: If available
- Person Responsible with signature line

#### **Right Column - Verification & Notes**

**QR Code:**
- Payment verification QR code
- Scannable payment details

**Important Notes:**
- This receipt serves as proof of Payment
- Three dotted lines for additional notes

**Description:**
- Monthly rent payment description
- Tenant name
- Additional note line

## 🖨️ Print Functionality

### **Print Features:**
- ✅ A4 page optimization
- ✅ Clean print layout
- ✅ Automatic print dialog
- ✅ Removes UI elements when printing
- ✅ Professional appearance on paper
- ✅ All colors print correctly
- ✅ No page breaks inside sections

### **How to Print:**
1. Click the Rent Receipt button (🧾) on any payment
2. Review the receipt in the dialog
3. Click "Print" button
4. Print dialog opens automatically
5. Select printer and print

## 📋 Receipt Number Format

Auto-generated receipt numbers follow this format:
```
RCP-YYYYMMDD-HHMMSS-XXXX
```

Example: `RCP-20241215-143025-7892`

## 🔍 QR Code Verification

The QR code contains:
- Receipt number
- Payment ID
- Amount
- Tenant name
- Property name
- Payment date
- Payment method
- Organization ID

Scan the QR code with any QR reader app to verify payment details.

## 💾 Data Display

### **Payment Data Used:**
- `payment.propertyName` - Property name
- `payment.tenantName` - Tenant name
- `payment.amount` - Payment amount
- `payment.paymentMethod` - Payment method
- `payment.paymentDate` - Payment date
- `payment.transactionId` - Transaction ID (if available)
- `payment.lateFee` - Late fees (included in description)

### **Auto-Generated Fields:**
- Receipt number (RCP-*-*-*)
- QR code
- Amount in words (using numberToWords utility)
- Payment date/time

## 🎯 Comparison with Other Receipts

### **PaymentReceipt (Standard)**
- Modern digital layout
- Two-column grid
- Detailed breakdown
- Color-coded sections
- Professional corporate look

### **RentReceipt (NEW)**
- Handwritten-style format
- Traditional layout
- Simplified design
- Classic receipt appearance
- Perfect for physical filing

### **CorporatePaymentSlip**
- Business invoice format
- Detailed tax breakdowns
- Payment instructions
- Corporate branding

## 🔧 Technical Details

### **Component File:**
- Location: `src/components/RentReceipt.jsx`
- Props: `payment`, `open`, `onClose`

### **Integration Points:**

**PaymentsPage.jsx:**
- Import: Added `import RentReceipt from '../components/RentReceipt'`
- State: Added `rentReceiptDialogOpen`
- Handler: Added `handleViewRentReceipt`
- Button: Added green Receipt icon
- Dialog: Added `<RentReceipt />` component

**RentPage.jsx:**
- Import: Added `import RentReceipt from '../components/RentReceipt'`
- State: Added `rentReceiptDialogOpen`
- Button: Added green Receipt icon
- Dialog: Added `<RentReceipt />` component

### **Dependencies:**
- Material-UI (`@mui/material`, `@mui/icons-material`)
- QRCode library (`qrcode`)
- date-fns (`format`)
- `../utils/numberToWords` (Amount in words conversion)

## ✅ Features Summary

- ✅ Traditional handwritten-style layout
- ✅ Two-column design (Payment info + Verification)
- ✅ Auto-generated receipt numbers
- ✅ QR code for verification
- ✅ Amount in words conversion
- ✅ Payment method checkboxes
- ✅ Signature line
- ✅ Important notes section
- ✅ Professional print layout
- ✅ A4 page optimization
- ✅ Clean print output
- ✅ Responsive design
- ✅ Mobile-friendly

## 📝 Usage Examples

### **From Payments Page:**
1. Navigate to `/app/payments`
2. Find the payment in the history table
3. Click the 🧾 green Receipt icon
4. Receipt opens in dialog
5. Click "Print" to print

### **From Rent Page:**
1. Navigate to `/app/rent`
2. Go to "Payments History" tab
3. Find the payment
4. Click the 🧾 green Receipt icon
5. Receipt opens in dialog
6. Click "Print" to print

### **Integration:**
```jsx
<RentReceipt
  payment={selectedPayment}
  open={rentReceiptDialogOpen}
  onClose={() => setRentReceiptDialogOpen(false)}
/>
```

## 🎨 Visual Guide

### **Buttons Layout:**

```
Actions Column:
┌──────────────────────────────────────────┐
│ [👁️ View] [🏢 Corporate] [🖨️ Print] [🧾] │
│                                           │
│  Standard receipts:                      │
│  👁️ View Details                          │
│  🏢 Corporate Invoice                     │
│  🖨️ Print Receipt                         │
│                                           │
│  NEW:                                    │
│  🧾 Rent Receipt (Green)                 │
└──────────────────────────────────────────┘
```

### **Receipt Layout:**

```
┌─────────────────────────────────────────────────────────┐
│         Property Management System                       │
│         Kampala, Uganda                                  │
│         Caretaker: +256 XXX XXX XXX                     │
│                                                          │
│                    RENT RECEIPT                         │
│                    ─────────                            │
│                                                          │
│  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ PAYEE INFORMATION   │  │   QR CODE               │  │
│  │ Name: _____________ │  │                         │  │
│  │ Address: __________ │  │   [QR CODE IMAGE]       │  │
│  │                     │  │                         │  │
│  │ PAYER INFORMATION   │  │   IMPORTANT NOTES:      │  │
│  │ Name: _____________ │  │   • Receipt serves as   │  │
│  │ Address: __________ │  │     proof of payment    │  │
│  │                     │  │   ─ ─ ─ ─ ─ ─ ─ ─ ─    │  │
│  │ PAYMENT DETAILS     │  │                         │  │
│  │ ┌─────────────────┐ │  │   DESCRIPTION:          │  │
│  │ │ Date: __________│ │  │   Monthly rent payment │  │
│  │ │ Time: __________│ │  │   [Tenant name]        │  │
│  │ │ Receipt: _______│ │  │   __________           │  │
│  │ │                 │ │  └─────────────────────────┘  │
│  │ │ Payment Method: │ │                               │
│  │ │ ☐ Cash          │ │                               │
│  │ │ ☐ Cheque        │ │                               │
│  │ │ ☒ Bank Card     │ │                               │
│  │ │ ☐ Mobile MTN    │ │                               │
│  │ │ ☐ Mobile Airtel │ │                               │
│  │ │                 │ │                               │
│  │ │ Rent Period: ___│ │                               │
│  │ │ Amount: ______  │ │                               │
│  │ │ Amount Words:   │ │                               │
│  │ │ [Amount text]   │ │                               │
│  │ │ Transaction ID: │ │                               │
│  │ │ _____________   │ │                               │
│  │ │ Person: ______  │ │                               │
│  │ │ ______________  │ │                               │
│  │ └─────────────────┘ │                               │
│  └─────────────────────┘                               │
│                                                          │
│  Footer: Generated by Property Management System        │
└─────────────────────────────────────────────────────────┘
```

## 🚀 Future Enhancements

Possible future improvements:
- [ ] Email receipt functionality
- [ ] PDF download option
- [ ] Customizable company header
- [ ] Multiple language support
- [ ] Batch printing
- [ ] Receipt templates
- [ ] Automatic archival
- [ ] Digital signature integration

## 📞 Support

For issues or questions about the Rent Receipt feature:
- Check the console for errors
- Verify payment data is complete
- Ensure QR code library is installed
- Test print functionality in different browsers

---

**Created**: December 2024  
**Component**: `RentReceipt.jsx`  
**Integration**: PaymentsPage, RentPage  
**Style**: Handwritten-style receipt with QR code verification

