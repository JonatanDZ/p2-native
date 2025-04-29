import { getUserFiltersDB, getSpecificItemFiltersDB, updateUserFiltersDB } from "./recommenderAlgorithmsServer.js";

export async function updateUserFilters(userId, itemId) {
    // Get the user and item you want to update the user with. 
    let userFilters = await getUserFiltersDB(userId);
    let itemFilters = await getSpecificItemFiltersDB(itemId);

    // Makes the user update based on the specific item. 
    let NewUserData = await insertNewData(userFilters, itemFilters);

    // send the new user filters to the DB.
    await updateUserFiltersDB(userId, NewUserData);
}

async function insertNewData(userFilters, itemFilters) {
    // Error catching
    if (!userFilters) {
        console.log("The user filters do not exist");
        process.exit(1);
    }

    // Error catching
    if (!itemFilters) {
        console.log("The item filters do not exist");
        process.exit(1);
    }


    // We use shift() to remove the IDs, because we won't need the first elements anymore.
    userFilters.shift();
    itemFilters.shift();

    // Increases userFilters[i] if the item has a 1 at that index, so it updates what the user will get recommended
    for (let i = 0; i < itemFilters.length; i++) {
        if (itemFilters[i] === 1) {
            userFilters[i]++;
        }
    }

    return userFilters;
}