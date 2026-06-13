const mongoose = require('mongoose');

const QuoteModel = mongoose.model('Quote');
const InvoiceModel = mongoose.model('Invoice');
const { calculate } = require('@/helpers');

/**
 * Converts a Quote to an Invoice.
 * Marks the quote as converted and creates a new Invoice document.
 */
const convert = async (req, res) => {
  const quote = await QuoteModel.findOne({ _id: req.params.id, removed: false });

  if (!quote) {
    return res.status(404).json({
      success: false,
      result: null,
      message: 'Quote not found',
    });
  }

  if (quote.converted) {
    return res.status(400).json({
      success: false,
      result: null,
      message: 'This quote has already been converted to an invoice',
    });
  }

  // Build invoice body from the quote
  const invoiceBody = {
    createdBy: req.admin._id,
    number: Date.now(), // temporary; ideally use last_invoice_number setting
    year: new Date().getFullYear(),
    date: new Date(),
    expiredDate: quote.expiredDate,
    client: quote.client._id || quote.client,
    items: quote.items,
    taxRate: quote.taxRate,
    subTotal: quote.subTotal,
    taxTotal: quote.taxTotal,
    total: quote.total,
    discount: quote.discount,
    currency: quote.currency,
    notes: quote.notes,
    status: 'draft',
    paymentStatus: 'unpaid',
    converted: { from: 'quote', quote: quote._id },
  };

  const invoice = await new InvoiceModel(invoiceBody).save();

  // Mark quote as converted
  await QuoteModel.findOneAndUpdate(
    { _id: req.params.id },
    { converted: true, convertedToInvoice: invoice._id, status: 'accepted' }
  );

  return res.status(200).json({
    success: true,
    result: invoice,
    message: 'Quote successfully converted to invoice',
  });
};

module.exports = convert;
