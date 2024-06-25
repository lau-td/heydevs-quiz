import csvtojson from "csvtojson";

export const convertStringToJson = (str: string): any => {
  const jsonString = str.replace(/\n/g, "").replace(/```json|```/g, "");
  return JSON.parse(jsonString);
};

export const removeCsvBlock = (csv) => {
  const startDelimiter = "```csv";
  const endDelimiter = "```";

  // Remove start and end delimiters
  let cleanedData = csv.replace(startDelimiter, "").replace(endDelimiter, "");

  // Trim leading and trailing whitespace
  cleanedData = cleanedData.trim();

  return cleanedData;
};

export const csvToJson = async (csv: string) => {
  return csvtojson()
    .fromString(csv)
    .then((data) => data);
};
