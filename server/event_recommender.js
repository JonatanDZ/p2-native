let user_array = [];

let data = [
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0],
  [0, 1, 1],
];

let user = [0, 0, -1];

for (let j = 0; j < 4; j++) {
  if (user[j] != -1) {
    for (let i = 0; i < data.length; i++) {
      if ((data[i][j] = user[j])) {
        user_array.append(data[i][user.indexOf(-1)]);
      }
    }
  }
}

let count = 0;
//Count amount of 1's and 0's in user_array
for (let i = 0; i < user_array.length; i++) {
  if (user_array[i] == 1) {
    count += 1;
  } else if (user_array[i] == 0) {
    count -= 1;
  }
}

console.log(count);
