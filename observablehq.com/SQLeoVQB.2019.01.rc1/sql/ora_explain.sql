-- Manually set
-- tools --> preferences --> command editor --> maximum column size to 132

explain plan set statement_id='MyStatementId' for
SELECT text from MyQuery;
select * from table(dbms_xplan.display);
delete from plan_table where statement_id='MyStatementId';

-- no need of explicit commit / rollback
-- will work whatever the choice of the user is