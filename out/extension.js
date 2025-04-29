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
    FileType[FileType["Godot"] = 2] = "Godot";
    FileType[FileType["Js"] = 3] = "Js";
    FileType[FileType["Cpp"] = 4] = "Cpp";
    FileType[FileType["Unknown"] = 5] = "Unknown";
})(FileType || (FileType = {}));
function activate(context) {
    let disposable = vscode.commands.registerCommand("extension.log", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        createLogStatement(editor);
        context.subscriptions.push(disposable);
    });
    let disposable2 = vscode.commands.registerCommand("extension.deleteLogs", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        deleteAllLogs(editor);
        context.subscriptions.push(disposable2);
    });
}
exports.activate = activate;
function deleteAllLogs(editor) {
    return __awaiter(this, void 0, void 0, function* () {
        const document = editor.document;
        const lineCount = document.lineCount;
        editor.edit((editBuilder) => {
            for (var i = 0; i < lineCount - 1; i++) {
                const line = document.lineAt(i);
                const nextLine = document.lineAt(i + 1);
                const text = line.text;
                const index = text.indexOf("&&& ");
                if (index != -1) {
                    var textRange = new vscode.Range(line.range.start, nextLine.range.start);
                    editBuilder.delete(textRange);
                }
            }
        });
    });
}
function createLogStatement(editor) {
    return __awaiter(this, void 0, void 0, function* () {
        const selectedText = editor.document.getText(editor.selection);
        const isVariable = checkIfVariable(editor, editor.selection);
        const fileType = yield getFileType(editor);
        if (fileType === FileType.Unknown)
            return;
        skipOverOpenCurly(editor);
        yield vscode.commands.executeCommand("editor.action.insertLineAfter");
        editor.edit((editBuilder) => {
            switch (fileType) {
                case FileType.Godot:
                    insertLogIntoEditor(editor, editBuilder, "print", selectedText, isVariable, fileType);
                    break;
                case FileType.Unity:
                    insertLogIntoEditor(editor, editBuilder, "Debug.Log", selectedText, isVariable, fileType);
                    addUnityImportStatement(editor, editBuilder);
                    break;
                case FileType.Dotnet:
                    const useDebug = vscode.workspace.getConfiguration().get('log-o-matic.useDebug');
                    const prefix = useDebug ? "Debug.WriteLine" : "Console.WriteLine";
                    insertLogIntoEditor(editor, editBuilder, prefix, selectedText, isVariable, fileType);
                    break;
                case FileType.Js:
                    insertLogIntoEditor(editor, editBuilder, "console.log", selectedText, isVariable, fileType);
                    break;
                case FileType.Cpp:
                    insertLogIntoEditor(editor, editBuilder, "", selectedText, isVariable, fileType);
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
        if (langId === "gdscript")
            return Promise.resolve(FileType.Godot);
        if (langId === "typescript" || langId === "javascript")
            return Promise.resolve(FileType.Js);
        if (langId === "cpp")
            return Promise.resolve(FileType.Cpp);
        if (langId === "csharp") {
            let files = yield vscode.workspace.findFiles("Packages/manifest.json", undefined, 1);
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
    if (text.length == 0) {
        return false;
    }
    const lastChar = text[text.length - 2];
    if (lastChar === ")") {
        return true;
    }
    const index = text.indexOf("(");
    return index === -1;
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
function insertLogIntoEditor(editor, editBuilder, methodName, text, isVariable, fileType) {
    const token = vscode.workspace.getConfiguration().get('log-o-matic.token');
    // println!("format {local_variable} arguments");
    let logStatement;
    if (isVariable) {
        switch (fileType) {
            case FileType.Godot:
                logStatement = `${methodName}("${token} ${text}: ", ${text})`;
                break;
            case FileType.Cpp:
                logStatement = `std::cout << \"${token} ${text}: \" << ${text} << std::endl;`;
                break;
            default:
                logStatement = `${methodName}("${token} ${text}: " + ${text});`;
                break;
        }
    }
    else {
        logStatement = `${methodName}("${token} ${text}");`;
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