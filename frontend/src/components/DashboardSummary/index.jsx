import { Spin } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
} from '@ant-design/icons';
import { useMoney } from '@/settings';
import { useSelector } from 'react-redux';
import { selectMoneyFormat } from '@/redux/settings/selectors';
import useDashboardSummary from '@/hooks/useDashboardSummary';

/* ─── Tile configuration ──────────────────────────────────────────────── */
const TILE_CONFIG = [
  {
    key: 'paidTotal',
    label: 'Paid Invoices',
    icon: CheckCircleOutlined,
    accentColor: '#16a34a',       // green-600
    bgColor: '#f0fdf4',            // green-50
    borderColor: '#bbf7d0',        // green-200
    iconBg: '#dcfce7',             // green-100
    valueColor: '#15803d',         // green-700
  },
  {
    key: 'unpaidTotal',
    label: 'Unpaid Invoices',
    icon: CloseCircleOutlined,
    accentColor: '#dc2626',        // red-600
    bgColor: '#fef2f2',            // red-50
    borderColor: '#fecaca',        // red-200
    iconBg: '#fee2e2',             // red-100
    valueColor: '#b91c1c',         // red-700
  },
  {
    key: 'quotesTotal',
    label: 'Quotes',
    icon: FileTextOutlined,
    accentColor: '#2563eb',        // blue-600
    bgColor: '#eff6ff',            // blue-50
    borderColor: '#bfdbfe',        // blue-200
    iconBg: '#dbeafe',             // blue-100
    valueColor: '#1d4ed8',         // blue-700
  },
  {
    key: 'paymentsTotal',
    label: 'Payments Received',
    icon: DollarCircleOutlined,
    accentColor: '#7c3aed',        // violet-600
    bgColor: '#f5f3ff',            // violet-50
    borderColor: '#ddd6fe',        // violet-200
    iconBg: '#ede9fe',             // violet-100
    valueColor: '#6d28d9',         // violet-700
  },
];

/* ─── Single tile ─────────────────────────────────────────────────────── */
function SummaryTile({ config, value, isLoading, moneyFormatter, currency_code }) {
  const Icon = config.icon;

  return (
    <div
      className="dashboard-summary-tile"
      style={{
        background: config.bgColor,
        border: `1.5px solid ${config.borderColor}`,
        borderRadius: 14,
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = `0 8px 24px ${config.accentColor}22`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Decorative top stripe */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: config.accentColor,
          borderRadius: '14px 14px 0 0',
        }}
      />

      {/* Icon + label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: config.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon style={{ fontSize: 18, color: config.accentColor }} />
        </div>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {config.label}
        </span>
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: config.valueColor,
          letterSpacing: '-0.5px',
          minHeight: 38,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isLoading ? (
          <Spin size="small" />
        ) : (
          moneyFormatter({ amount: value ?? 0, currency_code })
        )}
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function DashboardSummary() {
  const { moneyFormatter, currency_code } = useMoney();
  const money_format_settings = useSelector(selectMoneyFormat);
  const { paidTotal, unpaidTotal, quotesTotal, paymentsTotal, isLoading } = useDashboardSummary();

  const values = { paidTotal, unpaidTotal, quotesTotal, paymentsTotal };

  return (
    <div style={{ width: '100%' }}>
      {/* Section heading */}
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: '#1e1b4b',
          marginBottom: 16,
          letterSpacing: '0.01em',
        }}
      >
        Dashboard Summary
      </h2>

      {/* 4-column grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
        }}
        className="dashboard-summary-grid"
      >
        {TILE_CONFIG.map((config) => (
          <SummaryTile
            key={config.key}
            config={config}
            value={values[config.key]}
            isLoading={isLoading}
            moneyFormatter={moneyFormatter}
            currency_code={money_format_settings?.default_currency_code}
          />
        ))}
      </div>
    </div>
  );
}
