import { useState, useRef, useCallback } from 'react';
import { jsPDF } from 'jspdf';

interface MultiPhotoCaptureProps {
  /** Called when the user finishes and the PDF/file is ready. */
  onComplete: (file: File) => void;
  /** Called if the user cancels. */
  onCancel: () => void;
  /** Whether the parent is currently uploading. */
  isUploading: boolean;
}

interface CapturedImage {
  id: string;
  dataUrl: string;
  file: File;
}

/**
 * Multi-photo capture component.
 * The user can:
 * - Take photos with the camera (mobile) or select files (desktop)
 * - Add as many pages as needed (anverso/reverso, contracts with many pages)
 * - Preview and reorder/remove individual pages
 * - When done, all images are combined into a single PDF as physical evidence
 *
 * If the user selects a single PDF directly, it passes through without conversion.
 */
export function MultiPhotoCapture({ onComplete, onCancel, isUploading }: MultiPhotoCaptureProps) {
  const [images, setImages] = useState<CapturedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const addImages = useCallback((files: FileList | File[]) => {
    const newImages: CapturedImage[] = [];

    for (const file of Array.from(files)) {
      // If it's a single PDF, pass it through directly
      if (file.type === 'application/pdf' && images.length === 0) {
        onComplete(file);
        return;
      }

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          newImages.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            dataUrl,
            file,
          });
          // Update state after all are read
          if (newImages.length === Array.from(files).filter(f => f.type.startsWith('image/')).length) {
            setImages((prev) => [...prev, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }, [images.length, onComplete]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addImages(e.target.files);
    }
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((prev) => {
      const newArr = [...prev];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= newArr.length) return prev;
      [newArr[index]!, newArr[targetIndex]!] = [newArr[targetIndex]!, newArr[index]!];
      return newArr;
    });
  };

  const generatePdfAndComplete = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);

    try {
      // If single image, just send it directly (no need for PDF conversion)
      if (images.length === 1) {
        onComplete(images[0]!.file);
        return;
      }

      // Multiple images → combine into a PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();

        const img = images[i]!;
        const imgEl = await loadImage(img.dataUrl);

        // Calculate dimensions to fit the page while maintaining aspect ratio
        const maxW = pageWidth - margin * 2;
        const maxH = pageHeight - margin * 2;
        const ratio = Math.min(maxW / imgEl.width, maxH / imgEl.height);
        const w = imgEl.width * ratio;
        const h = imgEl.height * ratio;
        const x = (pageWidth - w) / 2;
        const y = (pageHeight - h) / 2;

        pdf.addImage(img.dataUrl, 'JPEG', x, y, w, h);
      }

      const blob = pdf.output('blob');
      const file = new File([blob], `certificado_${Date.now()}.pdf`, {
        type: 'application/pdf',
      });

      onComplete(file);
    } catch (err) {
      console.error('Error generating PDF:', err);
      setIsGenerating(false);
    }
  };

  const busy = isUploading || isGenerating;

  return (
    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Captura de documento ({images.length} {images.length === 1 ? 'página' : 'páginas'})
        </h4>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
        >
          Cancelar
        </button>
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Toma fotos de cada página del documento (anverso, reverso, o varias hojas). Se
        combinarán en un solo PDF como constancia.
      </p>

      {/* Preview grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map((img, index) => (
            <div key={img.id} className="relative group">
              <img
                src={img.dataUrl}
                alt={`Página ${index + 1}`}
                className="w-full h-24 object-cover rounded border border-slate-200 dark:border-slate-600"
              />
              <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-1 rounded">
                {index + 1}
              </span>
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <button type="button" onClick={() => moveImage(index, -1)}
                    className="bg-black/60 text-white text-[10px] w-4 h-4 rounded flex items-center justify-center">
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button type="button" onClick={() => moveImage(index, 1)}
                    className="bg-black/60 text-white text-[10px] w-4 h-4 rounded flex items-center justify-center">
                    →
                  </button>
                )}
                <button type="button" onClick={() => removeImage(img.id)}
                  className="bg-red-600/80 text-white text-[10px] w-4 h-4 rounded flex items-center justify-center">
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Capture buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Camera capture (mobile) */}
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          Tomar foto
        </button>
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* File select (desktop/galeria) */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Seleccionar archivo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Confirm button */}
      {images.length > 0 && (
        <button
          type="button"
          onClick={generatePdfAndComplete}
          disabled={busy}
          className="w-full px-4 py-2.5 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {busy
            ? 'Procesando...'
            : images.length === 1
              ? 'Subir como verificación'
              : `Combinar ${images.length} páginas en PDF y verificar`}
        </button>
      )}
    </div>
  );
}

/** Load an image element from a data URL. */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
