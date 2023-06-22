# NBA Stat Scraper

This is a web scraper built using Node.js and Cheerio to extract data from Basketball Reference and NBA.com. It provides various functions to retrieve information about NBA players and teams. The scraper utilizes the provided player and team names, as well as parameters like specific years, to fetch relevant data from the respective websites.

This tool is (obviously) not comprehensive in grabbing absolutely all data from Basketball Reference, but it should be more than enough for most use cases. There are other similar programs out there, but all of them either didn't work for me or were very incomplete. If you have a suggestion or want to add something, feel free to make an issue or PR and I'll respond as soon as possible. Thanks!

## Installation

To use this web scraper, follow the steps below:

1. Ensure you have Node.js installed on your machine.
2. Run `npm install nba-stat-scraper`

## Usage

The scraper provides the following functions:

### `getPlayer(playerName: string)`

This function takes a player's name as input and returns their biography, headshot, body measurables, accolades, season stats, and career stats.

### `getTeam(teamName: string)`

This function takes a team's name as input and returns the franchise's overall stats, such as win-loss record, championships won, and more.

### `getTeamSeason(teamName: string, year: number)`

This function takes a team's name and a specific year as inputs and returns the team's win-loss record, roster, stats, opponent stats, season result, coaches, and other relevant information for that particular season.

### `getPlayerSeason(playerName: string, year: number)`

This function takes a player's name and a specific year as inputs and returns the player's statistics for that particular season.

### `getPlayerCareer(playerName: string)`

This function takes a player's name as input and returns the player's career stat averages.

### Notes:

- The format for player names is `"first last" (e.g. "LeBron James")`, although the search will attempt to work with any query format.
- The format for team names is `"city teamName" (e.g. "Charlotte Hornets")`. The search will attempt to work with any query, but it's worse with teams than players.
- Years must be input in `yyyy` format.
- Sometimes the player search will give bad output even if you give proper input. If that's the case, try a listed nickname for the player.

## Examples

### Example output for `getPlayer("LeBron James")`:

```javascript
{
    name: 'LeBron James',
    picture: 'https://cdn.nba.com/headshots/nba/latest/1040x760/2544.png',
    positions: [
        'Small Forward',
        'Power Forward',
        'Point Guard',
        'Center',
        'Shooting Guard'
    ],
    height: '6-9',
    weight: 250,
    nicknames: [
        'King James',
        'LBJ',
        'Chosen One',
        'Bron-Bron',
        'The Little Emperor',
        'The Akron Hammer',
        'L-Train',
        'Benjamin Buckets'
    ],
    championships: 4,
    mvps: 4,
    allStars: 19,
    accolades: [
        '19x All Star',
        '2007-08 Scoring Champ',
        '2019-20 AST Champ',
        '4x NBA Champ',
        '19x All-NBA',
        '2003-04 All-Rookie',
        '2003-04 ROY',
        '3x AS MVP',
        '6x All-Defensive',
        '4x MVP',
        '4x Finals MVP',
        'NBA 75th Anniv. Team'
    ],
    stats: {
        '2003-04': {
            age: 19,
            teams: [Array],
            position: 'SG',
            games: 79,
            games_started: 79,
            mpg: 39.5,
            fg: 7.9,
            fga: 18.9,
            fg_pct: 0.417,
            '3p': 0.8,
            '3pa': 2.7,
            '3p_pct': 0.29,
            '2p': 7.1,
            '2pa': 16.1,
            '2p_pct': 0.438,
            efg: 0.438,
            ft: 4.4,
            fta: 5.8,
            ft_pct: 0.754,
            orb: 1.3,
            drb: 4.2,
            trb: 5.5,
            ast: 5.9,
            stl: 1.6,
            bpg: 0.7,
            tpg: 3.5,
            pf: 1.9,
            ppg: 20.9
        },
        ... // The rest of his seasons will be listed here in order
        career: {
            games: 1421,
            games_started: 1419,
            mpg: 38.1,
            fg: 10,
            fga: 19.7,
            fg_pct: 0.505,
            '3p': 1.6,
            '3pa': 4.6,
            '3p_pct': 0.345,
            '2p': 8.4,
            '2pa': 15.1,
            '2p_pct': 0.554,
            efg: 0.545,
            ft: 5.7,
            fta: 7.7,
            ft_pct: 0.735,
            orb: 1.2,
            drb: 6.3,
            trb: 7.5,
            ast: 7.3,
            stl: 1.5,
            bpg: 0.8,
            tpg: 3.5,
            pf: 1.8,
            ppg: 27.2,
            winShares: 255.1,
            per: 27.2
        }
    },
    shootingHand: 'Right',
    college: '',
    birthplace: 'Akron, Ohio',
    birthdate: '1984-12-30T08:00:00.000Z',
    draftPick: 1,
    draftYear: 2003,
    draftTeam: 'Cleveland Cavaliers',
    debut: '2003-10-29T08:00:00.000Z',
    careerLength: -1 // -1 for unretired players, since they're still playing
}
```

