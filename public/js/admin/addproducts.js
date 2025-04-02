import { loadComponents } from "./loadcomponents/loadcomponents.js";

loadComponents();

function onLoad() {
    fetch("/public/js/admin/TestCsv.csv")
        .then((res) => res.text())
        .then((data) => {
            let splitData = data.split(";",3);
            console.log(splitData);
        });
}

onLoad();