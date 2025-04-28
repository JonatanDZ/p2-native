import { getUserFiltersDB, getSpecificItemFiltersDB, getAllItemFiltersDB } from "./recommenderAlgorithmsServer.js";

// User recommendation based on pressed items.
let userId = 1;
recommenderAlgorithmForUser(userId)

export async function recommenderAlgorithmForUser(userId) {
    let userFilters = await getUserFiltersDB(userId);
    let allItems = await getAllItemFiltersDB();

    console.log("Item for user recommended: ")

    recommendItem(userFilters, allItems);
    // new line for prettynes
    console.log("");
}



// Item recommended, a like item.
let itemId = 1;
recommenderAlgorithmForItem(itemId);

export async function recommenderAlgorithmForItem(itemId) {
    let itemFilters = await getSpecificItemFiltersDB(itemId);
    let allItems = await getAllItemFiltersDB();

    console.log("A like items recommended: ")

    recommendItem(itemFilters, allItems);
    // new line for prettynes
    console.log("");
}

function recommendItem(userFilters, allItems) {
    let resultsOfDotProduct = allItems.map(list => ({
        id: list[0], 
        score: dotProduct(userFilters.slice(1), list.slice(1))
    }));
    
    let resultsCompared = compareLists(resultsOfDotProduct);
    
    console.log("Detter er nummer 1 recommended: ", resultsCompared[0]); // Prints the number one
    console.log() // New line

    resultsComparedPrinted(resultsCompared); // prints all recommended items sorted 
}

// Multiply the two vectors
function dotProduct(user, item) {
    let result = 0;
    for (let i in user) {
        result += user[i] * item[i];
    }
    return result;
}

// Sort the recommended list, goes from highest to lowest score
// https://www.w3schools.com/js/js_array_sort.asp#mark_sort
function compareLists(results) {
    return results.sort(function(a, b){return b.score - a.score});
}

// Prints the recommmended result
function resultsComparedPrinted(resultsCompared) {
    for (let list of resultsCompared){
        console.log(list);
    }
}
