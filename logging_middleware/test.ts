import { Log } from "./index";

async function testLogger() {
  const result1 = await Log(
    "backend",
    "error",
    "handler",
    "received string, expected bool"
  );
  console.log("Result 1:", result1);

  const result2 = await Log(
    "backend",
    "fatal",
    "db",
    "Critical database connection failure."
  );
  console.log("Result 2:", result2);
}

testLogger();