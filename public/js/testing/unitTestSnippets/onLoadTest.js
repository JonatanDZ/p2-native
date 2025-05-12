export function onLoadTest(e) {
    //  Removing aspects of the function which focuses on UI and saving to database
    //  This is a unit test so we are only looking to test for pure JS logic
    let data = e;
    let columnNames = data.split("\n");
    let headers = columnNames[0].split(";").map(header => header.replace(/\r/g, ""));
    let rowDataSplit = columnNames.slice(1).map(row => row.replace(/\r/g, ""));
    let rowData = rowDataSplit.map((row)=>{
        const rowData = row.split(";");
        let object = {};
        headers.forEach((headers, index) => {
            object[headers] = rowData[index];
        });
        return object;
    })
    return rowData;
}
