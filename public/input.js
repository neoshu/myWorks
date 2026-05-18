const inputUser = document.querySelector("#user");
const inputEmail = document.querySelector("#email");
const form = document.querySelector("form");
const showAll = document.querySelector("#show");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = inputUser.value.trim();
    const mail = inputEmail.value.trim();

    const res = await fetch("/tmp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, mail })
    });

    if (!res.ok) {
        const data = await res.json();
        alert(data.error);
        return;
    }

    form.reset();
});

showAll.addEventListener("click", async (event) => {
    event.preventDefault();
    let res = await fetch("/tmp");
    let users = await res.json();   // array
    let pre = document.querySelector("pre");
    pre.textContent = ""; // initiate
    users.forEach(row => {
        let para = document.createElement("p");
        // para.textContent = JSON.stringify(row);
        para.textContent = `${row.id} ${row.name} ${row.email}`;
        pre.appendChild(para);
    });
    

})
