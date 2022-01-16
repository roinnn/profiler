import Card from '@/components/Card';
import { useApi } from '@/hooks/api/base';
import { appStore } from '@/store';
import { SimpleGrid } from '@chakra-ui/react';
import { Cascader, DatePicker, Select } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef } from 'react';
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

  const handleChange = (selectTypes: string[]) => {
    appStore.updateTypes(selectTypes);
  };

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
  const onChange = (...args: any) => {
    const selectLabels = args[0] as string[][];
    const labels: { Key: string; Value: string }[] = [];
    selectLabels.forEach((item, index) => {
      const [Key, Value] = item;
      if (!Value) {
        const allObj = args[1][index][0] as any;
        console.log(allObj);
        allObj.children.forEach((c: any) => {
          labels.push({ Key, Value: c.value });
        });
      } else {
        labels.push({ Key, Value });
      }
    });
    appStore.updateLabels(labels);
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
  function onChange(date: Dayjs, dateString: any) {
    appStore.updateDate(date.unix() * 1000);
  }
  useEffect(() => {
    // 默认选择今天
    appStore.updateDate(dayjs(new Date()).unix() * 1000);
  }, []);
  return <DatePicker defaultValue={dayjs(new Date()) as any} onChange={onChange as any} />;
}
