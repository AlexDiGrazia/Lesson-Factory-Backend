import { prisma } from "../prisma/db.setup";

const clearDB = async () => {
  await prisma.user.deleteMany();
  await prisma.video.deleteMany();
  await prisma.videoPurchase.deleteMany();
};

const seed = async () => {
  await clearDB();
  console.log("db cleared");
  await prisma.user.createMany({
    data: [
      {
        email: "demo",
        password:
          "$2b$11$/0RXDZBi4cTOPzOwN9P4z.11mf60IcIW7312VXuBxu8J0DVlBGl4O",
        role: "ADMIN",
        emailVerified: false,
        subscribed: false,
      },
      {
        email: "dug@gmail.com",
        password:
          "$2b$11$PzBmXpwCy2AfFad5Ov4XheR/w2UPgxfADJTZtYba.p6aItsaAdS7m",
        role: "USER",
        emailVerified: false,
        subscribed: false,
      },
      {
        email: "funk@gmail.com",
        password:
          "$2b$11$koCHTsZiD6mZIMOmtfhL/.F3MYRpOqGHYX8gZqONdazOAPVJOVja6",
        role: "USER",
        emailVerified: false,
        subscribed: false,
      },
      {
        email: "jerry@gmail.com",
        password:
          "$2b$11$D4OXRJdetRg6dKS/a5WY0ucwBv04GxtlHVuptgnGtN5R6sPp8WpNS",
        role: "USER",
        emailVerified: false,
        subscribed: false,
      },
      {
        email: "jules@gmail.com",
        password:
          "$2b$11$JbHCWKMnXPIRtIZrHj4n..EabSdAb1LfKQLdxZmUCnhri2z9GzybS",
        role: "USER",
        emailVerified: false,
        subscribed: false,
      },
      {
        email: "teddy@gmail.com",
        password:
          "$2b$11$gtzpXlVsGFyN08oVZ9lEPuEfL/cb68/VQUPuY72/Jn2kqMnhM4KnG",
        role: "USER",
        emailVerified: false,
        subscribed: false,
      },
      {
        email: "dsad",
        password:
          "$2b$11$zcPCPUQ9oSeav8kO3e3E4.3GGTDkScHlaMawBP5/aDbOoccpP.7um",
        role: "USER",
        emailVerified: false,
        subscribed: false,
      },
      {
        email: "alexdigrazia5@gmail.com",
        password:
          "$2b$11$ppn0jJO7CD6qVibSP6RrpOeuqie80s/HpxnkMj5oglFFDt9yfdqFq",
        role: "ADMIN",
        emailVerified: false,
        subscribed: false,
      },
    ],
  });
  console.log("users created");
  await prisma.video.createMany({
    data: [
      { filename: "all-of-me", title: "All of Me" },
      { filename: "allegretto", title: "Allegretto" },
      { filename: "ATV", title: "ATV" },
      { filename: "bowl-launch", title: "Bowl Launch" },
      { filename: "coding", title: "Coding" },
      { filename: "colt-45", title: "Colt 45" },
      { filename: "deer", title: "Deer" },
      { filename: "Demo (4)", title: "Demo" },
      { filename: "halo", title: "Halo" },
      { filename: "jazz", title: "Jazz" },
      { filename: "julian-lage", title: "Julian Lage" },
      { filename: "light-fixture", title: "Light Fixture" },
      { filename: "matt-alex", title: "Matt and Alex" },
      { filename: "more-waves", title: "More Waves" },
      { filename: "moving", title: "Moving" },
      { filename: "nuggets", title: "Nuggets" },
      { filename: "rain", title: "Rain" },
      { filename: "river", title: "River" },
      { filename: "shred", title: "Shred" },
      { filename: "skateboarding", title: "Skateboarding" },
      { filename: "star-spangled-banner", title: "Star Spangled Banner" },
      { filename: "table", title: "Table" },
      { filename: "talking", title: "Talking" },
      { filename: "Utah", title: "Utah" },
      { filename: "waves", title: "Waves" },
      { filename: "surfline", title: "Surfline" },
      { filename: "man-park-app", title: "Man Park App" },
      { filename: "some-code", title: "Some More code" },
    ],
  });
  console.log("videos created");
};

seed();
