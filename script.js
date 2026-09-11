document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const menuToggle = document.getElementById("menuToggle");
    const navDrawer = document.getElementById("navDrawer");
    const navOverlay = document.getElementById("navOverlay");

    if (menuToggle && navDrawer && navOverlay) {
        function toggleMenu() {
            const isOpen = navDrawer.classList.contains("open");
            menuToggle.classList.toggle("active");
            navDrawer.classList.toggle("open");
            navOverlay.classList.toggle("active");
            document.body.style.overflow = isOpen ? "" : "hidden";
            menuToggle.setAttribute("aria-expanded", !isOpen);
        }

        menuToggle.addEventListener("click", toggleMenu);
        navOverlay.addEventListener("click", toggleMenu);

        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", function () {
                if (navDrawer.classList.contains("open")) {
                    toggleMenu();
                }
            });
        });

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && navDrawer.classList.contains("open")) {
                toggleMenu();
            }
        });
    }

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

    updateCountdown();
    setInterval(updateCountdown, 1000);

    const logoImage = document.getElementById("logoImage");
    const logoLink = document.getElementById("logoLink");

    if (logoImage && logoLink) {
        const LOGO_PATHS = {
            default: "assets/logo.png",
            alternate: "assets/logo-spartan-race.png",
        };

        let isAlternate = localStorage.getItem("logoState") === "alternate";
        logoImage.src = isAlternate ? LOGO_PATHS.alternate : LOGO_PATHS.default;

        if (isAlternate) {
            logoImage.classList.add("switching");
            setTimeout(() => logoImage.classList.remove("switching"), 300);
        }

        function toggleLogo(event) {
            if (event) event.preventDefault();

            isAlternate = !isAlternate;
            logoImage.src = isAlternate
                ? LOGO_PATHS.alternate
                : LOGO_PATHS.default;

            localStorage.setItem(
                "logoState",
                isAlternate ? "alternate" : "default",
            );

            logoImage.classList.remove("switching");
            void logoImage.offsetWidth;
            logoImage.classList.add("switching");

            setTimeout(() => {
                logoImage.classList.remove("switching");
            }, 300);

            const logoText = document.querySelector(".logo span");
            if (logoText) {
                logoText.style.transition = "color 0.3s ease";
            }
        }

        logoImage.addEventListener("click", toggleLogo);
        logoLink.addEventListener("click", function (e) {
            if (e.target === logoImage) return;
            toggleLogo(e);
        });

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
    }

    const passengersInput = document.getElementById("passengers");
    const btnMinus = document.getElementById("btnMinus");
    const btnPlus = document.getElementById("btnPlus");

    const COSTI_FISSI = {
        fuel: 60.3,
        toll: 34.1,
        nights: 1,
    };

    const JOURNEY_RULES = {
        andata: {
            from: "Napoli Centrale",
            to: "Misano Adriatico",
        },
        ritorno: {
            from: "Misano Adriatico",
            to: "Napoli Centrale",
        },
    };

    let selectedTransport = "car";
    let selectedTickets = {
        andata: [],
        ritorno: [],
    };

    let selectedHotel = {
        name: "Hotel Onda Marina",
        pricePerNight: 166,
        capacity: 4,
        basePriceMap: { 1: 72, 2: 102, 3: 135, 4: 166 },
    };

    let selectedRace = {
        name: "Spartan Super",
        price: 108,
        type: "super",
    };

    if (passengersInput && btnMinus && btnPlus) {
        function updatePassengers(delta) {
            let current = parseInt(passengersInput.value) || 1;
            let newVal = current + delta;
            newVal = Math.max(1, Math.min(8, newVal));

            if (newVal !== current) {
                passengersInput.value = newVal;
                updateAccommodationFilter(newVal);
                calculateCosts();
            }
        }

        btnMinus.addEventListener("click", function () {
            updatePassengers(-1);
        });

        btnPlus.addEventListener("click", function () {
            updatePassengers(1);
        });

        passengersInput.addEventListener("change", function () {
            let val = parseInt(this.value) || 1;
            val = Math.max(1, Math.min(8, val));
            this.value = val;
            updateAccommodationFilter(val);
            calculateCosts();
        });
    }

    document.querySelectorAll(".btn-clear-direction").forEach((btn) => {
        btn.addEventListener("click", function () {
            const direction = this.dataset.direction;
            selectedTickets[direction] = [];
            refreshTicketsUI(direction);
        });
    });

    const transportTabs = document.querySelectorAll(".transport-tab-btn");
    const carInfo = document.getElementById("transport-car-info");
    const trainInfo = document.getElementById("transport-train-info");
    const ticketsSection = document.getElementById("biglietti-treno");

    transportTabs.forEach((tab) => {
        tab.addEventListener("click", function () {
            transportTabs.forEach((t) => t.classList.remove("active"));
            this.classList.add("active");

            selectedTransport = this.dataset.transport;

            if (selectedTransport === "car") {
                if (carInfo) carInfo.classList.remove("hidden");
                if (trainInfo) trainInfo.classList.add("hidden");
                if (ticketsSection) ticketsSection.classList.add("hidden");
            } else {
                if (carInfo) carInfo.classList.add("hidden");
                if (trainInfo) trainInfo.classList.remove("hidden");
                if (ticketsSection) ticketsSection.classList.remove("hidden");
            }

            updateCalculatorRows();
            calculateCosts();
        });
    });

    document.querySelectorAll(".btn-select-ticket").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const card = this.closest(".ticket-option-card");
            if (!card) return;

            const direction = card.dataset.direction;
            const cardId = card.dataset.id;
            const list = selectedTickets[direction];
            const existingIndex = list.findIndex((t) => t.id === cardId);

            if (existingIndex !== -1) {
                list.splice(existingIndex, 1);
                card.classList.remove("selected");
                refreshTicketsUI(direction);
                return;
            }

            const ticket = {
                id: cardId,
                price: parseFloat(card.dataset.price) || 0,
                duration: card.dataset.duration || "",
                changes: parseInt(card.dataset.changes) || 0,
                departure: card.dataset.departure || "",
                arrival: card.dataset.arrival || "",
                from: card.dataset.from || "",
                to: card.dataset.to || "",
                legs: parseLegs(card.dataset.legs),
            };

            const check = canAddTicket(direction, ticket);
            if (!check.ok) {
                showValidation(direction, check.message, "error");
                return;
            }

            list.push(ticket);
            list.sort((a, b) => a.departure.localeCompare(b.departure));

            refreshTicketsUI(direction);
        });
    });

    document.querySelectorAll(".btn-select-hotel").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const card = this.closest(".accommodation-card");
            if (card) {
                selectHotel(card);
            }
        });
    });

    const raceTabs = document.querySelectorAll(".race-tab-btn");
    const sprintInfo = document.getElementById("race-sprint-info");
    const superInfo = document.getElementById("race-super-info");

    if (raceTabs.length > 0) {
        raceTabs.forEach((tab) => {
            tab.addEventListener("click", function () {
                raceTabs.forEach((t) => t.classList.remove("active"));
                this.classList.add("active");

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
                    document.documentElement.style.setProperty(
                        "--primary-color",
                        "var(--primary-red)",
                    );
                    document.documentElement.style.setProperty(
                        "--primary-color-background",
                        "var(--primary-red-background)",
                    );
                    document.documentElement.style.setProperty(
                        "--primary-color-hover",
                        "var(--primary-red-hover)",
                    );
                    document.documentElement.style.setProperty(
                        "--primary-color-box-shadow",
                        "var(--primary-red-box-shadow)",
                    );
                } else if (raceType === "super") {
                    if (sprintInfo) sprintInfo.classList.add("hidden");
                    if (superInfo) superInfo.classList.remove("hidden");
                    selectedRace = {
                        name: "Spartan Super",
                        price: price,
                        type: "super",
                    };
                    document.documentElement.style.setProperty(
                        "--primary-color",
                        "var(--primary-blue)",
                    );
                    document.documentElement.style.setProperty(
                        "--primary-color-background",
                        "var(--primary-blue-background)",
                    );
                    document.documentElement.style.setProperty(
                        "--primary-color-hover",
                        "var(--primary-blue-hover)",
                    );
                    document.documentElement.style.setProperty(
                        "--primary-color-box-shadow",
                        "var(--primary-blue-box-shadow)",
                    );
                }

                calculateCosts();
            });
        });
    }

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

    function parseLegs(raw) {
        try {
            return JSON.parse(raw || "[]").map((name) => ({
                name: name,
                class: getTrainTypeClass(name),
            }));
        } catch {
            return [];
        }
    }

    function getTrainTypeClass(typeName) {
        const map = {
            Frecciarossa: "frecciarossa",
            Italo: "italo",
            Intercity: "intercity",
            Regionale: "regionale",
            "Regionale Veloce": "regionale",
        };
        return map[typeName] || "regionale";
    }

    function normalizeStation(name) {
        return (name || "").trim().toLowerCase();
    }

    function stationsMatch(a, b) {
        return normalizeStation(a) === normalizeStation(b);
    }

    function timeToMinutes(hhmm) {
        if (!hhmm || !hhmm.includes(":")) return 0;
        const [h, m] = hhmm.split(":").map((n) => parseInt(n, 10) || 0);
        return h * 60 + m;
    }

    function minutesBetween(arrival, nextDeparture) {
        let diff = timeToMinutes(nextDeparture) - timeToMinutes(arrival);
        if (diff < 0) diff += 24 * 60;
        return diff;
    }

    function formatWait(totalMin) {
        if (totalMin < 60) return `${totalMin}m`;
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }

    function formatTotalDuration(firstDeparture, lastArrival) {
        const min = minutesBetween(firstDeparture, lastArrival);
        if (min < 60) return `${min}m`;
        const h = Math.floor(min / 60);
        const m = min % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }

    function canAddTicket(direction, ticket) {
        const rule = JOURNEY_RULES[direction];
        const list = selectedTickets[direction];

        if (list.length === 0) {
            if (!stationsMatch(ticket.from, rule.from)) {
                return {
                    ok: false,
                    message: `Il primo biglietto di ${
                        direction === "andata" ? "andata" : "ritorno"
                    } deve partire da <strong>${rule.from}</strong>.`,
                };
            }
            return { ok: true };
        }

        const sorted = [...list].sort((a, b) =>
            a.departure.localeCompare(b.departure),
        );
        const last = sorted[sorted.length - 1];

        if (ticket.departure < last.arrival) {
            return {
                ok: false,
                message: `Il biglietto selezionato parte alle <strong>${ticket.departure}</strong> ma il precedente arriva alle <strong>${last.arrival}</strong>. Scegli un biglietto con partenza successiva.`,
            };
        }

        if (!stationsMatch(ticket.from, last.to)) {
            return {
                ok: false,
                message: `Il biglietto deve partire da <strong>${last.to}</strong> (arrivo del precedente), non da <strong>${ticket.from}</strong>.`,
            };
        }

        return { ok: true };
    }

    function validateJourney(direction) {
        const rule = JOURNEY_RULES[direction];
        const list = selectedTickets[direction];

        if (list.length === 0) {
            return {
                valid: false,
                message: `Nessun biglietto di ${
                    direction === "andata" ? "andata" : "ritorno"
                } selezionato.`,
            };
        }

        const sorted = [...list].sort((a, b) =>
            a.departure.localeCompare(b.departure),
        );
        const first = sorted[0];
        const last = sorted[sorted.length - 1];

        if (!stationsMatch(first.from, rule.from)) {
            return {
                valid: false,
                message: `Il percorso di ${
                    direction === "andata" ? "andata" : "ritorno"
                } deve iniziare da <strong>${rule.from}</strong>.`,
            };
        }

        if (!stationsMatch(last.to, rule.to)) {
            return {
                valid: false,
                message: `Il percorso di ${
                    direction === "andata" ? "andata" : "ritorno"
                } deve terminare a <strong>${rule.to}</strong>.`,
            };
        }

        for (let i = 0; i < sorted.length - 1; i++) {
            if (!stationsMatch(sorted[i].to, sorted[i + 1].from)) {
                return {
                    valid: false,
                    message: `Discontinuità tra <strong>${sorted[i].to}</strong> e <strong>${sorted[i + 1].from}</strong>.`,
                };
            }
        }

        return { valid: true, message: "Percorso completo e valido." };
    }

    function refreshTicketsUI(direction) {
        document
            .querySelectorAll(
                `.ticket-option-card[data-direction="${direction}"]`,
            )
            .forEach((card) => {
                const id = card.dataset.id;
                const isSelected = selectedTickets[direction].some(
                    (t) => t.id === id,
                );
                card.classList.toggle("selected", isSelected);
                const btn = card.querySelector(".btn-select-ticket");
                if (btn) {
                    btn.textContent = isSelected
                        ? "Selezionato"
                        : direction === "andata"
                          ? "Aggiungi Andata"
                          : "Aggiungi Ritorno";
                }
            });

        renderTimeline(direction);
        renderValidation(direction);
        updateTrainSummaryUI();
        calculateCosts();
    }

    function renderTimeline(direction) {
        const container = document.getElementById(`timeline-${direction}`);
        const totalEl = document.getElementById(`total-${direction}`);
        if (!container) return;

        const list = [...selectedTickets[direction]].sort((a, b) =>
            a.departure.localeCompare(b.departure),
        );

        if (list.length === 0) {
            container.innerHTML =
                '<p class="text-muted">Nessun biglietto selezionato.</p>';
            if (totalEl) totalEl.textContent = "0,00 €";
            return;
        }

        let html = "";
        list.forEach((t, i) => {
            html += `
                <div class="journey-step">
                    <div>
                        <span class="step-time">${t.departure}</span>
                        <span class="step-station">${t.from}</span>
                    </div>
                    <span class="step-arrow"><i class="fa-solid fa-arrow-right"></i></span>
                    <div style="text-align:right">
                        <span class="step-time">${t.arrival}</span>
                        <span class="step-station">${t.to}</span>
                    </div>
                </div>
            `;

            if (i < list.length - 1) {
                const next = list[i + 1];
                const waitMin = minutesBetween(t.arrival, next.departure);
                html += `
                    <div class="journey-change">
                        <i class="fa-solid fa-hourglass-half"></i>
                        <span>${formatWait(waitMin)} cambio a ${t.to}</span>
                    </div>
                `;
            }
        });

        container.innerHTML = html;

        const total = list.reduce((sum, t) => sum + t.price, 0);
        if (totalEl) totalEl.textContent = total.toFixed(2) + " €";
    }

    function renderValidation(direction) {
        const el = document.getElementById(`validation-${direction}`);
        if (!el) return;

        const result = validateJourney(direction);
        el.classList.remove("error", "success", "visible");

        if (result.valid) {
            el.classList.add("success", "visible");
            el.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${result.message}`;
        } else {
            el.classList.add("error", "visible");
            el.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${result.message}`;
        }
    }

    function showValidation(direction, message, type) {
        const el = document.getElementById(`validation-${direction}`);
        if (!el) return;
        el.classList.remove("error", "success");
        el.classList.add(type, "visible");
        el.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;
    }

    function getTrainTotal() {
        const andata = selectedTickets.andata.reduce(
            (sum, t) => sum + t.price,
            0,
        );
        const ritorno = selectedTickets.ritorno.reduce(
            (sum, t) => sum + t.price,
            0,
        );
        return { andata, ritorno, totale: andata + ritorno };
    }

    function updateTrainSummaryUI() {
        const { andata, ritorno, totale } = getTrainTotal();

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setText(
            "summaryCostAndata",
            andata > 0 ? andata.toFixed(2) + " €" : "—",
        );
        setText(
            "summaryCostRitorno",
            ritorno > 0 ? ritorno.toFixed(2) + " €" : "—",
        );
        setText(
            "summaryCostTotale",
            totale > 0 ? totale.toFixed(2) + " €" : "—",
        );

        ["andata", "ritorno"].forEach((direction) => {
            const suffix = direction === "andata" ? "Andata" : "Ritorno";
            const list = [...selectedTickets[direction]].sort((a, b) =>
                a.departure.localeCompare(b.departure),
            );

            const durationEl = document.getElementById(
                `summaryDuration${suffix}`,
            );
            const changesEl = document.getElementById(
                `summaryChanges${suffix}`,
            );

            if (list.length === 0) {
                if (durationEl) durationEl.textContent = "—";
                if (changesEl) changesEl.textContent = "—";
                return;
            }

            const first = list[0];
            const last = list[list.length - 1];

            if (durationEl) {
                durationEl.textContent = formatTotalDuration(
                    first.departure,
                    last.arrival,
                );
            }
            if (changesEl) {
                changesEl.textContent = String(list.length - 1);
            }
        });

        renderDirectionSummary("andata");
        renderDirectionSummary("ritorno");

        const selectedAndataSummary = document.getElementById(
            "selectedAndataSummary",
        );
        const selectedRitornoSummary = document.getElementById(
            "selectedRitornoSummary",
        );

        if (selectedAndataSummary) {
            selectedAndataSummary.innerHTML =
                selectedTickets.andata.length > 0
                    ? buildSelectedTicketsHTML(selectedTickets.andata)
                    : `<div class="selected-ticket-empty"><div><i class="fa-solid fa-circle-info"></i> Nessun biglietto di andata selezionato.</div><a href="#biglietti-treno" class="quick-link">Vai alla selezione</a></div>`;
        }

        if (selectedRitornoSummary) {
            selectedRitornoSummary.innerHTML =
                selectedTickets.ritorno.length > 0
                    ? buildSelectedTicketsHTML(selectedTickets.ritorno)
                    : `<div class="selected-ticket-empty"><div><i class="fa-solid fa-circle-info"></i> Nessun biglietto di ritorno selezionato.</div><a href="#biglietti-treno" class="quick-link">Vai alla selezione</a></div>`;
        }
    }

    function renderDirectionSummary(direction) {
        const suffix = direction === "andata" ? "Andata" : "Ritorno";
        const container = document.getElementById(`selected${suffix}Summary`);
        if (!container) return;

        const list = [...selectedTickets[direction]].sort((a, b) =>
            a.departure.localeCompare(b.departure),
        );

        if (list.length === 0) {
            container.innerHTML = `<div class="selected-ticket-empty"><i class="fa-solid fa-circle-info"></i> Nessun biglietto di ${
                direction === "andata" ? "andata" : "ritorno"
            } selezionato. <a href="#biglietti-treno" class="quick-link">Vai alla selezione</a></div>`;
            return;
        }

        const first = list[0];
        const last = list[list.length - 1];

        container.innerHTML = `
            <div class="selected-ticket-route">
                <div class="selected-ticket-station">
                    <span class="selected-ticket-time">${first.departure}</span>
                    <span class="selected-ticket-city">${first.from}</span>
                </div>
                <div class="selected-ticket-arrow"><i class="fa-solid fa-arrow-right"></i></div>
                <div class="selected-ticket-station">
                    <span class="selected-ticket-time">${last.arrival}</span>
                    <span class="selected-ticket-city">${last.to}</span>
                </div>
            </div>
        `;
    }

    function buildSelectedTicketsHTML(tickets) {
        const sorted = [...tickets].sort((a, b) =>
            a.departure.localeCompare(b.departure),
        );

        const total = sorted.reduce((sum, t) => sum + t.price, 0);

        let html = '<div class="selected-tickets-list">';

        sorted.forEach((t, i) => {
            html += `
            <div class="selected-ticket-info">
                <div class="selected-ticket-head">
                    <div class="selected-ticket-legs">
                        ${t.legs
                            .map(
                                (l) =>
                                    `<span class="train-type ${l.class}">${l.name}</span>`,
                            )
                            .join("")}
                    </div>
                    <div class="selected-ticket-price">${t.price.toFixed(2)} €</div>
                </div>

                <div class="selected-ticket-route">
                    <div class="selected-ticket-station">
                        <span class="selected-ticket-time">${t.departure}</span>
                        <span class="selected-ticket-city">${t.from}</span>
                    </div>
                    <div class="selected-ticket-arrow">
                        <i class="fa-solid fa-arrow-right"></i>
                    </div>
                    <div class="selected-ticket-station">
                        <span class="selected-ticket-time">${t.arrival}</span>
                        <span class="selected-ticket-city">${t.to}</span>
                    </div>
                </div>

                <div class="selected-ticket-meta">
                    <span><i class="fa-solid fa-clock"></i> ${t.duration}</span>
                </div>
            </div>
        `;

            if (i < sorted.length - 1) {
                const next = sorted[i + 1];
                const waitMin = minutesBetween(t.arrival, next.departure);
                html += `
                <div class="selected-ticket-change">
                    <i class="fa-solid fa-hourglass-half"></i>
                    <span>${formatWait(waitMin)} cambio a ${t.to}</span>
                </div>
            `;
            }
        });

        html += "</div>";

        html += `
        <div class="selected-tickets-total">
            <span>Totale</span>
            <strong>${total.toFixed(2)} €</strong>
        </div>
    `;

        return html;
    }

    function updateCalculatorRows() {
        const carRows = document.querySelectorAll(".transport-car-row");
        const trainRows = document.querySelectorAll(".transport-train-row");

        if (selectedTransport === "car") {
            carRows.forEach((r) => r.classList.remove("hidden"));
            trainRows.forEach((r) => r.classList.add("hidden"));
        } else {
            carRows.forEach((r) => r.classList.add("hidden"));
            trainRows.forEach((r) => r.classList.remove("hidden"));
        }
    }

    function calculateCosts() {
        const passengers =
            parseInt(passengersInput ? passengersInput.value : 4) || 4;

        let fuelPerPerson = 0;
        let tollPerPerson = 0;
        let trainAndataPerPerson = 0;
        let trainRitornoPerPerson = 0;
        let transportPerPerson = 0;

        if (selectedTransport === "car") {
            fuelPerPerson = (COSTI_FISSI.fuel * 2) / passengers;
            tollPerPerson = (COSTI_FISSI.toll * 2) / passengers;
            transportPerPerson = fuelPerPerson + tollPerPerson;
        } else {
            const { andata, ritorno } = getTrainTotal();
            trainAndataPerPerson = andata;
            trainRitornoPerPerson = ritorno;
            transportPerPerson = andata + ritorno;
        }

        let hotelPerPerson = 0;
        if (selectedHotel && selectedHotel.basePriceMap) {
            const priceMap = selectedHotel.basePriceMap;
            const guests = Math.min(passengers, selectedHotel.capacity || 4);
            const key = String(guests);
            if (priceMap[key] !== undefined) {
                hotelPerPerson = priceMap[key] / guests;
            } else {
                hotelPerPerson =
                    (selectedHotel.pricePerNight || 166) / passengers;
            }
        } else {
            hotelPerPerson = (selectedHotel.pricePerNight || 166) / passengers;
        }

        const racePerPerson = selectedRace.price || 108;
        const totalPerPerson =
            transportPerPerson + hotelPerPerson + racePerPerson;

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        };

        setText("calcFuel", fuelPerPerson.toFixed(2) + " €");
        setText("calcToll", tollPerPerson.toFixed(2) + " €");
        setText(
            "calcTrainAndata",
            trainAndataPerPerson > 0
                ? trainAndataPerPerson.toFixed(2) + " €"
                : "—",
        );
        setText(
            "calcTrainRitorno",
            trainRitornoPerPerson > 0
                ? trainRitornoPerPerson.toFixed(2) + " €"
                : "—",
        );
        setText("calcHotel", hotelPerPerson.toFixed(2) + " €");
        setText("calcRace", racePerPerson.toFixed(2) + " €");
        setText("perPersonCost", totalPerPerson.toFixed(2) + " €");

        const selectedHotelLabel =
            document.getElementById("selectedHotelLabel");
        const selectedRaceLabel = document.getElementById("selectedRaceLabel");

        if (selectedHotelLabel && selectedHotel) {
            selectedHotelLabel.textContent = `(${selectedHotel.name})`;
        }

        if (selectedRaceLabel && selectedRace) {
            selectedRaceLabel.textContent = `(${selectedRace.name})`;
        }
    }

    function selectHotel(card) {
        document.querySelectorAll(".accommodation-card").forEach((c) => {
            c.classList.remove("selected-hotel");
            const btn = c.querySelector(".btn-select-hotel");
            if (btn) btn.classList.remove("active");
        });

        card.classList.add("selected-hotel");
        const btn = card.querySelector(".btn-select-hotel");
        if (btn) btn.classList.add("active");

        const title = card.querySelector(".card-title");
        const priceSpan = card.querySelector(".dynamic-price");
        const capacitySpan = card.querySelector(".card-capacity");

        if (title && priceSpan) {
            let priceText = priceSpan.textContent.trim();
            const price = parseFloat(priceText.replace("€", "").trim()) || 0;
            const name = title.textContent.trim();

            let basePriceMap = {};
            const basePriceAttr = card.dataset.basePrice;
            if (basePriceAttr) {
                try {
                    basePriceMap = JSON.parse(basePriceAttr);
                } catch (e) {}
            }

            let capacity = 4;
            if (capacitySpan) {
                const match = capacitySpan.textContent.match(/(\d+)/);
                if (match) capacity = parseInt(match[1]) || 4;
            }

            selectedHotel = {
                name: name,
                pricePerNight: price,
                capacity: capacity,
                basePriceMap: basePriceMap,
            };

            calculateCosts();
        }
    }

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

            const priceSpan = card.querySelector(".dynamic-price");
            if (priceSpan) {
                let basePriceMap = {};
                try {
                    basePriceMap = JSON.parse(card.dataset.basePrice || "{}");
                } catch (e) {}

                const guests = Math.min(capacity, cardCapacity);
                const key = String(guests);
                if (basePriceMap[key] !== undefined) {
                    priceSpan.textContent = basePriceMap[key] + " €";
                }
            }
        });

        if (noMsg) {
            if (visibleCount === 0) {
                noMsg.classList.remove("hidden");
            } else {
                noMsg.classList.add("hidden");
            }
        }
    }

    if ("IntersectionObserver" in window) {
        const revealElements = document.querySelectorAll(".reveal");

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("active");
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
        document.querySelectorAll(".reveal").forEach((el) => {
            el.classList.add("active");
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");

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

    function init() {
        const passengers =
            parseInt(passengersInput ? passengersInput.value : 4) || 4;
        updateAccommodationFilter(passengers);
        updateCalculatorRows();
        updateTrainSummaryUI();
        calculateCosts();
        refreshTicketsUI("andata");
        refreshTicketsUI("ritorno");

        document.documentElement.style.setProperty(
            "--primary-color",
            selectedRace.type === "super"
                ? "var(--primary-blue)"
                : "var(--primary-red)",
        );
        document.documentElement.style.setProperty(
            "--primary-color-background",
            selectedRace.type === "super"
                ? "var(--primary-blue-background)"
                : "var(--primary-red-background)",
        );
        document.documentElement.style.setProperty(
            "--primary-color-hover",
            selectedRace.type === "super"
                ? "var(--primary-blue-hover)"
                : "var(--primary-red-hover)",
        );
        document.documentElement.style.setProperty(
            "--primary-color-box-shadow",
            selectedRace.type === "super"
                ? "var(--primary-blue-box-shadow)"
                : "var(--primary-red-box-shadow)",
        );

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
    }

    init();

    let resizeTimeout;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            calculateCosts();
        }, 250);
    });
});
