"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World!');
        // commentLine();
        // vscode.commands.executeCommand('editor.action.insertLineBelow')
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function commentLine() {
    vscode.commands.executeCommand('editor.action.addCommentLine')
        .then((thing) => { console.log("in the then: " + thing); });
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map