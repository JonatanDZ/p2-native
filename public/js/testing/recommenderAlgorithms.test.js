import { reccomendEvents } from "../../../server/recommender/event_recommender";
import { compareLists, dotProduct, recommenderAlgorithmForItem, recommendItem } from "../../../server/recommender/recommenderAlgorithms"

// every test follows the principle of arrange, act and assert

//  testing recommenderAlgorithm functions
test('dotProduct properly returns a dotproduct between two vectors', ()=>{
  // arranging mock user and item filters
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

    // expecting the value of these two vectors being dotted with each other. 
    const output = dotProduct(user, item);
    const expected = 8;
    expect(output).toEqual(expected);
})

test('compareLists properly compares objects and returns a sorted list of objects', ()=>{
  // arranging mock input 
    const input = [
        { ID: 1, score: 3 },
        { ID: 2, score: 7 },
        { ID: 3, score: 5 }
    ];
    
    // expecting that the list with the highest score is output
    const sorted = compareLists(input);
    const expected =  
    [{ ID: 2, score: 7 },
    { ID: 3, score: 5 },
    { ID: 1, score: 3 }]

    expect(sorted).toEqual(expected);
});


test('recommendItem properly compares the lists and returns the recommended items as a list of objects', ()=>{
    // arranging mock user and items filters
    const user = [null, 2, 1, 0, 0, 1, 0, 0, 0, 2, 2, 0, 2, 0, 0];

    const items = [
        [1, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0],
        [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0] 
      ];
    
    // the recommended item should be the row in "items" which, when multiplied with the user filter, yields the largest result 
    const output = recommendItem(user, items);
    const expected = [{ID: 1, score: 8}, {ID: 2, score: 6}];

    expect(output).toEqual(expected);
});

// integration test, since it touches DB
//  will fail if the expected id changes, or its attributes are altered. 
test('recommenderAlgorithmForItem properly returns recommended item given a specific item ("other products you will like") ', async ()=>{
    const id = 551;
    const output = await recommenderAlgorithmForItem(id);

    //  since this is an integration test, values are subject to change, therefore the specific properties are stated as expected not the values.
    //  Firstly, it is expected to return an array of objects. 
    expect(Array.isArray(output)).toBe(true);

    // secondly, we expect the properties ID and score to be present in each object. 
    if (output.length > 0) {
        output.forEach(object => {
          expect(object).toHaveProperty('ID');
          expect(object).toHaveProperty('score');
        });
      }
})

/*
test('reccomendEvents properly returns a sorted array of recommended events', ()=>{
  const data = [
    { userID: 1, eventID: 1 },
    { userID: 1, eventID: 2 },
    { userID: 2, eventID: 1 },
    { userID: 2, eventID: 3 },
    { userID: 3, eventID: 2 },
    { userID: 3, eventID: 4 },
    { userID: 4, eventID: 1 },
    { userID: 4, eventID: 4 }
  ];
  const events = [
    { ID: 1, name: "Yoga" },
    { ID: 2, name: "Jazz" },
    { ID: 3, name: "Food Fest" },
    { ID: 4, name: "Fashion Show" }
  ];
  
  const output = reccomendEvents(data,events);

  // expect the type of output to be a 3d array
  expect(Array.isArray(output)).toBe(true);

  //  Expecting the following array
  Expecting: 
    [
    [2, 1],
    [2, 4],
    [1, 2],
    [1, 3]
    ]
    console log: "We reccomend event 1, event 4 and event 2"

  expect(output).toEqual([
    [2, 1],
    [2, 4],
    [1, 2],
    [1, 3]
  ])
})
*/


