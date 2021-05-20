SELECT
     'VFK_'|| trim( j.table_name )|| '_'|| trim( pk_name ) fk_name,
     'INNER' join_type,
     '' owner,
     j.table_name,
     c.rdb$field_name,
     '' pktable_owner,
     d.rdb$relation_name AS pktable_name,
     '' pktable_alias,
     c.rdb$field_name,
     j.pk_name
FROM
     ( SELECT tt.rdb$relation_name AS table_name, pk.pk_name, pk.nb_col FROM rdb$relation_fields tt INNER JOIN ( SELECT rdb$relation_constraints.rdb$relation_name, rdb$constraint_name AS pk_name, count( * ) AS nb_col FROM rdb$relation_constraints WHERE rdb$constraint_type = 'PRIMARY KEY' GROUP BY rdb$relation_name, rdb$constraint_name ) pk ON tt.rdb$relation_name = pk.rdb$relation_name WHERE rdb$field_name IN ( SELECT rdb$index_segments.rdb$field_name FROM rdb$index_segments WHERE rdb$index_name = pk.pk_name ) GROUP BY tt.rdb$relation_name, pk.pk_name, pk.nb_col HAVING count(*) = pk.nb_col ) j INNER JOIN rdb$index_segments c ON j.pk_name = c.RDB$INDEX_NAME
     INNER JOIN rdb$relation_constraints d ON c.RDB$INDEX_NAME = d.RDB$INDEX_NAME