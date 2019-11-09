"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    let disposable = vscode.commands.registerCommand("extension.log", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        addLogStatement(editor);
        importUnity(editor);
        context.subscriptions.push(disposable);
    });
}
exports.activate = activate;
function addLogStatement(editor) {
    const selectedText = editor.document.getText(editor.selection);
    const logStatement = `Debug.Log("${selectedText}: " + ${selectedText});`;
    vscode.commands.executeCommand("editor.action.insertLineAfter").then(() => {
        editor.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(editor.selection.active.line, editor.selection.active.character), logStatement);
        });
    });
}
function importUnity(editor) {
    const importStatement = "using UnityEngine;";
    const documentText = editor.document.getText();
    if (documentText.includes(importStatement))
        return;
    editor.edit(editBuilder => {
        editBuilder.insert(new vscode.Position(0, 0), importStatement + "\n");
    });
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map