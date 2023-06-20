function grabCareerStats(careerStatsRow, $) {
  career = {
    games: parseInt(careerStatsRow.find('[data-stat="g"]').text().trim()),
    games_started: parseInt(
      careerStatsRow.find('[data-stat="gs"]').text().trim()
    ),
    mpg: parseFloat(
      careerStatsRow.find('[data-stat="mp_per_g"]').text().trim()
    ),
    fg: parseFloat(careerStatsRow.find('[data-stat="fg_per_g"]').text().trim()),
    fga: parseFloat(
      careerStatsRow.find('[data-stat="fga_per_g"]').text().trim()
    ),
    fg_pct: parseFloat(
      careerStatsRow.find('[data-stat="fg_pct"]').text().trim()
    ),
    '3p': parseFloat(
      careerStatsRow.find('[data-stat="fg3_per_g"]').text().trim()
    ),
    '3pa': parseFloat(
      careerStatsRow.find('[data-stat="fg3a_per_g"]').text().trim()
    ),
    '3p_pct': parseFloat(
      careerStatsRow.find('[data-stat="fg3_pct"]').text().trim()
    ),
    '2p': parseFloat(
      careerStatsRow.find('[data-stat="fg2_per_g"]').text().trim()
    ),
    '2pa': parseFloat(
      careerStatsRow.find('[data-stat="fg2a_per_g"]').text().trim()
    ),
    '2p_pct': parseFloat(
      careerStatsRow.find('[data-stat="fg2_pct"]').text().trim()
    ),
    efg: parseFloat(careerStatsRow.find('[data-stat="efg_pct"]').text().trim()),
    ft: parseFloat(careerStatsRow.find('[data-stat="ft_per_g"]').text().trim()),
    fta: parseFloat(
      careerStatsRow.find('[data-stat="fta_per_g"]').text().trim()
    ),
    ft_pct: parseFloat(
      careerStatsRow.find('[data-stat="ft_pct"]').text().trim()
    ),
    orb: parseFloat(
      careerStatsRow.find('[data-stat="orb_per_g"]').text().trim()
    ),
    drb: parseFloat(
      careerStatsRow.find('[data-stat="drb_per_g"]').text().trim()
    ),
    trb: parseFloat(
      careerStatsRow.find('[data-stat="trb_per_g"]').text().trim()
    ),
    ast: parseFloat(
      careerStatsRow.find('[data-stat="ast_per_g"]').text().trim()
    ),
    stl: parseFloat(
      careerStatsRow.find('[data-stat="stl_per_g"]').text().trim()
    ),
    bpg: parseFloat(
      careerStatsRow.find('[data-stat="blk_per_g"]').text().trim()
    ),
    tpg: parseFloat(
      careerStatsRow.find('[data-stat="tov_per_g"]').text().trim()
    ),
    pf: parseFloat(careerStatsRow.find('[data-stat="pf_per_g"]').text().trim()),
    ppg: parseFloat(
      careerStatsRow.find('[data-stat="pts_per_g"]').text().trim()
    ),
  };

  career.winShares = parseFloat(
    $('.stats_pullout > .p3 > div:nth-child(2) > p:nth-child(3)').text()
  );
  career.per = parseFloat(
    $('.stats_pullout > .p3 > div:nth-child(1) > p:nth-child(3)').text()
  );

  return career;
}

module.exports = grabCareerStats;
