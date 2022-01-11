export default function useUrlQuery(keyArr: string[]) {
  const params = new URLSearchParams(window.location.search);
  return keyArr.map((key) => params.get(key) || void 0);
}
