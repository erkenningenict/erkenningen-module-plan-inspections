import React from 'react';
import { Button } from '@erkenningen/ui/components/button';

const PrintButton: React.FC<{ element: string }> = (props) => {
  const print = () => {
    const printContent = document.getElementById(props.element);
    const windowUrl = 'about:blank';
    const uniqueName = new Date();
    const windowName = 'Print' + uniqueName.getTime();
    const printWindow = window.open(windowUrl, windowName, 'left=100,top=50,width=700,height=800');
    if (!printWindow || !printContent) {
      return;
    }
    printWindow.document.write(
      `<style> body {font-family: Arial}</style>${printContent.innerHTML}`,
    );
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };
  return (
    <div className="hidden-xs hidden-sm">
      <Button icon="fas fa-print" type="button" onClick={() => print()} label="Printen"></Button>
    </div>
  );
};

export default PrintButton;
