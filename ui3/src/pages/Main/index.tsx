import { Box, SimpleGrid, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import useUrlQuery from '../../hooks/useUrlQuery';
import ChartCard from './Blocks/ChartCard';
import HeaderCard from './Blocks/HeaderCard';

export default function Main() {
  const [date = dayjs().format('YYYY-MM-DD HH:mm:ss'), types = 'fgprof_samples', labels = 'target'] = useUrlQuery([
    'date',
    'types',
    'labels',
  ]);

  return (
    <Box p={4}>
      <Text color={'red.400'}>{date}</Text>
      <SimpleGrid spacing="6">
        <HeaderCard />
        <ChartCard />
      </SimpleGrid>
    </Box>
  );
}
