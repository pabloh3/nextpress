// @ts-check
/**
 * The base configuration for a Node.js application
 *
 * This configuration is used to set environment variables and other settings
 * for the application.
 *
 * @package NodeApp
 */

// ** Environment and database settings ** //
export const envConfig = {
  DB_NAME: 'local',
  DB_USER: 'root',
  DB_PASSWORD: 'root',
  DB_HOST: 'localhost',
  DB_CHARSET: 'utf8',
  DB_COLLATE: '',
  AUTH_KEY: 'y*?<]|4@CaIx)BV<]/Z_t50$xm`3^!|A$?+3g+Zn!J4Uv9s|3~%eC :9<G^=)gI2',
  SECURE_AUTH_KEY: 'R8HPIE^K<%]`Bs_?wkdlhpM{!Tk*MR8ecT;9-l:A_x}.~KR,aSlPquCbGAnyN@1[',
  LOGGED_IN_KEY: '`5E[h )6KEswt:mM9BrMVm|@Ro`Iy-D-G<e-0O[.Ep8n1MZ0)sxI|.XFH8T)&4q^',
  NONCE_KEY: 'O 8<KQ5XE/_m^bn[Dd,)KBo= .zZM0YKrrJf5!lx{ojnrddm,hC?94am8[p|[kXu',
  AUTH_SALT: 's!`F_NK$d !`YEMS0Z?q_:8JX|qH=F`<KS$f-Wv:@i#D5n-4w|(lQ0`(M?m&ps;O',
  SECURE_AUTH_SALT: 'V>_a.CV~tRbyZOLfkJI%6?(G1[9j/xJg@&7JO#O-M+K`3o88!kZ+RE(KGdt6V(:6',
  LOGGED_IN_SALT: '$Y^ysP{>MOX[eo_:pRf:k=+E>@o!#iX^p{w6E}<]^heGo?A)<W|*at{w#yr,%4.e',
  NONCE_SALT: 'astCLb|tA@K%P1K;6TP|V+:Xx.D-49vwJFVW((w+kPi#voPk+-`;:=nE2PMR{1(+',
  WP_CACHE_KEY_SALT: 'Cp#Eq?GeVt!M5,)F?8jpbWRF2aDs J)gwP%(G<7u{kh`y3j`7r#f#ElDr5(1_qgC',
  TABLE_PREFIX: 'wp_',
  WP_DEBUG: false,
  WP_ENVIRONMENT_TYPE: 'local',
};

/**
 * Absolute path to the application directory.
 */
export const ABSPATH = process.cwd() + '/';

/**
 * Sets up application vars and included files.
 * Typically, you would import the necessary setup files here.
 *
 * Example: import './setup';
 */

// Import any required setup files here.