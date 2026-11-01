import * as migration_20261031_201223_initial from './20261031_201223_initial';
import * as migration_20261031_213643_navigation_and_funding from './20261031_213643_navigation_and_funding';
import * as migration_20261031_213646_drop_footer_legal from './20261031_213646_drop_footer_legal';

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
    name: '20261031_213646_drop_footer_legal'
  },
];
