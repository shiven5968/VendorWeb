import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcPath = 'C:/Users/Parth Sharma/.gemini/antigravity/brain/9eb6780c-8819-4623-bfc6-869cf5247e98/.user_uploaded/media_1788035992186.jpg';
const outDir = path.join(process.cwd(), 'public', 'meal-images');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// Column X bounding boxes (shaving 3px on left and right for pure photo):
const colBoxes = [
  { day: 'Monday',    left: 81,  width: 120 },
  { day: 'Tuesday',   left: 211, width: 120 },
  { day: 'Wednesday', left: 341, width: 130 },
  { day: 'Thursday',  left: 482, width: 125 },
  { day: 'Friday',    left: 619, width: 123 },
  { day: 'Saturday',  left: 754, width: 120 },
  { day: 'Sunday',    left: 887, width: 118 }
];

// Row Y bounding boxes:
const rowBoxes = {
  Breakfast: { top: 111, height: 98 },
  Lunch:     { top: 257, height: 97 },
  Snacks:    { top: 399, height: 90 },
  Dinner:    { top: 535, height: 96 }
};

// Exact mappings per day & meal:
const mappings = [
  // Monday
  { day: 0, meal: 'Breakfast', filename: 'veg-fried-idli.jpg', name: 'Veg Fried Idli & Sambhar' },
  { day: 0, meal: 'Lunch',     filename: 'rajma-masala.jpg',    name: 'Mix Veg & Rajma Masala' },
  { day: 0, meal: 'Snacks',    filename: 'burger.jpg',          name: 'Burger' },
  { day: 0, meal: 'Dinner',    filename: 'arhar-dal-aloo-gobhi.jpg', name: 'Arhar Dal & Aloo Gobhi' },

  // Tuesday
  { day: 1, meal: 'Breakfast', filename: 'matar-kulche.jpg',    name: 'Matar Kulche' },
  { day: 1, meal: 'Lunch',     filename: 'aloo-tamatar-tahri.jpg', name: 'Aloo Tamatar Sabji & Tahri' },
  { day: 1, meal: 'Snacks',    filename: 'macaroni.jpg',        name: 'Macaroni' },
  { day: 1, meal: 'Dinner',    filename: 'kali-masoor-aloo-beans.jpg', name: 'Kali Masoor Dal & Aloo Beans' },

  // Wednesday
  { day: 2, meal: 'Breakfast', filename: 'aloo-paratha.jpg',    name: 'Aloo Paratha' },
  { day: 2, meal: 'Lunch',     filename: 'kaabli-chhole.jpg',   name: 'Kaabli Chhole & Kashifal' },
  { day: 2, meal: 'Snacks',    filename: 'samosa.jpg',          name: 'Samosa' },
  { day: 2, meal: 'Dinner',    filename: 'butter-paneer.jpg',   name: 'Butter Paneer Masala' },

  // Thursday
  { day: 3, meal: 'Breakfast', filename: 'pav-bhaji.jpg',       name: 'Pav Bhaji' },
  { day: 3, meal: 'Lunch',     filename: 'kadhi-rice.jpg',      name: 'Kadhi Rice & Aloo Pyaj Sabji' },
  { day: 3, meal: 'Snacks',    filename: 'bread-pakoda.jpg',    name: 'Bread Pakoda' },
  { day: 3, meal: 'Dinner',    filename: 'dal-makhani-mix-veg.jpg', name: 'Daal Makhani & Mix Veg' },

  // Friday
  { day: 4, meal: 'Breakfast', filename: 'puri-aloo-tamatar.jpg', name: 'Aloo Tamatar Sabji & Puri' },
  { day: 4, meal: 'Lunch',     filename: 'mix-dal-tarohi.jpg',  name: 'Mix Daal, Tarohi & Roti' },
  { day: 4, meal: 'Snacks',    filename: 'bread-roll.jpg',      name: 'Bread Roll' },
  { day: 4, meal: 'Dinner',    filename: 'arhar-dal-lauki.jpg', name: 'Arhar Daal, Lauki' },

  // Saturday
  { day: 5, meal: 'Breakfast', filename: 'puri-aloo-tamatar-sat.jpg', name: 'Aloo Tamatar Sabji & Puri' },
  { day: 5, meal: 'Lunch',     filename: 'chhole-bhature.jpg',  name: 'Chhole Bhature & Cold Drink' },
  { day: 5, meal: 'Snacks',    filename: 'chowmein.jpg',        name: 'Chowmein' },
  { day: 5, meal: 'Dinner',    filename: 'arhar-dal-lauki-sat.jpg', name: 'Arhar Daal, Lauki' },

  // Sunday
  { day: 6, meal: 'Breakfast', filename: 'veg-sandwich.jpg',    name: 'Veg Sandwich & Cornflakes' },
  { day: 6, meal: 'Lunch',     filename: 'chhole-bhature-sun.jpg', name: 'Chhole Bhature & Cold Drink' },
  { day: 6, meal: 'Dinner',    filename: 'lauki-kofta-arabi.jpg', name: 'Lauki Kofta & Arabi' }
];

async function generateAll() {
  console.log('Extracting and upscaling all individual meal images from AI reference collage...');
  for (const m of mappings) {
    const col = colBoxes[m.day];
    const row = rowBoxes[m.meal];
    const targetPath = path.join(outDir, m.filename);

    await sharp(srcPath)
      .extract({ left: col.left, top: row.top, width: col.width, height: row.height })
      .resize(800, 600, {
        fit: 'cover',
        kernel: sharp.kernel.lanczos3
      })
      .jpeg({ quality: 95, mozjpeg: true })
      .toFile(targetPath);

    console.log(`Extracted: ${m.name.padEnd(30)} -> public/meal-images/${m.filename}`);
  }
  console.log('\nAll 27 individual food assets generated successfully in public/meal-images/!');
}

generateAll().catch(e => console.error(e));
