-- Alleen voor je lokale testdatabase.
-- Testwachtwoord voor de vier bestaande spelers: FrostgaleTest2026!
-- Plaats in worker/reset-local-player-passwords.sql en voer uit vanuit de projectroot:
-- npx wrangler d1 execute prime-archives --local --file=worker/reset-local-player-passwords.sql
-- Architect en andere accounts worden niet aangepast. Er worden geen gebruikers aangemaakt.

UPDATE users SET password_salt = '6e0b34a3be0d460b31c154a068134a0e', password_hash = 'bba31ae822cb098240d4d4878ce881fce2336d95fc5e8bc5cf82914e95e6f94c' WHERE lower(trim(username)) = 'lumi' AND role = 'player';
UPDATE users SET password_salt = '320de04337cac77c8f67a792d3094727', password_hash = '78da3eddecef9180af93273852f8bc4ec43dfa0c1d5cbc0dc86a8a192b2f98f3' WHERE lower(trim(username)) = 'clav' AND role = 'player';
UPDATE users SET password_salt = 'af4eec467295e7c3fe76117d3ab543e4', password_hash = '24d6cff58cbc211f0e02ce77ce0245ca1a7814db73a76718dd89934cf7f55b20' WHERE lower(trim(username)) = 'dakka' AND role = 'player';
UPDATE users SET password_salt = '368c6dff05c1425e2e990fe1370aaeaa', password_hash = '165fee00833716ece821348c75685e39630fcc6cf1c9cf0e56888ed6b8b951b3' WHERE lower(trim(username)) = 'venn' AND role = 'player';

SELECT id, username, display_name, role FROM users WHERE lower(trim(username)) IN ('lumi', 'clav', 'dakka', 'venn') ORDER BY id;
