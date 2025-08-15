// const { ActivityTypes } = require("@microsoft/agents-activity");
// const {
//   AgentApplication,
//   AttachmentDownloader,
//   MemoryStorage,
// } = require("@microsoft/agents-hosting");
// const { version } = require("@microsoft/agents-hosting/package.json");

// const downloader = new AttachmentDownloader();

// // Define storage and application
// const storage = new MemoryStorage();
// const teamsBot = new AgentApplication({
//   storage,
//   fileDownloaders: [downloader],
// });

// // Listen for user to say '/reset' and then delete conversation state
// teamsBot.message("/reset", async (context, state) => {
//   state.deleteConversationState();
//   await context.sendActivity("Ok I've deleted the current conversation state.");
// });

// teamsBot.message("/count", async (context, state) => {
//   const count = state.conversation.count ?? 0;
//   await context.sendActivity(`The count is ${count}`);
// });

// teamsBot.message("/diag", async (context, state) => {
//   await state.load(context, storage);
//   await context.sendActivity(JSON.stringify(context.activity));
// });

// teamsBot.message("/state", async (context, state) => {
//   await state.load(context, storage);
//   await context.sendActivity(JSON.stringify(state));
// });

// teamsBot.message("/runtime", async (context, state) => {
//   const runtime = {
//     nodeversion: process.version,
//     sdkversion: version,
//   };
//   await context.sendActivity(JSON.stringify(runtime));
// });

// teamsBot.conversationUpdate("membersAdded", async (context, state) => {
//   await context.sendActivity(
//     `Hi there! I'm an echo bot running on Agents SDK version ${version} that will echo what you said to me.`
//   );
// });

// // Listen for ANY message to be received. MUST BE AFTER ANY OTHER MESSAGE HANDLERS
// teamsBot.activity(ActivityTypes.Message, async (context, state) => {
//   // Increment count state
//   let count = state.conversation.count ?? 0;
//   state.conversation.count = ++count;

//   // Echo back users request
//   await context.sendActivity(`[${count}] you said: ${context.activity.text}`);
// });

// teamsBot.activity(/^message/, async (context, state) => {
//   await context.sendActivity(`Matched with regex: ${context.activity.type}`);
// });

// teamsBot.activity(
//   async (context) => Promise.resolve(context.activity.type === "message"),
//   async (context, state) => {
//     await context.sendActivity(`Matched function: ${context.activity.type}`);
//   }
// );

// // code version 2  //
// const axios = require("axios");
// const FormData = require("form-data");
// const { ActivityTypes } = require("@microsoft/agents-activity");
// const {
//   AgentApplication,
//   AttachmentDownloader,
//   MemoryStorage,
//   BotState,
//   ConversationState,
// } = require("@microsoft/agents-hosting");
// const { version } = require("@microsoft/agents-hosting/package.json");

// // Import the necessary dialog components
// const {
//   ComponentDialog,
//   WaterfallDialog,
//   TextPrompt,
//   DialogSet,
//   DialogTurnStatus,
// } = require('botbuilder-dialogs');

// require('dotenv').config();
// const downloader = new AttachmentDownloader();

// // Define storage and application
// const storage = new MemoryStorage();
// // Create state management objects
// const conversationState = new ConversationState(storage);
// const teamsBot = new AgentApplication({
//   storage,
//   fileDownloaders: [downloader],
//   conversationState, // Pass the conversation state to the bot application
// });

// // Define the names for our dialogs and prompts
// const LOGIN_DIALOG = 'loginDialog';
// const ROOT_DIALOG = 'rootDialog';
// const WATERFALL_DIALOG = 'waterfallDialog';
// const TEXT_PROMPT = 'textPrompt';

// // Create a property accessor for the dialog state
// const dialogState = conversationState.createProperty('DialogState');
// // Create a property accessor for some general state.
// const loginState = conversationState.createProperty('LoginState');

// // **HARD-CODED CREDENTIALS FOR DEMONSTRATION PURPOSES ONLY**
// // In a real application, you would validate against a secure database.
// const CORRECT_USERNAME = 'user123';
// const CORRECT_PASSWORD = 'password123';

