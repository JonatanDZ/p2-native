import { onLoadTest } from "./unitTestSnippets/onLoadTest";

// testing parsing of CSV file to JSON-format object. 
test('Properly parses CSV file to object in PRODUCTS.', ()=>{
    const input = "name;price\ntshirt;199\nhoodie;5.99";
    const output = onLoadTest(input);
    expect(output).toEqual([{name: "tshirt", price: "199"}, {name: "hoodie", price: "5.99"}]);
})


