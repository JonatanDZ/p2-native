
// Main function that calls the other functions to recommend an item
function recommendedItem(user, numberOfLists) {
    let resultsOfDotProduct = numberOfLists.map(list => ({
        id: list[0], 
        score: dotProduct(user.slice(1), list.slice(1))
    }));
    
    let resultsCompared = compareLists(resultsOfDotProduct);
    
    console.log("Detter er nummer 1 recommended: ", resultsCompared[0]); // Prints the number one
    console.log() // New line

    resultsComparedPrinted(resultsCompared); // prints all recommended items sorted 
}

//Test user
//let user = [0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 0];

// Code starts here where data is fetched and main function is called
let itemID = 2;
fetchData(itemID).then(data => {
    if (data) {
        let { items, itemALike } = data;
        itemALike = itemALike[0]; 
        console.log(items);
        console.log(itemALike);
        recommendedItem(itemALike, items);
    }
});