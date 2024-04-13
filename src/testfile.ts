function thing() {
    let thingo = "stuff";
    let otherString = otherThing();
    console.log("&&& otherThing(): " + otherThing());
}

function otherThing(): string {
    return "hey";
}
