function grabStats(statRows, $) {
  const stats = {};

  statRows.each((index, row) => {
    const rowData = $(row);

    // Make sure the stats we are getting are NBA stats.
    // This check also eliminates seasons a player completely missed.
    if (rowData.find('[data-stat="lg_id"]').text().trim() !== 'NBA') {
      return;
    }

    /* Check if the stats for this year are already generated. If they are,
    that means that the player has played for multiple teams in one year.
    Keep the total stats the same, just update the teams. */
    if (stats[rowData.find('th').text().trim()]) {
      stats[rowData.find('th').text().trim()].teams = [
        ...stats[rowData.find('th').text().trim()].teams,
        rowData.find('[data-stat="team_id"]').text().trim(),
      ];
    } else {
      stats[rowData.find('th').text().trim()] = {
        age: parseFloat(rowData.find('[data-stat="age"]').text().trim()),
        teams:
          // If the team id is "TOT", they got traded, so it's a special case.
          rowData.find('[data-stat="team_id"]').text().trim() === 'TOT'
            ? []
            : [rowData.find('[data-stat="team_id"]').text().trim()],
        position: rowData.find('[data-stat="pos"]').text().trim(),
        games: parseInt(rowData.find('[data-stat="g"]').text().trim()),
        games_started: parseInt(rowData.find('[data-stat="gs"]').text().trim()),
        mpg: parseFloat(rowData.find('[data-stat="mp_per_g"]').text().trim()),
        fg: parseFloat(rowData.find('[data-stat="fg_per_g"]').text().trim()),
        fga: parseFloat(rowData.find('[data-stat="fga_per_g"]').text().trim()),
        fg_pct: parseFloat(rowData.find('[data-stat="fg_pct"]').text().trim()),
        '3p': parseFloat(rowData.find('[data-stat="fg3_per_g"]').text().trim()),
        '3pa': parseFloat(
          rowData.find('[data-stat="fg3a_per_g"]').text().trim()
        ),
        '3p_pct': parseFloat(
          rowData.find('[data-stat="fg3_pct"]').text().trim()
        ),
        '2p': parseFloat(rowData.find('[data-stat="fg2_per_g"]').text().trim()),
        '2pa': parseFloat(
          rowData.find('[data-stat="fg2a_per_g"]').text().trim()
        ),
        '2p_pct': parseFloat(
          rowData.find('[data-stat="fg2_pct"]').text().trim()
        ),
        efg: parseFloat(rowData.find('[data-stat="efg_pct"]').text().trim()),
        ft: parseFloat(rowData.find('[data-stat="ft_per_g"]').text().trim()),
        fta: parseFloat(rowData.find('[data-stat="fta_per_g"]').text().trim()),
        ft_pct: parseFloat(rowData.find('[data-stat="ft_pct"]').text().trim()),
        orb: parseFloat(rowData.find('[data-stat="orb_per_g"]').text().trim()),
        drb: parseFloat(rowData.find('[data-stat="drb_per_g"]').text().trim()),
        trb: parseFloat(rowData.find('[data-stat="trb_per_g"]').text().trim()),
        ast: parseFloat(rowData.find('[data-stat="ast_per_g"]').text().trim()),
        stl: parseFloat(rowData.find('[data-stat="stl_per_g"]').text().trim()),
        bpg: parseFloat(rowData.find('[data-stat="blk_per_g"]').text().trim()),
        tpg: parseFloat(rowData.find('[data-stat="tov_per_g"]').text().trim()),
        pf: parseFloat(rowData.find('[data-stat="pf_per_g"]').text().trim()),
        ppg: parseFloat(rowData.find('[data-stat="pts_per_g"]').text().trim()),
      };
    }
  });

  return stats;
}

module.exports = grabStats;
