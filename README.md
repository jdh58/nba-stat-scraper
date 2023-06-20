# NBA Stat Scraper

This is a web scraper for Basketball Reference and NBA.com created using Node and Cheerio. Hopefully this will make querying for NBA

Planned Functions:
getPlayer(playerName: String) // Returns a player's bio, accolades, season stats, and career stats
getTeam(teamName: String) // Returns a franchise's overall stats (W-L, championships, etc.)
getTeamSeason(teamName: String, year: number) // Returns a team's W-L, roster, season result, coaches, etc.
getPlayerSeason(playerName: String, year: number) // Returns only a player's stats for that one season
getPlayerCareer(playerName: String, year: number) // Returns a player's stat averages for their career
getGame(teamName: String, date: Date) // Returns the teams, final score, date, and box score of a game

More may be added later, but I'd want to focus on building a similar package for BaseballRef and ProFootballRef first.

It's currently not ready for use (neither is this readme), but soon!!!!!
