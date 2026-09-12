import React from 'react';
import { X, Ruler } from 'lucide-react';

export const SizeChartModal = ({ isOpen, onClose, category = "Clothing" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto overflow-hidden shadow-2xl border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            <Ruler className="w-5 h-5 text-[#9f2089]" />
            <h3 className="text-base font-bold text-gray-900">Standard Size Guide</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-gray-600">
            Measurements are in <strong>Inches (in)</strong>. For best fit, measure around the fullest part of your bust/chest, waist, and hips.
          </p>

          <table className="w-full text-xs text-left border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-[#fdeaf3] text-[#9f2089] uppercase font-bold">
              <tr>
                <th className="py-2.5 px-3 border-b">Size</th>
                <th className="py-2.5 px-3 border-b">Bust / Chest</th>
                <th className="py-2.5 px-3 border-b">Waist</th>
                <th className="py-2.5 px-3 border-b">Hip / Length</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              <tr>
                <td className="py-2 px-3 font-bold">XS</td>
                <td className="py-2 px-3">32 - 34"</td>
                <td className="py-2 px-3">26 - 28"</td>
                <td className="py-2 px-3">34 - 36"</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="py-2 px-3 font-bold">S</td>
                <td className="py-2 px-3">34 - 36"</td>
                <td className="py-2 px-3">28 - 30"</td>
                <td className="py-2 px-3">36 - 38"</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">M</td>
                <td className="py-2 px-3">36 - 38"</td>
                <td className="py-2 px-3">30 - 32"</td>
                <td className="py-2 px-3">38 - 40"</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="py-2 px-3 font-bold">L</td>
                <td className="py-2 px-3">38 - 40"</td>
                <td className="py-2 px-3">32 - 34"</td>
                <td className="py-2 px-3">40 - 42"</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">XL</td>
                <td className="py-2 px-3">40 - 42"</td>
                <td className="py-2 px-3">34 - 36"</td>
                <td className="py-2 px-3">42 - 44"</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="py-2 px-3 font-bold">XXL</td>
                <td className="py-2 px-3">42 - 44"</td>
                <td className="py-2 px-3">36 - 38"</td>
                <td className="py-2 px-3">44 - 46"</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-bold">Free Size</td>
                <td className="py-2 px-3">34 - 42"</td>
                <td className="py-2 px-3">Adjustable</td>
                <td className="py-2 px-3">Standard</td>
              </tr>
            </tbody>
          </table>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
            <strong>Tip:</strong> If you are between sizes, we recommend ordering one size larger for a comfortable fit.
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 text-right">
          <button
            onClick={onClose}
            className="bg-[#9f2089] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#851670] transition-colors"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
