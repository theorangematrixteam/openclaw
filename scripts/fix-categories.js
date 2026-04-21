const { execFileSync } = require('child_process');

const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

// Fix Category column (A) for consistency:
// - Use "Jewelry" (American spelling) consistently
// - Batch 1 clothing brands should have subcategories too
// Row 2: BITCHN -> Clothing:Streetwear
// Row 3: Sharmeeli -> Clothing:Ethnic
// Row 4: Whynaut -> Clothing:Streetwear
// Row 5: Label Kariya -> Clothing:Ethnic Fusion
// Row 6: Our Karma Clothing -> Clothing:Streetwear
// Row 7: Aarnora -> Jewelry:Silver
// Row 8: Pranikas -> Clothing:Ethnic
// Row 9: Rihyaaz -> Clothing:Ethnic
// Row 10: Dandelion -> Jewelry:Handmade
// Row 11: Silvooshine -> Jewelry:Silver
// Row 12: Windowsill -> Product:Candles
// Row 13: Lussora -> Product:Perfume
// Row 14: Sunheri Flame -> Product:Candles
// Row 15: Gharana Karigari -> Clothing:Ethnic
// Row 16: Corall -> Clothing:Women

const catFixes = [
  { row: 2, value: 'Clothing:Streetwear' },
  { row: 3, value: 'Clothing:Ethnic' },
  { row: 4, value: 'Clothing:Streetwear' },
  { row: 5, value: 'Clothing:Ethnic Fusion' },
  { row: 6, value: 'Clothing:Streetwear' },
  { row: 7, value: 'Jewelry:Silver' },
  { row: 8, value: 'Clothing:Ethnic' },
  { row: 9, value: 'Clothing:Ethnic' },
  { row: 10, value: 'Jewelry:Handmade' },
  { row: 11, value: 'Jewelry:Silver' },
  { row: 15, value: 'Clothing:Ethnic' },
  { row: 16, value: 'Clothing:Women' },
];

for (const fix of catFixes) {
  const range = `Outbound!A${fix.row}`;
  try {
    const result = execFileSync(gog, [
      'sheets', 'update', sheetId, range,
      '--values-json', JSON.stringify([[fix.value]]),
      '--input', 'USER_ENTERED',
      '--no-input'
    ], { encoding: 'utf8' });
    console.log(`✅ Row ${fix.row}: ${fix.value}`);
  } catch(e) {
    console.log(`❌ Row ${fix.row}: ERROR`);
  }
}

console.log('\nCategories standardized!');