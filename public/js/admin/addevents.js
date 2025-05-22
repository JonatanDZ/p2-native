function onLoad(e) {
    let data = e.target.result;
    console.log(data);
    //  Splitting data each time there is a new line. Given that the user provides a correctly formatted csv file, index 0 will be the columnNames
    let columnNames = data.split("\n");

    //  Trimming both headers for weird characters as this causes issues in the DB
    //  Splitting once more, so each columnName is stored as indexes.      
    let headers = columnNames[0].split(";").map(header => header.replace(/\r/g, ""));
    //  .split returns an array of strings therefore .map has to be used to clean up; .map works just as foreach but returns an array which is needed

    // Splitting for row data 
    let rowDataSplit = columnNames.slice(1).map(row => row.replace(/\r/g, "")); // this skips the header row, and removes carriage returns 


    // initialize object
    //  Using the .map function on the array rowDataSplit. The array has all the data in each row, we now want to separate them by ";" so we can access
    //  each datapoint individually. The map method functions just as the forEach but returns an array; this is a KEY difference.
    let rowData = rowDataSplit.map((row) => {
        const rowData = row.split(";");
        let object = {};
        //  We now want to loop through each header and store each datapoint to the associated header, this will be stored in an object (associative array / struct).
        headers.forEach((headers, index) => {
            object[headers] = rowData[index];
        });
        // Since we are using the .map method this returns an array of objects.
        return object;
    })
    console.log(rowData);
    // save to DB in case of button click
    saveToDb(rowData);
    // DOM manipulation // Printing the data to the screen by creating javascript elements. 

    // getting content div from html
    const contentDiv = document.getElementById("content");

    // creating table
    const table = document.createElement("table");

    //  Creating row
    const headerRow = document.createElement("tr");

    // displaying each header in the first table row
    headers.forEach(headerText => {
        const th = document.createElement("th");
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    //append to page
    table.appendChild(headerRow);

    //  displaying the row data
    rowData.forEach(rowData => {
        // create row each time 
        const tr = document.createElement("tr");

        headers.forEach(headers => {
            // for each header create table data
            const td = document.createElement("td");
            td.textContent = rowData[headers];
            tr.appendChild(td);
        });

        table.appendChild(tr); // append this row to the table
    });

    // append to page
    contentDiv.appendChild(table);

    // apply a class so styling can be made
    table.classList.add("product-table");
}


function readFile() {
    //  Using FileReader instead of fetch. 
    document.getElementById("file_upload").addEventListener("change", function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        //  Passing the event to the function onLoad. 
        reader.onload = onLoad;
        reader.readAsText(file);
    });
}

function saveToDb(rowData){
    document.getElementById("upload_to_db_events").addEventListener("click", function (event){
        //Make a POST request with the data given by user
        fetch('/save-events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rowData)
        })
        .catch(error => {
            console.error("Error sending data to /save-events:", error);
        });
    })
}

readFile();
