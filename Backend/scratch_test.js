import { ProductSearchEngine } from './search/SearchEngine.js';

const mockProducts = [
  { id: '1', title: 'LG Luxurious Laptop Ultra', tags: ['lg', 'laptop', 'electronics'], isActive: true },
];

const engine = new ProductSearchEngine(mockProducts);
const result = engine.search('latop');
console.log(JSON.stringify(result, null, 2));
