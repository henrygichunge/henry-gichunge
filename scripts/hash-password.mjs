import { pbkdf2Sync, randomBytes } from "node:crypto";

const DEFAULT_ITERATIONS = 50000;
const MIN_ITERATIONS = 10000;
const MAX_ITERATIONS = 100000;
const MIN_LENGTH = 16;
const MAX_LENGTH = 200;

function fail(message) {
  console.error(`\n${message}`);
  process.exit(1);
}

const iterations = process.argv[2] ? Number(process.argv[2]) : DEFAULT_ITERATIONS;
if (!Number.isInteger(iterations) || iterations < MIN_ITERATIONS || iterations > MAX_ITERATIONS) {
  fail(`Iterations must be a whole number from ${MIN_ITERATIONS} to ${MAX_ITERATIONS}.`);
}

/** Reads a line from the keyboard without showing what is typed. */
function ask(prompt) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    if (!stdin.isTTY) {
      reject(new Error("Run this in an interactive terminal."));
      return;
    }
    process.stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";

    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === "\u0003") {
          stdin.setRawMode(false);
          process.stdout.write("\n");
          process.exit(1);
        } else if (ch === "\r" || ch === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener("data", onData);
          process.stdout.write("\n");
          resolve(value);
          return;
        } else if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
        } else {
          value += ch;
        }
      }
    };
    stdin.on("data", onData);
  });
}

async function main() {
  console.log("Choose a long, unique passphrase. Nothing you type is shown.");
  console.log(`It must be at least ${MIN_LENGTH} characters.\n`);

  const password = await ask("Passphrase: ");
  const again = await ask("Repeat it: ");

  if (password !== again) fail("The two entries do not match. Nothing was created.");
  if (password.length < MIN_LENGTH) fail(`Too short: use at least ${MIN_LENGTH} characters.`);
  if (password.length > MAX_LENGTH) fail(`Too long: use at most ${MAX_LENGTH} characters.`);

  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, iterations, 32, "sha256");

  console.log("\nCopy the ONE line below, in full, into the Cloudflare secret ADMIN_PASSWORD_HASH.");
  console.log("Do not paste it into chat, a file or the repository.\n");
  console.log(`pbkdf2-sha256$${iterations}$${salt.toString("base64")}$${hash.toString("base64")}`);
  console.log("\nWhen you have copied it, run:  clear");
}

main().catch((error) => fail(error.message));