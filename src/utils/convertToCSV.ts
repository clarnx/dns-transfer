// const convertToCSV = (records: Array<{hostname: string, type: string, value: string,}>) => {
//   if (!Array.isArray(records) || records.length === 0) return '';

//   // Define the headers for the CSV
//   const headers = ['Host', 'Type', 'Value'];

//   // Create CSV header row
//   const csvRows = [headers.join(',')];

//   // Add data rows
//   for (const record of records) {
//     const values = [
//       `"${record.hostname || ''}"`, 
//       `"${record.type || ''}"`, 
//       `"${record.value || ''}"`
//     ];
//     csvRows.push(values.join(','));
//   }

//   return csvRows.join('\n');
// }

const convertToCSV = (records: any) => {
    // const headers = ['Host', 'Type', 'Value'];
    // const csvRows = [headers.join(',')];

    // for (const record of records) {
    //   csvRows.push(`"${record.hostname}","${record.type}","${record.value}"`);
    // }

    // return csvRows.join('\n');

  const headers = ['Name', 'Type', 'Value'];
  const csvRows = [headers.join(',')];

  for (const record of records) {
    csvRows.push(`"${record.hostname}","${record.type}","${record.value}"`);
  }

  return csvRows.join('\n');
  };

export default convertToCSV