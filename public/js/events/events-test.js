let events = document.getElementsByClassName("event-link");
console.log("Events by class:" + events);
console.log(events[0]);

for (let i = 0; i < events.length; i++) {
  document.events[i].addEventListener("click", async function () {
    console.log("Is clicked!");
    const userID = 2; //Insert userID here
    const eventID = 5; //Insert eventID here

    try {
      const response = fetch("http://localhost:3000/event-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID, eventID }),
      });

      const result = response.json();

      if (response.ok) {
        alert("Du er nu tilmeldt");
        window.location.href = "/public/pages/events/events.html";
      } else {
        alert(result.error);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong. Try again.");
    }
  });
}
