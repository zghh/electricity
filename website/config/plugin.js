'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }

  passport: {
    enable: true,
    package: 'egg-passport',
  },

  passportLocal: {
    enable: true,
    package: 'egg-passport-local',
  },

  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },

  validate: {
    enable: true,
    package: 'egg-validate',
  },
};
