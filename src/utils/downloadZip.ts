import { ZIP_BASE64 } from './zipData';

export function downloadProjectZip(): boolean {
  try {
    const byteCharacters = atob(ZIP_BASE64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stormsight-ai.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (err) {
    console.error('Client-side zip download failed, trying static link:', err);
    const link = document.createElement('a');
    link.href = '/stormsight-ai.zip';
    link.download = 'stormsight-ai.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return false;
  }
}
