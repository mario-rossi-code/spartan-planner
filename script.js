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

    const COSTI_FISSI = {
        fuel: 60.3,
        toll: 34.1,
        nights: 1,
    };

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

    function calculateCosts() {
        const passengers =
            parseInt(passengersInput ? passengersInput.value : 4) || 4;

        const fuelTotal = COSTI_FISSI.fuel * 2;
        const tollTotal = COSTI_FISSI.toll * 2;

        const fuelPerPerson = fuelTotal / passengers;
        const tollPerPerson = tollTotal / passengers;

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
            fuelPerPerson + tollPerPerson + hotelPerPerson + racePerPerson;

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

    document.querySelectorAll(".btn-select-hotel").forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const card = this.closest(".accommodation-card");
            if (card) {
                selectHotel(card);
            }
        });
    });

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

        if (noMsg) {
            if (visibleCount === 0) {
                noMsg.classList.remove("hidden");
            } else {
                noMsg.classList.add("hidden");
            }
        }
    }

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
                } else if (raceType === "super") {
                    if (sprintInfo) sprintInfo.classList.add("hidden");
                    if (superInfo) superInfo.classList.remove("hidden");
                    selectedRace = {
                        name: "Spartan Super",
                        price: price,
                        type: "super",
                    };
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

        calculateCosts();

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
