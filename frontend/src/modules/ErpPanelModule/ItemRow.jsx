import { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Row, Col } from 'antd';

import { DeleteOutlined } from '@ant-design/icons';
import { useMoney, useDate } from '@/settings';
import calculate from '@/utils/calculate';

export default function ItemRow({ field, remove, current = null }) {
  const [totalState, setTotal] = useState(undefined);
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [unit, setUnit] = useState(1);

  const money = useMoney();
  const updateQt = (value) => {
    setQuantity(value);
  };
  const updatePrice = (value) => {
    setPrice(value);
  };
  const updateUnit = (value) => {
    setUnit(value ?? 1);
  };

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
          setUnit(item.unit ?? 1);
          setPrice(item.price);
        }
      } else {
        const item = items[field.fieldKey];

        if (item) {
          setQuantity(item.quantity);
          setUnit(item.unit ?? 1);
          setPrice(item.price);
        }
      }
    }
  }, [current]);

  useEffect(() => {
    const currentTotal = calculate.multiply(calculate.multiply(price, unit), quantity);

    setTotal(currentTotal);
  }, [price, quantity, unit]);

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
              pattern: /^(?!\s*$)[\s\S]+$/, // Regular expression to allow spaces, alphanumeric, and special characters, but not just spaces
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
      <Col className="gutter-row" span={2}>
        <Form.Item
          name={[field.name, 'unit']}
          initialValue={1}
          rules={[
            { required: true, message: 'Required' },
            {
              type: 'integer',
              message: 'Must be an integer',
            },
            {
              validator: (_, value) =>
                value >= 1
                  ? Promise.resolve()
                  : Promise.reject(new Error('Min value is 1')),
            },
          ]}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={1}
            precision={0}
            onChange={updateUnit}
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
