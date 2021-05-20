declare
v_text long;
begin
  for tab in (select distinct owner,table_name from dba_tab_columns
    where owner='SCHEMA')
    loop
    v_text := null;
      for col in (select decode(column_id,1,null,';') sep,column_name from dba_tab_columns
      where owner=tab.owner
      and table_name=tab.table_name
      order by column_id)
    loop
      v_text := v_text||col.sep || col.column_name;
    end loop;
  dbms_output.put_line('echo '||v_text||'>'||tab.table_name||'.csv');
  end loop;
end;
 