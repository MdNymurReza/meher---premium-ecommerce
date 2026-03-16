import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Order } from '../types';
import { format } from 'date-fns';

export const generateInvoice = (order: Order) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(22);
  doc.setTextColor(26, 26, 26);
  doc.text('MEHER MALA', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text('Premium Jewellery & Apparel', 20, 37);

  // Invoice Label
  doc.setFontSize(18);
  doc.setTextColor(26, 26, 26);
  doc.text('INVOICE', pageWidth - 60, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Order ID: #${order.id.slice(-8).toUpperCase()}`, pageWidth - 60, 37);
  doc.text(`Date: ${format(order.createdAt?.toDate() || new Date(), 'dd MMM yyyy')}`, pageWidth - 60, 43);

  // Divider
  doc.setDrawColor(230, 230, 230);
  doc.line(20, 55, pageWidth - 20, 55);

  // Customer Details
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.text('Bill To:', 20, 70);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(order.customerName, 20, 78);
  doc.text(order.phone, 20, 84);
  doc.text(order.email, 20, 90);
  
  // Address wrap
  const addressLines = doc.splitTextToSize(order.address, 80);
  doc.text(addressLines, 20, 96);

  // Payment Info
  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.text('Payment Method:', pageWidth - 100, 70);
  
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text(order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'bKash Manual', pageWidth - 100, 78);
  if (order.transactionId) {
    doc.text(`TrxID: ${order.transactionId}`, pageWidth - 100, 84);
  }
  doc.text(`Status: ${order.status}`, pageWidth - 100, 90);

  // Table
  const tableData = order.products.map(item => [
    item.name + (item.size ? ` (${item.size})` : ''),
    item.quantity.toString(),
    `BDT ${item.price.toLocaleString()}`,
    `BDT ${(item.price * item.quantity).toLocaleString()}`
  ]);

  autoTable(doc, {
    startY: 120,
    head: [['Product', 'Qty', 'Price', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255] },
    styles: { fontSize: 9, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 35, halign: 'right' }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Summary
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  
  const summaryX = pageWidth - 100;
  doc.text('Subtotal:', summaryX, finalY);
  doc.text(`BDT ${order.subtotal.toLocaleString()}`, pageWidth - 20, finalY, { align: 'right' });

  if (order.discountAmount) {
    doc.text(`Discount (${order.discountCode}):`, summaryX, finalY + 7);
    doc.text(`- BDT ${order.discountAmount.toLocaleString()}`, pageWidth - 20, finalY + 7, { align: 'right' });
  }

  doc.text('Shipping:', summaryX, finalY + 14);
  doc.text(`BDT ${(order.shippingCost || 0).toLocaleString()}`, pageWidth - 20, finalY + 14, { align: 'right' });

  doc.setDrawColor(26, 26, 26);
  doc.setLineWidth(0.5);
  doc.line(summaryX, finalY + 18, pageWidth - 20, finalY + 18);

  doc.setFontSize(12);
  doc.setTextColor(26, 26, 26);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', summaryX, finalY + 25);
  doc.text(`BDT ${order.totalPrice.toLocaleString()}`, pageWidth - 20, finalY + 25, { align: 'right' });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for shopping with Meher Mala!', pageWidth / 2, finalY + 50, { align: 'center' });
  doc.text('For any queries, contact us at support@mehermala.com', pageWidth / 2, finalY + 56, { align: 'center' });

  doc.save(`Invoice_MeherMala_${order.id.slice(-8).toUpperCase()}.pdf`);
};
