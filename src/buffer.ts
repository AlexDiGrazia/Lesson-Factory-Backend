const password = ``;

const encoded = Buffer.from(password, "utf-8").toString("base64");
const decoded = Buffer.from(encoded, "base64").toString("utf-8");

console.log({ encoded });
console.log({ decoded });
