const password = "dogs dont like cats";
// const encoded = btoa(password);
// console.log({ encoded });

// const decoded = atob(encoded);
// console.log({ decoded });

// const test = atob("cXFkeSBnaHh4IGRzaWEgcGxrZg");
// console.log({ decoded: test });

/* ^^^^ deprecated ^^^^ */

const encoded = Buffer.from(password, "utf-8").toString("base64");
const decoded = Buffer.from("ZG9ncyBkb250IGxpa2UgY2F0cw", "base64").toString(
  "utf-8"
);

console.log({ encoded });
console.log({ decoded });

const test = Buffer.from(encoded, "base64").toString("utf-8");

console.log({ test });
