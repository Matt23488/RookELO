const components = [...document.getElementsByClassName("component")];
components.forEach((com, i) => {
    com.setAttribute("draggable", "true");
    com.setAttribute("id", `component${i}`)
    com.addEventListener("dragstart", ev => {
        ev.dataTransfer.setData("text", ev.target.id);
    });
});

const containers = [...document.getElementsByClassName("container")];
containers.forEach((con, i) => {
    con.addEventListener("dragover", ev => {
        ev.preventDefault();
    });
    con.addEventListener("drop", ev => {
        ev.preventDefault();
        const data = ev.dataTransfer.getData("text");
        con.appendChild(document.getElementById(data));
    });
});