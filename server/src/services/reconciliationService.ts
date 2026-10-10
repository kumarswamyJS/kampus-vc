import { Payment } from '../models/Payment';
import { FinancialLedgerEntry } from '../models/FinancialLedgerEntry';
import { ReconciliationLog } from '../models/ReconciliationLog';

export const runFinancialReconciliation = async (triggeredByUserId?: string) => {
  const runId = `rec_${Date.now()}`;
  const capturedPayments = await Payment.find({ status: 'captured' });

  let matchedCount = 0;
  let discrepanciesCount = 0;

  for (const payment of capturedPayments) {
    const ledgerEntry = await FinancialLedgerEntry.findOne({
      projectId: payment.projectId,
      milestoneId: payment.milestoneId,
      eventType: payment.isSimulation ? 'funded_simulated' : 'funded_verified',
    });

    if (ledgerEntry && ledgerEntry.amount === payment.amount) {
      matchedCount += 1;
    } else {
      discrepanciesCount += 1;
    }
  }

  const summary = `Reconciliation completed for ${capturedPayments.length} captured payments. Matched: ${matchedCount}, Discrepancies: ${discrepanciesCount}.`;

  const log = await ReconciliationLog.create({
    runId,
    inspectedPaymentsCount: capturedPayments.length,
    matchedCount,
    discrepanciesCount,
    summary,
    triggeredByUserId,
  });

  return log;
};
