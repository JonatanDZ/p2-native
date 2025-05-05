import { getUserFiltersDB, getSpecificItemFiltersDB, updateUserFiltersDB } from "./recommenderAlgorithmsServer.js";


test("getUserFiltersDB test", () => {
    let userId, itemId = 1;
    expext(getUserFiltersDB(userId, itemId).toBe(null));
});

