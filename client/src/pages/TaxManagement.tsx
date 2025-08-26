import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FaPlus, FaEdit, FaTrash, FaFileAlt, FaPercent, FaCalendarAlt } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AnimatedCard from '../components/ui/AnimatedCard';
import DataTable, { type Column } from '../components/ui/DataTable';
import { designTokens } from '../design/tokens';
import { apiRequest } from '../lib/queryClient';

// Form Schema
const taxRateSchema = z.object({
  name: z.string().min(1, "Tax name is required"),
  type: z.enum(['vat', 'gst', 'sales_tax', 'excise']),
  rate: z.coerce.number().min(0).max(1, "Rate must be between 0 and 1"),
  region: z.string().optional(),
  accountId: z.string().min(1, "Tax account is required"),
  effectiveFrom: z.string().min(1, "Effective date is required"),
  effectiveTo: z.string().optional(),
  isActive: z.boolean().default(true)
});

type TaxRateFormData = z.infer<typeof taxRateSchema>;

interface TaxRate {
  id: string;
  name: string;
  type: string;
  rate: string;
  region?: string;
  accountId: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface TaxReport {
  period: string;
  totalSales: string;
  taxableAmount: string;
  taxCollected: string;
  taxPaid: string;
  taxOwed: string;
  breakdown: Array<{
    taxType: string;
    taxableAmount: string;
    taxAmount: string;
  }>;
}

interface Account {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: string;
}

const TaxManagement = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('Q1 2024');
  
  const queryClient = useQueryClient();

  // Fetch tax rates
  const { data: taxRates = [], isLoading: loadingRates } = useQuery<TaxRate[]>({
    queryKey: ['/api/tax-rates'],
  });