// // ---------------------------------------------
// // Define the LoginDialog as a ComponentDialog
// // ---------------------------------------------
// class LoginDialog extends ComponentDialog {
//   constructor(id) {
//     super(id || LOGIN_DIALOG);

//     // Add prompts that will be used by the waterfall dialog.
//     this.addDialog(new TextPrompt(TEXT_PROMPT));

//     // Define the waterfall dialog steps.
//     this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
//       this.promptForUsernameStep.bind(this),
//       this.promptForPasswordStep.bind(this),
//       this.validateCredentialsStep.bind(this),
//     ]));

//     // The initial dialog to run is the waterfall dialog.
//     this.initialDialogId = WATERFALL_DIALOG;
//   }

//   /**
//    * Step 1: Prompt the user for their username.
//    */
//   async promptForUsernameStep(stepContext) {
//     // We are entering the first step of the dialog.
//     // We'll prompt the user for their username.
//     return await stepContext.prompt(TEXT_PROMPT, {
//       prompt: 'What is your username?',
//     });
//   }

//   /**
//    * Step 2: Prompt the user for their password.
//    */
//   async promptForPasswordStep(stepContext) {
//     // Save the username from the previous step into the dialog's state.
//     stepContext.values.username = stepContext.result;

//     // Now, prompt the user for their password.
//     return await stepContext.prompt(TEXT_PROMPT, {
//       prompt: `Hello, ${stepContext.values.username}! Please enter your password.`,
//     });
//   }

//   /**
//    * Step 3: Acknowledge the login and end the dialog.
//    */
//   async validateCredentialsStep(stepContext) {
//     // Save the password from the previous step.
//     stepContext.values.password = stepContext.result;
    
//     // Perform validation against the hard-coded credentials.
//     const { username, password } = stepContext.values;
    
//     if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
//         // Validation successful
//         await stepContext.context.sendActivity(
//           `Thanks, ${username}. You are now logged in! We will not store your password.`
//         );
//         // End the dialog and return the success status.
//         return await stepContext.endDialog({ success: true, username: username });
//     } else {
//         // Validation failed
//         await stepContext.context.sendActivity(
//           "Invalid username or password. Please start the login process again by typing 'login'."
//         );
//         // End the dialog with a failure status.
//         return await stepContext.endDialog({ success: false });
//     }
//   }
// }

// // ---------------------------------------------
// // Define the RootDialog to orchestrate other dialogs
// // ---------------------------------------------
// class RootDialog extends ComponentDialog {
//   constructor(id) {
//     super(id || ROOT_DIALOG);

//     // Add our login dialog as a component.
//     this.addDialog(new LoginDialog(LOGIN_DIALOG));

//     // The waterfall dialog defines the root conversation flow.
//     this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
//       this.startDialogStep.bind(this),
//       this.finalStep.bind(this),
//     ]));

//     // The initial dialog to run is the waterfall dialog.
//     this.initialDialogId = WATERFALL_DIALOG;
//   }

//   /**
//    * This is the first step of the RootDialog. It will check if the user
//    * wants to login and start the LoginDialog.
//    */
//   async startDialogStep(stepContext) {
//     // Check if the user's message is 'login' to start the dialog.
//     const text = stepContext.context.activity.text.toLowerCase();
//     if (text === 'login') {
//       return await stepContext.beginDialog(LOGIN_DIALOG);
//     } else {
//       await stepContext.context.sendActivity("Hi! Say 'login' to start the login process.");
//       return await stepContext.endDialog();
//     }
//   }

//   /**
//    * This is the final step of the RootDialog. It receives the result from
//    * the LoginDialog and can process it or just end the conversation.
//    */
//   async finalStep(stepContext) {
//     // We've received the result from the login dialog.
//     // For this example, we'll just log it and end the conversation.
//     if (stepContext.result && stepContext.result.success) {
//       console.log(`Login successful for user: ${stepContext.result.username}`);
//       await stepContext.context.sendActivity(`You're all set!`);
//     }

