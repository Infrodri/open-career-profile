import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { generateOutput } from '../api/profile.api';

interface OutputGeneratorProps {
  profileId: string;
}

export function OutputGenerator({ profileId }: OutputGeneratorProps) {
  const [templateId, setTemplateId] = useState('standard');
  const [format, setFormat] = useState<'html' | 'pdf'>('html');

  const mutation = useMutation({
    mutationFn: () => generateOutput(profileId, templateId, format),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      if (format === 'html') {
        window.open(url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = `profile.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    },
  });

  return (
    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Generate Output</h3>

      <div className="space-y-4">
        {/* Template Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="standard">Standard</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>

        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="html"
                checked={format === 'html'}
                onChange={() => setFormat('html')}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">HTML</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
                className="text-blue-600"
              />
              <span className="text-sm text-gray-700">PDF</span>
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {mutation.isPending ? 'Generating...' : 'Generate CV'}
        </button>

        {mutation.isError && (
          <p className="text-sm text-red-600 mt-2">{mutation.error.message}</p>
        )}
      </div>
    </section>
  );
}
