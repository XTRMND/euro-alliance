import * as migration_20261031_201223_initial from './20261031_201223_initial';

export const migrations = [
  {
    up: migration_20261031_201223_initial.up,
    down: migration_20261031_201223_initial.down,
    name: '20261031_201223_initial'
  },
];
