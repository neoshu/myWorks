const inputUser = document.querySelector("#user");
const inputEmail = document.querySelector("#email");
const form = document.querySelector("form");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = inputUser.value.trim();
    const mail = inputEmail.value.trim();

    await fetch("/tmp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, mail })
    });

    form.reset();
});
