document.addEventListener("DOMContentLoaded", () => {
    /* ==========================================
       1. NAVIGATION DRAWER MOBILE (MODERNA)
       ========================================== */
    const menuToggle = document.getElementById("menuToggle");
    const navDrawer = document.getElementById("navDrawer");
    const navOverlay = document.getElementById("navOverlay");
    const navLinks = document.querySelectorAll(".nav-links a");

    function toggleMenu() {
        menuToggle.classList.toggle("active");
        navDrawer.classList.toggle("open");
        navOverlay.classList.toggle("active");
        document.body.style.overflow = navDrawer.classList.contains("open")
            ? "hidden"
            : "";
    }

    menuToggle.addEventListener("click", toggleMenu);
    navOverlay.addEventListener("click", toggleMenu);

    navLinks.forEach((link) => {
        link.addEventListener("click", () => {
            if (navDrawer.classList.contains("open")) {
                toggleMenu();
            }
        });
    });

    /* ==========================================
       2. COUNTDOWN TIMER (Misano 20 Settembre 2026, 10:15 AM)
       ========================================== */
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

            document.getElementById("cd-days").innerText =
                days < 10 ? "0" + days : days;
            document.getElementById("cd-hours").innerText =
                hours < 10 ? "0" + hours : hours;
            document.getElementById("cd-mins").innerText =
                minutes < 10 ? "0" + minutes : minutes;
            document.getElementById("cd-secs").innerText =
                seconds < 10 ? "0" + seconds : seconds;
        }
    }

    setInterval(updateCountdown, 1000);
    updateCountdown();

    /* ==========================================
       3. CONTATORE PARTECIPANTI & FILTRO ALLOGGI
       ========================================== */
    const passengersInput = document.getElementById("passengers");
    const btnMinus = document.getElementById("btnMinus");
    const btnPlus = document.getElementById("btnPlus");
    const perPersonCostEl = document.getElementById("perPersonCost");
    const capacityFilterCount = document.getElementById("capacityFilterCount");
    const accommodationCards = document.querySelectorAll(".accommodation-card");
    const noAccommodationMsg = document.getElementById("noAccommodationMsg");

    // Costo Fisso Auto A/R (120,60€ carburante + 68,20€ pedaggio A/R)
    const totalCostRoundTrip = 188.8;

    function updateCalculatorAndFilter() {
        let count = parseInt(passengersInput.value) || 1;

        // 1. Calcola quota A/R per persona
        const perPerson = totalCostRoundTrip / count;
        perPersonCostEl.innerText =
            perPerson.toFixed(2).replace(".", ",") + " €";

        // 2. Aggiorna etichetta filtro alloggi
        capacityFilterCount.innerText = count;

        // 3. Filtra alloggi in base alla capacità (mostra quelli con capienza >= count)
        let visibleCount = 0;
        accommodationCards.forEach((card) => {
            const capacity = parseInt(card.getAttribute("data-capacity")) || 1;

            if (capacity >= count) {
                card.classList.remove("hidden");
                visibleCount++;
            } else {
                card.classList.add("hidden");
            }
        });

        // Mostra messaggio se nessun alloggio soddisfa il requisito
        if (visibleCount === 0) {
            noAccommodationMsg.classList.remove("hidden");
        } else {
            noAccommodationMsg.classList.add("hidden");
        }
    }

    // Bottoni Incremento / Decremento
    btnMinus.addEventListener("click", () => {
        let currentVal = parseInt(passengersInput.value) || 1;
        if (currentVal > 1) {
            passengersInput.value = currentVal - 1;
            updateCalculatorAndFilter();
        }
    });

    btnPlus.addEventListener("click", () => {
        let currentVal = parseInt(passengersInput.value) || 1;
        if (currentVal < 8) {
            passengersInput.value = currentVal + 1;
            updateCalculatorAndFilter();
        }
    });

    // Inizializzazione al caricamento
    updateCalculatorAndFilter();

    /* ==========================================
       4. SELEZIONE WAVES (BATTERIE PARTENZA)
       ========================================== */
    const waveSlots = document.querySelectorAll(".wave-time-slot");

    waveSlots.forEach((slot) => {
        slot.addEventListener("click", () => {
            waveSlots.forEach((s) => s.classList.remove("selected"));
            slot.classList.add("selected");
        });
    });

    /* ==========================================
       5. CHECKLIST INTERATTIVA
       ========================================== */
    const checkItems = document.querySelectorAll(
        '.check-item input[type="checkbox"]',
    );

    checkItems.forEach((checkbox) => {
        checkbox.addEventListener("change", (e) => {
            const parent = e.target.closest(".check-item");
            if (e.target.checked) {
                parent.classList.add("completed");
            } else {
                parent.classList.remove("completed");
            }
        });
    });

    /* ==========================================
       6. REVEAL ANIMATION ON SCROLL
       ========================================== */
    const reveals = document.querySelectorAll(".reveal");

    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        reveals.forEach((reveal) => {
            const revealTop = reveal.getBoundingClientRect().top;
            if (revealTop < windowHeight - 50) {
                reveal.classList.add("active");
            }
        });
    }

    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();
});
