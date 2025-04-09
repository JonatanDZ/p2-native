
item_id = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0];
user_id = [1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0];

function insertData(item_id, user_id) {
    for (let i = 0; i < item_id.length; i++) {
        if (item_id[i] === 1) {
            user_id[i]++;
        } 
    }
    return user_id;
}

//mangler funktion der henter user ned, og manglr en funktion der får item. 

// Forside skal laves først

document.getElementById().addEventListener("click", function() {
    let insertData(item_id, user_id);
    //skal ind og rette db efter opdatering. 
    alt table db.userUpdate(insertData);

});

//console.log(user_id);