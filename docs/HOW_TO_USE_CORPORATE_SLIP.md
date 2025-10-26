# 🏢 How to Use Corporate Payment Slip

## 🚀 Quick Start Guide

The **Corporate Payment Slip** is now integrated into your Payments page and ready to use!

## 📍 Where to Find It

### **Payments Page** (`/app/payments`)

In the payment history table, each payment row has **three action buttons**:

1. 👁️ **View Details** (Eye icon) - Shows payment details dialog
2. 🏢 **Corporate Invoice** (Building icon - NEW!) - Opens corporate payment slip
3. 🖨️ **Print Receipt** (Printer icon) - Opens standard receipt

## 🎯 How to Use

### **Step 1: Navigate to Payments Page**
- Click **"Payments"** in the sidebar
- Or go to `/app/payments`

### **Step 2: Find the Payment**
- Use the search bar to find payments
- Filter by property, method, status, or date range
- All payments are listed in the table

### **Step 3: Open Corporate Slip**
- Click the **🏢 Business icon** (blue) in the Actions column
- Corporate Payment Slip dialog opens
- Professional invoice layout displayed

### **Step 4: Review the Slip**
The slip shows:
- ✅ Bill From (Property Owner) details
- ✅ Bill To (Tenant/Company) details
- ✅ Property details (name, unit, type, area)
- ✅ Payment dates (issue, due, billing period)
- ✅ Detailed charges breakdown table
- ✅ Payment instructions (bank & mobile money)
- ✅ QR code for verification
- ✅ Terms & conditions
- ✅ Payment status indicator

### **Step 5: Print or Close**
- Click **"Print"** button to print the slip
  - New window opens with clean invoice
  - Print dialog appears automatically
  - Only the slip prints (no UI elements)
- Click **"Close"** to return to payments page

## 🎨 Visual Guide

### **Payment Row Actions:**
```
┌─────────────┬──────────────┬────────────────────┐
│ Date        │ Tenant       │ Actions            │
├─────────────┼──────────────┼────────────────────┤
│ Oct 23 2025 │ ABC Corp Ltd │ 👁️  🏢  🖨️        │
│             │              │ View Corp Print    │
└─────────────┴──────────────┴────────────────────┘
```

### **Corporate Slip Dialog:**
```
┌─────────────────────────────────────────────┐
│  Corporate Payment Slip          [Print] [X]│
├─────────────────────────────────────────────┤
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │    PAYMENT SLIP      Invoice# INV-123 │ │
│  │  Property Management System           │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  BILL FROM                   PAYMENT INFO   │
│  Property Management Ltd     Issue: Oct 26  │
│  Kampala, Uganda            Due: Nov 02     │
│                                             │
│  BILL TO                     [QR CODE]      │
│  ABC Corporation Ltd         Scan to verify │
│  Contact: John Doe                          │
│                                             │
│  PROPERTY DETAILS            STATUS         │
│  Name: Corporate Plaza       ┌──────────┐   │
│  Unit: Floor 5, Suite 501    │ PENDING  │   │
│                              └──────────┘   │
│  CHARGES BREAKDOWN                          │
│  ┌─────────────────────────────────────┐   │
│  │ Item        │ Period  │ Amount      │   │
│  ├─────────────┼─────────┼─────────────┤   │
│  │ Monthly Rent│ Oct 2025│ 1,500,000   │   │
│  │ TOTAL       │         │ 1,500,000   │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  PAYMENT INSTRUCTIONS                       │
│  Bank: Stanbic Bank Uganda                  │
│  Acc: 9030008123456                        │
│  Mobile Money: 0782 XXX XXX                │
│  Reference: INV-123                        │
│                                             │
│  TERMS & CONDITIONS                         │
│  • Payment due within 7 days               │
│  • Late payment: 5% penalty                │
│  • Send proof to: accounts@...             │
│                                             │
└─────────────────────────────────────────────┘
```

## 🎯 Use Cases

### **1. For Corporate Tenants**
**When to use:**
- Monthly rent billing
- Lease renewals
- Corporate accounting needs
- Tax documentation
- Audit requirements

**Benefits:**
- Professional documentation
- Complete billing details
- Tax ID (TIN) numbers included
- Suitable for corporate books
- Easy payment tracking

