SELECT
     CONCAT('echo ', GROUP_CONCAT( COLUMN_NAME Order by ORDINAL_POSITION SEPARATOR ';' ), '> ', TABLE_NAME, '.csv')
FROM
     INFORMATION_SCHEMA.COLUMNS
WHERE
     TABLE_SCHEMA = 'test'
GROUP BY
     TABLE_NAME