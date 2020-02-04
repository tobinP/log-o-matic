# log-o-matic 9000

Tool for logging out C# variables in Unity

# How to use

Highlight a variable and press `alt-L` will produce a log like this:

`Debug.Log("&&& myVar: " + myVar);`

Highlight a function name and press `alt-L` will produce a log this:

`Debug.Log("&&& myFunction");`

If UnityEngine isn't already imported in the file, it will log-o-matically add `using UnityEngine;` at the top.
