"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function activate(context) {
    let disposable = vscode.commands.registerCommand("extension.log", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        doCommand(editor);
        context.subscriptions.push(disposable);
    });
}
exports.activate = activate;
function doCommand(editor) {
    const selectedText = editor.document.getText(editor.selection);
    const isVariable = checkIfVariable(editor, editor.selection);
    skipOverOpenCurly(editor);
    vscode.commands.executeCommand("editor.action.insertLineAfter").then(() => {
        editor.edit(editBuilder => {
            addLog(editor, editBuilder, selectedText, isVariable);
            importUnity(editor, editBuilder);
        });
    });
}
function checkIfVariable(editor, selection) {
    const position = new vscode.Position(selection.anchor.line, selection.active.character + 1);
    const range = new vscode.Selection(selection.anchor, position);
    const selectedText = editor.document.getText(range);
    const n = selectedText.indexOf("(");
    return (n === -1);
}
function skipOverOpenCurly(editor) {
    var startPosition = editor.selection.active.with(editor.selection.active.line + 1, 0);
    var endPosition = editor.selection.active.with(editor.selection.active.line + 1, 200);
    var selection = new vscode.Selection(startPosition, endPosition);
    const nextLineText = editor.document.getText(selection).trim();
    if (nextLineText.length == 1 && nextLineText.includes("{")) {
        editor.selection = selection;
    }
}
function addLog(editor, editBuilder, text, isVariable) {
    let logStatement;
    if (isVariable) {
        logStatement = `Debug.Log("&&& ${text}: " + ${text});`;
    }
    else {
        logStatement = `Debug.Log("&&& ${text}");`;
    }
    editBuilder.insert(new vscode.Position(editor.selection.active.line, editor.selection.active.character), logStatement);
}
function importUnity(editor, editBuilder) {
    const importStatement = "using UnityEngine;";
    const documentText = editor.document.getText();
    if (documentText.includes(importStatement))
        return;
    editBuilder.insert(new vscode.Position(0, 0), importStatement + "\n");
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map