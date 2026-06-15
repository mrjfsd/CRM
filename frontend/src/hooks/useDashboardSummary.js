import { useState, useEffect } from 'react';
import { request } from '@/request';

/**
 * useDashboardSummary
 *
 * Fetches summary totals from the existing backend summary endpoints:
 *   GET /api/invoice/summary  → { total, total_undue }
 *   GET /api/payment/summary  → { total, count }
 *   GET /api/quote/summary    → { total, count }
 *
 * Returns:
 *   paidTotal    – total value of all invoices minus unpaid remainder (= credit received)
 *   unpaidTotal  – total outstanding (unpaid/partially paid) invoice value
 *   quotesTotal  – total value of all quotes
 *   paymentsTotal – total payments received (from payment records)
 *   isLoading    – true while any request is in-flight
 *   error        – error string if any request failed
 *   refetch      – function to manually re-trigger all fetches
 */
export default function useDashboardSummary() {
  const [data, setData] = useState({
    paidTotal: 0,
    unpaidTotal: 0,
    quotesTotal: 0,
    paymentsTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [invoiceRes, paymentRes, quoteRes] = await Promise.all([
        request.summary({ entity: 'invoice' }),
        request.summary({ entity: 'payment' }),
        request.summary({ entity: 'quote' }),
      ]);

      const invoiceTotal = invoiceRes?.result?.total ?? 0;
      const invoiceUnpaid = invoiceRes?.result?.total_undue ?? 0;
      // Paid = all invoices minus the outstanding unpaid portion
      const paidTotal = Math.max(0, invoiceTotal - invoiceUnpaid);

      setData({
        paidTotal,
        unpaidTotal: invoiceUnpaid,
        quotesTotal: quoteRes?.result?.total ?? 0,
        paymentsTotal: paymentRes?.result?.total ?? 0,
      });
    } catch (err) {
      setError(err?.message || 'Failed to load summary data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return { ...data, isLoading, error, refetch: fetchAll };
}
