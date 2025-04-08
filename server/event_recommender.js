let count = [0, 0, 0, 0, 0];

let data = [
  [0, 1, 1, 1, 0],
  [1, 0, 1, 1, 1],
  [1, 1, 0, 0, 0],
  [0, 1, 1, 0, 1],
];

let user = [0, 0, -1, 1, -1];

for (let j = 0; j < user.length; j++) {
  for (let i = 0; i < data.length; i++) {
    if (data[i][j] == user[j]) {
      for (let n = 0; n < user.length; n++) {
        if (user[n] == -1) {
          if (data[i][n] == 1) {
            count[n] += 1;
          } else count[n] -= 1;
        }
      }
    }
  }
}

console.log(count);
