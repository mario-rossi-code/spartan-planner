document.addEventListener("DOMContentLoaded", () => {
    /* 1. NAVIGATION DRAWER MOBILE */
    const menuToggle = document.getElementById("menuToggle");
    const navDrawer = document.getElementById("navDrawer");
    const navOverlay = document.getElementById("navOverlay");
    const navLinks = document.querySelectorAll(".nav-links a");

    function closeMenu() {
        if (menuToggle && navDrawer && navOverlay) {
            menuToggle.classList.remove("active");
            navDrawer.classList.remove("open");
            navOverlay.classList.remove("active");
            document.body.style.overflow = "";
        }
    }

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            if (navDrawer.classList.contains("open")) {
                closeMenu();
            } else {
                menuToggle.classList.add("active");
                navDrawer.classList.add("open");
                navOverlay.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        });
    }

    if (navOverlay) navOverlay.addEventListener("click", closeMenu);

    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            closeMenu();
            const targetId = link.getAttribute("href");
            if (targetId.startsWith("#")) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = 80;
                    const elementPosition =
                        targetElement.getBoundingClientRect().top;
                    const offsetPosition =
                        elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                    });
                }
            }
        });
    });

    /* 2. COUNTDOWN TIMER */
    const targetDate = new Date("September 20, 2026 10:15:00").getTime();
    function updateCountdown() {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor(
                (difference % (1000 * 60 * 60)) / (1000 * 60),
            );
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            if (document.getElementById("cd-days"))
                document.getElementById("cd-days").innerText =
                    days < 10 ? "0" + days : days;
            if (document.getElementById("cd-hours"))
                document.getElementById("cd-hours").innerText =
                    hours < 10 ? "0" + hours : hours;
            if (document.getElementById("cd-mins"))
                document.getElementById("cd-mins").innerText =
                    minutes < 10 ? "0" + minutes : minutes;
            if (document.getElementById("cd-secs"))
                document.getElementById("cd-secs").innerText =
                    seconds < 10 ? "0" + seconds : seconds;
        }
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* 3. CALCOLATORE DINAMICO SPESE E FILTRO */
    const passengersInput = document.getElementById("passengers");
    const btnMinus = document.getElementById("btnMinus");
    const btnPlus = document.getElementById("btnPlus");

    // Elementi Output Calcolatore
    const calcFuelEl = document.getElementById("calcFuel");
    const calcTollEl = document.getElementById("calcToll");
    const calcHotelEl = document.getElementById("calcHotel");
    const calcRaceEl = document.getElementById("calcRace");
    const perPersonCostEl = document.getElementById("perPersonCost");

    // Elementi Etichette Selezionate
    const selectedHotelLabel = document.getElementById("selectedHotelLabel");
    const selectedRaceLabel = document.getElementById("selectedRaceLabel");

    // Valori Base
    const totalFuel = 120.6;
    const totalToll = 68.2;
    let selectedHotelPriceNight = 150;
    let selectedHotelName = "Relax in Misano (Fronte Mare)";
    let selectedRacePrice = 108; // SPRINT di default
    let selectedRaceType = "sprint"; // 'sprint' oppure 'super'
    let selectedRaceName = "Sprint";

    function updateCalculator() {
        const count = parseInt(passengersInput.value) || 1;

        // Quota Viaggio divisa per partecipanti
        const fuelPerPerson = totalFuel / count;
        const tollPerPerson = totalToll / count;

        // Quota Alloggio divisa per partecipanti
        const hotelPerPerson = selectedHotelPriceNight / count;

        // Biglietto gara fisso a persona
        const racePerPerson = selectedRacePrice;

        // Totale a Persona
        const totalPerPerson =
            fuelPerPerson + tollPerPerson + hotelPerPerson + racePerPerson;

        // Aggiorna DOM Prezzi
        if (calcFuelEl)
            calcFuelEl.innerText =
                fuelPerPerson.toFixed(2).replace(".", ",") + " €";
        if (calcTollEl)
            calcTollEl.innerText =
                tollPerPerson.toFixed(2).replace(".", ",") + " €";
        if (calcHotelEl)
            calcHotelEl.innerText =
                hotelPerPerson.toFixed(2).replace(".", ",") + " €";
        if (calcRaceEl)
            calcRaceEl.innerText =
                racePerPerson.toFixed(2).replace(".", ",") + " €";
        if (perPersonCostEl)
            perPersonCostEl.innerText =
                totalPerPerson.toFixed(2).replace(".", ",") + " €";

        // Aggiorna Etichette Selezionate
        if (selectedHotelLabel)
            selectedHotelLabel.innerText = `(${selectedHotelName})`;

        if (selectedRaceLabel) {
            selectedRaceLabel.innerText = `(${selectedRaceName})`;
            // Cambio colore dinamico in base alla gara selezionata
            selectedRaceLabel.style.color =
                selectedRaceType === "sprint"
                    ? "var(--primary-red)"
                    : "#0047bb";
        }

        // Aggiorna filtro capacità visibile
        const capacityFilterCount = document.getElementById(
            "capacityFilterCount",
        );
        if (capacityFilterCount) capacityFilterCount.innerText = count;

        // Filtra visibilità alloggi
        const accommodationCards = document.querySelectorAll(
            ".accommodation-card",
        );
        let visibleCount = 0;
        accommodationCards.forEach((card) => {
            const cap = parseInt(card.getAttribute("data-capacity")) || 1;
            if (cap >= count) {
                card.classList.remove("hidden");
                visibleCount++;
            } else {
                card.classList.add("hidden");
            }
        });

        const noAccommodationMsg =
            document.getElementById("noAccommodationMsg");
        if (noAccommodationMsg) {
            if (visibleCount === 0)
                noAccommodationMsg.classList.remove("hidden");
            else noAccommodationMsg.classList.add("hidden");
        }
    }

    if (btnMinus) {
        btnMinus.addEventListener("click", () => {
            let val = parseInt(passengersInput.value) || 1;
            if (val > 1) {
                passengersInput.value = val - 1;
                updateCalculator();
            }
        });
    }

    if (btnPlus) {
        btnPlus.addEventListener("click", () => {
            let val = parseInt(passengersInput.value) || 1;
            if (val < 8) {
                passengersInput.value = val + 1;
                updateCalculator();
            }
        });
    }

    /* 4. SELEZIONE ALLOGGIO PER IL CALCOLO */
    const hotelSelectBtns = document.querySelectorAll(".btn-select-hotel");
    hotelSelectBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const card = e.target.closest(".accommodation-card");
            document
                .querySelectorAll(".accommodation-card")
                .forEach((c) => c.classList.remove("selected-hotel"));
            document.querySelectorAll(".btn-select-hotel").forEach((b) => {
                b.classList.remove("active");
                b.innerHTML = "Seleziona per Calcolo";
            });

            card.classList.add("selected-hotel");
            btn.classList.add("active");
            btn.innerHTML =
                '<i class="fa-solid fa-check"></i> Selezionato per Calcolo';

            selectedHotelPriceNight =
                parseFloat(card.getAttribute("data-price-night")) || 0;
            const titleEl = card.querySelector(".card-title");
            selectedHotelName = titleEl ? titleEl.innerText.trim() : "Alloggio";

            updateCalculator();
        });
    });

    /* 5. SELEZIONE GARA (SUPER vs SPRINT) */
    const raceTabBtns = document.querySelectorAll(".race-tab-btn");
    const raceSuperInfo = document.getElementById("race-super-info");
    const raceSprintInfo = document.getElementById("race-sprint-info");

    raceTabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            raceTabBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            selectedRaceType = btn.getAttribute("data-race");
            selectedRacePrice = parseFloat(btn.getAttribute("data-price")) || 0;

            if (selectedRaceType === "super") {
                selectedRaceName = "Super";
                if (raceSuperInfo) raceSuperInfo.classList.remove("hidden");
                if (raceSprintInfo) raceSprintInfo.classList.add("hidden");
            } else {
                selectedRaceName = "Sprint";
                if (raceSprintInfo) raceSprintInfo.classList.remove("hidden");
                if (raceSuperInfo) raceSuperInfo.classList.add("hidden");
            }

            updateCalculator();
        });
    });

    /* 6. SELEZIONE BATTERIE / WAVES */
    const waveSlots = document.querySelectorAll(".wave-time-slot");
    waveSlots.forEach((slot) => {
        slot.addEventListener("click", () => {
            const parentBlock = slot.closest(".race-info-block");
            parentBlock
                .querySelectorAll(".wave-time-slot")
                .forEach((s) => s.classList.remove("selected"));
            slot.classList.add("selected");
        });
    });

    /* 7. CHECKLIST INTERATTIVA */
    const checkItems = document.querySelectorAll(
        '.check-item input[type="checkbox"]',
    );
    checkItems.forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
            const parent = e.target.closest(".check-item");
            if (e.target.checked) parent.classList.add("completed");
            else parent.classList.remove("completed");
        });
    });

    /* 8. REVEAL ON SCROLL */
    const reveals = document.querySelectorAll(".reveal");
    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        reveals.forEach((reveal) => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - 50) reveal.classList.add("active");
        });
    }
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    // Inizializza calcolatore al caricamento
    updateCalculator();
});
