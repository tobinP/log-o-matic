import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand("extension.log", () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		doCommand(editor);
		context.subscriptions.push(disposable);
	});
}

function doCommand(editor: vscode.TextEditor) {
	const selectedText = editor.document.getText(editor.selection);
	skipOverOpenCurly(editor);
	vscode.commands.executeCommand("editor.action.insertLineAfter").then(() => {
		editor.edit(editBuilder => {
			addLog(editor, editBuilder, selectedText);
			importUnity(editor, editBuilder);
		});
	});
}

function skipOverOpenCurly(editor: vscode.TextEditor) {
	var startPosition = editor.selection.active.with(
		editor.selection.active.line + 1,
		0
	);
	var endPosition = editor.selection.active.with(
		editor.selection.active.line + 1,
		200
	);
	var selection = new vscode.Selection(startPosition, endPosition);
	const nextLineText = editor.document.getText(selection).trim();
	if (nextLineText.length == 1 && nextLineText.includes("{")) {
		editor.selection = selection;
	}
}

function addLog(
	editor: vscode.TextEditor,
	editBuilder: vscode.TextEditorEdit,
	text: string
) {
	const logStatement = `Debug.Log("&&& ${text}: " + ${text});`;
	editBuilder.insert(
		new vscode.Position(
			editor.selection.active.line,
			editor.selection.active.character
		),
		logStatement
	);
}

function importUnity(
	editor: vscode.TextEditor,
	editBuilder: vscode.TextEditorEdit
) {
	const importStatement = "using UnityEngine;";
	const documentText = editor.document.getText();
	if (documentText.includes(importStatement)) return;
	editBuilder.insert(new vscode.Position(0, 0), importStatement + "\n");
}

export function deactivate() {}
