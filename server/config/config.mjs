// @ts-check

/**
 * The base configuration for the web app
 *
 * This configuration file uses similar values as the original WordPress "wp-config.php" file.
 */

import path from 'path';

/** Database settings */
const dbConfig = {
  name: 'local',
  user: 'root',
  password: 'root',
  host: 'localhost',
  charset: 'utf8',
  collate: '',
};

/** Authentication unique keys and salts */
const authConfig = {
  authKey: 'y*?<]|4@CaIx)BV<]/Z_t50$xm`3^!|A$?+3g+Zn!J4Uv9s|3~%eC :9<G^=)gI2',
  secureAuthKey: 'R8HPIE^K<%]`Bs_?wkdlhpM{!Tk*MR8ecT;9-l:A_x}.~KR,aSlPquCbGAnyN@1[',
  loggedInKey: '`5E[h )6KEswt:mM9BrMVm|@Ro`Iy-D-G<e-0O[.Ep8n1MZ0)sxI|.XFH8T)&4q^',
  nonceKey: 'O 8<KQ5XE/_m^bn[Dd,)KBo= .zZM0YKrrJf5!lx{ojnrddm,hC?94am8[p|[kXu',
  authSalt: 's!`F_NK$d !`YEMS0Z?q_:8JX|qH=F`<KS$f-Wv:@i#D5n-4w|(lQ0`(M?m&ps;O',
  secureAuthSalt: 'V>_a.CV~tRbyZOLfkJI%6?(G1[9j/xJg@&7JO#O-M+K`3o88!kZ+RE(KGdt6V(:6',
  loggedInSalt: '$Y^ysP{>MOX[eo_:pRf:k=+E>@o!#iX^p{w6E}<]^heGo?A)<W|*at{w#yr,%4.e',
  nonceSalt: 'astCLb|tA@K%P1K;6TP|V+:Xx.D-49vwJFVW((w+kPi#voPk+-`;:=nE2PMR{1(+',
  cacheKeySalt: 'Cp#Eq?GeVt!M5,)F?8jpbWRF2aDs J)gwP%(G<7u{kh`y3j`7r#f#ElDr5(1_qgC',
};

/** Database table prefix */
const tablePrefix = 'wp_';

/** Debug mode */
const debugConfig = {
  wpDebug: false,
  environmentType: 'local',
};

/** Absolute path to the app directory */
const abspath = path.resolve();

export { dbConfig, authConfig, tablePrefix, debugConfig, abspath };
