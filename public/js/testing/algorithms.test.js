import { compareLists, dotProduct } from "../../../server/recommender/recommenderAlgorithms"

// every test follows the principle of arrange, act and assert

//  testing recommenderAlgorithm functions
test('dotProduct properly returns a dotproduct between two vectors', async ()=>{
    const user = {
        black: 2,
        white: 1,
        gray: 0,
        brown: 0,
        blue: 1,
        pants: 0,
        t_shirt: 0,
        sweatshirt: 0,
        hoodie: 2,
        shoes: 2,
        shorts: 0,
        cotton: 0,
        linnen: 0,
        polyester: 0
      };
      const item = {
        black: 1,
        white: 1,
        gray: 0,
        brown: 0,
        blue: 1,
        pants: 0,
        t_shirt: 0,
        sweatshirt: 0,
        hoodie: 1,
        shoes: 1,
        shorts: 0,
        cotton: 1,
        linnen: 0,
        polyester: 0
      };

    const output = dotProduct(user, item);
    const expected = 8;
    expect(output).toEqual(expected);

})

test('compareLists properly compares objects and returns a sorted list of objects', async ()=>{
    const input = [
        { ID: 1, score: 3 },
        { ID: 2, score: 7 },
        { ID: 3, score: 5 }
    ];
    
    const sorted = compareLists(input);
    const expected =  
    [{ ID: 2, score: 7 },
    { ID: 3, score: 5 },
    { ID: 1, score: 3 }]
    
    expect(sorted).toEqual(expected);
});