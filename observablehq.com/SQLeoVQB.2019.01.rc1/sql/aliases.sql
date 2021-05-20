alias ora_activsess="
select sid,serial#,username,osuser,machine,program,status,last_call_et,ses.sql_id,event,sql_text,executions,fetches,rows_processed,elapsed_time/1000000,ses.*
from v$session ses,v$sql sql
where type='USER' and (status in ('ACTIVE','KILLED') or last_call_et <1)
and sql_hash_value=hash_value(+)
and sql_child_number=child_number(+)
order by ses.status,ses.LAST_CALL_ET desc
";

alias ora_explain="
SELECT * FROM TABLE(DBMS_XPLAN.DISPLAY_CURSOR('?', null, 'ADVANCED'))
";

alias ora_longops="
select * from v$session_longops
where sid = '?'
order by start_time desc
";

alias ora_partkey="
select * from dba_part_key_columns
where name like '?'
";

alias ora_segs="
SELECT
segs.OWNER,
segs.SEGMENT_NAME,
segs.SEGMENT_TYPE,
segs.TABLESPACE_NAME,
round( sum( segs.BYTES ) / 1024 / 1024) MB,
round( max( segs.BYTES ) / 1024 / 1024) MaxMB,
count( * ) AS NB
FROM
DBA_SEGMENTS segs /*SQLeo(10_10_false)*/
WHERE
segs.owner LIKE '?'
and segs.segment_name LIKE '?'
GROUP BY
segs.OWNER,
segs.SEGMENT_NAME,
segs.SEGMENT_TYPE,
segs.TABLESPACE_NAME
ORDER BY
MB DESC
";

alias ora_sql="
select
count(*),
min(first_load_time),
parsing_schema_name,sql_text,sql_id,module,
max(length(sql_fulltext)),
sum(executions) EXECS,
sum(sharable_mem) shared_mem,
sum(buffer_gets) BUFFS,
sum(disk_reads) READS,
sum(direct_writes) writes,
sum(rows_processed) ROWSS,
round(sum(elapsed_time)/1000) ELAPS,
round(sum(cpu_time)/1000) cpu,
round(sum(concurrency_wait_time)/1000) concurrency,
round(sum(user_io_wait_time)/1000) io_wait
from v$sql
where executions !=0
group by first_load_time,parsing_schema_name,sql_text,sql_id,module
order by 14 desc
";

alias ora_subpartkey="
select * from dba_subpart_key_columns
where name like '?'
";

alias ora_desctab="
SELECT
TAB.COLUMN_ID,
TAB.OWNER,
TAB.TABLE_NAME,
TAB.COLUMN_NAME,
TAB.NULLABLE,
TAB.DATA_TYPE,
TAB.DATA_LENGTH,
TAB.CHAR_USED,
PK.POSITION AS PK,
FK.POSITION AS FK,
TAB.DATA_PRECISION,
TAB.DATA_SCALE,
TAB.DATA_DEFAULT
FROM
DBA_TAB_COLUMNS TAB /*SQLeo(349_143_false)*/
LEFT OUTER JOIN (SELECT
CPK.OWNER,
CPK.TABLE_NAME,
CCPK.COLUMN_NAME,
CCPK.POSITION
FROM
DBA_CONS_COLUMNS CCPK /*SQLeo(850_127_false)*/
INNER JOIN DBA_CONSTRAINTS CPK /*SQLeo(457_86_false)*/
ON CCPK.OWNER = CPK.OWNER
AND CCPK.CONSTRAINT_NAME = CPK.CONSTRAINT_NAME
AND CCPK.TABLE_NAME = CPK.TABLE_NAME
WHERE
CPK.constraint_type = 'P') PK /*SQLeo(646_65_false)*/
ON TAB.OWNER = PK.OWNER
AND TAB.COLUMN_NAME = PK.COLUMN_NAME
AND TAB.TABLE_NAME = PK.TABLE_NAME
LEFT OUTER JOIN (SELECT
CFK.OWNER,
CFK.TABLE_NAME,
CCFK.COLUMN_NAME,
CCFK.POSITION
FROM
DBA_CONS_COLUMNS CCFK /*SQLeo(776_169_false)*/
INNER JOIN DBA_CONSTRAINTS CFK /*SQLeo(372_90_false)*/
ON CCFK.OWNER = CFK.OWNER
AND CCFK.TABLE_NAME = CFK.TABLE_NAME
AND CFK.CONSTRAINT_NAME = CCFK.CONSTRAINT_NAME
WHERE
CFK.constraint_type = 'R') FK /*SQLeo(10_10_false)*/
ON TAB.OWNER = FK.OWNER
AND TAB.TABLE_NAME = FK.TABLE_NAME
AND TAB.COLUMN_NAME = FK.COLUMN_NAME
WHERE
TAB.table_name = '?'
ORDER BY
1 ASC
";

alias selstar="
select * from ?
";
