// forventen csv kommmer ind med e
export function onLoadTest(e) {
    //  Removing aspects of the function which focuses on UI and saving to database
    //  This is a unit test so we are only looking to test for pure JS logic
    let data = e;
    //  Splitting data each time there is a new line. Given that the user provides a correctly formatted csv file, index 0 will be the columnNames
    let columnNames = data.split("\n");
    //  Trimming both headers for weird characters as this causes issues in the DB
    //  Splitting once more, so each columnName is stored as indexes.
    let headers = columnNames[0].split(";").map(header => header.replace(/\r/g, ""));
    //  .split returns an array of strings therefore .map has to be used to clean up; .map works just as foreach but returns an array which is needed

    // Splitting for row data 
    let rowDataSplit = columnNames.slice(1).map(row => row.replace(/\r/g, ""));

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
        
        return object;
    })
    return rowData;
}
