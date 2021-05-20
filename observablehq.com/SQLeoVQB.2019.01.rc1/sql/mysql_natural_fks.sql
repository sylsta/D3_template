SELECT
     concat( 'VFK_' , j.table_name , '_' , c.table_name ) AS fk_name,
     'INNER' join_type,
     j.table_schema AS table_schema,
     j.table_name,
     c.column_name,
     j.pktable_owner AS pktable_owner,
     c.table_name AS pktable_name,
     '' pktable_alias,
     c.column_name,
     'na' AS comment
FROM
     ( SELECT tt.table_schema, tt.table_name, pk.pktable_owner, pk.pk_name, pk.nb_col FROM ( SELECT pc.table_schema, pc.table_name, c.constraint_schema AS pktable_owner, concat( pc.constraint_name , pc.table_name ) AS pk_name, count( * ) AS nb_col FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE pc INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS c ON pc.table_schema = c.TABLE_SCHEMA AND pc.constraint_name = c.CONSTRAINT_NAME AND c.TABLE_NAME = pc.table_name WHERE c.constraint_type = 'PRIMARY KEY' GROUP BY pc.table_schema, pc.table_name, c.constraint_schema, pc.constraint_name ) pk INNER JOIN INFORMATION_SCHEMA.COLUMNS tt ON pk.table_schema = tt.table_schema AND pk.table_name <> tt.table_name WHERE column_name IN ( SELECT INFORMATION_SCHEMA.KEY_COLUMN_USAGE.column_name FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE table_name = pk.table_name AND table_schema = pk.table_schema AND constraint_name = 'PRIMARY' ) GROUP BY tt.table_schema, tt.table_name, pk.pktable_owner, pk.pk_name, pk.nb_col HAVING count(*) = pk.nb_col ) j INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE c ON j.pktable_owner = c.TABLE_SCHEMA
WHERE
     j.pk_name 
 = concat(c.CONSTRAINT_NAME,c.table_name)
ORDER BY
     j.table_name ASC