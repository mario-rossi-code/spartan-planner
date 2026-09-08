/* ==========================================================================
   SPARTAN PLANNER - MAIN SCRIPT
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    // ==========================================================================
    // 1. MENU MOBILE TOGGLE
    // ==========================================================================
    const menuToggle = document.getElementById("menuToggle");
    const navDrawer = document.getElementById("navDrawer");
    const navOverlay = document.getElementById("navOverlay");

    if (menuToggle && navDrawer && navOverlay) {
        /**
         * Apre o chiude il menu di navigazione mobile
         */
        function toggleMenu() {
            const isOpen = navDrawer.classList.contains("open");
            menuToggle.classList.toggle("active");
            navDrawer.classList.toggle("open");
            navOverlay.classList.toggle("active");
            document.body.style.overflow = isOpen ? "" : "hidden";
            menuToggle.setAttribute("aria-expanded", !isOpen);
        }

        // Event listener per il pulsante menu
        menuToggle.addEventListener("click", toggleMenu);

        // Event listener per l'overlay (chiude il menu)
        navOverlay.addEventListener("click", toggleMenu);

        // Event listener per i link del menu (chiude il menu dopo il click)
        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", function () {
                if (navDrawer.classList.contains("open")) {
                    toggleMenu();
                }
            });
        });

        // Chiudi il menu premendo ESC
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && navDrawer.classList.contains("open")) {
                toggleMenu();
            }
        });
    }

    // ==========================================================================
    // 2. COUNTDOWN TIMER
    // ==========================================================================
    /**
     * Aggiorna il countdown per l'evento Spartan Race
     * Data target: 19 Settembre 2026
     */
    function updateCountdown() {
        const targetDate = new Date("2026-09-19T00:00:00").getTime();
        const now = Date.now();
        let diff = targetDate - now;

        if (diff < 0) {
            diff = 0;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        const cdDays = document.getElementById("cd-days");
        const cdHours = document.getElementById("cd-hours");
        const cdMins = document.getElementById("cd-mins");
        const cdSecs = document.getElementById("cd-secs");

        if (cdDays) cdDays.textContent = String(days).padStart(2, "0");
        if (cdHours) cdHours.textContent = String(hours).padStart(2, "0");
        if (cdMins) cdMins.textContent = String(mins).padStart(2, "0");
        if (cdSecs) cdSecs.textContent = String(secs).padStart(2, "0");
    }

    // Aggiorna il countdown ogni secondo
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // ==========================================================================
    // 3. LOGO TOGGLE - Alterna tra logo.png e logo-spartan-race.png
    // ==========================================================================
    const logoImage = document.getElementById("logoImage");
    const logoLink = document.getElementById("logoLink");

    if (logoImage && logoLink) {
        // Imposta il percorso base delle immagini
        const LOGO_PATHS = {
            default: "assets/logo.png",
            alternate: "assets/logo-spartan-race.png",
        };

        // Controlla se c'è uno stato salvato nel localStorage
        let isAlternate = localStorage.getItem("logoState") === "alternate";

        // Imposta l'immagine iniziale
        logoImage.src = isAlternate ? LOGO_PATHS.alternate : LOGO_PATHS.default;

        // Aggiungi la classe per l'animazione iniziale se necessario
        if (isAlternate) {
            logoImage.classList.add("switching");
            setTimeout(() => logoImage.classList.remove("switching"), 300);
        }

        /**
         * Alterna l'immagine del logo
         */
        function toggleLogo(event) {
            if (event) event.preventDefault();

            // Alterna lo stato
            isAlternate = !isAlternate;

            // Aggiorna l'immagine
            logoImage.src = isAlternate
                ? LOGO_PATHS.alternate
                : LOGO_PATHS.default;

            // Salva lo stato nel localStorage per persistere tra le pagine
            localStorage.setItem(
                "logoState",
                isAlternate ? "alternate" : "default",
            );

            // Aggiungi animazione
            logoImage.classList.remove("switching");
            // Forza il reflow per riavviare l'animazione
            void logoImage.offsetWidth;
            logoImage.classList.add("switching");

            // Rimuovi la classe dopo l'animazione
            setTimeout(() => {
                logoImage.classList.remove("switching");
            }, 300);

            // Feedback visivo: cambia il colore del testo dell'ultima parola
            const logoText = document.querySelector(".logo span");
            if (logoText) {
                logoText.style.transition = "color 0.3s ease";
            }
        }

        // Event listener per il click sul logo (sull'immagine o su tutto il link)
        logoImage.addEventListener("click", toggleLogo);
        logoLink.addEventListener("click", function (e) {
            // Se il click è stato sull'immagine, evita che l'evento venga gestito due volte
            if (e.target === logoImage) return;
            toggleLogo(e);
        });

        // Opzionale: rotella del mouse per cambiare logo (effetto divertente)
        let wheelTimeout;
        logoImage.addEventListener(
            "wheel",
            function (e) {
                e.preventDefault();
                clearTimeout(wheelTimeout);
                wheelTimeout = setTimeout(() => {
                    toggleLogo(e);
                }, 200);
            },
            { passive: false },
        );

        console.log("Logo toggler inizializzato!");
    }

    // ==========================================================================
    // 4. COUNTER CONTROLLI (Numero Partecipanti)
    // ==========================================================================
    const passengersInput = document.getElementById("passengers");
    const btnMinus = document.getElementById("btnMinus");
    const btnPlus = document.getElementById("btnPlus");

    if (passengersInput && btnMinus && btnPlus) {
        /**
         * Aggiorna il valore del contatore partecipanti
         * @param {number} delta - Variazione da applicare (+1 o -1)
         */
        function updatePassengers(delta) {
            let current = parseInt(passengersInput.value) || 1;
            let newVal = current + delta;

            // Limita il valore tra 1 e 8
            newVal = Math.max(1, Math.min(8, newVal));

            if (newVal !== current) {
                passengersInput.value = newVal;
                // Aggiorna il filtro capienza alloggi
                updateAccommodationFilter(newVal);
                // Ricalcola i costi
                calculateCosts();
            }
        }

        // Event listeners per i pulsanti
        btnMinus.addEventListener("click", function () {
            updatePassengers(-1);
        });

        btnPlus.addEventListener("click", function () {
            updatePassengers(1);
        });

        // Event listener per l'input (gestisce anche l'inserimento manuale)
        passengersInput.addEventListener("change", function () {
            let val = parseInt(this.value) || 1;
            val = Math.max(1, Math.min(8, val));
            this.value = val;
            updateAccommodationFilter(val);
            calculateCosts();
        });
    }

    // ==========================================================================
    // 5. CALCOLATORE COSTI AVANZATO
    // ==========================================================================
    const COSTI_FISSI = {
        fuel: 60.3, // Carburante (andata)
        toll: 34.1, // Pedaggio (andata)
        nights: 1, // Numero di notti
    };

    // Stato globale per alloggio e gara selezionati
    let selectedHotel = {
        name: "Hotel Onda Marina",
        pricePerNight: 166,
        capacity: 4,
        basePriceMap: { 1: 72, 2: 102, 3: 135, 4: 166 },
    };

    let selectedRace = {
        name: "Spartan Sprint",
        price: 108,
        type: "sprint",
    };

    /**
     * Calcola e aggiorna tutti i costi nel calcolatore
     */
    function calculateCosts() {
        const passengers =
            parseInt(passengersInput ? passengersInput.value : 4) || 4;

        // Costi auto (andata e ritorno)
        const fuelTotal = COSTI_FISSI.fuel * 2;
        const tollTotal = COSTI_FISSI.toll * 2;

        // Quota carburante e pedaggio per persona
        const fuelPerPerson = fuelTotal / passengers;
        const tollPerPerson = tollTotal / passengers;

        // Quota alloggio per persona
        let hotelPerPerson = 0;
        if (selectedHotel && selectedHotel.basePriceMap) {
            const priceMap = selectedHotel.basePriceMap;
            // Trova il prezzo per il numero di ospiti (o il più vicino)
            const guests = Math.min(passengers, selectedHotel.capacity || 4);
            const key = String(guests);
            if (priceMap[key] !== undefined) {
                hotelPerPerson = priceMap[key] / guests;
            } else {
                // Fallback: usa il prezzo totale / ospiti
                hotelPerPerson =
                    (selectedHotel.pricePerNight || 166) / passengers;
            }
        } else {
            hotelPerPerson = (selectedHotel.pricePerNight || 166) / passengers;
        }

        // Costo gara per persona
        const racePerPerson = selectedRace.price || 108;

        // TOTALE per persona
        const totalPerPerson =
            fuelPerPerson + tollPerPerson + hotelPerPerson + racePerPerson;

        // Aggiorna la UI
        const calcFuel = document.getElementById("calcFuel");
        const calcToll = document.getElementById("calcToll");
        const calcHotel = document.getElementById("calcHotel");
        const calcRace = document.getElementById("calcRace");
        const perPersonCost = document.getElementById("perPersonCost");
        const selectedHotelLabel =
            document.getElementById("selectedHotelLabel");
        const selectedRaceLabel = document.getElementById("selectedRaceLabel");

        if (calcFuel) calcFuel.textContent = fuelPerPerson.toFixed(2) + " €";
        if (calcToll) calcToll.textContent = tollPerPerson.toFixed(2) + " €";
        if (calcHotel) calcHotel.textContent = hotelPerPerson.toFixed(2) + " €";
        if (calcRace) calcRace.textContent = racePerPerson.toFixed(2) + " €";
        if (perPersonCost)
            perPersonCost.textContent = totalPerPerson.toFixed(2) + " €";

        if (selectedHotelLabel && selectedHotel) {
            selectedHotelLabel.textContent = `(${selectedHotel.name})`;
        }

        if (selectedRaceLabel && selectedRace) {
            selectedRaceLabel.textContent = `(${selectedRace.name})`;
        }
    }

    // ==========================================================================
    // 6. SELEZIONE ALLOGGIO
    // ==========================================================================
    /**
     * Seleziona un hotel per il calcolo dei costi
     * @param {HTMLElement} card - La card dell'hotel selezionato
     */
    function selectHotel(card) {
        // Rimuovi la selezione da tutte le card
        document.querySelectorAll(".accommodation-card").forEach((c) => {
            c.classList.remove("selected-hotel");
            const btn = c.querySelector(".btn-select-hotel");
            if (btn) btn.classList.remove("active");
        });

        // Aggiungi la selezione alla card cliccata
        card.classList.add("selected-hotel");
        const btn = card.querySelector(".btn-select-hotel");
        if (btn) btn.classList.add("active");

        // Estrai i dati dell'hotel
        const title = card.querySelector(".card-title");
        const priceSpan = card.querySelector(".dynamic-price");
        const capacitySpan = card.querySelector(".card-capacity");

        if (title && priceSpan) {
            let priceText = priceSpan.textContent.trim();
            // Rimuovi '€' e spazi
            const price = parseFloat(priceText.replace("€", "").trim()) || 0;
            const name = title.textContent.trim();

            // Estrai la mappa dei prezzi dal data attribute
            let basePriceMap = {};
            const basePriceAttr = card.dataset.basePrice;
            if (basePriceAttr) {
                try {
                    basePriceMap = JSON.parse(basePriceAttr);
                } catch (e) {
                    console.warn("Errore parsing basePriceMap:", e);
                }
            }

            // Estrai la capienza
            let capacity = 4;
            if (capacitySpan) {
                const match = capacitySpan.textContent.match(/(\d+)/);
                if (match) capacity = parseInt(match[1]) || 4;
            }

            // Aggiorna l'hotel selezionato
            selectedHotel = {
                name: name,
                pricePerNight: price,
                capacity: capacity,
                basePriceMap: basePriceMap,
            };

            // Ricalcola i costi
            calculateCosts();
        }
    }

    // Inizializza i bottoni di selezione hotel
    document.querySelectorAll(".btn-select-hotel").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const card = this.closest(".accommodation-card");
            if (card) {
                selectHotel(card);
            }
        });
    });

    // ==========================================================================
    // 7. FILTRO ALLOGGI PER CAPACITÀ
    // ==========================================================================
    /**
     * Filtra gli alloggi in base al numero di partecipanti
     * @param {number} capacity - Numero di persone
     */
    function updateAccommodationFilter(capacity) {
        const cards = document.querySelectorAll(".accommodation-card");
        const noMsg = document.getElementById("noAccommodationMsg");
        const countDisplay = document.getElementById("capacityFilterCount");
        let visibleCount = 0;

        if (countDisplay) {
            countDisplay.textContent = capacity;
        }

        cards.forEach((card) => {
            const cardCapacity = parseInt(card.dataset.capacity) || 0;
            const isVisible = cardCapacity >= capacity;

            card.style.display = isVisible ? "flex" : "none";
            if (isVisible) visibleCount++;
        });

        // Mostra/nascondi il messaggio di nessun risultato
        if (noMsg) {
            if (visibleCount === 0) {
                noMsg.classList.remove("hidden");
            } else {
                noMsg.classList.add("hidden");
            }
        }
    }

    // ==========================================================================
    // 8. SELEZIONE TIPO GARA (SPRINT / SUPER)
    // ==========================================================================
    const raceTabs = document.querySelectorAll(".race-tab-btn");
    const sprintInfo = document.getElementById("race-sprint-info");
    const superInfo = document.getElementById("race-super-info");

    if (raceTabs.length > 0) {
        raceTabs.forEach((tab) => {
            tab.addEventListener("click", function () {
                // Rimuovi la classe active da tutti i tab
                raceTabs.forEach((t) => t.classList.remove("active"));
                this.classList.add("active");

                // Mostra la card della gara corrispondente
                const raceType = this.dataset.race;
                const price = parseFloat(this.dataset.price) || 108;

                if (raceType === "sprint") {
                    if (sprintInfo) sprintInfo.classList.remove("hidden");
                    if (superInfo) superInfo.classList.add("hidden");
                    selectedRace = {
                        name: "Spartan Sprint",
                        price: price,
                        type: "sprint",
                    };
                } else if (raceType === "super") {
                    if (sprintInfo) sprintInfo.classList.add("hidden");
                    if (superInfo) superInfo.classList.remove("hidden");
                    selectedRace = {
                        name: "Spartan Super",
                        price: price,
                        type: "super",
                    };
                }

                // Ricalcola i costi
                calculateCosts();
            });
        });
    }

    // ==========================================================================
    // 9. SELEZIONE BATTERIA (WAVE TIME)
    // ==========================================================================
    document.querySelectorAll(".wave-time-slot").forEach((slot) => {
        slot.addEventListener("click", function () {
            const parent = this.closest(".wave-section");
            if (parent) {
                parent.querySelectorAll(".wave-time-slot").forEach((s) => {
                    s.classList.remove("selected");
                });
                this.classList.add("selected");
            }
        });
    });

    // ==========================================================================
    // 10. REVEAL ANIMATION ON SCROLL (Intersection Observer)
    // ==========================================================================
    if ("IntersectionObserver" in window) {
        const revealElements = document.querySelectorAll(".reveal");

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
                        // Opzionale: rimuovi l'osservatore dopo l'animazione
                        // revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: "0px 0px -50px 0px",
            },
        );

        revealElements.forEach((el) => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback per browser che non supportano IntersectionObserver
        document.querySelectorAll(".reveal").forEach((el) => {
            el.classList.add("active");
        });
    }

    // ==========================================================================
    // 11. SMOOTH SCROLL PER I LINK INTERNI
    // ==========================================================================
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");

            // Salta se è solo "#" o vuoto
            if (targetId === "#" || !targetId) return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                const navHeight = 60;
                const targetPosition =
                    targetElement.getBoundingClientRect().top +
                    window.pageYOffset -
                    navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth",
                });
            }
        });
    });

    // ==========================================================================
    // 12. INIZIALIZZAZIONE FINALE
    // ==========================================================================
    /**
     * Inizializza tutti i componenti all'avvio
     */
    function init() {
        // Imposta il valore iniziale del contatore partecipanti
        const passengers =
            parseInt(passengersInput ? passengersInput.value : 4) || 4;
        updateAccommodationFilter(passengers);

        // Calcola i costi iniziali
        calculateCosts();

        // Se c'è un hotel selezionato di default, segnalalo visivamente
        document.querySelectorAll(".accommodation-card").forEach((card) => {
            const title = card.querySelector(".card-title");
            if (
                title &&
                selectedHotel &&
                title.textContent.trim().replace(/\s+/g, " ") ===
                    selectedHotel.name
            ) {
                card.classList.add("selected-hotel");
                const btn = card.querySelector(".btn-select-hotel");
                if (btn) btn.classList.add("active");
            }
        });

        console.log("✅ Spartan Planner inizializzato!");
        console.log("📊 Partecipanti:", passengers);
        console.log("🏨 Hotel selezionato:", selectedHotel.name);
        console.log("🏃 Gara selezionata:", selectedRace.name);
    }

    // Avvia l'inizializzazione
    init();

    // Ricalcola i costi quando la finestra viene ridimensionata (per sicurezza)
    let resizeTimeout;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            calculateCosts();
        }, 250);
    });
});
