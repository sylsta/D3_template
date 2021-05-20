SELECT
     f.constraint_name AS fk_name,
     'INNER' AS join_type,
     f.owner AS fktable_schem,
     f.table_name AS fktable_name,
     fc.COLUMN_NAME AS pktable_schem,
     p.OWNER AS pktable_owner,
     p.table_name AS pktable_name,
     '' AS pktable_alias,
     pc.column_name AS pkcolumn_name,
     p.constraint_name AS pk_name
FROM
     DBA_CONSTRAINTS p INNER JOIN DBA_CONSTRAINTS f ON p.OWNER = f.R_OWNER
     AND p.constraint_name = f.R_CONSTRAINT_NAME
     INNER JOIN DBA_CONS_COLUMNS pc ON p.OWNER = pc.OWNER
     AND pc.CONSTRAINT_NAME = p.constraint_name
     AND pc.TABLE_NAME = p.table_name
     INNER JOIN DBA_CONS_COLUMNS fc ON pc.POSITION = fc.POSITION
     AND fc.OWNER = f.owner
     AND fc.CONSTRAINT_NAME = f.constraint_name
     AND fc.TABLE_NAME = f.table_name
WHERE
     f.owner = 'SCOTT'
 AND f.constraint_type = 'R'
 AND p.constraint_type = 'P'