//     return await stepContext.endDialog();
//   }
// }

// // Create a dialog set to manage the dialogs
// const dialogs = new DialogSet(dialogState);
// dialogs.add(new RootDialog());


// // ---------------------------------------------
// // Your existing message handlers
// // ---------------------------------------------
// teamsBot.message("/reset", async (context, state) => {
//   try {
//     // Clear the state and dialog stack
//     state.deleteConversationState();
//     await dialogState.delete(context);
//     await context.sendActivity("Ok I've deleted the current conversation state.");
//   } catch (error) {
//     console.error(`[Reset Error] ${error}`);
//     await context.sendActivity("I'm sorry, I'm having trouble resetting the conversation. Please try again.");
//   }
// });

// teamsBot.message("/set", async (context, state) => {
//   try {
//     // Set a property in the conversation state.
//     await loginState.set(context, { isLoggedIn: true, lastLogin: new Date() });
//     await context.sendActivity("Ok I've set some state for the current conversation.");
//   } catch (error) {
//     console.error(`[Set Error] ${error}`);
//     await context.sendActivity("I'm sorry, I'm having trouble with the set command.");
//   }
// });

// teamsBot.message("/count", async (context, state) => {
//   const count = state.conversation.count ?? 0;
//   await context.sendActivity(`The count is ${count}`);
// });

// teamsBot.message("/diag", async (context, state) => {
//   await state.load(context, storage);
//   await context.sendActivity(JSON.stringify(context.activity));
// });

// teamsBot.message("/state", async (context, state) => {
//   await state.load(context, storage);
//   await context.sendActivity(JSON.stringify(state));
// });

// teamsBot.message("/runtime", async (context, state) => {
//   const runtime = {
//     nodeversion: process.version,
//     sdkversion: version,
//   };
//   await context.sendActivity(JSON.stringify(runtime));
// });

// teamsBot.conversationUpdate("membersAdded", async (context, state) => {
//   await context.sendActivity(
//     `Hi there! I'm an echo bot running on Agents SDK version ${version} that will echo what you said to me.`
//   );
// });

// // ----------------------------------------------------
// // The main activity handler to run the dialogs
// // ----------------------------------------------------
// teamsBot.activity(ActivityTypes.Message, async (context, state) => {
//   // Increment count state (if needed, but dialogs handle flow now)
//   let count = state.conversation.count ?? 0;
//   state.conversation.count = ++count;

//   try {
//     // Create a dialog context from the current turn
//     const dialogContext = await dialogs.createContext(context);
//     const dialogResult = await dialogContext.continueDialog();

//     // If the dialog is not active, start the RootDialog
//     if (dialogResult.status === DialogTurnStatus.empty) {
//       await dialogContext.beginDialog(ROOT_DIALOG);
//     }
//   } catch (error) {
//     console.error(`[Dialogs Error] ${error}`);
//     await context.sendActivity("I'm sorry, I'm having trouble processing that request. Please try again or type 'login' to start over.");
//   }
  
//   // Save changes to the conversation state at the end of the turn.
//   await conversationState.saveChanges(context, false);
// });

// // This handler will only run if no other message handler above it has matched
// // and the dialog system has finished.
// teamsBot.activity(/^message/, async (context, state) => {
//   await context.sendActivity(`Matched with regex: ${context.activity.type}`);
// });

// teamsBot.activity(
//   async (context) => Promise.resolve(context.activity.type === "message"),
//   async (context, state) => {
//     await context.sendActivity(`Matched function: ${context.activity.type}`);
//   }
// );
// module.exports.teamsBot = teamsBot;

// code version 2  ended //

const axios = require("axios");
const FormData = require("form-data");
const { ActivityTypes } = require("@microsoft/agents-activity");
const {
  AgentApplication,
  AttachmentDownloader,
  MemoryStorage,
  BotState,
  ConversationState,
} = require("@microsoft/agents-hosting");
const { version = 'N/A' } = require("@microsoft/agents-hosting/package.json");

