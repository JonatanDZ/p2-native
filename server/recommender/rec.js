function dotProduct(user, item) {
    let result = 0;
    for (let i in user) {
        result += user[i] * item[i];
    }
    return result;
}

function resultsComparedPrinted(resultsCompared) {
    for (let list of resultsCompared){
        console.log(list);
    }
}

//https://www.w3schools.com/js/js_array_sort.asp#mark_sort Se hvordan det virker her.
function compareLists(results) {
    return results.sort(function(a, b){return b - a});
}

function recommendedItem(user, numberOfLists) {
    let resultsOfDotProduct = [];
    for (let list of numberOfLists) { 
        resultsOfDotProduct.push(dotProduct(user, list)); 
    }    
    
    let resultsCompared = compareLists(resultsOfDotProduct);
    resultsComparedPrinted(resultsCompared);
}

let user = [1, 0, 0, 1, 1];
let numberOfLists = [[1, 1, 1, 1, 0],[0, 0, 1, 0, 1],[0, 0, 1, 0, 1]];

recommendedItem(user, numberOfLists);