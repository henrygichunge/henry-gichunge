-- Starter content. Safe to run twice: existing rows are skipped.
-- The biography, mission and intro are draft wording: edit them later in the admin dashboard.

INSERT OR IGNORE INTO site_profile (id, display_name, full_name, tagline, intro, biography, mission)
VALUES (
  1,
  'Henry Gichunge',
  'Henry Mutuma Gichunge',
  'Ideas. Education. Innovation.',
  'I teach, build software and develop practical digital solutions that make education and everyday business work better.',
  'Henry Mutuma Gichunge works where teaching and technology meet. Experience in the classroom shows him what teachers and learners actually need; software development lets him build it.

His current work focuses on education technology, including MathOS for assessment and learner performance, BrightMe for learning and revision, and ManageMe OS, a planned platform for small business operations.',
  'To use teaching experience and practical software to make education and everyday work simpler, fairer and more effective.'
);

INSERT OR IGNORE INTO site_settings (key, value) VALUES
  ('contact_email', ''),
  ('contact_phone', ''),
  ('contact_location', '');

INSERT OR IGNORE INTO projects (slug, name, category, status, summary, overview, status_note, sort_order, state) VALUES
  (
    'mathos',
    'MathOS',
    'Education Technology',
    'in_development',
    'A platform helping teachers manage assessment, learner performance, grading and educational workflows, including CBC analysis, merit lists, KJSEA-related tools and timetable generation.',
    'MathOS is an education technology platform designed to help teachers manage assessment, learner performance, grading and educational workflows in one place.',
    'MathOS is a developing product. Features and availability may change as it matures.',
    1,
    'published'
  ),
  (
    'brightme',
    'BrightMe',
    'Learning Platform',
    'status_to_confirm',
    'A smart learning and revision platform that helps learners access educational resources and digital learning support.',
    'BrightMe is a smart learning and revision platform focused on helping learners access educational resources and digital learning support.',
    'The current status of BrightMe is still to be confirmed. More detail will be added here.',
    2,
    'published'
  ),
  (
    'manageme',
    'ManageMe OS',
    'Business Software',
    'planned',
    'A planned business management platform to help small businesses manage services, sales, payments and daily operations.',
    'ManageMe OS is a planned business management platform aimed at helping small businesses manage services, sales, payments and daily operations.',
    'ManageMe OS is planned and is not yet available.',
    3,
    'published'
  );

INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Assessment management', 1 FROM projects WHERE slug = 'mathos';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'CBC performance analysis', 2 FROM projects WHERE slug = 'mathos';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Merit lists', 3 FROM projects WHERE slug = 'mathos';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'KJSEA-related assessment tools', 4 FROM projects WHERE slug = 'mathos';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Timetable generation', 5 FROM projects WHERE slug = 'mathos';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Teacher productivity', 6 FROM projects WHERE slug = 'mathos';

INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Access to educational resources', 1 FROM projects WHERE slug = 'brightme';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Digital learning support', 2 FROM projects WHERE slug = 'brightme';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Revision support', 3 FROM projects WHERE slug = 'brightme';

INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Service management', 1 FROM projects WHERE slug = 'manageme';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Sales tracking', 2 FROM projects WHERE slug = 'manageme';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Payments', 3 FROM projects WHERE slug = 'manageme';
INSERT OR IGNORE INTO project_focus_areas (project_id, label, sort_order)
SELECT id, 'Daily business operations', 4 FROM projects WHERE slug = 'manageme';