const vscode = require('vscode');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

function activate(context) {
  let disposable = vscode.commands.registerCommand('extension.createPaste', async function () {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showErrorMessage('No active editor found.');
      return;
    }

    const code = editor.document.getText();
    const pasteName = await vscode.window.showInputBox({
      prompt: 'Enter the paste name',
      placeHolder: path.basename(editor.document.fileName),
    });

    if (!pasteName) {
      return;
    }

    const language = editor.document.languageId;
    const syntaxHighlighting = language !== 'plaintext';

    const apiKey = vscode.workspace.getConfiguration('sxpaste').get('pastebinAPIKey');
    if (!apiKey) {
      vscode.window.showErrorMessage('Pastebin API key not found. Please set the "sxpaste.pastebinAPIKey" setting.');
      return;
    }

    const form = new FormData();
    form.append('api_dev_key', apiKey);
    form.append('api_option', 'paste');
    form.append('api_paste_name', pasteName);
    form.append('api_paste_code', code);
    form.append('api_paste_private', '0');
    form.append('api_paste_expire_date', 'N');
    form.append('api_paste_format', syntaxHighlighting ? language : '');

    try {
      // @ts-ignore
      const response = await axios.post('https://pastebin.com/api/api_post.php', form, {
        headers: form.getHeaders(),
      });

      const pasteURL = response.data;
      vscode.env.clipboard.writeText(pasteURL);
      vscode.window.showInformationMessage('Paste created and URL copied to clipboard.');
    } catch (error) {
      vscode.window.showErrorMessage('Error creating paste.');
    }
  });

  context.subscriptions.push(disposable);
}

exports.activate = activate;
