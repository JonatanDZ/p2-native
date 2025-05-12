import { dotProduct } from "../../../server/recommender/recommenderAlgorithms"


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

test('compareLists properly returns the list which is largest', async ()=>{

})