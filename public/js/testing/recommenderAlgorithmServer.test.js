// integration testing, since it touches on the live DB

import { getAllItemFiltersDB, getUserFiltersDB } from "../../../server/recommender/recommenderAlgorithmsServer"

test('getUserFiltersDB properly returns the filter row from the DB given a user id', async () => {
  // assumes that there actually is a row with id = 7, this can cause issues 
    const id = 7;
    const output = await getUserFiltersDB(id);

    //  Testing to see if it returns an array, since it initially gets an object from the DB and then returns the specific row as an array
    expect(output).toEqual(expect.any(Array));

    //  Testing to see if the row has the correct properties
    // The function returns only the values in the row. Therefore we simply want to check that the function returns a row with actual information.
    if(output !== undefined){
        output.forEach(element => {
            expect(element).toBeGreaterThanOrEqual(0);
        });
    } 
  });

test('getAllItemFiltersDB properly returns an array of the values of each itemFilter', async ()=>{
    const output = await getAllItemFiltersDB();

    //  Function should return an array of objects
    expect(output).toEqual(expect.any(Array));

    // run through all objects in array and check the properties
    if (output.length > 0) {
        // enters the outer array, where all item filter arrays are
        output.forEach(row => {
            // enters the inner array, where the values of the item filter is
            row.forEach(value => {
              expect(value).toBeGreaterThanOrEqual(0);
            });
          });
        }
})