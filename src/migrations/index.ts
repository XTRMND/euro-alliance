import * as migration_20261031_201223_initial from './20261031_201223_initial';
import * as migration_20261031_213643_navigation_and_funding from './20261031_213643_navigation_and_funding';
import * as migration_20261031_213646_drop_footer_legal from './20261031_213646_drop_footer_legal';
import * as migration_20261101_073529_navigation_groups from './20261101_073529_navigation_groups';
import * as migration_20261101_111922_home_courses_news from './20261101_111922_home_courses_news';
import * as migration_20261101_124621_course_page from './20261101_124621_course_page';
import * as migration_20261101_130035_inquiries from './20261101_130035_inquiries';
import * as migration_20261101_132146_contact_and_topics from './20261101_132146_contact_and_topics';
import * as migration_20261101_151145_programs from './20261101_151145_programs';
import * as migration_20261101_161108_programs_vouchers from './20261101_161108_programs_vouchers';
import * as migration_20261101_162829_programs_professions from './20261101_162829_programs_professions';

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
    name: '20261101_124621_course_page',
  },
  {
    up: migration_20261101_130035_inquiries.up,
    down: migration_20261101_130035_inquiries.down,
    name: '20261101_130035_inquiries',
  },
  {
    up: migration_20261101_132146_contact_and_topics.up,
    down: migration_20261101_132146_contact_and_topics.down,
    name: '20261101_132146_contact_and_topics',
  },
  {
    up: migration_20261101_151145_programs.up,
    down: migration_20261101_151145_programs.down,
    name: '20261101_151145_programs',
  },
  {
    up: migration_20261101_161108_programs_vouchers.up,
    down: migration_20261101_161108_programs_vouchers.down,
    name: '20261101_161108_programs_vouchers',
  },
  {
    up: migration_20261101_162829_programs_professions.up,
    down: migration_20261101_162829_programs_professions.down,
    name: '20261101_162829_programs_professions'
  },
];
