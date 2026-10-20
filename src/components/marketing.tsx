/* Original verified Jokers content, ported from the supplied static site. */
export default function Marketing() {
  return (
    <div className="marketing" id="top">
      <a className="skip" href="#main">
        {"Skip to content"}
      </a>
      <header className="bar">
        <a className="brand" href="#top" aria-label="Jokers of Aggieland home">
          <img
            src="/assets/logo.png"
            alt="Jokers of Aggieland"
            width="436"
            height="291"
          />
          <span className="brand-type">
            {"JOKERS"}
            <span>{"OF AGGIELAND"}</span>
          </span>
        </a>
        <nav className="bar-nav" aria-label="Main">
          <a href="#games">{"Cash games"}</a>
          <a href="#week">{"The week"}</a>
          <a href="#tournaments">{"Tournaments"}</a>
          <a href="#membership">{"Membership"}</a>
          <a href="#visit">{"Visit"}</a>
        </nav>
        <a className="btn btn-primary bar-cta" href="/play">
          {"Join the wait-list "}
          <span aria-hidden="true">{"↗"}</span>
        </a>
        <button
          className="menu-button"
          aria-label="Open navigation"
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <span></span>
          <span></span>
        </button>
      </header>
      <nav id="mobile-menu" className="mobile-menu" aria-label="Mobile" hidden>
        <a href="/play">{"Join the wait-list ↗"}</a>
        <a href="#games">{"Cash games"}</a>
        <a href="#week">{"The week"}</a>
        <a href="#tournaments">{"Tournaments"}</a>
        <a href="#membership">{"Membership"}</a>
        <a href="#gallery">{"The room"}</a>
        <a href="#wsop">{"WSOP archive"}</a>
        <a href="#visit">{"Visit & contact"}</a>
      </nav>
      <main id="main">
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">
              <span className="nowrap">{"Members-only poker club"}</span>
              <span className="sep" aria-hidden="true">
                {"·"}
              </span>
              <span className="nowrap">{"College Station, Texas"}</span>
            </p>
            <h1 className="hero-title">
              {"Pull up"}
              <br />
              {"a "}
              <span className="accent">{"chair."}</span>
            </h1>
            <p className="hero-lede">
              {
                "Your seat in Aggieland. Daily cash games, weekly tournaments, and a good reason to stay for another hand."
              }
            </p>
            <div className="hero-cta">
              <a className="btn btn-primary btn-lg" href="/play">
                {"Join the wait-list "}
                <span aria-hidden="true">{"↗"}</span>
              </a>
              <a className="btn btn-ghost btn-lg" href="tel:+19794462077">
                {"Call (979) 446-2077"}
              </a>
            </div>
            <p className="hero-note">
              <span className="dot-live" aria-hidden="true"></span>
              <span id="opening-note">
                {"Weekdays from 7 PM · Weekends from 2 PM"}
              </span>
            </p>
          </div>
          <div className="table-stage" aria-hidden="true">
            <div className="table">
              <div className="table-rail">
                <span className="cup"></span>
                <span className="cup"></span>
                <span className="cup"></span>
                <span className="cup"></span>
                <span className="cup"></span>
                <span className="cup"></span>
                <span className="cup"></span>
                <span className="cup"></span>
              </div>
              <div className="table-felt">
                <div className="table-center">
                  <div className="felt-brand">
                    <img
                      src="/assets/logo.png"
                      alt=""
                      width="436"
                      height="291"
                    />
                    <span>{"JOKERS"}</span>
                    <small>{"OF AGGIELAND"}</small>
                  </div>
                </div>
              </div>
              <span className="dealer-btn">{"D"}</span>
            </div>
            <div className="seats">
              <span className="seat"></span>
              <span className="seat"></span>
              <span className="seat"></span>
              <span className="seat"></span>
              <span className="seat"></span>
              <span className="seat"></span>
              <span className="seat"></span>
              <span className="seat"></span>
              <span className="seat"></span>
            </div>
            <span className="table-caption">
              {"A LITTLE TEXAS. A LOT OF POKER."}
            </span>
          </div>
        </section>
        <section className="how">
          <div className="wrap">
            <p className="eyebrow">{"Welcome to Jokers"}</p>
            <h2 className="h2">{"Good cards. Better company."}</h2>
            <ol className="steps">
              <li>
                <span className="step-n">{"1"}</span>
                <h3>{"Become a member"}</h3>
                <p>
                  {
                    "Our members-only club is open to your next great poker night. Membership is "
                  }
                  <strong>{"$5 a month"}</strong>
                  {" or "}
                  <strong>{"$50 a year."}</strong>
                </p>
              </li>
              <li>
                <span className="step-n">{"2"}</span>
                <h3>{"Find your seat"}</h3>
                <p>
                  {
                    "Texas Hold’em, Omaha, and more. Call or text the club for the games running tonight and available seats."
                  }
                </p>
              </li>
              <li>
                <span className="step-n">{"3"}</span>
                <h3>{"Make yourself at home"}</h3>
                <p>
                  <strong>{"Drinks, food, and snacks"}</strong>
                  {
                    " come with your membership. Seat rental is separate; ask the club for the current rate."
                  }
                </p>
              </li>
            </ol>
          </div>
        </section>
        <section className="games" id="games">
          <div className="wrap">
            <div className="section-top">
              <div>
                <p className="eyebrow">{"Cash games, every day"}</p>
                <h2 className="h2">{"Find your kind of action."}</h2>
              </div>
              <p className="lede">
                {
                  "From your first buy-in to your regular game. Tables run based on the schedule and player interest."
                }
              </p>
            </div>
            <div
              className="game-filters"
              role="group"
              aria-label="Filter cash games"
            >
              <button className="chip" aria-pressed="true" data-filter="all">
                {"All games"}
              </button>
              <button className="chip" aria-pressed="false" data-filter="nlh">
                {"Hold’em"}
              </button>
              <button className="chip" aria-pressed="false" data-filter="mixed">
                {"Mixed games"}
              </button>
            </div>
            <div className="game-grid">
              <article className="game-card" data-type="nlh">
                <span className="game-suit">{"♠"}</span>
                <p className="game-label">{"No Limit Hold’em"}</p>
                <h3>
                  {"$0.25"}
                  <span>{" / "}</span>
                  {"$0.50"}
                </h3>
                <p className="buyin">{"$20–$100 buy-in"}</p>
                <p>{"A small-stakes seat at the table."}</p>
              </article>
              <article className="game-card" data-type="nlh">
                <span className="game-suit">{"♣"}</span>
                <p className="game-label">{"No Limit Hold’em"}</p>
                <h3>
                  {"$1"}
                  <span>{" / "}</span>
                  {"$2"}
                </h3>
                <p className="buyin">{"$100–$300 buy-in"}</p>
                <p>{"With reverse button."}</p>
              </article>
              <article className="game-card" data-type="nlh">
                <span className="game-suit red-text">{"♥"}</span>
                <p className="game-label">{"No Limit Hold’em"}</p>
                <h3>
                  {"$2"}
                  <span>{" / "}</span>
                  {"$5"}
                </h3>
                <p className="buyin">{"$200–$1,000 buy-in"}</p>
                <p>{"With reverse button."}</p>
              </article>
              <article className="game-card" data-type="mixed">
                <span className="game-suit red-text">{"♦"}</span>
                <p className="game-label">{"Round of Each"}</p>
                <h3>
                  {"$5"}
                  <span>{" / "}</span>
                  {"$5"}
                </h3>
                <p className="buyin">{"$300–$1,000 buy-in"}</p>
                <p>
                  {
                    "NLH and Dealer’s Choice: Omaha, Omaha Hi/Lo, and bomb pots. Five-card maximum."
                  }
                </p>
              </article>
              <article className="game-card" data-type="mixed">
                <span className="game-suit">{"♠"}</span>
                <p className="game-label">{"Dealer’s Choice"}</p>
                <h3>
                  {"$5"}
                  <span>{" / "}</span>
                  {"$5"}
                </h3>
                <p className="buyin">{"$300–$1,000 buy-in"}</p>
                <p>
                  {
                    "Omaha, Omaha Hi/Lo, and Pineapple. No limit on the number of cards."
                  }
                </p>
              </article>
              <article className="game-card game-invite">
                <p className="eyebrow">{"Your game, your people"}</p>
                <h3>
                  {"Something"}
                  <br />
                  {"else in mind?"}
                </h3>
                <p>
                  {"Other games are offered by player request and interest."}
                </p>
                <a href="sms:+19794462077" className="text-link">
                  {"Text the club "}
                  <span aria-hidden="true">{"↗"}</span>
                </a>
              </article>
            </div>
          </div>
        </section>
        <section className="week" id="week">
          <div className="wrap">
            <p className="eyebrow">{"Every week in Aggieland"}</p>
            <h2 className="h2">{"Seven days. Plenty of hands."}</h2>
            <p className="lede">
              {
                "$1/$2 NLH and $0.25/$0.50 NLH are on the daily schedule. Here’s the mixed-game lineup."
              }
            </p>
            <div className="cards">
              <article className="card" data-day="1">
                <p className="card-day">{"Mon"}</p>
                <span className="card-suit">{"♠"}</span>
                <h3>{"$5/$5 ROE"}</h3>
                <p>
                  {"Round of Each."}
                  <br />
                  <strong>{"Doors at 7 PM."}</strong>
                </p>
              </article>
              <article className="card red" data-day="2">
                <p className="card-day">{"Tue"}</p>
                <span className="card-suit">{"♥"}</span>
                <h3>{"$1/$1 ROE"}</h3>
                <p>
                  {"Plus Turbo Tuesday."}
                  <br />
                  <strong>{"Doors at 7 PM."}</strong>
                </p>
              </article>
              <article className="card" data-day="3">
                <p className="card-day">{"Wed"}</p>
                <span className="card-suit">{"♣"}</span>
                <h3>{"$1/$1 ROE"}</h3>
                <p>
                  {"Round of Each."}
                  <br />
                  <strong>{"Doors at 7 PM."}</strong>
                </p>
              </article>
              <article className="card red" data-day="4">
                <p className="card-day">{"Thu"}</p>
                <span className="card-suit">{"♦"}</span>
                <h3>{"$1/$1 ROE"}</h3>
                <p>
                  {"Plus Thursday NLH."}
                  <br />
                  <strong>{"Doors at 7 PM."}</strong>
                </p>
              </article>
              <article className="card" data-day="5">
                <p className="card-day">{"Fri"}</p>
                <span className="card-suit">{"♠"}</span>
                <h3>{"$5/$5 ROE"}</h3>
                <p>
                  {"Round of Each."}
                  <br />
                  <strong>{"Doors at 7 PM."}</strong>
                </p>
              </article>
              <article className="card red" data-day="6">
                <p className="card-day">{"Sat"}</p>
                <span className="card-suit">{"♥"}</span>
                <h3>{"$1/$1 ROE"}</h3>
                <p>
                  {"Start your weekend early."}
                  <br />
                  <strong>{"Doors at 2 PM."}</strong>
                </p>
              </article>
              <article className="card" data-day="0">
                <p className="card-day">{"Sun"}</p>
                <span className="card-suit">{"♣"}</span>
                <h3>{"$1/$2/$5 DC"}</h3>
                <p>
                  {"Plus Sunday NLH."}
                  <br />
                  <strong>{"Doors at 2 PM."}</strong>
                </p>
              </article>
            </div>
            <p className="small schedule-note">
              {
                "Open until 4 AM every day. Games depend on player interest. Call or text to confirm tonight’s lineup."
              }
            </p>
          </div>
        </section>
        <section className="tournaments" id="tournaments">
          <div className="wrap">
            <p className="eyebrow">{"Shuffle up & deal"}</p>
            <h2 className="h2">{"Make a run for it."}</h2>
            <p className="lede">
              {
                "Weekly No Limit Hold’em tournaments. Pick your night, bring your game."
              }
            </p>
            <div className="tourney-grid">
              <article className="tourney">
                <div className="tourney-top">
                  <span>{"Tuesday"}</span>
                  <span>{"7:00 PM"}</span>
                </div>
                <h3>
                  {"Turbo"}
                  <br />
                  {"Tuesday."}
                </h3>
                <div className="tourney-price">
                  {"$20 "}
                  <span>{"entry"}</span>
                </div>
                <dl>
                  <div>
                    <dt>{"Starting stack"}</dt>
                    <dd>{"10,000"}</dd>
                  </div>
                  <div>
                    <dt>{"Levels"}</dt>
                    <dd>{"10 minutes"}</dd>
                  </div>
                  <div>
                    <dt>{"Add-on"}</dt>
                    <dd>{"5,000 chips / $10"}</dd>
                  </div>
                </dl>
                <p>{"Rebuys available for the first hour."}</p>
                <a className="btn btn-ghost" href="tel:+19794462077">
                  {"Ask about Tuesday ↗"}
                </a>
              </article>
              <article className="tourney featured">
                <div className="tourney-top">
                  <span>{"Thursday"}</span>
                  <span>{"7:00 PM"}</span>
                </div>
                <h3>
                  {"Thursday"}
                  <br />
                  {"night NLH."}
                </h3>
                <div className="tourney-price">
                  {"$50 "}
                  <span>{"entry"}</span>
                </div>
                <dl>
                  <div>
                    <dt>{"Starting stack"}</dt>
                    <dd>{"5,000"}</dd>
                  </div>
                  <div>
                    <dt>{"Levels"}</dt>
                    <dd>{"20 minutes"}</dd>
                  </div>
                  <div>
                    <dt>{"Add-on"}</dt>
                    <dd>{"5,000 chips / $10"}</dd>
                  </div>
                </dl>
                <p>{"Rebuys available for the first hour."}</p>
                <a className="btn btn-primary" href="tel:+19794462077">
                  {"Ask about Thursday ↗"}
                </a>
              </article>
              <article className="tourney">
                <div className="tourney-top">
                  <span>{"Sunday"}</span>
                  <span>{"3:00 PM"}</span>
                </div>
                <h3>
                  {"Sunday"}
                  <br />
                  {"on the felt."}
                </h3>
                <div className="tourney-price">
                  {"$60 "}
                  <span>{"entry"}</span>
                </div>
                <dl>
                  <div>
                    <dt>{"Starting stack"}</dt>
                    <dd>{"10,000"}</dd>
                  </div>
                  <div>
                    <dt>{"Levels"}</dt>
                    <dd>{"20 minutes"}</dd>
                  </div>
                  <div>
                    <dt>{"Add-on"}</dt>
                    <dd>{"5,000 chips / $20"}</dd>
                  </div>
                </dl>
                <p>{"Rebuys available for the first hour."}</p>
                <a className="btn btn-ghost" href="tel:+19794462077">
                  {"Ask about Sunday ↗"}
                </a>
              </article>
            </div>
            <p className="small">
              {
                "Looking for Monday’s turbo? The club also mentions Monday tournaments; call to confirm the current time and format. No additional upcoming events are currently listed."
              }
            </p>
          </div>
        </section>
        <section className="community">
          <div className="wrap community-grid">
            <div>
              <p className="eyebrow">{"The club, in your pocket"}</p>
              <h2 className="h2">
                {"Know the game."}
                <br />
                {"Before you go."}
              </h2>
              <ul className="ticks">
                <li>{"Get daily game and event updates in GroupMe"}</li>
                <li>{"Find out what’s running with a call or text"}</li>
                <li>{"Stay connected with the Jokers community"}</li>
              </ul>
              <div className="app-cta">
                <a
                  className="btn btn-primary btn-lg"
                  href="https://groupme.com/join_group/96999219/Tqp5i9AF"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"Join our GroupMe ↗"}
                </a>
                <a className="btn btn-ghost btn-lg" href="sms:+19794462077">
                  {"Text the club"}
                </a>
              </div>
              <p className="small">
                {"Real updates from your local poker club."}
              </p>
            </div>
            <div className="community-visual" aria-hidden="true">
              <div className="community-token">{"♠"}</div>
              <p>
                {"THE NEXT HAND"}
                <br />
                {"STARTS HERE."}
              </p>
              <span>{"JOKERS OF AGGIELAND · COLLEGE STATION, TX"}</span>
            </div>
          </div>
        </section>
        <section className="room" id="gallery">
          <figure className="room-fig">
            <img
              src="/assets/room.jpg"
              alt="Players gathered around a poker table at Jokers of Aggieland"
              width="1905"
              height="902"
              loading="lazy"
            />
            <figcaption>
              <span className="nowrap">{"Our room."}</span>{" "}
              <span className="nowrap">{"Your people."}</span>{" "}
              <span className="nowrap">{"Your seat."}</span>
            </figcaption>
          </figure>
        </section>
        <section className="membership" id="membership">
          <div className="wrap">
            <p className="eyebrow">{"A seat in the community"}</p>
            <h2 className="h2">{"Small membership. Big welcome."}</h2>
            <p className="lede">
              {
                "Every membership includes drinks, food, and snacks. Seat rental is charged separately."
              }
            </p>
            <div className="membership-layout">
              <div>
                <div className="tiers">
                  <div className="tier">
                    <p className="tier-name">{"Monthly"}</p>
                    <p className="tier-price">{"$5"}</p>
                    <p>{"One month of membership."}</p>
                  </div>
                  <div className="tier tier-hot">
                    <p className="tier-name">{"Yearly"}</p>
                    <p className="tier-price">{"$50"}</p>
                    <p>
                      {"Twelve months. Save $10 over paying monthly all year."}
                    </p>
                  </div>
                </div>
                <div className="member-benefits">
                  <span>{"♠ Drinks"}</span>
                  <span>{"♣ Food"}</span>
                  <span>{"♥ Snacks"}</span>
                </div>
                <p className="small">
                  {
                    "Daily memberships are mentioned by the club, but a daily price is not published. Call for details and current seat-rental rates."
                  }
                </p>
              </div>
              <div className="calc-felt membership-calc">
                <p className="eyebrow">{"Plan your membership"}</p>
                <h3>{"How many months will you play?"}</h3>
                <div className="dial-wrap">
                  <div
                    className="dial"
                    id="dial"
                    role="slider"
                    tabIndex={0}
                    aria-label="Months of membership"
                    aria-valuemin={1}
                    aria-valuemax={12}
                    aria-valuenow={5}
                  >
                    <svg viewBox="0 0 220 220" aria-hidden="true">
                      <circle
                        className="dial-track"
                        cx="110"
                        cy="110"
                        r="88"
                      ></circle>
                      <circle
                        className="dial-fill"
                        id="dial-fill"
                        cx="110"
                        cy="110"
                        r="88"
                      ></circle>
                    </svg>
                    <span
                      className="dial-knob"
                      id="dial-knob"
                      aria-hidden="true"
                    >
                      {"D"}
                    </span>
                    <div className="dial-read">
                      <span className="dial-num" id="dial-num">
                        {"5"}
                      </span>
                      <span className="dial-unit" id="dial-unit">
                        {"months"}
                      </span>
                    </div>
                  </div>
                  <div className="dial-steps">
                    <button
                      className="round"
                      id="months-minus"
                      aria-label="One month less"
                    >
                      {"−"}
                    </button>
                    <span className="dial-hint">
                      {"Drag the dealer button"}
                    </span>
                    <button
                      className="round"
                      id="months-plus"
                      aria-label="One month more"
                    >
                      {"+"}
                    </button>
                  </div>
                </div>
                <div className="member-result" aria-live="polite">
                  <p id="member-choice">{"Monthly is your best fit"}</p>
                  <strong id="member-total">{"$25"}</strong>
                  <p id="member-summary">
                    {"5 months × $5. Membership only; seat rental is separate."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="gallery-section">
          <div className="wrap">
            <div className="section-top">
              <div>
                <p className="eyebrow">{"Around the tables"}</p>
                <h2 className="h2">{"This is Jokers."}</h2>
              </div>
              <span className="small">{"Photos from the club"}</span>
            </div>
            <div className="photo-grid">
              <button
                className="photo"
                aria-label="Enlarge club photo 1"
                data-photo="/assets/gallery-1.jpg"
              >
                <img
                  src="/assets/gallery-1.jpg"
                  alt="A night of poker at Jokers of Aggieland"
                  loading="lazy"
                />
                <span aria-hidden="true">{"↗"}</span>
              </button>
              <button
                className="photo"
                aria-label="Enlarge club photo 2"
                data-photo="/assets/gallery-2.jpg"
              >
                <img
                  src="/assets/gallery-2.jpg"
                  alt="Inside the Jokers of Aggieland poker club"
                  loading="lazy"
                />
                <span aria-hidden="true">{"↗"}</span>
              </button>
              <button
                className="photo"
                aria-label="Enlarge club photo 3"
                data-photo="/assets/gallery-3.jpg"
              >
                <img
                  src="/assets/gallery-3.jpg"
                  alt="Poker tables and club community at Jokers"
                  loading="lazy"
                />
                <span aria-hidden="true">{"↗"}</span>
              </button>
            </div>
          </div>
        </section>
        <section className="wsop" id="wsop">
          <div className="wrap">
            <div className="archive-head">
              <p className="eyebrow">{"From Aggieland to Vegas"}</p>
              <span className="archive-badge">
                {"2026 · Completed promotion"}
              </span>
            </div>
            <h2 className="h2">{"The road to the WSOP."}</h2>
            <p className="lede">
              {
                "A look back at the club’s 2026 WSOP seat giveaway. The qualification period and final tournament have concluded."
              }
            </p>
            <div className="archive-grid">
              <div className="archive-info">
                <h3>{"One seat. The biggest stage."}</h3>
                <p>
                  {
                    "The advertised top prize included entry to the $1,000 WSOP Event #100 NLH on July 15, 2026 in Las Vegas, plus up to $1,000 for flights and hotel."
                  }
                </p>
                <details>
                  <summary>{"Giveaway format & dates"}</summary>
                  <p>
                    {
                      "Qualifying ran May 4–June 25, 2026 across Monday, Tuesday, Thursday, and Sunday tournaments, with 31 possible tournaments. Players earned one point per $1 of entry fees and one point per $1 won. Each player’s best 15 tournaments counted."
                    }
                  </p>
                  <p>
                    {
                      "The top 10 qualified for free entry to the $150 final NLH tournament on Saturday, June 27. First place received 40,000 bonus chips; places 2–5 received 20,000; places 6–10 received 10,000. Additional prize money followed normal club payout guidelines."
                    }
                  </p>
                  <p>
                    {
                      "A winner under 21 or unable to attend could select $1,500 instead of the tournament entry."
                    }
                  </p>
                </details>
                <p className="small">
                  {
                    "Final standings below are the qualification standings published by the club, not the final tournament result."
                  }
                </p>
              </div>
              <div className="standings">
                <h3>{"Final qualification standings"}</h3>
                <ol>
                  <li>{"Harlan Harris"}</li>
                  <li>{"Joe Williams"}</li>
                  <li>{"Richard Schlueter"}</li>
                  <li>{"Paul Stine"}</li>
                  <li>{"Albert Vasquez"}</li>
                  <li>{"Hunter Lehmann"}</li>
                  <li>{"Timothy Ramsey"}</li>
                  <li>{"Jeremy Johnson"}</li>
                  <li>{"Ryan Stewart"}</li>
                  <li>{"Odean Hill"}</li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        <section className="visit" id="visit">
          <div className="wrap visit-grid">
            <div>
              <p className="eyebrow">{"Come find us"}</p>
              <h2 className="h2">{"Right here in Aggieland."}</h2>
              <address className="addr">
                {"2553 Texas Avenue South, Suite D"}
                <br />
                {"College Station, TX 77840"}
              </address>
              <dl className="facts">
                <div>
                  <dt>{"Mon–Fri"}</dt>
                  <dd>{"7:00 PM–4:00 AM"}</dd>
                </div>
                <div>
                  <dt>{"Sat–Sun"}</dt>
                  <dd>{"2:00 PM–4:00 AM"}</dd>
                </div>
                <div>
                  <dt>{"Call or text"}</dt>
                  <dd>
                    <a href="tel:+19794462077">{"(979) 446-2077"}</a>
                  </dd>
                </div>
                <div>
                  <dt>{"Email"}</dt>
                  <dd>
                    <a href="mailto:jokers@jokersofaggieland.com">
                      {"jokers@jokersofaggieland.com"}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt>{"Follow"}</dt>
                  <dd>
                    <a
                      href="https://www.facebook.com/profile.php?id=61551989045768"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {"Facebook ↗"}
                    </a>
                  </dd>
                </div>
              </dl>
              <div className="visit-cta">
                <a
                  className="btn btn-primary btn-lg"
                  href="https://www.google.com/maps/dir/?api=1&destination=2553+Texas+Avenue+South+Suite+D+College+Station+TX+77840"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"Get directions ↗"}
                </a>
              </div>
            </div>
            <a
              className="map"
              href="https://www.google.com/maps/search/?api=1&query=Jokers+of+Aggieland+2553+Texas+Avenue+South+College+Station"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Jokers of Aggieland in Google Maps"
            >
              <span className="map-pin" aria-hidden="true">
                {"♠"}
              </span>
              <span className="map-road r1"></span>
              <span className="map-road r2"></span>
              <span className="map-road r3"></span>
              <span className="map-label">{"Texas Avenue South"}</span>
              <span className="map-open">{"Open in Maps ↗"}</span>
            </a>
          </div>
        </section>
        <section className="faq">
          <div className="wrap narrow">
            <p className="eyebrow">{"Before your first hand"}</p>
            <h2 className="h2">{"Questions, answered."}</h2>
            <details>
              <summary>{"Do I need a membership?"}</summary>
              <p>
                {
                  "Yes. Jokers of Aggieland is a members-only poker club. Monthly membership is $5 and annual membership is $50. The club also mentions daily memberships; contact the club for daily pricing and sign-up details."
                }
              </p>
            </details>
            <details>
              <summary>{"What does membership include?"}</summary>
              <p>
                {
                  "Drinks, food, and snacks. Membership does not include seat rental, tournament entry, add-ons, or cash-game buy-ins."
                }
              </p>
            </details>
            <details>
              <summary>{"How much does seat rental cost?"}</summary>
              <p>
                {
                  "The club does not publish a seat-rental rate on its website. Call or text (979) 446-2077 for current rates."
                }
              </p>
            </details>
            <details>
              <summary>{"Which games can I play?"}</summary>
              <p>
                {
                  "Texas Hold’em, Round of Each, and Dealer’s Choice, including Omaha, Omaha Hi/Lo, Pineapple, and bomb pots. Games are offered according to the schedule and player interest; other games can be requested."
                }
              </p>
            </details>
            <details>
              <summary>{"How do I check what’s running tonight?"}</summary>
              <p>
                {"Call or "}
                <a href="sms:+19794462077">{"text (979) 446-2077"}</a>
                {", or "}
                <a
                  href="https://groupme.com/join_group/96999219/Tqp5i9AF"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {"join the club’s GroupMe"}
                </a>
                {" for daily game and event updates."}
              </p>
            </details>
            <details>
              <summary>{"When does the club open?"}</summary>
              <p>
                {
                  "Monday through Friday, 7 PM to 4 AM. Saturday and Sunday, 2 PM to 4 AM. Sunday’s published NLH tournament starts at 3 PM."
                }
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="wrap foot-grid">
          <a
            className="brand footer-brand"
            href="#top"
            aria-label="Back to top"
          >
            <span className="brand-type">
              {"JOKERS"}
              <span>{"OF AGGIELAND"}</span>
            </span>
          </a>
          <p>
            {"2553 Texas Avenue South, Suite D · College Station, TX 77840"}
            <br />
            <a href="tel:+19794462077">{"(979) 446-2077"}</a>
            {" · "}
            <a href="mailto:jokers@jokersofaggieland.com">{"Email the club"}</a>
          </p>
          <nav className="footer-nav" aria-label="Footer">
            <a href="#games">{"Cash games"}</a>
            <a href="#tournaments">{"Tournaments"}</a>
            <a href="#gallery">{"Gallery"}</a>
            <a href="#wsop">{"WSOP archive"}</a>
            <a
              href="https://groupme.com/join_group/96999219/Tqp5i9AF"
              target="_blank"
              rel="noopener noreferrer"
            >
              {"GroupMe ↗"}
            </a>
          </nav>
          <p className="credit">
            <a href="/staff/login">{"Staff desk ↗"}</a>
          </p>
          <p className="credit">
            {"© "}
            <span id="yr">{"2026"}</span>
            {" Jokers of Aggieland"}
          </p>
        </div>
      </footer>
      <nav className="dock" aria-label="Quick actions">
        <a href="tel:+19794462077">
          <span aria-hidden="true">{"☎"}</span>
          {"Call"}
        </a>
        <a
          href="https://www.google.com/maps/dir/?api=1&destination=2553+Texas+Avenue+South+Suite+D+College+Station+TX+77840"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span aria-hidden="true">{"↗"}</span>
          {"Directions"}
        </a>
        <a className="dock-main" href="/play">
          <span aria-hidden="true">{"♠"}</span>
          {"Wait-list"}
        </a>
      </nav>
      <dialog id="photo-dialog" aria-label="Club photo">
        <button className="photo-close" aria-label="Close photo">
          {"×"}
        </button>
        <img
          id="enlarged-photo"
          src="/assets/gallery-1.jpg"
          alt="Enlarged club photo"
        />
      </dialog>
    </div>
  );
}
