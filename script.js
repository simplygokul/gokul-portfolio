(function () {
  const menu = document.querySelector(".menu-button");
  const nav = document.getElementById("site-nav");

  const setMenuOpen = (open) => {
    document.body.classList.toggle("menu-open", open);
    document.documentElement.classList.toggle("menu-open", open);
    menu?.setAttribute("aria-expanded", String(open));
  };

  menu?.addEventListener("click", () => {
    setMenuOpen(!document.documentElement.classList.contains("menu-open"));
  });

  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.documentElement.classList.contains("menu-open")) {
      setMenuOpen(false);
      menu?.focus();
    }
  });

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const reveals = document.querySelectorAll("[data-reveal]");
  const process = document.querySelector("[data-process]");

  if (!("IntersectionObserver" in window) || reduced) {
    reveals.forEach((el) => el.classList.add("visible"));
    process?.classList.add("visible");
  } else {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.14 }
    );

    reveals.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 3, 2) * 90}ms`;
      observer.observe(el);
    });
    if (process) observer.observe(process);
  }

  if (!reduced) {
    const card = document.querySelector("[data-parallax]");
    card?.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-2px)`;
    });
    card?.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  }

  const params = new URLSearchParams(location.search);
  const reason = params.get("reason");
  if (reason) {
    document
      .querySelectorAll("[data-reason]")
      .forEach((item) => item.classList.toggle("selected", item.dataset.reason === reason));
  }

  const radarList = document.querySelector("[data-radar-list]");
  const radarEmptyTemplate = document.getElementById("radar-empty-template");
  let radarEvents = [];
  let radarStateById = new Map();
  let radarTimer = null;
  let radarLiveRegion = null;

  const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (char) => {
      const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
      return entities[char];
    });

  const parseTime = (value) => {
    if (!value) return null;
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const formatCheckedAt = (value) => {
    if (!value) return "Checked recently";
    const date = new Date(`${value}T00:00:00+05:30`);
    if (Number.isNaN(date.getTime())) return `Checked ${escapeHtml(value)}`;
    return `Checked ${date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}`;
  };

  const kolkataDay = (time) => new Date(time).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  const getEndTime = (event) => parseTime(event.endsAt || event.expiresAt);

  const getRelativeActiveLabel = (event, now) => {
    const startsAt = parseTime(event.startsAt);
    const deadline = parseTime(event.registrationDeadline);
    const today = kolkataDay(now);
    const tomorrow = kolkataDay(now + 24 * 60 * 60 * 1000);
    const startDay = startsAt ? kolkataDay(startsAt) : null;

    if (deadline && deadline - now <= 24 * 60 * 60 * 1000) return "Closing soon";
    if (startDay === today) return "Today";
    if (startDay === tomorrow) return "Tomorrow";
    return event.status === "apply" ? "Apply soon" : "Worth checking";
  };

  const getRadarState = (event, now) => {
    if (event.isCancelled) return { key: "cancelled", label: "Cancelled", rank: 99, cta: false };

    const startsAt = parseTime(event.startsAt);
    const endsAt = getEndTime(event);
    const registrationDeadline = parseTime(event.registrationDeadline);

    if (endsAt && endsAt <= now) {
      return { key: "completed", label: "Event completed", rank: 5, cta: false, sortTime: endsAt };
    }

    if (startsAt && endsAt && startsAt <= now && now < endsAt) {
      return { key: "happening", label: "Happening now", rank: 1, cta: true, sortTime: endsAt };
    }

    if (registrationDeadline && registrationDeadline <= now) {
      return { key: "registration-closed", label: "Registration closed", rank: 4, cta: false, sortTime: startsAt || endsAt };
    }

    const isClosingSoon = registrationDeadline && registrationDeadline - now <= 24 * 60 * 60 * 1000;
    return {
      key: isClosingSoon ? "closing-soon" : "active",
      label: getRelativeActiveLabel(event, now),
      rank: isClosingSoon ? 2 : 3,
      cta: true,
      sortTime: registrationDeadline || startsAt || endsAt
    };
  };

  const getStateClass = (state) => {
    const classes = {
      happening: "radar-happening radar-immediate",
      "closing-soon": "radar-apply",
      active: "",
      "registration-closed": "radar-registration-closed radar-inactive",
      completed: "radar-completed radar-inactive"
    };
    return classes[state.key] || "";
  };

  const sortRadarEvents = (a, b) => {
    if (a.state.rank !== b.state.rank) return a.state.rank - b.state.rank;
    if (a.state.key === "completed" && b.state.key === "completed") {
      return (b.state.sortTime || 0) - (a.state.sortTime || 0);
    }
    return (a.state.sortTime || Number.MAX_SAFE_INTEGER) - (b.state.sortTime || Number.MAX_SAFE_INTEGER);
  };

  const isPublicDetail = (detail) => {
    const label = String(detail?.label || "").toLowerCase();
    const value = String(detail?.value || "").toLowerCase();
    const privatePatterns = ["bosscoder", "my schedule", "my class", "my calendar", "clashes with", "personal"];
    return label && detail?.value && !privatePatterns.some((pattern) => value.includes(pattern));
  };

  const getPublicDetails = (event) => {
    const details = Array.isArray(event.details) ? event.details.filter(isPublicDetail) : [];
    if (details.length) {
      const priority = ["date", "time", "deadline", "mode", "cost", "venue", "type", "organizer"];
      const selected = [];
      priority.forEach((label) => {
        const match = details.find(
          (detail) =>
            String(detail.label || "").toLowerCase() === label &&
            !selected.includes(detail)
        );
        if (match && selected.length < 4) selected.push(match);
      });
      details.forEach((detail) => {
        if (selected.length < 4 && !selected.includes(detail)) selected.push(detail);
      });
      return selected;
    }

    return [
      { label: "Format", value: event.format },
      { label: "Cost", value: event.cost },
      { label: "Date", value: event.date },
      { label: "Time", value: event.time }
    ].filter((detail) => detail.value);
  };

  const ensureRadarLiveRegion = () => {
    if (!radarList || radarLiveRegion) return;
    radarLiveRegion = document.createElement("div");
    radarLiveRegion.className = "sr-only";
    radarLiveRegion.setAttribute("aria-live", "polite");
    radarLiveRegion.setAttribute("aria-atomic", "true");
    radarList.before(radarLiveRegion);
  };

  const renderRadarEmpty = () => {
    if (!radarList || !radarEmptyTemplate) return;
    radarList.replaceChildren(radarEmptyTemplate.content.cloneNode(true));
  };

  const announceRadarChanges = (eventsWithState) => {
    if (!radarLiveRegion) return;
    const changes = eventsWithState
      .filter(({ event, state }) => {
        const previous = radarStateById.get(event.id);
        return previous && previous !== state.key;
      })
      .map(({ event, state }) => `${event.title} is now ${state.label.toLowerCase()}.`);

    if (changes.length) radarLiveRegion.textContent = changes.join(" ");
    radarStateById = new Map(eventsWithState.map(({ event, state }) => [event.id, state.key]));
  };

  const renderRadarEvents = (eventsWithState) => {
    if (!radarList) return;
    if (!eventsWithState.length) {
      renderRadarEmpty();
      return;
    }

    const fragment = document.createDocumentFragment();
    eventsWithState.forEach(({ event, state }, index) => {
      const article = document.createElement("article");
      article.className = `radar-card ${getStateClass(state)}`.trim();
      if (eventsWithState.length % 2 === 1 && index === eventsWithState.length - 1) {
        article.classList.add("radar-card-wide");
      }
      article.dataset.radarState = state.key;
      article.innerHTML = `
        <div class="radar-status">${escapeHtml(state.label)}</div>
        <h3>${escapeHtml(event.title)}</h3>
        <dl>
          ${getPublicDetails(event)
            .map(
              (detail) =>
                `<div><dt>${escapeHtml(detail.label)}</dt><dd>${escapeHtml(detail.value)}</dd></div>`
            )
            .join("")}
        </dl>
        <p>${escapeHtml(event.summary)}</p>
        <div class="radar-card-bottom">
          <span>${formatCheckedAt(event.checkedAt)}</span>
          ${
            state.cta
              ? `<a href="${escapeHtml(event.sourceUrl)}" target="_blank" rel="noopener noreferrer">Official link <span>&#8599;</span></a>`
              : `<span class="radar-link-muted" aria-label="${escapeHtml(state.label)}">${
                  state.key === "completed" ? "Event completed" : "No active registration link"
                }</span>`
          }
        </div>
      `;
      fragment.append(article);
    });

    radarList.replaceChildren(fragment, radarEmptyTemplate);
  };

  const updateRadarStates = () => {
    if (!radarList || !radarEvents.length) {
      renderRadarEmpty();
      return;
    }

    const now = Date.now();
    const eventsWithState = radarEvents
      .filter((event) => !event.isCancelled)
      .map((event) => ({ event, state: getRadarState(event, now) }))
      .filter(({ state }) => state.key !== "cancelled")
      .sort(sortRadarEvents);

    announceRadarChanges(eventsWithState);
    renderRadarEvents(eventsWithState);
  };

  const loadRadarEvents = async () => {
    if (!radarList) return;
    ensureRadarLiveRegion();

    try {
      const response = await fetch("data/radar-events.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`Radar data returned ${response.status}`);

      const snapshot = await response.json();
      radarEvents = Array.isArray(snapshot.events) ? snapshot.events : [];
      updateRadarStates();
      if (!radarTimer) radarTimer = window.setInterval(updateRadarStates, 60 * 1000);
    } catch (error) {
      console.warn("Unable to load IT Exposure Radar data.", error);
      renderRadarEmpty();
    }
  };

  loadRadarEvents();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") updateRadarStates();
  });
  window.addEventListener("focus", updateRadarStates);
})();
