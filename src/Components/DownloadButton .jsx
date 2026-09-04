import React from 'react';

const DownloadButton = () => {
  const handleDownload = () => {
    const fileUrl = '/files/PEELS-Native-Plants-Availability.pdf';
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = 'PEELS-Native-Plants-Availability.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button onClick={handleDownload}>Download File</button>
  );
};

export default DownloadButton;
