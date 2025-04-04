
function onLoad() {
   // let file = document.getElementById("file_upload");

    fetch("/public/js/admin/TestCsv.csv")
        .then((res) => res.text())
        .then((data) => {
            //  Splitting data each time there is a new line. Given that the user provides a correctly formatted csv file, index 0 will be the rowNames
            let rowNamesSplit = data.split("\n");
            //  Splitting once more, so each rowName is stored as indexes. 
            let headers = rowNamesSplit[0].split(";");

            // Splitting for row data 
            let rowDataSplit = rowNamesSplit.slice(1); // this skips the header row
            // initialize object
            //  Using the .map function on the array rowDataSplit. The array has all the data in each row, we now want to separate them by ";" so we can access
                //  each datapoint individually 
            let rowData = rowDataSplit.map((row)=>{
                const rowData = row.split(";")
                let object = {};
                //  We now want to loop through each header and store each datapoint to the associated header, this will be stored in an object (associative array / struct).
                headers.forEach((headers, index) => {
                    object[headers] = rowData[index];
                });
                return object;
            })
            console.log(rowData);

            // DOM manipulation // 

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
        });
}

onLoad();