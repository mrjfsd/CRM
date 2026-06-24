import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col, Select } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';
import { useMoney } from '@/settings';
import calculate from '@/utils/calculate';

// ─── Unit of Measure options ───────────────────────────────────────────────
const UOM_OPTIONS = [
  { label: 'SQM – Square Meter',   value: 'SQM',  group: 'Area & Measurement' },
  { label: 'SQF – Square Foot',    value: 'SQF',  group: 'Area & Measurement' },
  { label: 'LM – Linear Meter',    value: 'LM',   group: 'Area & Measurement' },
  { label: 'LF – Linear Foot',     value: 'LF',   group: 'Area & Measurement' },

  { label: 'PCS – Pieces',         value: 'PCS',  group: 'Quantity & Itemized' },
  { label: 'UNIT – Unit',          value: 'UNIT', group: 'Quantity & Itemized' },
  { label: 'SET – Set',            value: 'SET',  group: 'Quantity & Itemized' },
  { label: 'LOT – Lot',            value: 'LOT',  group: 'Quantity & Itemized' },
  { label: 'NOS – Numbers',        value: 'NOS',  group: 'Quantity & Itemized' },
  { label: 'LUM – Lump Sum',       value: 'LUM',  group: 'Quantity & Itemized' },

  { label: 'KG – Kilogram',        value: 'KG',   group: 'Weight & Material' },
  { label: 'TON – Metric Ton',     value: 'TON',  group: 'Weight & Material' },
  { label: 'MT – Metric Tonne',    value: 'MT',   group: 'Weight & Material' },

  { label: 'HR – Hours',           value: 'HR',   group: 'Labor & Time' },
  { label: 'MD – Man-Days',        value: 'MD',   group: 'Labor & Time' },
  { label: 'MH – Man-Hours',       value: 'MH',   group: 'Labor & Time' },
  { label: 'WK – Week',            value: 'WK',   group: 'Labor & Time' },
  { label: 'MO – Month',           value: 'MO',   group: 'Labor & Time' },
];

// Group into Select optgroup structure
const UOM_GROUPED = UOM_OPTIONS.reduce((acc, opt) => {
  const group = acc.find((g) => g.label === opt.group);
  if (group) {
    group.options.push({ label: opt.label, value: opt.value });
  } else {
    acc.push({ label: opt.group, options: [{ label: opt.label, value: opt.value }] });
  }
  return acc;
}, []);

// Graceful fallback for legacy numeric values stored in older documents
const VALID_UOM_VALUES = UOM_OPTIONS.map((o) => o.value);
const normalisedUnit = (raw) => {
  if (raw && VALID_UOM_VALUES.includes(String(raw))) return String(raw);
  return 'PCS';
};

// ───────────────────────────────────────────────────────────────────────────

export default function ItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  const money = useMoney();

  const updateQt = (value) => setQuantity(value);
  const updatePrice = (value) => setPrice(value);

  useEffect(() => {
    if (current) {
      // When it accesses the /payment/ endpoint,
      // it receives an invoice.item instead of just item
      // and breaks the code, but now we can check if items exists,
      // and if it doesn't we can access invoice.items.
      const { items, invoice } = current;

      if (invoice) {
        const item = invoice[field.fieldKey];
        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      } else {
        const item = items[field.fieldKey];
        if (item) {
          setQuantity(item.quantity);
          setPrice(item.price);
        }
      }
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.multiply(price, quantity);
    setTotal(currentTotal);
  }, [price, quantity]);

  return (
    <Row gutter={[12, 12]} style={{ position: 'relative' }}>
      <Col className="gutter-row" span={5}>
        <Form.Item
          name={[field.name, 'itemName']}
          rules={[
            {
              required: true,
              message: 'Missing itemName name',
            },
            {
              pattern: /^(?!\s*$)[\s\S]+$/,
              message: 'Item Name must contain alphanumeric or special characters',
            },
          ]}
        >
          <Input placeholder="Item Name" />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={6}>
        <Form.Item name={[field.name, 'description']}>
          <Input placeholder="description Name" />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={2}>
        <Form.Item name={[field.name, 'quantity']} rules={[{ required: true }]}>
          <InputNumber style={{ width: '100%' }} min={0} onChange={updateQt} />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={3}>
        <Form.Item
          name={[field.name, 'unit']}
          initialValue="PCS"
          getValueProps={(value) => ({ value: normalisedUnit(value) })}
        >
          <Select
            showSearch
            placeholder="UOM"
            options={UOM_GROUPED}
            optionFilterProp="label"
            style={{ width: '100%' }}
          />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'price']} rules={[{ required: true }]}>
          <InputNumber
            className="moneyInput"
            onChange={updatePrice}
            min={0}
            controls={false}
            addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
            addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
          />
        </Form.Item>
      </Col>

      <Col className="gutter-row" span={4}>
        <Form.Item name={[field.name, 'total']}>
          <Form.Item>
            <InputNumber
              readOnly
              className="moneyInput"
              value={totalState}
              min={0}
              controls={false}
              addonAfter={money.currency_position === 'after' ? money.currency_symbol : undefined}
              addonBefore={money.currency_position === 'before' ? money.currency_symbol : undefined}
              formatter={(value) =>
                money.amountFormatter({ amount: value, currency_code: money.currency_code })
              }
            />
          </Form.Item>
        </Form.Item>
      </Col>

      <div style={{ position: 'absolute', right: '-20px', top: ' 5px' }}>
        <DeleteOutlined onClick={() => remove(field.name)} />
      </div>
    </Row>
  );
}
