/**
 *
 * @param array - array of string array. First array is key sand others is values
 * @returns list of json data
 */
export function convertArrayToJSON<T>(array: string[][]): T[] {
  const [keys, ...values] = array;
  return values.map(
    (value) =>
      Object.fromEntries(keys.map((key, i) => [key, value[i]])) as any as T
  );
}
