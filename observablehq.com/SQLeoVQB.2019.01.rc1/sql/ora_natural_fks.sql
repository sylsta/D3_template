drop table dba_cons_columns;
create table dba_cons_columns
as select * from dba_cons_columns;
create index cc1 on dba_cons_columns(owner, constraint_name)


select 'VFK_'||j.table_name||'_'||pk_name fk_name,'INNER' join_type,j.owner,j.table_name,column_name,j.pktable_owner,c.table_name pktable_name,'' pktable_alias,column_name,pk_name from
(select tt.owner,tt.table_name,pk.pktable_owner,pk.pk_name,pk.nb_col
from
	dba_tab_columns  tt,
	(select pc.owner,pc.table_name,pc.owner as pktable_owner,pc.constraint_name as pk_name,count(*) as nb_col
     from dba_cons_columns pc , dba_constraints c
     where c.constraint_type='P'
     and pc.owner=c.owner
	 and pc.owner in ('SYSTEM','SCOTT')
     and pc.constraint_name=c.constraint_name
     group by pc.owner,pc.table_name,pc.constraint_name)
  pk
where column_name in  (select column_name from dba_cons_columns where constraint_name=pk.pk_name and owner=pk.owner )
and tt.table_name != pk.table_name
and tt.owner in ('SYSTEM','SCOTT')
group by tt.owner,tt.table_name,pk.pktable_owner,pk.pk_name,pk.nb_col
having count(*)= pk.nb_col) j,
dba_cons_columns c
where j.pk_name=c.constraint_name and j.pktable_owner=c.owner

