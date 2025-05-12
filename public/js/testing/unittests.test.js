import { createProduct, getLikedProducts, getProduct, getProducts, getRecommendedProducts } from "../../../server/dbserver";
import { onLoadTest } from "./unitTestSnippets/onLoadTest";

// every test follows the principle of arrange, act and assert

// testing parsing of CSV file to JSON-format object. 
test('onLoadTest properly parses CSV file to object in PRODUCTS.', ()=>{
    const input = "name;price\ntshirt;199\nhoodie;5.99";
    const output = onLoadTest(input);
    
    expect(output).toEqual([{name: "tshirt", price: "199"}, {name: "hoodie", price: "5.99"}]);
})

// All functions getting or sending data to database / primarily from dbserver.js
//  These are integration tests, since they actually test our live DB 
//  Issue is that this assumes you have correct data in the DB, not that the function retrieves properly. 
test('getProducts returns an array of products with expected fields', async () => {
    const products = await getProducts();
  
    // check that it's an array
    expect(Array.isArray(products)).toBe(true);
  
    // if not empty, check shape of first product
    if (products.length > 0) {
        products.forEach(product => {
          expect(product).toHaveProperty('ID');
          expect(product).toHaveProperty('shopID');
          expect(product).toHaveProperty('name');
          expect(product).toHaveProperty('picture');
          expect(product).toHaveProperty('info');
          expect(product).toHaveProperty('price');
          expect(product).toHaveProperty('amount');
        });
      }
  });

//  Testing retrieval of recommendedProducts
test('getRecommendedProducts returns an array of recommended products with expected fields', async () =>{
    const recProducts = await getRecommendedProducts();

    // check that it's an array
    expect(Array.isArray(recProducts)).toBe(true);

    // if not empty, check shape of first product
    if (recProducts.length > 0) {
        recProducts.forEach(recProduct => {
            expect(recProduct).toHaveProperty('ID');
            expect(recProduct).toHaveProperty('shopID');
            expect(recProduct).toHaveProperty('name');
            expect(recProduct).toHaveProperty('picture');
            expect(recProduct).toHaveProperty('info');
            expect(recProduct).toHaveProperty('price');
            expect(recProduct).toHaveProperty('amount');
        });
        }

})

//  Testing retrieval of liked products
test('getLikedProducts returns an array of liked products with expected fields', async () =>{
    const likedProducts = await getLikedProducts();

    // check that it's an array
    expect(Array.isArray(likedProducts)).toBe(true);

    // if not empty, check shape of first product
    if (likedProducts.length > 0) {
        likedProducts.forEach(likedProduct => {
            expect(likedProduct).toHaveProperty('ID');
            expect(likedProduct).toHaveProperty('shopID');
            expect(likedProduct).toHaveProperty('name');
            expect(likedProduct).toHaveProperty('picture');
            expect(likedProduct).toHaveProperty('info');
            expect(likedProduct).toHaveProperty('price');
            expect(likedProduct).toHaveProperty('amount');
        });
        }

})

test('getProduct properly returns a single, specific product', async () =>{
    //  init mock id and function call 
    let mockId = 1; 
    let output = await getProduct(mockId);
    //  init max tries and amount of current tries, so loop doesnt run infinitely.
    //  This accounts for zero entries in the DB
    let tries = 0;
    let maxTries = 100;

    //  if every element in the row is null, we skip to the next product (there should be no NULL rows in the DB)
    while(output === undefined && tries < maxTries){
        mockId++;
        tries++;
        output = await getProduct(mockId);
    }

    if(output !== undefined){
        expect(output).toHaveProperty('ID');
        expect(output).toHaveProperty('shopID');
        expect(output).toHaveProperty('name');
        expect(output).toHaveProperty('picture');
        expect(output).toHaveProperty('info');
        expect(output).toHaveProperty('price');
        expect(output).toHaveProperty('amount');
    } 
})

test('createProduct properly returns both a row in products_table and products_filter. The function is dependent on getProduct working.. ', async () =>{
    const input = {
        name: "White pants",
        shopID: "1",
        picture: "test.jpg",
        info: "Perfect for everyday use.",
        price: "651",
        amount: "6",
        black: 0,
        white: 1,
        gray: 0,
        brown: 0,
        blue: 0,
        pants: 1,
        t_shirt: 0,
        sweatshirt: 0,
        hoodie: 0,
        shoes: 0,
        shorts: 0,
        cotton: 0,
        linnen: 0,
        polyester: 1
      };    
      
      // Starting transaction in mysql 
    //  The transaction is a sort of testing environment. Everything in between start transaction and rollback will not be applied to the actual database.

    // TODO: fix the transaction aspect so it actually doesnt save in the DB. 
    //await pool.query('START TRANSACTION');
    // Issue 
    const output = await createProduct(input);
    expect(output.productTableOutput).toEqual({
        ID: expect.any(Number),
        name: "White pants",
        shopID: 1,
        price: 651,
        amount: 6,
        picture: "test.jpg",
        info: "Perfect for everyday use.",
        size: null  // or optional if not needed
      });

    expect(output.productFiltersTableOutput).toEqual({
        productID: output.productTableOutput.ID,  
        black: 0,
        white: 1,
        gray: 0,
        brown: 0,
        blue: 0,
        pants: 1,
        t_shirt: 0,
        sweatshirt: 0,
        hoodie: 0,
        shoes: 0,
        shorts: 0,
        cotton: 0,
        linnen: 0,
        polyester: 1
      });

    //await pool.query('ROLLBACK');
})
