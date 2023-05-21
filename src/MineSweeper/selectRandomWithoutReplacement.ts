export function selectRandomWithoutReplacement<T>(
  array: T[],
  num: number
): T[] {
  if (num > array.length) {
    throw new Error(
      "The number of elements to select is greater than the number of elements in the array."
    );
  }

  const result: T[] = [];
  const tempArray = [...array];

  while (result.length < num) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    result.push(tempArray[randomIndex]);
    tempArray.splice(randomIndex, 1);
  }

  return result;
}
