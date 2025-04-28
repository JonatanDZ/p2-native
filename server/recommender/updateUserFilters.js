import { getUserFiltersDB, getSpecificItemFiltersDB, updateUserFiltersDB } from "./recommenderAlgorithmsServer.js";

let itemId = 5;
let userId = 1;

updateUserFilters(userId, itemId);

export async function updateUserFilters(userId, itemId) {
    let NewUserData = [];

    let userFilters = await getUserFiltersDB(userId);
    let itemFilters = await getSpecificItemFiltersDB(itemId);
    console.log("User: ", userFilters);
    console.log("item added: ", itemFilters);

    // her sker magien med at listen bliver opdateret med de rigtige tal
    NewUserData = await insertNewData(userFilters, itemFilters);
    await updateUserFiltersDB(userId, NewUserData);
    console.log("Efter userFilter update: ", await getUserFiltersDB(userId));
}

async function insertNewData(userFilters, itemFilters) {
    //fjerner id og er fejlkode for om id'sne eksistere. 

    if (!userFilters) {
        console.log("The user filters do not exist");
        process.exit(1);
    }

    if (!itemFilters) {
        console.log("The item filters do not exist");
        process.exit(1);
    }

    userFilters.shift();
    itemFilters.shift();

    // lægger 1 til i user hvis der er 1 i item der er trykket på.
    for (let i = 0; i < itemFilters.length; i++) {
        if (itemFilters[i] === 1) {
            userFilters[i]++;
        }
    }

    return userFilters;
}