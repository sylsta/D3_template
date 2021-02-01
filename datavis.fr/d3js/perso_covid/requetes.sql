with total_femme as (
SELECT jour, sum(hosp) as hosp_f , sum(rea) as rea_f, sum(rad) as rad_f , sum(dc) as dc_f 
from `donnees-hospitalieres-covid19-2021-01-30-19h03.csv` 
where sexe=1
group by jour 
),
total_homme as (
SELECT jour, sum(hosp) as hosp_h , sum(rea) as rea_h, sum(rad) as rad_h , sum(dc) as dc_h 
from `donnees-hospitalieres-covid19-2021-01-30-19h03.csv` 
where sexe=0
group by jour)
SELECT total_femme.jour, total_femme.hosp_f, total_femme.rea_f, total_femme.dc_f, total_femme.rad_f, total_homme.hosp_h, total_homme.rea_h, total_homme.rad_h, total_homme.dc_h 
FROM total_homme, total_femme 
WHERE total_homme.jour = total_femme.jour
