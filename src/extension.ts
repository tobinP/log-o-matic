import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand("extension.log", () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		addLogStatement(editor);
		importUnity(editor);
		context.subscriptions.push(disposable);
	});
}

function addLogStatement(editor: vscode.TextEditor) {
	const selectedText = editor.document.getText(editor.selection);
	const logStatement = `Debug.Log("${selectedText}: " + ${selectedText});`;
	vscode.commands.executeCommand("editor.action.insertLineAfter").then(() => {
		editor.edit(editBuilder => {
			editBuilder.insert(
				new vscode.Position(
					editor.selection.active.line,
					editor.selection.active.character
				),
				logStatement
			);
		});
	});
}

function importUnity(editor: vscode.TextEditor) {
	const importStatement = "using UnityEngine;";
	const documentText = editor.document.getText();
	if (documentText.includes(importStatement)) return;

	editor.edit(editBuilder => {
		editBuilder.insert(new vscode.Position(0, 0), importStatement + "\n");
	});
}

export function deactivate() {}
