import Card from '@/components/Card';
import { SimpleGrid } from '@chakra-ui/react';
import { Cascader, DatePicker, Select } from 'antd';
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
  const handleChange = () => {};
  return (
    <Select defaultValue="lucy" onChange={handleChange}>
      <OptGroup label="Manager">
        <Option value="jack">Jack</Option>
        <Option value="lucy">Lucy</Option>
      </OptGroup>
      <OptGroup label="Engineer">
        <Option value="Yiminghe">yiminghe</Option>
      </OptGroup>
    </Select>
  );
}

function LabelSelect() {
  const options = [
    {
      label: 'Light',
      value: 'light',
      children: new Array(20).fill(null).map((_, index) => ({ label: `Number ${index}`, value: index })),
    },
    {
      label: 'Bamboo',
      value: 'bamboo',
      children: [
        {
          label: 'Little',
          value: 'little',
          children: [
            {
              label: 'Toy Fish',
              value: 'fish',
            },
            {
              label: 'Toy Cards',
              value: 'cards',
            },
            {
              label: 'Toy Bird',
              value: 'bird',
            },
          ],
        },
      ],
    },
  ];

  const onChange = (value: any) => {
    console.log(value);
  };
  return <Cascader style={{ width: '100%' }} options={options} onChange={onChange} multiple maxTagCount="responsive" />;
}

function DateSelect() {
  function onChange(date: any, dateString: any) {
    console.log(date, dateString);
  }
  return <DatePicker onChange={onChange} />;
}
