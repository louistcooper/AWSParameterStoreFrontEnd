const { SSMClient, PutParameterCommand } = require("@aws-sdk/client-ssm");
const readline = require("readline");

const ssmClient = new SSMClient({ region: "ap-southeast-2" });

function promptUserInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question("Enter parameter key: ", (key) => {
      rl.question("Enter parameter value: ", (value) => {
        rl.close();
        resolve({ key, value });
      });
    });
  });
}

async function putStringParameters(stringParameters) {
  for (const [name, value] of Object.entries(stringParameters)) {
    const command = new PutParameterCommand({
      Name: name,
      Value: value,
      Type: "String",
      Overwrite: true,
    });

    try {
      await ssmClient.send(command);
      console.log(`Parameter '${name}' added to Parameter Store.`);
    } catch (error) {
      console.error(`Error adding parameter '${name}':`, error);
    }
  }
}

async function putSecretStringParameters(secretStringParameters) {
  for (const [name, value] of Object.entries(secretStringParameters)) {
    const command = new PutParameterCommand({
      Name: name,
      Value: value,
      Type: "SecureString",
      Overwrite: true,
    });

    try {
      await ssmClient.send(command);
      console.log(`Secure Parameter '${name}' added to Parameter Store.`);
    } catch (error) {
      console.error(`Error adding secure parameter '${name}':`, error);
    }
  }
}

async function addParameters() {
  // while (true) {
    const { key, value } = await promptUserInput();
    // if (!key || !value) break;

    const isSecure = await promptConfirmation(
      "Is this a secure parameter? (y/n)"
    );

    if (isSecure) {
      await putSecretStringParameters({ [key]: value });
    } else {
      await putStringParameters({ [key]: value });
    }
  // }
}

function promptConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === "y");
    });
  });
}

// Run the script
addParameters();
