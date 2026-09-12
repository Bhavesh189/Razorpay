import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/bhave/OneDrive/Desktop/Razorpay/Frontend/src/components';
const files = [
  'AuthModal.jsx',
  'DownloadAppModal.jsx',
  'HelpModal.jsx',
  'OrderTrackingModal.jsx',
  'SizeChartModal.jsx',
  'SupplierModal.jsx',
  'WishlistModal.jsx',
];

for (const file of files) {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the modal wrappers to add max-w-[95vw] and max-h-[90vh] overflow-y-auto consistently.
  // Standardize: <div className="bg-white rounded-3xl w-full max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl ...
  
  content = content.replace(
    /className="bg-white rounded-(?:3xl|2xl|xl|lg|md) max-w-([a-z0-9]+) w-full([^"]*)"/g,
    'className="bg-white rounded-3xl w-full max-w-[95vw] sm:max-w-$1 max-h-[90vh] overflow-y-auto$2"'
  );
  
  // Replace missing overflow/max-height for modals that don't have it explicitly
  content = content.replace(
    /className="fixed inset-0 z-50 flex items-center justify-center (p-\d sm:p-\d) bg-slate-900\/60 backdrop-blur-md animate-in/g,
    'className="fixed inset-0 z-50 flex items-center justify-center $1 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-in'
  );

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
}
