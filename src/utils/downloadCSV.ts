const downloadCSV = (csvContent, fileName = 'data.csv') => {
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = window.URL.createObjectURL(blob);

//   // Open the file in a new tab
//   const newWindow = window?.open(url);
//   if (newWindow) {
//     newWindow.onload = () => {
//       newWindow.document.write(`<a href="${url}" download="${fileName}">Download CSV</a>`);
//       newWindow.document.close();
//     };
//   } else {
//     alert('Popup blocked! Please allow popups for this site.');
//   }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url); 
};

export default downloadCSV;