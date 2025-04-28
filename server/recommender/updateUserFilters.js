import {getUserFiltersDB, getAllItemFiltersDB} from "./recommenderAlgorithmsServer.js";

async function updateUserFilters(userId, itemId) {
    let dataForDB = [];

    let userFilters = await getUserFiltersDB(userId);
    let itemFilters = await getAllItemFiltersDB(itemId);
    console.log("Tidliger user: ", userFilters[0]);
    console.log("Tidligere item", itemFilters[0]);
/* 
 
    // her sker magien med at listen bliver opdateret med de rigtige tal
    dataForDB = await alterDataToList(data);
    console.log(data);


    alterDataYes = 1;
    // Ændre det oprindelige liste med den nye liste af tal i dben. 
    await fetchData(userId, itemId, dataForDB, alterDataYes);

    // Går ind og henter den nye liste i db. 
    alterDataYes = 0;
    let alteredData = await fetchData(userId, itemId, dataForDB, alterDataYes);
    console.log(alteredData.userData[0]); */
};

let itemId = 5;
let userId = 1;
updateUserFilters(userId, itemId);