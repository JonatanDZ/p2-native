import { onLoadTest } from "./unitTestSnippets/onLoadTest";

// every test follows the principle of arrange, act and assert

// testing parsing of CSV file to JSON-format object. 
test('onLoadTest properly parses CSV file to object in PRODUCTS.', ()=>{
    const input = "name;price\ntshirt;199\nhoodie;5.99";
    const output = onLoadTest(input);
    
    expect(output).toEqual([{name: "tshirt", price: "199"}, {name: "hoodie", price: "5.99"}]);
})
