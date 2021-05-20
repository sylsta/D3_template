SELECT
	'VFK_'|| j.table_name|| '_'|| pk_name fk_name,
	'INNER' join_type,
	j.table_schema,
	j.table_name,
	c.column_name,
	j.pktable_owner,
	c.table_name AS pktable_name,
	'' pktable_alias,
	c.column_name,
	j.pk_name
FROM
	(SELECT
		tt.table_schema,
		tt.table_name,
		pk.pktable_owner,
		pk.pk_name,
		pk.nb_col
	 FROM
		INFORMATION_SCHEMA.COLUMNS tt /*SQLeo(167_10_true)*/ 
		INNER JOIN (SELECT
						pc.table_schema,
						pc.table_name,
						c.constraint_schema AS pktable_owner,
						pc.constraint_name AS pk_name,
						count( * ) AS nb_col
					 FROM
						INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE pc /*SQLeo(10_10_false)*/ 
						INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS c /*SQLeo(469_10_false)*/ 
						 ON pc.table_schema = c.TABLE_SCHEMA
						  AND pc.constraint_name = c.CONSTRAINT_NAME
					 WHERE
						c.constraint_type = 'PRIMARY KEY'
						and pc.table_schema IN ('PUBLIC')
					 GROUP BY
						pc.table_schema,
						pc.table_name,
						c.constraint_schema,
						pc.constraint_name) pk /*SQLeo(10_10_false)*/ 
		 ON tt.table_schema = pk.table_schema
	 WHERE
		tt.column_name IN (SELECT
								ccu.column_name
							 FROM
								INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE ccu /*SQLeo(10_10_false)*/ 
							 WHERE
								ccu.constraint_name = pk.pk_name
								and ccu.constraint_schema = pk.table_schema)
		and tt.table_schema IN ('PUBLIC')
		and tt.table_name != pk.table_name
	 GROUP BY
		tt.table_schema,
		tt.table_name,
		pk.pktable_owner,
		pk.pk_name,
		pk.nb_col
	 HAVING
		count(*) = pk.nb_col) j /*SQLeo(10_10_false)*/ 
	INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE c /*SQLeo(167_10_false)*/ 
	 ON j.pktable_owner = c.TABLE_SCHEMA
	  AND j.pk_name = c.CONSTRAINT_NAME