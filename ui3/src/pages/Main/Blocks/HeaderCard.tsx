import Card from '@/components/Card';
import { useApi } from '@/hooks/api/base';
import { SimpleGrid } from '@chakra-ui/react';
import { Cascader, DatePicker, Select } from 'antd';
import { useMemo, useRef } from 'react';
const { Option, OptGroup } = Select;

export default function HeaderCard() {
  return (
    <Card>
      <SimpleGrid columns={[1, null, 3]} spacing={4}>
        <TypeSelect />
        <LabelSelect />
        <DateSelect />
      </SimpleGrid>
    </Card>
  );
}

function TypeSelect() {
  const { data } = useApi('/api/group_sample_types');
  const loading = !data;
  const types = useRef([
    'heap',
    'fgprof',
    'profile',
    'goroutine',
    'allocs',
    'block',
    'threadcreate',
    'mutex',
    'trace',
  ]).current;

  const handleChange = () => {};

  return (
    <Select loading={loading} mode={'multiple'} placeholder="Select Type" onChange={handleChange}>
      {data
        ? types.map((type) => {
            const list = data[type] as string[];
            return (
              <OptGroup key={type} label={type}>
                {list.map((item) => {
                  return (
                    <Option key={item} value={item}>
                      {item}
                    </Option>
                  );
                })}
              </OptGroup>
            );
          })
        : null}
    </Select>
  );
}

function LabelSelect() {
  const { data } = useApi('/api/group_labels');
  const loading = !data;

  const options = useMemo(() => {
    if (!data) {
      return [];
    }
    return Object.keys(data).map((key) => {
      const children = (data[key] || []).map((item: { Key: string; Value: string }) => {
        return {
          label: item.Value,
          value: item.Value,
        };
      });
      return {
        label: key,
        value: key,
        children,
      };
    });
  }, [data]);
  const onChange = (value: any) => {
    console.log(value);
  };
  return (
    <Cascader
      loading={loading}
      placeholder="Select Labels"
      style={{ width: '100%' }}
      options={options}
      onChange={onChange}
      multiple
      maxTagCount="responsive"
    />
  );
}

function DateSelect() {
  function onChange(date: any, dateString: any) {
    console.log(date, dateString);
  }
  return <DatePicker onChange={onChange} />;
}
