# Paddle ELO Tracker

A web application for tracking paddle/table tennis player ELO ratings and match history.

## Features

- **Leaderboard**: View all players ranked by their ELO rating
- **Match Entry**: Record match results between two teams of two players
- **Player Management**: Add new players to the system
- **Match History**: View a history of all recorded matches

## Technical Details

This application uses:

- HTML, CSS, and JavaScript for the frontend
- Supabase for the backend database
- ELO rating system for player skill tracking

## Database Schema

### Players Table

```sql
create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  elo numeric not null default 1500,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### Matches Table

```sql
create table matches (
  id uuid primary key default gen_random_uuid(),
  winner1 uuid references players(id),
  winner2 uuid references players(id),
  loser1 uuid references players(id),
  loser2 uuid references players(id),
  winner_team_avg_elo numeric not null,
  loser_team_avg_elo numeric not null,
  created_at timestamptz not null default now()
);
```

## ELO Rating System

The application uses the standard ELO rating system with a K-factor of 32. After each match:

1. The average ELO of each team is calculated
2. The expected outcome is determined based on the difference in team ratings
3. The actual outcome (1 for win, 0 for loss) is compared to the expected outcome
4. ELO points are transferred between players based on the difference

## Setup and Usage

1. Clone this repository
2. Open `index.html` in a web browser
3. Add players on the Match Entry page
4. Record matches to update player ELO ratings
5. View the leaderboard to see player rankings

## License

ISC License - Darragh Flynn 2024
