const fs = require('fs');

// Admin files to update
const adminFiles = [
  'public/admin/users.html',
  'public/admin/transactions.html', 
  'public/admin/plans.html',
  'public/admin/header.html',
  'public/admin/dashboard.html'
];

// Replacements to make
const replacements = [
  { from: /DataHarbour/g, to: 'DataHarbour' },
  { from: /dataharbour\.com/g, to: 'dataharbour.com' }
];

adminFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    replacements.forEach(replacement => {
      content = content.replace(replacement.from, replacement.to);
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Admin branding update complete!');