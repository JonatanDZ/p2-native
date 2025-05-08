import { getProducts } from "../../../server/dbserver";
import { onLoadTest } from "./unitTestSnippets/onLoadTest";

// testing parsing of CSV file to JSON-format object. 
test('Properly parses CSV file to object in PRODUCTS.', ()=>{
    const input = "name;price\ntshirt;199\nhoodie;5.99";
    const output = onLoadTest(input);
    expect(output).toEqual([{name: "tshirt", price: "199"}, {name: "hoodie", price: "5.99"}]);
})

// All functions getting or sending data to database / primarily from dbserver.js

test('getProducts returns an array of products with expected fields', async () => {
    const products = await getProducts();
  
    // check that it's an array
    expect(Array.isArray(products)).toBe(true);
  
    // check that it's not empty (optional, depends on if DB can be empty)
    // expect(products.length).toBeGreaterThan(0);
  
    // if not empty, check shape of first product
    if (products.length > 0) {
      const product = products[0];
      expect(product).toHaveProperty('ID');
      expect(product).toHaveProperty('shopID');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('picture');
      expect(product).toHaveProperty('info');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('amount');
      expect(product).toHaveProperty('size');

      // add others as needed
  
      expect(typeof product.id).toBe('number');
      expect(typeof product.shopID).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(typeof product.picture).toBe('string');
      expect(typeof product.info).toBe('string');
      expect(typeof product.price).toBe('number');
      expect(typeof product.amount).toBe('number');
      expect(typeof product.size).toBe('string');
    }
  });

