import Config from '@/helper/Config';
import useSWR from 'swr';

// @ts-ignore
const fetcher = (...args) => fetch(...args).then((res) => res.json());

export const useApi = (url: string) => {
  return useSWR(Config.BaseApi + url, fetcher, {
    revalidateOnFocus: false,
  });
};
