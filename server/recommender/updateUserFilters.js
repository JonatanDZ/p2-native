import { getUserFiltersDB, getSpecificItemFiltersDB, updateUserFiltersDB } from "./recommenderAlgorithmsServer.js";

// funktionen kalder først på getUserFiltersDB, så den får et array af filtre fra det specifikke userID. dernæst kalder den på getSpecifikItemFiltersDB og får
// filtrene for et specifikt itemId.
// så lader vi newUserData være det array som insertNewData spytter ud til sidst.
// til sidst kalder vi på updateUserFiltersDB som tager userID og NewUserdata som argumenter. Den funktion sørger så for at opdatere databasen.
export async function updateUserFilters(userId, itemId) {
    // Get the user and item you want to update the user with. 
    let userFilters = await getUserFiltersDB(userId);
    let itemFilters = await getSpecificItemFiltersDB(itemId);

    // Makes the user update based on the specific item. 
    let NewUserData = await insertNewData(userFilters, itemFilters);

    // send the new user filters to the DB.
    await updateUserFiltersDB(userId, NewUserData);
}

// funktionen tager brugerfiltre og itemfiltre som parametre. Så tjekker den først om der er userfilters og itemfilters. Dernæst bruger vi shift fordi vi vilk gerne 
// fjerne userid og itemid da vi ikke skal bruge det nu. Så er der for loop som øger userFilters[i] filter med 1. Fx klikker en person på en sort t-shirt, vil den brugers
// filter for "black" blive øget med 1 samt hvilket slags tøj det er osv. 
// til sidst returnerer den det opdaterede array som kan sendes til databasen.
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