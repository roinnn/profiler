import { Box } from '@chakra-ui/react';

export default function Card({ children }: { children: any }) {
  return (
    <Box shadow={'sm'} p={6} borderWidth={'1px'} borderRadius={'2px'} borderColor={'gray.200'}>
      {children}
    </Box>
  );
}
