import * as migration_20261031_201223_initial from './20261031_201223_initial';
import * as migration_20261031_213643_navigation_and_funding from './20261031_213643_navigation_and_funding';
import * as migration_20261031_213646_drop_footer_legal from './20261031_213646_drop_footer_legal';
import * as migration_20261101_073529_navigation_groups from './20261101_073529_navigation_groups';
import * as migration_20261101_111922_home_courses_news from './20261101_111922_home_courses_news';
import * as migration_20261101_124621_course_page from './20261101_124621_course_page';

export const migrations = [
  {
    up: migration_20261031_201223_initial.up,
    down: migration_20261031_201223_initial.down,
    name: '20261031_201223_initial',
  },
  {
    up: migration_20261031_213643_navigation_and_funding.up,
    down: migration_20261031_213643_navigation_and_funding.down,
    name: '20261031_213643_navigation_and_funding',
  },
  {
    up: migration_20261031_213646_drop_footer_legal.up,
    down: migration_20261031_213646_drop_footer_legal.down,
    name: '20261031_213646_drop_footer_legal',
  },
  {
    up: migration_20261101_073529_navigation_groups.up,
    down: migration_20261101_073529_navigation_groups.down,
    name: '20261101_073529_navigation_groups',
  },
  {
    up: migration_20261101_111922_home_courses_news.up,
    down: migration_20261101_111922_home_courses_news.down,
    name: '20261101_111922_home_courses_news',
  },
  {
    up: migration_20261101_124621_course_page.up,
    down: migration_20261101_124621_course_page.down,
    name: '20261101_124621_course_page'
  },
];