// Import the necessary dialog components
const {
  ComponentDialog,
  WaterfallDialog,
  TextPrompt,
  DialogSet,
  DialogTurnStatus,
} = require('botbuilder-dialogs');

require('dotenv').config();
const downloader = new AttachmentDownloader();

// Define storage and application
const storage = new MemoryStorage();
// Create state management objects
const conversationState = new ConversationState(storage);
const teamsBot = new AgentApplication({
  storage,
  fileDownloaders: [downloader],
  conversationState, // Pass the conversation state to the bot application
});

// Define the names for our dialogs and prompts
const LOGIN_DIALOG = 'loginDialog';
const ROOT_DIALOG = 'rootDialog';
const WATERFALL_DIALOG = 'waterfallDialog';
const TEXT_PROMPT = 'textPrompt';

// Create a property accessor for the dialog state
const dialogState = conversationState.createProperty('DialogState');
// Create a property accessor for some general state.
const loginState = conversationState.createProperty('LoginState');

// **HARD-CODED CREDENTIALS FOR DEMONSTRATION PURPOSES ONLY**
// In a real application, you would validate against a secure database.
const CORRECT_USERNAME = 'user123';
const CORRECT_PASSWORD = 'password123';

// ---------------------------------------------
// Define the LoginDialog as a ComponentDialog
// ---------------------------------------------
class LoginDialog extends ComponentDialog {
  constructor(id) {
    super(id || LOGIN_DIALOG);

    // Add prompts that will be used by the waterfall dialog.
    this.addDialog(new TextPrompt(TEXT_PROMPT));

    // Define the waterfall dialog steps.
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.promptForUsernameStep.bind(this),
      this.validateUsernameStep.bind(this),
      this.promptForPasswordStep.bind(this),
      this.validateCredentialsStep.bind(this),
    ]));

    // The initial dialog to run is the waterfall dialog.
    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * Step 1: Prompt the user for their username.
   */
  async promptForUsernameStep(stepContext) {
    // Check if we're resuming with username already validated (for password retry)
    if (stepContext.options && stepContext.options.skipToPassword) {
      stepContext.values.username = stepContext.options.username;
      stepContext.values.usernameAttempts = stepContext.options.usernameAttempts;
      // Skip to step 3 (password prompt)
      return await stepContext.next();
    }
    
    // If we have existing attempt count from retry, preserve it
    if (stepContext.options && stepContext.options.usernameAttempts) {
      stepContext.values.usernameAttempts = stepContext.options.usernameAttempts;
    }
    
    // Normal flow: prompt for username
    return await stepContext.prompt(TEXT_PROMPT, {
      prompt: 'What is your username?',
    });
  }

  /**
   * Step 2: Validate username and give retry chances.
   */
  async validateUsernameStep(stepContext) {
    // If we're skipping to password (retry scenario), just continue
    if (stepContext.options && stepContext.options.skipToPassword) {
      return await stepContext.next();
    }
    
    const username = stepContext.result;
    
    // Initialize retry count if not exists
    if (!stepContext.values.usernameAttempts) {
      stepContext.values.usernameAttempts = 0;
    }
    
    stepContext.values.usernameAttempts++;
    
    if (username === CORRECT_USERNAME) {
      // Username is valid, store it and move to password
      stepContext.values.username = username;
      return await stepContext.next();
    } else {
      // Username is invalid
      if (stepContext.values.usernameAttempts < 3) {
        // Give another chance (max 3 attempts)
        await stepContext.context.sendActivity(
          `Invalid username. Please try again. (Attempt ${stepContext.values.usernameAttempts + 1}/3)`
        );
        // Go back to username prompt while preserving attempt count
        return await stepContext.replaceDialog(WATERFALL_DIALOG, {
          usernameAttempts: stepContext.values.usernameAttempts
        });
      } else {
        // Max attempts reached (3 attempts used)
        await stepContext.context.sendActivity(
          "Too many failed attempts. Please start the login process again by typing 'login'."
        );
        return await stepContext.endDialog({ success: false });
      }
    }
  }

  /**
   * Step 3: Prompt the user for their password.
   */
  async promptForPasswordStep(stepContext) {
    // If we have existing password attempt count from retry, preserve it
    if (stepContext.options && stepContext.options.passwordAttempts) {
      stepContext.values.passwordAttempts = stepContext.options.passwordAttempts;
    }
    
    // Username was validated in previous step
    return await stepContext.prompt(TEXT_PROMPT, {
      prompt: `Hello, ${stepContext.values.username}! Please enter your password.`,
    });
  }

  /**
   * Step 4: Validate password and complete login with retry logic.
   */
  async validateCredentialsStep(stepContext) {
    const password = stepContext.result;
    
    // Initialize password retry count if not exists
    if (!stepContext.values.passwordAttempts) {
      stepContext.values.passwordAttempts = 0;
    }
    
    stepContext.values.passwordAttempts++;
    
    if (password === CORRECT_PASSWORD) {
      // Password is valid - successful login
      const username = stepContext.values.username;
      await stepContext.context.sendActivity(
        `Thanks, ${username}. You are now logged in! You can now use 'logout' to log out.`
      );
      // Login status ko state mein save karein
      await loginState.set(stepContext.context, { isLoggedIn: true, username: username });
      // End the dialog and return the success status.
      return await stepContext.endDialog({ success: true, username: username });
    } else {
      // Password is invalid
      if (stepContext.values.passwordAttempts < 3) {
        // Give another chance for password (max 3 attempts)
        await stepContext.context.sendActivity(
          `Invalid password. Please try again. (Attempt ${stepContext.values.passwordAttempts + 1}/3)`
        );
        // Go back to password prompt (step 3) while preserving all state
        return await stepContext.replaceDialog(WATERFALL_DIALOG, {
          username: stepContext.values.username,
          usernameAttempts: stepContext.values.usernameAttempts,
          passwordAttempts: stepContext.values.passwordAttempts,
          skipToPassword: true
        });
      } else {
        // Max password attempts reached (3 attempts used)
        await stepContext.context.sendActivity(
          "Too many failed password attempts. Please start the login process again by typing 'login'."
        );
        return await stepContext.endDialog({ success: false });
      }
    }
  }
}

