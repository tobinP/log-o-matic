"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
var FileType;
(function (FileType) {
    FileType[FileType["Unity"] = 0] = "Unity";
    FileType[FileType["Dotnet"] = 1] = "Dotnet";
    FileType[FileType["Js"] = 2] = "Js";
    FileType[FileType["Unknown"] = 3] = "Unknown";
})(FileType || (FileType = {}));
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
    return __awaiter(this, void 0, void 0, function* () {
        const selectedText = editor.document.getText(editor.selection);
        const isVariable = checkIfVariable(editor, editor.selection);
        const fileType = yield getFileType(editor);
        if (fileType === FileType.Unknown)
            return;
        skipOverOpenCurly(editor);
        yield vscode.commands.executeCommand("editor.action.insertLineAfter");
        editor.edit(editBuilder => {
            switch (fileType) {
                case FileType.Unity:
                    addLogStatement(editor, editBuilder, "Debug.Log", selectedText, isVariable);
                    addUnityImportStatement(editor, editBuilder);
                    break;
                case FileType.Dotnet:
                    addLogStatement(editor, editBuilder, "Console.WriteLine", selectedText, isVariable);
                    break;
                case FileType.Js:
                    addLogStatement(editor, editBuilder, "console.log", selectedText, isVariable);
                    break;
                default:
                    break;
            }
        });
    });
}
function getFileType(editor) {
    return __awaiter(this, void 0, void 0, function* () {
        let langId = editor.document.languageId;
        if (langId === 'typescript' || langId === 'javascript')
            return Promise.resolve(FileType.Js);
        if (langId === 'csharp') {
            let files = yield vscode.workspace.findFiles('Packages/manifest.json', undefined, 1);
            if (files.length === 0) {
                return Promise.resolve(FileType.Dotnet);
            }
            else {
                return Promise.resolve(FileType.Unity);
            }
        }
        vscode.window.showInformationMessage(`Unsupported file type`);
        return Promise.resolve(FileType.Unknown);
    });
}
function checkIfVariable(editor, selection) {
    const newEndPosition = new vscode.Position(selection.start.line, selection.end.character + 1);
    const newSelection = new vscode.Selection(selection.start, newEndPosition);
    const text = editor.document.getText(newSelection);
    const index = text.indexOf("(");
    return (index === -1);
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
function addLogStatement(editor, editBuilder, prefix, text, isVariable) {
    let logStatement;
    if (isVariable) {
        logStatement = `${prefix}("&&& ${text}: " + ${text});`;
    }
    else {
        logStatement = `${prefix}("&&& ${text}");`;
    }
    editBuilder.insert(new vscode.Position(editor.selection.active.line, editor.selection.active.character), logStatement);
}
function addUnityImportStatement(editor, editBuilder) {
    const importStatement = "using UnityEngine;";
    const documentText = editor.document.getText();
    if (documentText.includes(importStatement))
        return;
    editBuilder.insert(new vscode.Position(0, 0), importStatement + "\n");
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map