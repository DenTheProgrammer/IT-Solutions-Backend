SELECT id, slug FROM profiles ORDER BY slug;

SELECT 'profiles' AS table_name, count(*) AS rows FROM profiles
UNION ALL SELECT 'profile_links', count(*) FROM profile_links
UNION ALL SELECT 'skills', count(*) FROM skills
UNION ALL SELECT 'experiences', count(*) FROM experiences
UNION ALL SELECT 'achievements', count(*) FROM achievements
UNION ALL SELECT 'projects', count(*) FROM projects;

SELECT 'profiles' AS duplicate_groups, count(*) AS duplicates FROM (
  SELECT slug FROM profiles GROUP BY slug HAVING count(*) > 1
) AS duplicates
UNION ALL SELECT 'profile_links', count(*) FROM (
  SELECT profile_id, kind, url FROM profile_links
  GROUP BY profile_id, kind, url HAVING count(*) > 1
) AS duplicates
UNION ALL SELECT 'skills', count(*) FROM (
  SELECT profile_id, name FROM skills GROUP BY profile_id, name HAVING count(*) > 1
) AS duplicates
UNION ALL SELECT 'experiences', count(*) FROM (
  SELECT profile_id, company, position, start_date FROM experiences
  GROUP BY profile_id, company, position, start_date HAVING count(*) > 1
) AS duplicates
UNION ALL SELECT 'achievements', count(*) FROM (
  SELECT experience_id, text FROM achievements
  GROUP BY experience_id, text HAVING count(*) > 1
) AS duplicates
UNION ALL SELECT 'projects', count(*) FROM (
  SELECT profile_id, name FROM projects GROUP BY profile_id, name HAVING count(*) > 1
) AS duplicates;

SELECT count(*) AS invalid_experience_dates FROM experiences
WHERE extract(day FROM start_date) <> 1
   OR extract(day FROM end_date) <> 1
   OR end_date < start_date;

SELECT count(*) AS forbidden_contact_links FROM profile_links
WHERE url ~* '^https?://([^/]+\.)?linkedin\.com/';
