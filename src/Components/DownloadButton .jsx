import React from 'react';

const DownloadButton = () => {
  const handleDownload = () => {
    const fileUrl = '../../files/PNP_Availability_List.xlsx';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'PNP_Availability_List.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload}>Download File</button>
  );
};

export default DownloadButton;