  // Fetch accounts (liability accounts for tax payable)
  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ['/api/accounts'],
    select: (data) => data.filter(account => 
      account.accountType === 'liability' && 
      (account.accountName.toLowerCase().includes('tax') || 
       account.accountName.toLowerCase().includes('payable'))
    )
  });

  // Fetch tax report
  const { data: taxReport, isLoading: loadingReport } = useQuery<TaxReport>({
    queryKey: ['/api/tax-report', { period: reportPeriod }],
    enabled: showReport,
  });

  // Create/Update tax rate mutation
  const saveTaxRateMutation = useMutation({
    mutationFn: async (data: TaxRateFormData) => {
      if (editingTaxRate) {
        const response = await fetch(`/api/tax-rates/${editingTaxRate.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update tax rate');
        return response.json();
      } else {
        const response = await fetch('/api/tax-rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create tax rate');
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tax-rates'] });
      setShowModal(false);
      setEditingTaxRate(null);
      reset();
    },
  });

  // Form handling
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TaxRateFormData>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      type: 'sales_tax',
      isActive: true,
      effectiveFrom: new Date().toISOString().split('T')[0]
    }
  });

  const handleEdit = (taxRate: TaxRate) => {
    setEditingTaxRate(taxRate);
    setValue('name', taxRate.name);
    setValue('type', taxRate.type as any);
    setValue('rate', parseFloat(taxRate.rate));
    setValue('region', taxRate.region || '');
    setValue('accountId', taxRate.accountId);
    setValue('effectiveFrom', taxRate.effectiveFrom.split('T')[0]);
    setValue('effectiveTo', taxRate.effectiveTo ? taxRate.effectiveTo.split('T')[0] : '');
    setValue('isActive', taxRate.isActive);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingTaxRate(null);
    reset({
      type: 'sales_tax',
      isActive: true,
      effectiveFrom: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const onSubmit = (data: TaxRateFormData) => {
    saveTaxRateMutation.mutate(data);
  };

  const taxRateColumns: Column[] = [
    {
      key: 'name',
      label: 'Tax Name',
      render: (value, taxRate: TaxRate) => (
        <div>
          <div className="fw-bold">{taxRate.name}</div>
          {taxRate.region && (
            <small className="text-muted">{taxRate.region}</small>
          )}
        </div>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (value, taxRate: TaxRate) => (
        <span className="badge bg-info">
          {taxRate.type.toUpperCase()}
        </span>
      )
    },
    {
      key: 'rate',
      label: 'Rate',
      render: (value, taxRate: TaxRate) => (
        <span className="fw-bold">
          {(parseFloat(taxRate.rate) * 100).toFixed(2)}%
        </span>
      )
    },
    {
      key: 'effectiveFrom',
      label: 'Effective Period',
      render: (taxRate) => (
        <div>
          <div>From: {new Date(taxRate.effectiveFrom).toLocaleDateString()}</div>
          {taxRate.effectiveTo && (
            <div>To: {new Date(taxRate.effectiveTo).toLocaleDateString()}</div>
          )}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (taxRate) => (
        <span className={`badge ${taxRate.isActive ? 'bg-success' : 'bg-secondary'}`}>
          {taxRate.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (taxRate) => (
        <div className="d-flex gap-1">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => handleEdit(taxRate)}
            data-testid={`button-edit-${taxRate.id}`}
          >
            <FaEdit />
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            data-testid={`button-delete-${taxRate.id}`}
          >
            <FaTrash />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0" style={{ color: designTokens.colors.shopify.green }}>
            <FaPercent className="me-2" />
            Tax Management
          </h2>
          <p className="text-muted mt-1">Manage tax rates and generate tax reports for compliance</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-info"
            onClick={() => setShowReport(!showReport)}
            data-testid="button-tax-report"
          >
            <FaFileAlt className="me-2" />
            {showReport ? 'Hide' : 'Show'} Tax Report
          </button>
          <button
            className="btn btn-primary"
            onClick={handleNew}
            data-testid="button-new-tax-rate"
          >
            <FaPlus className="me-2" />
            New Tax Rate
          </button>
        </div>
      </div>

      {/* Tax Report */}
      {showReport && (
        <AnimatedCard className="mb-4">
          <div className="card-header bg-info text-white">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Tax Report</h5>
              <select
                className="form-select form-select-sm w-auto"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                data-testid="select-report-period"
              >
                <option value="Q1 2024">Q1 2024</option>
                <option value="Q2 2024">Q2 2024</option>
                <option value="Q3 2024">Q3 2024</option>
                <option value="Q4 2024">Q4 2024</option>
                <option value="2024">Full Year 2024</option>
              </select>
            </div>
          </div>
          <div className="card-body">
            {loadingReport ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : taxReport ? (
              <>
                {/* Summary Cards */}
                <div className="row mb-4">
                  <div className="col-md-2">
                    <div className="card border-primary">
                      <div className="card-body text-center">
                        <h5 className="text-primary mb-0">
                          ${parseFloat(taxReport.totalSales).toFixed(0)}
                        </h5>
                        <small className="text-muted">Total Sales</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="card border-info">
                      <div className="card-body text-center">
                        <h5 className="text-info mb-0">
                          ${parseFloat(taxReport.taxableAmount).toFixed(0)}
                        </h5>
                        <small className="text-muted">Taxable Amount</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="card border-success">
                      <div className="card-body text-center">
                        <h5 className="text-success mb-0">
                          ${parseFloat(taxReport.taxCollected).toFixed(0)}
                        </h5>
                        <small className="text-muted">Tax Collected</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="card border-warning">
                      <div className="card-body text-center">
                        <h5 className="text-warning mb-0">
                          ${parseFloat(taxReport.taxPaid).toFixed(0)}
                        </h5>
                        <small className="text-muted">Tax Paid</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="card border-danger">
                      <div className="card-body text-center">
                        <h5 className="text-danger mb-0">
                          ${parseFloat(taxReport.taxOwed).toFixed(0)}
                        </h5>
                        <small className="text-muted">Tax Owed</small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tax Breakdown */}
                <h6>Tax Breakdown by Type:</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Tax Type</th>
                        <th>Taxable Amount</th>
                        <th>Tax Amount</th>
                        <th>Effective Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {taxReport.breakdown.map((item, index) => (
                        <tr key={index}>
                          <td className="fw-bold">{item.taxType}</td>
                          <td>${parseFloat(item.taxableAmount).toFixed(2)}</td>
                          <td className="text-success fw-bold">
                            ${parseFloat(item.taxAmount).toFixed(2)}
                          </td>
                          <td>
                            {((parseFloat(item.taxAmount) / parseFloat(item.taxableAmount)) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : null}
          </div>
        </AnimatedCard>
      )}

      {/* Tax Rates Table */}
      <AnimatedCard>
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">Tax Rates</h5>
        </div>
        <div className="card-body">
          {loadingRates ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <DataTable
              data={taxRates}
              columns={taxRateColumns}
              loading={false}
              emptyMessage="No tax rates found"
            />
          )}
        </div>
      </AnimatedCard>

      {/* Tax Rate Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  {editingTaxRate ? 'Edit Tax Rate' : 'New Tax Rate'}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                  data-testid="button-close-tax-modal"
                />
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6">
                      <label className="form-label">Tax Name *</label>
                      <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="e.g., California Sales Tax"
                        {...register('name')}
                        data-testid="input-tax-name"
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name.message}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tax Type *</label>
                      <select
                        className={`form-select ${errors.type ? 'is-invalid' : ''}`}
                        {...register('type')}
                        data-testid="select-tax-type"
                      >
                        <option value="sales_tax">Sales Tax</option>
                        <option value="vat">VAT</option>
                        <option value="gst">GST</option>
                        <option value="excise">Excise Tax</option>
                      </select>
                      {errors.type && (
                        <div className="invalid-feedback">{errors.type.message}</div>
                      )}
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Tax Rate * (as decimal)</label>
                      <div className="input-group">
                        <input
                          type="number"
                          step="0.0001"
                          min="0"
                          max="1"
                          className={`form-control ${errors.rate ? 'is-invalid' : ''}`}
                          placeholder="0.0825"
                          {...register('rate')}
                          data-testid="input-tax-rate"
                        />
                        <span className="input-group-text">%</span>
                      </div>
                      <small className="text-muted">0.0825 = 8.25%</small>
                      {errors.rate && (
                        <div className="invalid-feedback">{errors.rate.message}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Region</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., CA, UK, etc."
                        {...register('region')}
                        data-testid="input-tax-region"
                      />
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Tax Account *</label>
                      <select
                        className={`form-select ${errors.accountId ? 'is-invalid' : ''}`}
                        {...register('accountId')}
                        data-testid="select-tax-account"
                      >
                        <option value="">Select Account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.accountCode} - {account.accountName}
                          </option>
                        ))}
                      </select>
                      {errors.accountId && (
                        <div className="invalid-feedback">{errors.accountId.message}</div>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Effective From *</label>
                      <input
                        type="date"
                        className={`form-control ${errors.effectiveFrom ? 'is-invalid' : ''}`}
                        {...register('effectiveFrom')}
                        data-testid="input-effective-from"
                      />
                      {errors.effectiveFrom && (
                        <div className="invalid-feedback">{errors.effectiveFrom.message}</div>
                      )}
                    </div>
                  </div>

                  <div className="row mt-3">
                    <div className="col-md-6">
                      <label className="form-label">Effective To (Optional)</label>
                      <input
                        type="date"
                        className="form-control"
                        {...register('effectiveTo')}
                        data-testid="input-effective-to"
                      />
                      <small className="text-muted">Leave blank if no end date</small>
                    </div>
                    <div className="col-md-6 d-flex align-items-center">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          {...register('isActive')}
                          id="isActive"
                          data-testid="checkbox-is-active"
                        />
                        <label className="form-check-label" htmlFor="isActive">
                          Active
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                    data-testid="button-cancel-tax"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saveTaxRateMutation.isPending}
                    data-testid="button-save-tax"
                  >
                    <FaPercent className="me-2" />
                    {saveTaxRateMutation.isPending ? 'Saving...' : 'Save Tax Rate'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxManagement;