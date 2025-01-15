function thing() {
    let thingo = "stuff";
    let otherString = otherThing();
    console.log("1234 otherString: " + otherString);
}

function otherThing(): string {
    console.log("1234 otherThing");
    return "hey";
}
