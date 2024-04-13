# log-o-matic 9000

Tool for logging out variables or function names in Unity, Dotnet, Javascript and Typescript.

# How to use

Highlight a variable and press `alt+L` to produce a log like this:

`Console.WriteLine("&&& myVar: " + myVar);`

Highlight a function name and press `alt+L` to produce a log this:

`Console.WriteLine("&&& myFunction");`

If UnityEngine isn't already imported in the file, it will log-o-matically add `using UnityEngine;` at the top.
