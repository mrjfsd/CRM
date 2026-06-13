import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';

import CrudModule from '@/modules/CrudModule/CrudModule';
import PaymentModeForm from '@/forms/PaymentModeForm';

export default function PaymentMode() {
  const translate = useLanguage();
  const entity = 'paymentMode';

  const searchConfig = {
    displayLabels: ['name'],
    searchFields: 'name',
  };

  const deleteModalLabels = ['name'];

  // Required by ReadItem — must provide fields OR readColumns in config.
  // ReadItem.jsx L17: let { readColumns, fields } = config;
  const fields = {
    name: {
      type: 'string',
      label: translate('Payment Mode'),
    },
    description: {
      type: 'string',
      label: translate('Description'),
    },
    enabled: {
      type: 'boolean',
      label: translate('enabled'),
    },
    isDefault: {
      type: 'boolean',
      label: translate('Default Mode'),
    },
  };

  const dataTableColumns = [
    {
      title: translate('Payment Mode'),
      dataIndex: 'name',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
    },
    {
      title: translate('enabled'),
      dataIndex: 'enabled',
      render: (enabled) => (
        <Tag bordered={false} color={enabled ? 'green' : 'red'}>
          {enabled ? translate('enabled') : translate('disabled')}
        </Tag>
      ),
    },
    {
      title: translate('Default'),
      dataIndex: 'isDefault',
      render: (isDefault) => (
        <Tag bordered={false} color={isDefault ? 'blue' : 'default'}>
          {isDefault ? translate('yes') : translate('no')}
        </Tag>
      ),
    },
  ];

  const Labels = {
    PANEL_TITLE: translate('payment_mode'),
    DATATABLE_TITLE: translate('payment_mode_list'),
    ADD_NEW_ENTITY: translate('add_new_payment_mode'),
    ENTITY_NAME: translate('payment_mode'),
  };

  const configPage = {
    entity,
    ...Labels,
  };

  const config = {
    ...configPage,
    fields,
    dataTableColumns,
    searchConfig,
    deleteModalLabels,
  };

  return (
    <CrudModule
      createForm={<PaymentModeForm />}
      updateForm={<PaymentModeForm isUpdateForm={true} />}
      config={config}
    />
  );
}
