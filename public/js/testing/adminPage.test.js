import { onLoadTest } from "./unitTestSnippets/onLoadTest";

// every test follows the principle of arrange, act and assert

// testing parsing of CSV file to JSON-format object. 

//testen får noget mock data som tester om den læser de rigtige elementer i den givne CSV fil. Den får name;price og så fortæller vi den et navn og prisen på et produkt
// testen skulle så gerne forvente at læse navnet er tshirt og prisen er 199
test('onLoadTest properly parses CSV file to object in PRODUCTS.', () => {
    // inputting mock "name" row and data row
    const input = "name;price\ntshirt;199\nhoodie;5.99";
    const output = onLoadTest(input);

    // asserting that the output matches the expected array of objects
    expect(output).toEqual([{ name: "tshirt", price: "199" }, { name: "hoodie", price: "5.99" }]);
})
