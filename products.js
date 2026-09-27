// Product data — to add/edit/remove products, just edit this file, no need to touch the logic elsewhere.
// custom: true means this product supports custom text (an input box appears at checkout)
// detailPage means the card links to its own options page instead of adding to cart directly
// To use a real photo instead of the emoji icon: delete the `icon` line and add `image: 'images/xxx.jpg'`

window.CATEGORIES = ['All', 'Earrings', 'Brooches', 'Bookmarks', 'Stamps', 'Keychains', 'Custom'];

window.PRODUCTS = [
  { id: 'ear-1',  category: 'Earrings',  name: 'Daisy Stud Earrings',      price: 150, desc: 'Brass daisy charm, light and versatile', custom: false, icon: '🌼' },
  { id: 'pin-1',  category: 'Brooches',  name: 'Cat Brooch',               price: 130, desc: 'Cute cat design, great on jackets or bags', custom: false, icon: '🐱' },
  { id: 'pin-2',  category: 'Brooches',  name: 'Custom Pattern Brooch',    price: 200, desc: 'Send us a simple design to engrave', custom: true,  icon: '✒️' },
  { id: 'book-1', category: 'Bookmarks', name: 'Forest Animal Bookmark',   price: 110, desc: 'Wood-grain texture, a little surprise while reading', custom: false, icon: '🦉' },
  { id: 'book-2', category: 'Bookmarks', name: 'Custom Name Bookmark',     price: 160, desc: 'Engrave a name or short quote, a thoughtful gift', custom: true,  icon: '✒️' },
  { id: 'stamp-1',category: 'Stamps',    name: 'Flower Stamp',             price: 180, desc: 'Handmade wooden handle, perfect for finishing letters', custom: false, icon: '🌸' },
  { id: 'key-1',  category: 'Keychains', name: 'Geometric Keychain',       price: 120, desc: 'Simple geometric lines, warm wood texture', custom: false, icon: '🔑' },

  // Multi-option products — each uses detailPage to link to its own options page instead of adding to cart directly from the card
  { id: 'ear-shapes',   category: 'Earrings', name: 'Shapes Engraving Pattern Earrings', price: 150, desc: '16 patterns, 2 sizes, 18 colors to mix and match', custom: false, image: 'images/shapes-a1.png', detailPage: 'product-shapes-engraving.html' },
  { id: 'custom-text',  category: 'Custom',   name: 'Custom Engraved Text',              price: 170, desc: 'Type your own text — choose font, finish, color and put it on earrings, a brooch or a keychain', custom: false, image: 'images/custom-text-hero.jpg', detailPage: 'product-custom-text.html' },
  { id: 'stamp-custom', category: 'Stamps',   name: 'Custom Stamp',                      price: 220, desc: 'Upload your own design — choose material, shape, size and handle style', custom: false, image: 'images/stamp-hero.jpg', detailPage: 'product-custom-stamp.html' },
];