### Example output for `getTeam("Los Angeles Lakers")`:

```javascript
{
    name: 'Los Angeles Lakers',
    location: 'Los Angeles, California',
    teamNames: ['Los Angeles Lakers', 'Minneapolis Lakers'],
    wins: 3503,
    losses: 2419,
    win_pct: 0.592,
    playoffAppearances: 63,
    championships: 17
}
```

### Example output for `getTeamSeason("Golden State Warriors", 2016)`:

```javascript
{
    name: 'Golden State Warriors',
    season: '2015-16',
    wins: 73,
    losses: 9,
    seed: 1,
    coach: ['Steve Kerr', 'Luke Walton'],
    executive: 'Bob Myers',
    preseasonOdds: 480,
    overUnder: 59.5,
    arena: 'Oracle Arena',
    attendance: 803436,
    stats: {
        g: 82,
        mp: 19880,
        fg: 3489,
        fga: 7159,
        fg_pct: 0.487,
        fg3: 1077,
        fg3a: 2592,
        fg3_pct: 0.416,
        fg2: 2412,
        fg2a: 4567,
        fg2_pct: 0.528,
        ft: 1366,
        fta: 1790,
        ft_pct: 0.763,
        orb: 816,
        drb: 2972,
        trb: 3788,
        ast: 2373,
        stl: 689,
        blk: 498,
        tov: 1245,
        pf: 1701,
        pts: 9421,
        ppg: 114.9,
        oppg: 104.1,
        srs: 10.38,
        pace: 99.3,
        expW: 65,
        expL: 17
    },
    oppStats: {
        g: 82,
        mp: 19880,
        fg: 3188,
        fga: 7330,
        fg_pct: 0.435,
        fg3: 640,
        fg3a: 1928,
        fg3_pct: 0.332,
        fg2: 2548,
        fg2a: 5402,
        fg2_pct: 0.472,
        ft: 1523,
        fta: 2013,
        ft_pct: 0.757,
        orb: 937,
        drb: 2662,
        trb: 3599,
        ast: 1823,
        stl: 710,
        blk: 336,
        tov: 1185,
        pf: 1627,
        pts: 8539
    },
    playoffs: [
        'Won NBA Western Conference First Round (4-1) versus Houston Rockets',
        'Won NBA Western Conference Semifinals (4-1) versus Portland Trail Blazers',
        'Won NBA Western Conference Finals (4-3) versus Oklahoma City Thunder',
        'Lost NBA Finals (3-4) versus Cleveland Cavaliers'
    ],
    playoffResult: 'Lost NBA Finals (3-4) versus Cleveland Cavaliers',
    roster: [
        'Leandro Barbosa',
        'Harrison Barnes',
        'Andrew Bogut',
        'Ian Clark',
        'Stephen Curry',
        'Festus Ezeli',
        'Draymond Green',
        'Andre Iguodala',
        'Shaun Livingston',
        'Kevon Looney',
        'James Michael McAdoo',
        'Brandon Rush',
        'Marreese Speights',
        'Jason Thompson',
        'Klay Thompson',
        'Anderson Varejão'
    ]
}
```

### Example output for `getPlayerSeason("Derrick Rose", 2011)`:

```javascript
{
    age: 22,
    teams: ['CHI'],
    position: 'PG',
    games: 81,
    games_started: 81,
    mpg: 37.4,
    fg: 8.8,
    fga: 19.7,
    fg_pct: 0.445,
    '3p': 1.6,
    '3pa': 4.8,
    '3p_pct': 0.332,
    '2p': 7.2,
    '2pa': 15,
    '2p_pct': 0.481,
    efg: 0.485,
    ft: 5.9,
    fta: 6.9,
    ft_pct: 0.858,
    orb: 1,
    drb: 3.1,
    trb: 4.1,
    ast: 7.7,
    stl: 1,
    bpg: 0.6,
    tpg: 3.4,
    pf: 1.7,
    ppg: 25
}
```

### Example output for `getPlayerCareer("Damian Lillard")`:

```javascript
{
  games: 769,
  games_started: 769,
  mpg: 36.3,
  fg: 8.2,
  fga: 18.6,
  fg_pct: 0.439,
  '3p': 3.1,
  '3pa': 8.3,
  '3p_pct': 0.372,
  '2p': 5.1,
  '2pa': 10.3,
  '2p_pct': 0.494,
  efg: 0.523,
  ft: 5.8,
  fta: 6.4,
  ft_pct: 0.895,
  orb: 0.6,
  drb: 3.6,
  trb: 4.2,
  ast: 6.7,
  stl: 1,
  bpg: 0.3,
  tpg: 2.8,
  pf: 1.9,
  ppg: 25.2,
  winShares: 103.1,
  per: 22.5,
  name: 'Damian Lillard'
}
```
