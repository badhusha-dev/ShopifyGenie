import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaTrash, FaSave, FaBalanceScale } from 'react-icons/fa';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AnimatedCard from '../components/ui/AnimatedCard';
import { designTokens } from '../design/tokens';
import { apiRequest } from '../lib/queryClient';

// Form Schema
const journalLineSchema = z.object({
  accountId: z.string().min(1, "Account is required"),
  description: z.string().optional(),
  debitAmount: z.coerce.number().min(0).optional(),
  creditAmount: z.coerce.number().min(0).optional(),
});

const manualJournalSchema = z.object({
  transactionDate: z.string().min(1, "Transaction date is required"),
  reference: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  lines: z.array(journalLineSchema).min(2, "At least 2 journal lines required"),
}).refine((data) => {
  const totalDebits = data.lines.reduce((sum, line) => sum + (line.debitAmount || 0), 0);
  const totalCredits = data.lines.reduce((sum, line) => sum + (line.creditAmount || 0), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01;
}, {
  message: "Total debits must equal total credits",
  path: ["lines"]
});

type ManualJournalFormData = z.infer<typeof manualJournalSchema>;

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
}

const ManualJournalEntry = () => {
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  // Fetch accounts for dropdown
  const { data: accounts = [], isLoading: loadingAccounts } = useQuery<Account[]>({
    queryKey: ['/accounts'],
  });

  // Create manual journal entry mutation
  const createJournalMutation = useMutation({
    mutationFn: async (data: ManualJournalFormData) => {
      return apiRequest('/api/journal-entries/manual', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/journal-entries'] });
      reset();
      setShowPreview(false);
    },
  });

  // Form handling
  const { register, control, handleSubmit, watch, reset, formState: { errors } } = useForm<ManualJournalFormData>({
    resolver: zodResolver(manualJournalSchema),
    defaultValues: {
      transactionDate: new Date().toISOString().split('T')[0],
      lines: [
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 },
        { accountId: '', description: '', debitAmount: 0, creditAmount: 0 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines"
  });

  const watchedLines = watch('lines');

  // Calculate totals
  const totalDebits = watchedLines?.reduce((sum, line) => sum + (line.debitAmount || 0), 0) || 0;
  const totalCredits = watchedLines?.reduce((sum, line) => sum + (line.creditAmount || 0), 0) || 0;
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

  const addLine = () => {
    append({ accountId: '', description: '', debitAmount: 0, creditAmount: 0 });
  };

  const onSubmit = (data: ManualJournalFormData) => {
    if (showPreview) {
      createJournalMutation.mutate(data);
    } else {
      setShowPreview(true);
    }
  };

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ color: designTokens.colors.primary }}>
            <FaBalanceScale className="me-2" />
            Manual Journal Entry
          </h2>
          <p className="text-muted mt-1">Create manual journal entries with double-entry validation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          {/* Left Column - Journal Entry Form */}
          <div className="col-lg-8">
            <AnimatedCard>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">Journal Entry Details</h5>
              </div>
              <div className="card-body">
                {/* Basic Information */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <label className="form-label">Transaction Date *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.transactionDate ? 'is-invalid' : ''}`}
                      {...register('transactionDate')}
                      data-testid="input-transaction-date"
                    />
                    {errors.transactionDate && (
                      <div className="invalid-feedback">{errors.transactionDate.message}</div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Reference</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., INV-001, PO-123"
                      {...register('reference')}
                      data-testid="input-reference"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Description *</label>
                  <textarea
                    className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                    rows={2}
                    placeholder="Describe the journal entry purpose"
                    {...register('description')}
                    data-testid="textarea-description"
                  />
                  {errors.description && (
                    <div className="invalid-feedback">{errors.description.message}</div>
                  )}
                </div>

                {/* Journal Lines */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="mb-0">Journal Lines</h6>
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={addLine}
                    data-testid="button-add-line"
                  >
                    <FaPlus className="me-1" />
                    Add Line
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '25%' }}>Account</th>
                        <th style={{ width: '25%' }}>Description</th>
                        <th style={{ width: '20%' }}>Debit</th>
                        <th style={{ width: '20%' }}>Credit</th>
                        <th style={{ width: '10%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fields.map((field, index) => (
                        <tr key={field.id}>
                          <td>
                            <select
                              className={`form-select form-select-sm ${errors.lines?.[index]?.accountId ? 'is-invalid' : ''}`}
                              {...register(`lines.${index}.accountId`)}
                              data-testid={`select-account-${index}`}
                            >
                              <option value="">Select Account</option>
                              {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                  {account.accountCode} - {account.accountName}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Line description"
                              {...register(`lines.${index}.description`)}
                              data-testid={`input-line-description-${index}`}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-control form-control-sm"
                              placeholder="0.00"
                              {...register(`lines.${index}.debitAmount`)}
                              data-testid={`input-debit-${index}`}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-control form-control-sm"
                              placeholder="0.00"
                              {...register(`lines.${index}.creditAmount`)}
                              data-testid={`input-credit-${index}`}
                            />
                          </td>
                          <td>
                            {fields.length > 2 && (
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => remove(index)}
                                data-testid={`button-remove-line-${index}`}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th colSpan={2}>Totals:</th>
                        <th className="text-end">
                          <span className={totalDebits > 0 ? 'text-success fw-bold' : ''}>
                            ${totalDebits.toFixed(2)}
                          </span>
                        </th>
                        <th className="text-end">
                          <span className={totalCredits > 0 ? 'text-success fw-bold' : ''}>
                            ${totalCredits.toFixed(2)}
                          </span>
                        </th>
                        <th>
                          {isBalanced && totalDebits > 0 ? (
                            <span className="badge bg-success">Balanced</span>
                          ) : (
                            <span className="badge bg-warning">Unbalanced</span>
                          )}
                        </th>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {errors.lines && (
                  <div className="alert alert-danger">
                    {errors.lines.message}
                  </div>
                )}
              </div>
            </AnimatedCard>
          </div>

          {/* Right Column - Preview & Summary */}
          <div className="col-lg-4">
            <AnimatedCard>
              <div className="card-header bg-info text-white">
                <h6 className="mb-0">Entry Summary</h6>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <small className="text-muted">Total Debits</small>
                  <div className="h4 text-success">${totalDebits.toFixed(2)}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Total Credits</small>
                  <div className="h4 text-primary">${totalCredits.toFixed(2)}</div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Difference</small>
                  <div className={`h5 ${isBalanced ? 'text-success' : 'text-danger'}`}>
                    ${Math.abs(totalDebits - totalCredits).toFixed(2)}
                  </div>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Status</small>
                  <div>
                    {isBalanced && totalDebits > 0 ? (
                      <span className="badge bg-success">Ready to Post</span>
                    ) : (
                      <span className="badge bg-warning">Needs Balancing</span>
                    )}
                  </div>
                </div>

                <hr />

                {/* Action Buttons */}
                <div className="d-grid gap-2">
                  {!showPreview ? (
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!isBalanced || totalDebits === 0}
                      data-testid="button-preview"
                    >
                      <FaBalanceScale className="me-2" />
                      Preview Entry
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="btn btn-success"
                        disabled={createJournalMutation.isPending}
                        data-testid="button-post"
                      >
                        <FaSave className="me-2" />
                        {createJournalMutation.isPending ? 'Posting...' : 'Post Entry'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPreview(false)}
                        data-testid="button-edit"
                      >
                        Edit Entry
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn btn-outline-danger"
                    onClick={() => {
                      reset();
                      setShowPreview(false);
                    }}
                    data-testid="button-clear"
                  >
                    Clear Form
                  </button>
                </div>
              </div>
            </AnimatedCard>

            {/* Validation Tips */}
            <AnimatedCard className="mt-3">
              <div className="card-body">
                <h6 className="card-title">Double-Entry Rules</h6>
                <ul className="list-unstyled small">
                  <li className="mb-1">
                    <span className="text-success">✓</span> Total debits must equal total credits
                  </li>
                  <li className="mb-1">
                    <span className="text-success">✓</span> At least 2 journal lines required
                  </li>
                  <li className="mb-1">
                    <span className="text-success">✓</span> Each line needs an account
                  </li>
                  <li className="mb-1">
                    <span className="text-success">✓</span> Either debit or credit amount required
                  </li>
                </ul>
              </div>
            </AnimatedCard>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ManualJournalEntry;