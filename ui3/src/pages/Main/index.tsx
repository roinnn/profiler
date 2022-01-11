import { Box, Container, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import useUrlQuery from '../../hooks/useUrlQuery';
import ChartCard from './Blocks/ChartCard';

export default function Main() {
  const [date = dayjs().format('YYYY-MM-DD HH:mm:ss'), types = 'fgprof_samples', labels = 'target'] = useUrlQuery([
    'date',
    'types',
    'labels',
  ]);
  return (
    <Box p={4}>
      <Text color={'red.400'}>{date}</Text>

      <ChartCard />
    </Box>
  );
}

// function Parent() {
//   const [value, setValue] = useState('');
//   const onSubChange = (subValue: string) => {
//     setValue(subValue);
//   };
//   return (
//     <div>
//       <Text fontSize={'xl'} borderBottom={'2px'}>
//         sub value: {value}
//       </Text>
//       <Sub onChange={onSubChange} />
//     </div>
//   );
// }

// function Sub({ onChange }: { onChange: (value: string) => void }) {
//   const ref = useRef<HTMLInputElement>(null);
//   const onClick = () => {
//     if (!ref.current) {
//       return;
//     }
//     onChange(ref.current.value);
//   };
//   return (
//     <div>
//       <Input ref={ref} />
//       <Button onClick={onClick}>click me</Button>
//     </div>
//   );
// }
