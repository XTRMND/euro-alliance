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
import * as migration_20261101_164315_programs_teachers from './20261101_164315_programs_teachers';
import * as migration_20261101_170930_programs_farmers from './20261101_170930_programs_farmers';
import * as migration_20261101_172522_programs_computer from './20261101_172522_programs_computer';
import * as migration_20261101_180436_programs_translations from './20261101_180436_programs_translations';
import * as migration_20261101_190504_news_article from './20261101_190504_news_article';
import * as migration_20261101_195219_about from './20261101_195219_about';
import * as migration_20261101_211203_legal_pages from './20261101_211203_legal_pages';
import * as migration_20261101_214328_search_index from './20261101_214328_search_index';
import * as migration_20261101_222512_redirects from './20261101_222512_redirects';
import * as migration_20261101_224812_seo_meta from './20261101_224812_seo_meta';
import * as migration_20261102_082459_programs_legacy_url from './20261102_082459_programs_legacy_url';
import * as migration_20261102_091944_media_text_in_image from './20261102_091944_media_text_in_image';
import * as migration_20261102_100531_course_groups from './20261102_100531_course_groups';
import * as migration_20261102_103633_course_level_unit from './20261102_103633_course_level_unit';
import * as migration_20261102_104535_bulgarian from './20261102_104535_bulgarian';
import * as migration_20261102_134639_missing_addresses from './20261102_134639_missing_addresses';
import * as migration_20261102_140644_course_free from './20261102_140644_course_free';
import * as migration_20261102_151729_course_stickers from './20261102_151729_course_stickers';
import * as migration_20261103_090104_home_about from './20261103_090104_home_about';
import * as migration_20261103_091658_home_about_tint from './20261103_091658_home_about_tint';
import * as migration_20261109_132504_admin_edited_at from './20261109_132504_admin_edited_at';
import * as migration_20261112_084508_groups_collection from './20261112_084508_groups_collection';
import * as migration_20261112_090923_prices_collection from './20261112_090923_prices_collection';
import * as migration_20261112_091845_categories_and_translation_languages from './20261112_091845_categories_and_translation_languages';
import * as migration_20261112_094228_drop_search_and_missing_addresses from './20261112_094228_drop_search_and_missing_addresses';
import * as migration_20261112_100253_navigation_link_pickers from './20261112_100253_navigation_link_pickers';
import * as migration_20261112_105731_inquiry_statuses from './20261112_105731_inquiry_statuses';

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
    name: '20261101_162829_programs_professions',
  },
  {
    up: migration_20261101_164315_programs_teachers.up,
    down: migration_20261101_164315_programs_teachers.down,
    name: '20261101_164315_programs_teachers',
  },
  {
    up: migration_20261101_170930_programs_farmers.up,
    down: migration_20261101_170930_programs_farmers.down,
    name: '20261101_170930_programs_farmers',
  },
  {
    up: migration_20261101_172522_programs_computer.up,
    down: migration_20261101_172522_programs_computer.down,
    name: '20261101_172522_programs_computer',
  },
  {
    up: migration_20261101_180436_programs_translations.up,
    down: migration_20261101_180436_programs_translations.down,
    name: '20261101_180436_programs_translations',
  },
  {
    up: migration_20261101_190504_news_article.up,
    down: migration_20261101_190504_news_article.down,
    name: '20261101_190504_news_article',
  },
  {
    up: migration_20261101_195219_about.up,
    down: migration_20261101_195219_about.down,
    name: '20261101_195219_about',
  },
  {
    up: migration_20261101_211203_legal_pages.up,
    down: migration_20261101_211203_legal_pages.down,
    name: '20261101_211203_legal_pages',
  },
  {
    up: migration_20261101_214328_search_index.up,
    down: migration_20261101_214328_search_index.down,
    name: '20261101_214328_search_index',
  },
  {
    up: migration_20261101_222512_redirects.up,
    down: migration_20261101_222512_redirects.down,
    name: '20261101_222512_redirects',
  },
  {
    up: migration_20261101_224812_seo_meta.up,
    down: migration_20261101_224812_seo_meta.down,
    name: '20261101_224812_seo_meta',
  },
  {
    up: migration_20261102_082459_programs_legacy_url.up,
    down: migration_20261102_082459_programs_legacy_url.down,
    name: '20261102_082459_programs_legacy_url',
  },
  {
    up: migration_20261102_091944_media_text_in_image.up,
    down: migration_20261102_091944_media_text_in_image.down,
    name: '20261102_091944_media_text_in_image',
  },
  {
    up: migration_20261102_100531_course_groups.up,
    down: migration_20261102_100531_course_groups.down,
    name: '20261102_100531_course_groups',
  },
  {
    up: migration_20261102_103633_course_level_unit.up,
    down: migration_20261102_103633_course_level_unit.down,
    name: '20261102_103633_course_level_unit',
  },
  {
    up: migration_20261102_104535_bulgarian.up,
    down: migration_20261102_104535_bulgarian.down,
    name: '20261102_104535_bulgarian',
  },
  {
    up: migration_20261102_134639_missing_addresses.up,
    down: migration_20261102_134639_missing_addresses.down,
    name: '20261102_134639_missing_addresses',
  },
  {
    up: migration_20261102_140644_course_free.up,
    down: migration_20261102_140644_course_free.down,
    name: '20261102_140644_course_free',
  },
  {
    up: migration_20261102_151729_course_stickers.up,
    down: migration_20261102_151729_course_stickers.down,
    name: '20261102_151729_course_stickers',
  },
  {
    up: migration_20261103_090104_home_about.up,
    down: migration_20261103_090104_home_about.down,
    name: '20261103_090104_home_about',
  },
  {
    up: migration_20261103_091658_home_about_tint.up,
    down: migration_20261103_091658_home_about_tint.down,
    name: '20261103_091658_home_about_tint',
  },
  {
    up: migration_20261109_132504_admin_edited_at.up,
    down: migration_20261109_132504_admin_edited_at.down,
    name: '20261109_132504_admin_edited_at',
  },
  {
    up: migration_20261112_084508_groups_collection.up,
    down: migration_20261112_084508_groups_collection.down,
    name: '20261112_084508_groups_collection',
  },
  {
    up: migration_20261112_090923_prices_collection.up,
    down: migration_20261112_090923_prices_collection.down,
    name: '20261112_090923_prices_collection',
  },
  {
    up: migration_20261112_091845_categories_and_translation_languages.up,
    down: migration_20261112_091845_categories_and_translation_languages.down,
    name: '20261112_091845_categories_and_translation_languages',
  },
  {
    up: migration_20261112_094228_drop_search_and_missing_addresses.up,
    down: migration_20261112_094228_drop_search_and_missing_addresses.down,
    name: '20261112_094228_drop_search_and_missing_addresses',
  },
  {
    up: migration_20261112_100253_navigation_link_pickers.up,
    down: migration_20261112_100253_navigation_link_pickers.down,
    name: '20261112_100253_navigation_link_pickers',
  },
  {
    up: migration_20261112_105731_inquiry_statuses.up,
    down: migration_20261112_105731_inquiry_statuses.down,
    name: '20261112_105731_inquiry_statuses'
  },
];