// ---------------------------------------------
// Define the RootDialog to orchestrate other dialogs
// ---------------------------------------------
class RootDialog extends ComponentDialog {
  constructor(id) {
    super(id || ROOT_DIALOG);

    // Add our login dialog as a component.
    this.addDialog(new LoginDialog(LOGIN_DIALOG));

    // The waterfall dialog defines the root conversation flow.
    this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
      this.startDialogStep.bind(this),
      this.finalStep.bind(this),
    ]));

    // The initial dialog to run is the waterfall dialog.
    this.initialDialogId = WATERFALL_DIALOG;
  }

  /**
   * This is the first step of the RootDialog. It will check if the user
   * wants to login and start the LoginDialog.
   */
  async startDialogStep(stepContext) {
    // Check if the user's message is 'login' to start the dialog.
    const text = stepContext.context.activity.text.toLowerCase();
    
    // Check if user is already logged in
    const loginData = await loginState.get(stepContext.context);
    const isLoggedIn = loginData && loginData.isLoggedIn;
    
    if (text === 'login') {
      if (isLoggedIn) {
        await stepContext.context.sendActivity("You are already logged in! Use 'logout' to log out first.");
        return await stepContext.endDialog();
      } else {
        return await stepContext.beginDialog(LOGIN_DIALOG);
      }
    } else if (text === 'logout') {
      if (isLoggedIn) {
        await loginState.delete(stepContext.context);
        await stepContext.context.sendActivity("You have been logged out. Type 'login' to log in again.");
        return await stepContext.endDialog();
      } else {
        await stepContext.context.sendActivity("You are not logged in. Type 'login' to start the login process.");
        return await stepContext.endDialog();
      }
    } else {
      // Any other message when not in login dialog
      if (isLoggedIn) {
        await stepContext.context.sendActivity("You are logged in. Available commands: 'login', 'logout'");
      } else {
        await stepContext.context.sendActivity("Please type 'login' to start the login process.");
      }
      return await stepContext.endDialog();
    }
  }

  /**
   * This is the final step of the RootDialog. It receives the result from
   * the LoginDialog and can process it or just end the conversation.
   */
  async finalStep(stepContext) {
    // We've received the result from the login dialog.
    if (stepContext.result && stepContext.result.success) {
      console.log(`Login successful for user: ${stepContext.result.username}`);
      await stepContext.context.sendActivity(`Welcome! You can now use 'logout' to log out when needed.`);
    }

    return await stepContext.endDialog();
  }
}