### **2. For Commercial Properties**
**When to use:**
- Office space rentals
- Retail space billing
- Warehouse rentals
- Shopping mall units
- Business centers

**Benefits:**
- Detailed property information
- Multiple payment methods
- Clear payment terms
- Professional branding
- Legal protection

### **3. For Property Managers**
**When to use:**
- Managing business tenants
- Corporate client billing
- Professional invoicing
- Payment follow-ups
- Record keeping

**Benefits:**
- Easy tracking with invoice numbers
- Complete contact information
- Payment status at a glance
- Professional image
- Audit trail

## 📋 Customization Options

### **Adding Tenant Information**
If you have tenant data with company details:

```javascript
// Fetch tenant data
const tenant = {
  companyName: 'ABC Corporation Ltd',
  contactPerson: 'John Doe',
  address: 'P.O. Box 12345, Kampala',
  phone: '+256 782 123 456',
  email: 'accounts@abccorp.com',
  tin: '1234567890',
  spaceName: 'Floor 5, Suite 501'
};

// Pass to CorporatePaymentSlip
<CorporatePaymentSlip
  payment={payment}
  property={property}
  tenant={tenant}  // Add tenant data
  open={open}
  onClose={onClose}
/>
```

### **Customizing Payment Terms**
Add to payment data:

```javascript
payment: {
  ...otherData,
  paymentTerms: 'Net 30 Days',  // Custom payment terms
  dueDate: '2025-11-15',         // Custom due date
  lateFee: 75000,                // Late payment fee
  notes: 'Special instructions'  // Additional notes
}
```

## 🖨️ Printing Tips

### **For Best Results:**
1. **Enable background graphics** in print settings
2. **Use A4 paper size**
3. **Portrait orientation**
4. **Default margins** (0.5in)
5. **Color printing** for professional appearance

### **Print Shortcuts:**
- Windows: `Ctrl + P`
- Mac: `Cmd + P`

## 🔄 Workflow Example

### **Monthly Billing Process:**

1. **Generate Payments**
   - Record monthly rent payments
   - System auto-generates payment records

2. **Send Invoices**
   - Open Payments page
   - Click 🏢 Corporate Invoice for each tenant
   - Click Print
   - Email PDF to tenant

3. **Track Payments**
   - Use payment status (Pending/Paid)
   - Follow up on overdue payments
   - Update status when paid

4. **Record Keeping**
   - Print for company records
   - Attach to payment vouchers
   - File for audit purposes

## 📊 Comparison Table

| Feature | Standard Receipt | Corporate Slip |
|---------|-----------------|----------------|
| Target | Individual | Corporate |
| Detail Level | Basic | Comprehensive |
| Bank Details | No | Yes |
| Tax Info | Basic | TIN Numbers |
| Terms | Simple | Detailed |
| Breakdown | Summary | Table |
| Professional | ✅ | ✅✅✅ |
| Use Case | Quick receipt | Formal invoice |

## ❓ FAQs

**Q: Can I use both Receipt and Corporate Slip?**
A: Yes! Use Receipt for individuals and Corporate Slip for businesses.

**Q: How do I customize bank details?**
A: Edit the payment instructions section in `CorporatePaymentSlip.jsx`

**Q: Can I add my company logo?**
A: Yes, add an image tag in the header section.

**Q: Does it work on mobile?**
A: Yes, responsive design works on all devices.

**Q: Can I download as PDF?**
A: Use browser print to PDF option when printing.

**Q: How do I change the color scheme?**
A: Modify the `sx` styles in the component (currently blue #1976d2).

**Q: Can I add more payment methods?**
A: Yes, edit the payment instructions section.

**Q: Is the QR code secure?**
A: Yes, contains payment verification data (read-only).

## 🎉 Benefits Summary

### **For Tenants:**
✅ Professional documentation for accounting
✅ Clear payment instructions
✅ Multiple payment methods
✅ Easy tracking with invoice number
✅ Tax compliance (TIN included)

### **For Owners:**
✅ Professional brand image
✅ Complete payment tracking
✅ Easy follow-up
✅ Legal protection with T&C
✅ Audit-ready documentation

### **For Both:**
✅ QR code verification
✅ Complete contact information
✅ Clear communication
✅ Reduced disputes
✅ Better record keeping

---

**Start using Corporate Payment Slips today for professional invoicing!** 🏢✨

