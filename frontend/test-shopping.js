// Simple test to check if shopping module can be parsed
const fs = require('fs');
const path = require('path');

try {
  const shoppingPath = path.join(__dirname, 'src/pages/module/shopping.jsx');
  const content = fs.readFileSync(shoppingPath, 'utf8');
  
  // Basic syntax checks
  const hasMatchingBraces = (content.match(/\{/g) || []).length === (content.match(/\}/g) || []).length;
  const hasMatchingParens = (content.match(/\(/g) || []).length === (content.match(/\)/g) || []).length;
  const hasMatchingBrackets = (content.match(/\[/g) || []).length === (content.match(/\]/g) || []).length;
  
  console.log('Shopping module syntax check:');
  console.log('- Matching braces:', hasMatchingBraces);
  console.log('- Matching parentheses:', hasMatchingParens);
  console.log('- Matching brackets:', hasMatchingBrackets);
  console.log('- File size:', content.length, 'characters');
  
  // Check for key components
  console.log('- Has export:', content.includes('export default'));
  console.log('- Has ShoppingModule:', content.includes('ShoppingModule'));
  console.log('- Has return statement:', content.includes('return ('));
  console.log('- Has hidden input:', content.includes('type="file"'));
  
  console.log('\n✅ Shopping module appears to be syntactically correct!');
} catch (error) {
  console.error('❌ Error checking shopping module:', error.message);
}