// Create a dialog set to manage the dialogs
const dialogs = new DialogSet(dialogState);
dialogs.add(new RootDialog());


// Remove all the other message handlers except reset
teamsBot.message("/reset", async (context, state) => {
  try {
    // Clear the state and dialog stack
    state.deleteConversationState();
    await dialogState.delete(context);
    await loginState.delete(context);
    await context.sendActivity("Ok I've deleted the current conversation state. Please type 'login' to start.");
  } catch (error) {
    console.error(`[Reset Error] ${error}`);
    await context.sendActivity("I'm sorry, I'm having trouble resetting the conversation. Please try again.");
  }
});

teamsBot.conversationUpdate("membersAdded", async (context, state) => {
  await context.sendActivity(
    `Hi there! Welcome to the secure bot. Please type 'login' to start the login process.`
  );
});

// ----------------------------------------------------
// The main activity handler to run the dialogs
// ----------------------------------------------------
teamsBot.activity(ActivityTypes.Message, async (context, state) => {
  // Load the conversation state before any logic runs
  await conversationState.load(context);

  // Increment count state (if needed, but dialogs handle flow now)
  let count = state.conversation.count ?? 0;
  state.conversation.count = ++count;

  try {
    // Create a dialog context from the current turn
    const dialogContext = await dialogs.createContext(context);
    const dialogResult = await dialogContext.continueDialog();

    // Check if dialog is running
    const isDialogRunning = dialogResult.status === DialogTurnStatus.waiting;

    // Check login status
    const loginData = await loginState.get(context);
    const isLoggedIn = loginData && loginData.isLoggedIn;
    const text = context.activity.text.toLowerCase();

    // If dialog is running, let it continue regardless of login status
    if (isDialogRunning) {
      // Dialog is already handling the conversation flow
      await conversationState.saveChanges(context, false);
      return;
    }

    // If no dialog is active and user is not logged in, only allow 'login' command
    if (!isLoggedIn && text !== 'login') {
      await context.sendActivity("You need to login first. Please type 'login' to start the login process.");
      await conversationState.saveChanges(context, false);
      return;
    }

    // If user is logged in, only allow 'login' and 'logout' commands
    if (isLoggedIn && text !== 'login' && text !== 'logout') {
      await context.sendActivity("Available commands: 'login', 'logout'");
      await conversationState.saveChanges(context, false);
      return;
    }

    // If the dialog is not active, start the RootDialog
    if (dialogResult.status === DialogTurnStatus.empty) {
      await dialogContext.beginDialog(ROOT_DIALOG);
    }
  } catch (error) {
    console.error(`[Dialogs Error] ${error}`);
    await context.sendActivity("I'm sorry, I'm having trouble processing that request. Please try again or type 'login' to start over.");
  }
  
  // Save changes to the conversation state at the end of the turn.
  await conversationState.saveChanges(context, false);
});

// Remove the extra activity handlers since we want to restrict functionality
// This handler will only run if no other message handler above it has matched
// and the dialog system has finished.
// teamsBot.activity(/^message/, async (context, state) => {
//   await context.sendActivity(`Matched with regex: ${context.activity.type}`);
// });

// teamsBot.activity(
//   async (context) => Promise.resolve(context.activity.type === "message"),
//   async (context, state) => {
//     await context.sendActivity(`Matched function: ${context.activity.type}`);
//   }
// );


module.exports.teamsBot = teamsBot;