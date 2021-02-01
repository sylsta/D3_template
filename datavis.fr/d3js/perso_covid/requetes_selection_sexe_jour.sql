SELECT
	tot_f.hosp_f,
	tot_f.rea_f,
	tot_f.dc_f,
	tot_f.rad_f,
	tot_h.hosp_h,
	tot_h.rea_h,
	tot_h.jour,
	tot_h.rad_h,
	tot_h.dc_h,
	tot_f.hosp_f + tot_h.hosp_h AS hosp_tot,
	tot_f.rea_f + tot_h.rea_h AS rea_tot,
	tot_f.rad_f + tot_h.rad_h AS rad_tot,
	tot_f.dc_f + tot_h.dc_h AS dc_tot,
	CONCAT(SUBSTR(tot_f.jour, 9, 2),"/",SUBSTR(tot_f.jour, 6, 2),"/",SUBSTR(tot_f.jour, 1, 4)) as day
FROM
	(SELECT
		jour,
		sum( hosp ) AS hosp_f,
		sum( rea ) AS rea_f,
		sum( rad ) AS rad_f,
		sum( dc ) AS dc_f
	 FROM
		data_01
	 WHERE
		sexe = 1
	 GROUP BY
		jour) tot_f
	INNER JOIN (SELECT
					jour,
					sum( hosp ) AS hosp_h,
					sum( rea ) AS rea_h,
					sum( rad ) AS rad_h,
					sum( dc ) AS dc_h
				 FROM
					data_01
				 WHERE
					sexe = 0
				 GROUP BY
					jour) tot_h
	 ON tot_f.jour = tot_h.jour
