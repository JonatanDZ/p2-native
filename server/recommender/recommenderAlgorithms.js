import {
  getUserFiltersDB,
  getSpecificItemFiltersDB,
  getAllItemFiltersDB,
} from "./recommenderAlgorithmsServer.js";

// User recommendation based on pressed items.
export async function recommenderAlgorithmForUser(userId) {
  // Get items from DB.
  let userFilters = await getUserFiltersDB(userId);
  let allItems = await getAllItemFiltersDB();

  console.log("Item for user recommended: ");

  // To get result use: await recommenderAlgorithmForUser(userId)
  return recommendItem(userFilters, allItems);
}

// Item recommended, a like item.
export async function recommenderAlgorithmForItem(itemId) {
  // Get items from DB
  let itemFilters = await getSpecificItemFiltersDB(itemId);
  let allItems = await getAllItemFiltersDB();

  console.log("A like items recommended: ");

  // To get result use: await recommenderAlgorithmForItem(itemId)
  return recommendItem(itemFilters, allItems);
}

export function recommendItem(userFilters, allItems) {
  // map returns an array to resultsOfDotProduct, where every item is mapped to an object with an id and a score for the different items
  let resultsOfDotProduct = allItems.map((item) => ({
    // Saves id on every item in the list
    ID: item[0],
    // Saves scores on every item in the list with dotProduct(), slice(1) to remove id's, slice(1) makes it start at index 1 instead of zero.
    score: dotProduct(userFilters.slice(1), item.slice(1)),
  }));

  // We compare the lists
  let resultsCompared = compareLists(resultsOfDotProduct);

  // Prints the number one
  console.log("Detter er nummer 1 recommended: ", resultsCompared[0]);
  console.log(); // New line

  // prints all recommended items sorted
  resultsComparedPrinted(resultsCompared);

  // Return the number one recommended
  return resultsCompared;
}

// Multiply the two vectors
export function dotProduct(user, item) {
  let result = 0;
  for (let i in user) {
    result += user[i] * item[i];
  }
  return result;
}

// Sort the recommended list, goes from highest to lowest score
// https://www.w3schools.com/js/js_array_sort.asp#mark_sort
export function compareLists(results) {
  return results.sort(function (a, b) {
    return b.score - a.score;
  });
}

// Prints the recommended result
export function resultsComparedPrinted(resultsCompared) {
  for (let list of resultsCompared) {
    console.log(list);
  }
}
