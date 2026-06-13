import { Tag } from 'antd';
import useLanguage from '@/locale/useLanguage';

import CrudModule from '@/modules/CrudModule/CrudModule';
import TaxForm from '@/forms/TaxForm';

export default function Taxes() {
  const translate = useLanguage();
  const entity = 'taxes';

  const searchConfig = {
    displayLabels: ['taxName'],
    searchFields: 'taxName',
  };

  const deleteModalLabels = ['taxName'];

  // Required by ReadItem (index.jsx:L17) — must be present or readColumns will be undefined
  // and .map() will crash. Matches the field shape consumed by dataForRead() in dataStructure.jsx.
  const fields = {
    taxName: {
      type: 'string',
      label: translate('name'),
    },
    taxValue: {
      type: 'string',
      label: translate('Value'),
    },
    enabled: {
      type: 'boolean',
      label: translate('enabled'),
    },
    isDefault: {
      type: 'boolean',
      label: translate('Default'),
    },
  };

  const dataTableColumns = [
    {
      title: translate('name'),
      dataIndex: 'taxName',
    },
    {
      title: translate('Value'),
      dataIndex: 'taxValue',
      render: (value) => `${value}%`,
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
    PANEL_TITLE: translate('taxes'),
    DATATABLE_TITLE: translate('taxes_list'),
    ADD_NEW_ENTITY: translate('add_new_tax'),
    ENTITY_NAME: translate('taxes'),
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
      createForm={<TaxForm />}
      updateForm={<TaxForm isUpdateForm={true} />}
      config={config}
    />
  );
}
