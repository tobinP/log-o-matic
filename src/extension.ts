import * as vscode from "vscode";

enum FileType {
    Unity,
    Dotnet,
    Godot,
    Js,
    Cpp,
    Rust,
    Unknown,
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand("extension.log", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        createLogStatement(editor);
        context.subscriptions.push(disposable);
    });

    let disposable2 = vscode.commands.registerCommand("extension.deleteLogs", () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        deleteAllLogs(editor);
        context.subscriptions.push(disposable2);
    });
}

async function deleteAllLogs(editor: vscode.TextEditor): Promise<void> {
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
}

async function createLogStatement(editor: vscode.TextEditor): Promise<void> {
    const selectedText = editor.document.getText(editor.selection);
    const isVariable = checkIfVariable(editor, editor.selection);
    const fileType = await getFileType(editor);
    if (fileType === FileType.Unknown) return;

    skipOverOpenCurly(editor);
    await vscode.commands.executeCommand("editor.action.insertLineAfter");
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
            case FileType.Rust:
                insertLogIntoEditor(editor, editBuilder, "println!", selectedText, isVariable, fileType);
                break;
            default:
                break;
        }
    });
}

async function getFileType(editor: vscode.TextEditor): Promise<FileType> {
    let langId = editor.document.languageId;

    if (langId === "gdscript") return Promise.resolve(FileType.Godot);

    if (langId === "typescript" || langId === "javascript") return Promise.resolve(FileType.Js);

    if (langId === "cpp") return Promise.resolve(FileType.Cpp);

    if (langId === "rust") return Promise.resolve(FileType.Rust);

    if (langId === "csharp") {
        let files = await vscode.workspace.findFiles("Packages/manifest.json", undefined, 1);
        if (files.length === 0) {
            return Promise.resolve(FileType.Dotnet);
        } else {
            return Promise.resolve(FileType.Unity);
        }
    }

    vscode.window.showInformationMessage(`Unsupported file type`);
    return Promise.resolve(FileType.Unknown);
}

function checkIfVariable(editor: vscode.TextEditor, selection: vscode.Selection): boolean {
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

function skipOverOpenCurly(editor: vscode.TextEditor): void {
    var startPosition = editor.selection.active.with(editor.selection.active.line + 1, 0);

    var endPosition = editor.selection.active.with(editor.selection.active.line + 1, 200);
    var selection = new vscode.Selection(startPosition, endPosition);
    const nextLineText = editor.document.getText(selection).trim();
    if (nextLineText.length == 1 && nextLineText.includes("{")) {
        editor.selection = selection;
    }
}

function insertLogIntoEditor(
    editor: vscode.TextEditor,
    editBuilder: vscode.TextEditorEdit,
    methodName: string,
    text: string,
    isVariable: boolean,
    fileType: FileType
): void {
    const token = vscode.workspace.getConfiguration().get('log-o-matic.token');

    // println!("format {local_variable} arguments");

    let logStatement: string;
    if (isVariable) {
        switch (fileType) {
            case FileType.Godot:
                logStatement = `${methodName}("${token} ${text}: ", ${text})`;
                break;
            case FileType.Cpp:
                logStatement = `std::cout << \"${token} ${text}: \" << ${text} << std::endl;`
                break;
            case FileType.Rust:
                logStatement = `${methodName}("${token} ${text}: {${text}}")`
                break;
            default:
                logStatement = `${methodName}("${token} ${text}: " + ${text});`;
                break;
        }
    } else {
        logStatement = `${methodName}("${token} ${text}");`;
    }
    editBuilder.insert(
        new vscode.Position(editor.selection.active.line, editor.selection.active.character),
        logStatement
    );
}

function addUnityImportStatement(
    editor: vscode.TextEditor,
    editBuilder: vscode.TextEditorEdit
): void {
    const importStatement = "using UnityEngine;";
    const documentText = editor.document.getText();
    if (documentText.includes(importStatement)) return;
    editBuilder.insert(new vscode.Position(0, 0), importStatement + "\n");
}

export function deactivate() { }
