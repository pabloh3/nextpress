import crypto from 'crypto';
import fs from 'fs';
// The 'mysql2' package is recommended to handle MySQL interactions with Node.js
import { createConnection } from 'mysql2/promise';

/*
 * Node.js database access abstraction class equivalent to WordPress' wpdb.
 * Converts PHP WordPress database abstraction to a Node.js context.
 *
 * This example uses modern JS practices and assumptions about Node.js libraries for database access.
 * The original WordPress functionality and behavior may differ, and this should be customized further 
 * to meet the exact needs applicable to the original context (likely requires use of an npm package like mysql2).
 */

// Define constants similar to WordPress' PHP defines for compatibility
const EZSQL_VERSION = 'WP1.25';
const OBJECT = 'OBJECT';
const OBJECT_K = 'OBJECT_K';
const ARRAY_A = 'ARRAY_A';
const ARRAY_N = 'ARRAY_N';

/**
 * WordPress Node.js inspired database access abstraction class.
 *
 * This class is used to mock or simulate interaction with a database without using raw SQL statements.
 * You must still implement the actual database interaction using a specific library, e.g., mysql2.
 *
 * It is structured similarly to how the php wpdb might be extended in WordPress.
 *
 * @link Emulation of WordPress' wpdb API to JavaScript.
 */
class Wpdb {
  /**
   * Whether to show SQL/DB errors.
   * Default is to show errors if both WP_DEBUG and WP_DEBUG_DISPLAY evaluate to true.
   *
   * @var {boolean}
   */
  showErrors = false;

  /**
   * Whether to suppress errors during DB bootstrapping. Default false.
   *
   * @var {boolean}
   */
  suppressErrors = false;

  /**
   * The error encountered during the last query.
   *
   * @var {string}
   */
  lastError = '';

  /**
   * The number of queries made.
   *
   * @var {number}
   */
  numQueries = 0;

  /**
   * Count of rows returned by the last query.
   *
   * @var {number}
   */
  numRows = 0;

  /**
   * Initialize necessary properties or handle bootstrapping here.
   */
  /*constructor() {
    // Initialization logic if needed
  }*/

  /**
   * Count of rows affected by the last query.
   *
   * @var {number}
   */
  rowsAffected = 0;

  /**
   * The ID generated for an AUTO_INCREMENT column by the last query (usually INSERT).
   *
   * @var {number}
   */
  insertId = 0;

  /**
   * The last query made.
   *
   * @var {string}
   */
  lastQuery = '';

  /**
   * Results of the last query.
   *
   * @var {Array<Object>|null}
   */
  lastResult = null;

  /**
   * Database query result.
   * Possible values:
   * - Instance of a result set class for successful SELECT, SHOW, DESCRIBE, or EXPLAIN queries
   * - `true` for other successful query types
   * - `null` if a query is yet to be made or if the result has since been flushed
   * - `false` if the query returned an error
   *
   * @var {Object|boolean|null}
   */
  result = null;

  /**
   * Cached column info, for confidence checking data before inserting.
   *
   * @var {Array<Object>}
   */
  colMeta = [];

  /**
   * Calculated character sets keyed by table name.
   *
   * @var {Object<string, string>}
   */
  tableCharset = {};

  /**
   * Whether text fields in the current query need to be confidence checked.
   *
   * @var {boolean}
   */
  checkCurrentQuery = true;

  /**
   * Flag to ensure we don't run into recursion problems when checking the collation.
   *
   * @var {boolean}
   */
  checkingCollation = false;

  /**
   * Saved info on the table column.
   *
   * @var {Array<Object>}
   */
  colInfo = [];

  /**
   * Log of queries that were executed, for debugging purposes.
   *
   * @var {Array.<Array.<Array.<string|number|Object>>>}
   */
  queries = [];

  /**
   * The number of times to retry reconnecting before giving up. Default is 5.
   *
   * @var {number}
   */
  reconnectRetries = 5;

  /**
   * WordPress table prefix.
   *
   * Used to have multiple WordPress installations in a single database, or for security reasons.
   *
   * @var {string}
   */
  prefix = '';

  /**
   * WordPress base table prefix.
   *
   * @var {string}
   */
  basePrefix = '';

  /**
   * Whether the database queries are ready to start executing.
   *
   * @var {boolean}
   */
  ready = false;

  /**
   * Blog ID.
   *
   * @var {number}
   */
  blogId = 0;

  /**
   * Site ID.
   *
   * @var {number}
   */
  siteId = 0;

  /**
   * List of WordPress per-site tables.
   *
   * @var {Array<string>}
   */
  tables = [
    'posts',
    'comments',
    'links',
    'options',
    'postmeta',
    'terms',
    'term_taxonomy',
    'term_relationships',
    'termmeta',
    'commentmeta',
  ];

  /**
   * List of deprecated WordPress tables.
   *
   * @var {Array<string>}
   */
  oldTables = ['categories', 'post2cat', 'link2cat'];

  /**
   * List of WordPress global tables.
   *
   * @var {Array<string>}
   */
  globalTables = ['users', 'usermeta'];

  /**
   * List of Multisite global tables.
   *
   * @var {Array<string>}
   */
  msGlobalTables = ['blogs', 'blogmeta', 'signups', 'site', 'sitemeta', 'registration_log'];

  /**
   * List of deprecated WordPress Multisite global tables.
   *
   * @var {Array<string>}
   */
  oldMsGlobalTables = ['sitecategories'];

  /**
   * WordPress Comments table.
   *
   * @var {string}
   */
  comments = '';

  /**
   * WordPress Comment Metadata table.
   *
   * @var {string}
   */
  commentMeta = '';

  /**
   * WordPress Links table.
   *
   * @var {string}
   */
  links = '';

  /**
   * WordPress Options table.
   *
   * @var {string}
   */
  options = '';

  /**
   * WordPress Post Metadata table.
   *
   * @var {string}
   */
  postMeta = '';

  /**
   * WordPress Posts table.
   *
   * @var {string}
   */
  posts = '';

  /**
   * WordPress Terms table.
   *
   * @var {string}
   */
  terms = '';

  /**
   * WordPress Term Relationships table.
   *
   * @var {string}
   */
  termRelationships = '';

  /**
   * WordPress Term Taxonomy table.
   *
   * @var {string}
   */
  termTaxonomy = '';

  /**
   * WordPress Term Meta table.
   *
   * @var {string}
   */
  termMeta = '';

  //
  // Global and Multisite tables
  //

  /**
   * WordPress User Metadata table.
   *
   * @var {string}
   */
  userMeta = '';

  /**
   * WordPress Users table.
   *
   * @var {string}
   */
  users = '';

  /**
   * Multisite Blogs table.
   *
   * @var {string}
   */
  blogs = '';

  /**
   * Multisite Blog Metadata table.
   *
   * @var {string}
   */
  blogMeta = '';

  /**
   * Multisite Registration Log table.
   *
   * @var {string}
   */
  registrationLog = '';

  /**
   * Multisite Signups table.
   *
   * @var {string}
   */
  signups = '';

  /**
   * Multisite Sites table.
   *
   * @var {string}
   */
  site = '';

  /**
   * Multisite Sitewide Terms table.
   *
   * @var {string}
   */
  siteCategories = '';

  /**
   * Multisite Site Metadata table.
   *
   * @var {string}
   */
  siteMeta = '';

  /**
   * Format specifiers for DB columns.
   *
   * @var {Object<string, string>}
   */
  fieldTypes = {};

  /**
   * Database table columns charset.
   *
   * @var {string}
   */
  charset = '';

  /**
   * Database table columns collate.
   *
   * @var {string}
   */
  collate = '';

  /**
   * Database Username.
   *
   * @var {string}
   */
  dbUser = '';

  /**
   * Database Password.
   *
   * @var {string}
   */
  dbPassword = '';

  /**
   * Database Name.
   *
   * @var {string}
   */
  dbName = '';

  /**
   * Database Host.
   *
   * @var {string}
   */
  dbHost = '';

  /**
   * Database handle.
   * Possible values:
   * - Instance representing a database connection during normal operation
   * - `null` if the connection is yet to be made or has been closed
   * - `false` if the connection has failed
   *
   * @var {Object|boolean|null}
   */
  dbh = null;

  /**
   * A textual description of the last query/get_row/get_var call.
   *
   * @var {string}
   */
  funcCall = '';

  /**
   * Whether MySQL is used as the database engine.
   *
   * Set in dbConnect() to true, by default. This is used when checking
   * against the required MySQL version for compatibility.
   *
   * @var {boolean}
   */
  isMySQL = null;

  /**
   * A list of incompatible SQL modes.
   *
   * @var {Array<string>}
   */
  incompatibleModes = [
    'NO_ZERO_DATE',
    'ONLY_FULL_GROUP_BY',
    'STRICT_TRANS_TABLES',
    'STRICT_ALL_TABLES',
    'TRADITIONAL',
    'ANSI',
  ];

  /**
   * Backward compatibility for unquoted formatted/argnum placeholders in queries.
   *
   * This feature allows old code to remain functional, though it may introduce SQL Injection risks.
   *
   * @var {boolean}
   */
  allowUnsafeUnquotedParameters = true;

  /**
   * Whether to use the `mysql2` package, simulating the mysqli functionality from PHP.
   * This mirrors legacy behavior that would have chosen between the old `mysql` and `mysqli`
   * extensions in PHP.
   *
   * @var {boolean}
   */
  useMySQLi = true;

  /**
   * Whether we've managed to successfully connect at some point.
   *
   * @var {boolean}
   */
  hasConnected = false;

  /**
   * Time when the last query was performed.
   * Only set when `SAVEQUERIES` is defined and truthy.
   *
   * @var {number|null}
   */
  timeStart = null;

  /**
   * The last SQL error that was encountered.
   *
   * @var {Error|string|null}
   */
  error = null;

  /**
   * Connects to the database server and selects a database.
   *
   * Initializes the database connection and sets up class properties.
   *
   * @param {string} dbUser     Database user.
   * @param {string} dbPassword Database password.
   * @param {string} dbName     Database name.
   * @param {string} dbHost     Database host.
   */
  constructor(dbUser, dbPassword, dbName, dbHost) {
    if (process.env.WP_DEBUG && process.env.WP_DEBUG_DISPLAY) {
      this.showErrors();
    }

    this.dbUser = dbUser;
    this.dbPassword = dbPassword;
    this.dbName = dbName;
    this.dbHost = dbHost;

    // Configuration is manually handled elsewhere if specified.
    if (process.env.WP_SETUP_CONFIG) {
      return;
    }

    this.dbConnect();
  }

  /**
   * Shows errors depending on the debugging settings.
   */
  showErrors() {
    this.showErrors = true;
  }

  /**
   * Establishes a connection to the database. Placeholder for actual connectivity logic.
   */
  dbConnect() {
    // Actual connection logic using 'mysql2' package goes here
  }

  /**
   * Determines the best charset and collation to use given a charset and collation.
   *
   * @param {string} charset The character set to check.
   * @param {string} collate The collation to check.
   * @return {Object<string, string>} The most appropriate character set and collation to use.
   */
  determineCharset(charset, collate) {
    if (!this.dbh) {
      return { charset, collate };
    }

    if (charset === 'utf8') {
      charset = 'utf8mb4';
    }

    if (charset === 'utf8mb4') {
      collate = !collate || collate === 'utf8_general_ci'
        ? 'utf8mb4_unicode_ci'
        : collate.replace('utf8_', 'utf8mb4_');
    }

    if (this.hasCapability('utf8mb4_520') && collate === 'utf8mb4_unicode_ci') {
      collate = 'utf8mb4_unicode_520_ci';
    }

    return { charset, collate };
  }

  /**
   * Sets the connection's character set.
   *
   * @param {Object} dbh The connection object, analogous to a mysqli connection.
   * @param {string} [charset] Optional character set.
   * @param {string} [collate] Optional collation.
   */
  setCharset(dbh, charset = null, collate = null) {
    charset = charset || this.charset;
    collate = collate || this.collate;

    if (this.hasCapability('collation') && charset) {
      let setCharsetSucceeded = true;

      if (dbh && this.hasCapability('set_charset')) {
        setCharsetSucceeded = dbh.execute(`SET NAMES ${charset}`);
      }

      if (setCharsetSucceeded) {
        let query = `SET NAMES '${charset}'`;
        if (collate) {
          query += ` COLLATE '${collate}'`;
        }
        dbh.query(query);
      }
    }
  }

  /**
   * Placeholder for checking certain capabilities related to the database connection.
   *
   * @param {string} capability
   * @returns {boolean}
   */
  hasCapability(capability) {
    // Logic to check specific database feature capability goes here
    return false;
  }

  /**
   * Changes the current SQL mode, and ensures its compatibility.
   *
   * If no modes are passed, it will ensure the current SQL server modes are compatible.
   *
   * @param {Array<string>} [modes=[]] Optional A list of SQL modes to set.
   */
  setSqlMode(modes = []) {
    if (!modes.length) {
      let [modesArray] = dbh.query(`SELECT @@SESSION.sql_mode`);

      if (!modesArray || !modesArray[0]) {
        return;
      }

      const modesStr = modesArray[0];

      if (!modesStr) {
        return;
      }

      modes = modesStr.split(',');
    }

    modes = modes.map(mode => mode.toUpperCase());

    const incompatibleModes = this.incompatibleModes; // Placeholder for the `apply_filters` behaviour

    modes = modes.filter(mode => !incompatibleModes.includes(mode));

    const modesStr = modes.join(',');

    dbh.query(`SET SESSION sql_mode='${modesStr}'`);
  }

  /**
   * Sets the table prefix for the WordPress tables.
   *
   * @param {string} prefix        Alphanumeric name for the new prefix.
   * @param {boolean} [setTableNames=true] Whether the table names should be updated or not.
   * @return {string|Error} Old prefix or error on invalid prefix.
   */
  setPrefix(prefix, setTableNames = true) {
    if (/[^a-z0-9_]/i.test(prefix)) {
      return new Error('Invalid database prefix');
    }

    let oldPrefix = process.env.IS_MULTISITE ? '' : prefix;

    if (this.basePrefix) {
      oldPrefix = this.basePrefix;
    }

    this.basePrefix = prefix;

    if (setTableNames) {
      for (const [table, prefixedTable] of Object.entries(this.tables('global'))) {
        this[table] = prefixedTable;
      }

      if (process.env.IS_MULTISITE && !this.blogId) {
        return oldPrefix;
      }

      this.prefix = this.getBlogPrefix();

      for (const [table, prefixedTable] of Object.entries(this.tables('blog'))) {
        this[table] = prefixedTable;
      }

      for (const [table, prefixedTable] of Object.entries(this.tables('old'))) {
        this[table] = prefixedTable;
      }
    }
    return oldPrefix;
  }

  /**
   * Sets the blog ID.
   *
   * @param {number} blogId
   * @param {number} [networkId=0] Optional network ID.
   * @return {number} Previous blog ID.
   */
  setBlogId(blogId, networkId = 0) {
    if (networkId) {
      this.siteId = networkId;
    }

    const oldBlogId = this.blogId;
    this.blogId = blogId;

    this.prefix = this.getBlogPrefix();

    for (const [table, prefixedTable] of Object.entries(this.tables('blog'))) {
      this[table] = prefixedTable;
    }

    for (const [table, prefixedTable] of Object.entries(this.tables('old'))) {
      this[table] = prefixedTable;
    }

    return oldBlogId;
  }

  /**
   * Gets the blog prefix.
   *
   * @param {number|null} [blogId=null] Optional. Blog ID to retrieve the table prefix for.
   *                                   Defaults to the current blog ID.
   * @return {string} Blog prefix.
   */
  getBlogPrefix(blogId = null) {
    if (process.env.IS_MULTISITE) {
      if (blogId === null) {
        blogId = this.blogId;
      }

      blogId = Number(blogId);

      if (process.env.MULTISITE && (blogId === 0 || blogId === 1)) {
        return this.basePrefix;
      } else {
        return `${this.basePrefix}${blogId}_`;
      }
    }
    return this.basePrefix;
  }

  /**
   * Returns an array of WordPress tables.
   *
   * Also allows for custom user and usermeta tables to override the default ones.
   *
   * The `scope` argument can take one of the following:
   *
   * - 'all' - returns 'all' and 'global' tables. No old tables returned.
   * - 'blog' - returns the blog-level tables for the queried blog.
   * - 'global' - returns the global tables, returning multisite tables only on multisite.
   * - 'ms_global' - returns the multisite global tables regardless of multisite installation.
   * - 'old' - returns deprecated tables.
   *
   * @param {string} [scope='all'] Optional. Table scope: 'all', 'global', 'ms_global', 'blog', 'old'. Default 'all'.
   * @param {boolean} [prefix=true] Optional. Include table prefixes or not. Defaults true.
   * @param {number} [blogId=0] Optional. Blog ID to prefix. Used only when prefix is requested.
   * @return {Object<string, string>|string[]} Table names. Keys are unprefixed names if prefix requested.
   */
  tables(scope = 'all', prefix = true, blogId = 0) {
    let tables;
    switch (scope) {
      case 'all':
        tables = [...this.globalTables, ...this.tables];
        if (process.env.IS_MULTISITE) {
          tables = [...tables, ...this.msGlobalTables];
        }
        break;
      case 'blog':
        tables = this.tables;
        break;
      case 'global':
        tables = this.globalTables;
        break;

      if (process.env.IS_MULTISITE) {
        tables = [...tables, ...this.msGlobalTables];
      }
      break;
    case 'ms_global':
      tables = this.msGlobalTables;
      break;
    case 'old':
      tables = this.oldTables;
      if (process.env.IS_MULTISITE) {
        tables = [...tables, ...this.oldMsGlobalTables];
      }
      break;
    default:
      return [];
    }

    // If prefixes are requested
    let prefixedTables = {};
    if (prefix) {
      const blogPrefix = this.getBlogPrefix(blogId || this.blogId);
      for (const table of tables) {
        prefixedTables[table] = `${blogPrefix}${table}`;
      }
      return prefixedTables;
    }
    return tables;
  }

  /**
   * Selects a database using the current or provided database connection.
   *
   * The database name will be changed based on the current database connection.
   *
   * @param {string} db Database name.
   * @param {Object} [dbh=null] Optional. Database connection.
   *                    Defaults to the current database handle.
   */
  select(db, dbh = null) {
    dbh = dbh || this.dbh;

    // Example: Using mysql2/promise syntax (use actual implementation)
    dbh.query(`USE ${db}`).catch((err) => {
      this.ready = false;
      console.error('Database selection failed:', err.message);

      if (!process.env.TEMPLATE_REDIRECT_DONE) {
        // Example translations 
        const message = '<h1>Cannot select database</h1>' +
                        `<p>The database server could be connected to (which means your username and password is okay) but the ${db} database could not be selected.</p>` +
                        `<ul><li>Are you sure it exists?</li>`;

        // Preferably implement a proper error handling logic for your application
        console.log(message);
      }
    });
  }

  /**
   * Prepares a SQL query for safe execution.
   *
   * Uses `sprintf()`-like syntax. The following placeholders can be used in the query string:
   *
   * - `%d` (integer)
   * - `%f` (float)
   * - `%s` (string)
   * - `%i` (identifier, e.g. table/field names)
   *
   * All placeholders MUST be left unquoted in the query string. A corresponding argument
   * MUST be passed for each placeholder.
   *
   * Note: There is one exception to the above: for compatibility with old behavior,
   * numbered or formatted string placeholders (eg, `%1$s`, `%5s`) will not have quotes
   * added by this function, so should be passed with appropriate quotes around them.
   *
   * Literal percentage signs (`%`) in the query string must be written as `%%`. Percentage wildcards
   * (for example, to use in LIKE syntax) must be passed via a substitution argument containing
   * the complete LIKE string, these cannot be inserted directly in the query string.
   * Also see wpdb::esc_like().
   *
   * Arguments may be passed as individual arguments to the method or as a single array
   * containing all arguments.
   *
   * @param {string} query SQL query with placeholders.
   * @param {...*} args Arguments to replace the placeholders.
   * @return {string} The processed SQL query.
   */
  prepare(query, ...args) {
    return query.replace(/%[dfsi]/g, (match, index) => {
      const arg = args.shift();
      switch (match) {
        case '%d':
          return parseInt(arg, 10);
        case '%f':
          return parseFloat(arg);
        case '%s':
          return `'${String(arg).replace(/'/g, "''")}'`;
        case '%i':
          return this.quoteIdentifier(arg);
        default:
          return match;
      }
    });
  }

  /**
   * Description of the syntax can be found at php.net's sprintf documentation.
   *
   * Prepares a SQL query for safe execution.
   *
   * @param {string} query SQL query with sprintf-like placeholders.
   * @param {...*} args The array or individual variables to substitute into the query's placeholders.
   * @return {string|undefined} Sanitized query string, if there is a query to prepare.
   */
  prepare(query, ...args) {
    if (query === undefined || query === null) {
      return;
    }

    /*
     * This is not foolproof -- but it will catch obviously incorrect usage.
     *
     * Includes checking for placeholder presence in a query.
     */
    if (!query.includes('%')) {
      console.warn('The query argument of wpdb::prepare() must have a placeholder.');
      return query; // Or handle the warning accordingly
    }

    /*
     * Allowed formatting in placeholders, capturing specific possible patterns:
     *  - Sign specifier, like $+d
     *  - Numbered placeholders, e.g. %1$s
     *  - Padding specifier, with custom characters, e.g. %05s, %'#5s
     *  - Alignment specifier, e.g. %05-s
     *  - Precision specifier, e.g. %.2f
     */
    const allowedFormat = '(?:[1-9][0-9]*[$])?[-+0-9]*(?: |0|\'.)?[-+0-9]*(?:\.[0-9]+)?';

    // Remove wrapping quotes from %s placeholders for backward compatibility
    query = query.replace(/'%([^']+)%'/g, '%$1%')
                 .replace(/"%([^']+)%"/g, '%$1%');

    // Escape any unescaped percent symbols
    query = query.replace(new RegExp(`%(?!(${allowedFormat})?[sdfFi])`, 'g'), '%%$1');

    // Split query into parts using placeholders
    const splitQuery = query.split(new RegExp(`(^|[^%]|(?:%%)+)(%(${allowedFormat})?[sdfFi])`));

    const splitQueryCount = splitQuery.length;

    // Split always returns with 1 value before the first placeholder (even if query = "%s")
    const placeholderCount = ((splitQueryCount - 1) / 3);

    // If args were passed as an array, like in vsprintf(), unwrap them
    const passedAsArray = (Array.isArray(args[0]) && args.length === 1);
    if (passedAsArray) {
      args = args[0];
    }

    let newQuery = '';
    let key = 2; // Keys 0 and 1 in splitQuery contain values before the first placeholder
    let argID = 0;
    const argIdentifiers = [];
    const argStrings = [];

    while (key < splitQueryCount) {
      let placeholder = splitQuery[key];

      const format = placeholder.slice(1, -1);
      const type = placeholder.slice(-1);

      if (type === 'f' && this.allowUnsafeUnquotedParameters &&
          // Checking the last character of split_query[key - 1]
          splitQuery[key - 1].slice(-1) === '%') {

        // Mimic legacy behavior for particular float handling

        const s = splitQuery[key - 2] + splitQuery[key - 1];
        let k = 1;
        const l = s.length;
        while (k <= l && s[l - k] === '%') {
          ++k;
        }

        placeholder = '%' + (k % 2 ? '%' : '') + format + type;

        --placeholderCount;
      } else {
        // Force floats to be locale-unaware.
        if (type === 'f') {
          type = 'F';
          placeholder = `%${format}${type}`;
        }

        if (type === 'i') {
          placeholder = '\`%${format}s\`';
          const argnumPos = format.indexOf('$');

          if (argnumPos !== -1) {
            // sprintf() argnum starts at 1, argID from 0.
            argIdentifiers.push(parseInt(format.substring(0, argnumPos), 10) - 1);
          } else {
            argIdentifiers.push(argID);
          }
        } else if (type !== 'd' && type !== 'F') {
          // For ('s' === type), ensure string escaping is used as a safe default.
          const argnumPos = format.indexOf('$');

          if (argnumPos !== -1) {
            argStrings.push(parseInt(format.substring(0, argnumPos), 10) - 1);
          } else {
            argStrings.push(argID);
          }

          if (!this.allowUnsafeUnquotedParameters ||
              (format === '' && splitQuery[key - 1].slice(-1) !== '%')) {
            placeholder = `'%${format}s'`;
          }
        }
      }
      // Glue (-2), any leading characters (-1), then the new placeholder.
      newQuery += splitQuery[key - 2] + splitQuery[key - 1] + placeholder;

      key += 3;
      ++argID;
    }

    // Add remaining query characters, or index 0 if there were no placeholders.
    query = `${newQuery}${splitQuery[key - 2]}`;

    const dualUse = argIdentifiers.filter(item => argStrings.includes(item));

    if (dualUse.length > 0) {
      console.warn('Passed arguments cannot be prepared as both an Identifier and Value.');

      const usedPlaceholders = {};

      key = 2;
      argID = 0;
      // Parse again (only used when there is an error).
      while (key < splitQueryCount) {
        placeholder = splitQuery[key];

        const format = placeholder.slice(1, -1);
        const argnumPos = format.indexOf('$');

        let argPos;
        if (argnumPos !== -1) {
          argPos = parseInt(format.substring(0, argnumPos), 10) - 1;
        } else {
          argPos = argID;
        }

        if (!usedPlaceholders[argPos]) {
          usedPlaceholders[argPos] = [];
        }

        usedPlaceholders[argPos].push(placeholder);

        key += 3;
        ++argID;
      }

      const conflicts = dualUse.map(argPos => usedPlaceholders[argPos].join(' and '));

      console.warn(`Arguments cannot be prepared as both an Identifier and Value. Found the following conflicts: ${conflicts.join(', ')}`);

      return null;
    }

    const argsCount = args.length;

    if (argsCount !== placeholderCount) {
      if (placeholderCount === 1 && passedAsArray) {
        // If query expected one argument but got an array, log an error.
        console.warn('The query only expected one placeholder, but an array of multiple placeholders was sent.');
        return null;
      } else {
        // Log a warning for incorrect number of placeholders
        console.warn(`The query does not contain the correct number of placeholders (${placeholderCount}) for the arguments passed (${argsCount}).`);

        // If not enough arguments to match placeholders, return an empty string to prevent execution.
        if (argsCount < placeholderCount) {
          let maxNumberedPlaceholder = 0;
          for (let i = 2, l = splitQueryCount; i < l; i += 3) {
            // Assume a preceding number is for a numbered placeholder, e.g. '%3$s'.
            const argnum = parseInt(splitQuery[i].slice(1), 10);
            if (maxNumberedPlaceholder < argnum) {
              maxNumberedPlaceholder = argnum;
            }
          }
          if (!maxNumberedPlaceholder || argsCount < maxNumberedPlaceholder) {
            return '';
          }
        }
      }
    }

    const argsEscaped = [];

    args.forEach((value, i) => {
      if (argIdentifiers.includes(i)) {
        argsEscaped.push(this.escapeIdentifierValue(value));
      } else if (typeof value === 'number') {
        argsEscaped.push(value);
      } else {
        if (!(typeof value === 'string' || value === null)) {
          console.warn(`Unsupported value type (${typeof value}).`);
          value = '';
        }
        argsEscaped.push(this.realEscape(value));
      }
    });

    query = query.replace(/%(?!^\d+\$)/g, () => argsEscaped.shift() || '');
    return this.addPlaceholderEscape(query);
  }

  /**
   * First half of escaping for `LIKE` special characters `%` and `_` before preparing for SQL.
   *
   * Use this only before wpdb::prepare() or esc_sql(). Reversing the order is very bad for security.
   *
   * @param {string} text The raw text to be escaped. Input typed by the user without additional slashes.
   * @return {string} Text in the form of a LIKE phrase. Not SQL safe until used with wpdb::prepare().
   */
  escLike(text) {
    return text.replace(/[\\%_]/g, '\\$&');
  }

  /**
   * Prints SQL/DB error.
   *
   * @param {string} [str=''] The error to display.
   * @return {void|boolean} Void if errors showing is enabled, false if disabled.
   */
  printError(str = '') {
    const EZSQLError = global.EZSQL_ERROR || [];

    if (!str) {
      str = this.dbh ? this.dbh.error : 'Unknown error';
    }

    EZSQLError.push({
      query: this.lastQuery,
      errorStr: str,
    });

    if (this.suppressErrors) {
      return false;
    }

    const caller = this.getCaller();
    const errorStr = caller ?
      `WordPress database error ${str} for query ${this.lastQuery} made by ${caller}` :
      `WordPress database error ${str} for query ${this.lastQuery}`;
    
    console.error(errorStr);

    // Are we showing errors?
    if (!this.showErrors) {
      return false;
    }

    // If there is an error then log it.
    let msg = `WordPress database error: [${str}]
    ${this.lastQuery}`;

    if (process.env.IS_MULTISITE) {
      if (process.env.ERRORLOGFILE) {
        console.error(msg); // Use actual file logging here
      }
      if (process.env.DIEONDBERROR) {
        throw new Error(msg);
      }
    } else {
      str = str; // Simulate htmlspecialchars usage
      const query = this.lastQuery; // Simulate htmlspecialchars usage

      console.log(`
        <div id="error"><p class="wpdberror"><strong>WordPress database error:</strong> [${str}]<br /><code>${query}</code></p></div>
      `);
    }
  }

  /**
   * Enables showing of database errors.
   * This function should be used to enable showing of errors.
   *
   * @param {boolean} [show=true] Optional. Whether to show errors. Default true.
   * @return {boolean} Whether showing of errors was previously active.
   */
  showErrors(show = true) {
    const errors = this.showErrors;
    this.showErrors = show;
    return errors;
  }

  /**
   * Disables showing of database errors.
   *
   * By default database errors are not shown.
   *
   * @return {boolean} Whether showing of errors was previously active.
   */
  hideErrors() {
    const show = this.showErrors;
    this.showErrors = false;
    return show;
  }

  // Additional error handling and debug utilities can be added here...

  /**
   * Enables or disables suppression of database errors.
   *
   * By default, database errors are suppressed.
   *
   * @param {boolean} [suppress=true] Whether to suppress errors.
   * @return {boolean} Whether suppression of errors was previously active.
   */
  suppressErrors(suppress = true) {
    const errors = this.suppressErrors;
    this.suppressErrors = Boolean(suppress);
    return errors;
  }

  /**
   * Kills cached query results.
   */
  flush() {
    this.lastResult = [];
    this.colInfo = null;
    this.lastQuery = null;
    this.rowsAffected = 0;
    this.numRows = 0;
    this.lastError = '';

    if (this.result) {
      this.result.free(); // Assuming result is a class instance
      this.result = null;

      // Confidence check before using the handle.
      if (!this.dbh) {
        return;
      }

      // Clear out any results from a multi-query.
      while (this.dbh.moreResults()) {
        this.dbh.nextResult();
      }
    }
  }

  /**
   * Connects to and selects the database.
   *
   * If `allowBail` is false, the lack of database connection needs to be handled manually.
   *
   * @param {boolean} [allowBail=true] Allows the function to bail.
   * @return {boolean} True with a successful connection, false on failure.
   */
  async dbConnect(allowBail = true) {
    this.isMySQL = true;

    const clientFlags = process.env.MYSQL_CLIENT_FLAGS || 0;

    try {
      this.dbh = await createConnection({
        host: this.dbHost,
        user: this.dbUser,
        password: this.dbPassword,
        database: this.dbName,
        flags: clientFlags,
      });

    } catch (error) {
      if (allowBail) {
        console.error('Failed to connect to the database:', error);
        return false;
      }
      throw error;
    }

    let host = this.dbHost;
    let port = null;
    let socket = null;
    let isIPv6 = false;

    const hostData = this.parseDbHost(this.dbHost);
    if (hostData) {
      [host, port, socket, isIPv6] = hostData;
    }

    // If using a client library that requires brackets for IPv6 addresses
    if (isIPv6) {
      host = `[${host}]`;
    }

    try {
      await this.dbh.connect({
        host,
        user: this.dbUser,
        password: this.dbPassword,
        port,
        socket,
        flags: clientFlags,
      });
    } catch (error) {
      this.dbh = null;
      if (allowBail) {
        console.error('Error establishing a database connection:', error);

        if (process.env.WP_CONTENT_DIR && fs.existsSync(`${process.env.WP_CONTENT_DIR}/db-error.php`)) {
          require(`${process.env.WP_CONTENT_DIR}/db-error.php`);
          process.exit(1);
        }

        const message = `<h1>Error establishing a database connection</h1>` +
        `<ul>` +
        `<li>Are you sure you have the correct username and password?</li>` +
        `<li>Are you sure you have typed the correct hostname?</li>` +
        `<li>Are you sure the database server is running?</li>` +
        `</ul>` +
        `<p>If you are unsure what these terms mean you should probably contact your host. If you still need help you can always visit the <a href="https://wordpress.org/support/forums/">WordPress support forums</a>.</p>`;

        this.bail(message, 'db_connect_fail');
        return false;
      } else if (this.dbh) {
        if (!this.hasConnected) {
          this.initCharset();
        }

        this.hasConnected = true;

        this.setCharset(this.dbh);

        this.ready = true;
        this.setSqlMode();
        this.select(this.dbName, this.dbh);

        return true;
      }
      return false;
    }
  }

  /**
   * Parses the DB_HOST setting.
   *
   * Helps understand host, port, and socket for database connection.
   *
   * @param {string} host The DB_HOST setting to parse.
   * @return {Array|boolean} Array with host, port, socket, and IPv6 status. False if unparseable.
   */
  parseDbHost(host) {
    let socket = null;
    let isIPv6 = false;

    // First peel off the socket parameter from the right, if it exists.
    const socketPos = host.indexOf(':/');
    if (socketPos !== -1) {
      socket = host.substring(socketPos + 1);
      host = host.substring(0, socketPos);
    }

    /*
    * Check for an IPv6 address first.
    * An IPv6 address will always contain at least two colons.
    */
    let pattern;
    if ((host.match(/:/g) || []).length > 1) {
      pattern = /^(?:\[)?(?<host>[0-9a-fA-F:]+)(?:\]:(?<port>[\d]+))?/;
      isIPv6 = true;
    } else {
      // Assume dealing with an IPv4 address.
      pattern = /^(?<host>[^:/]*)(?::(?<port>[\d]+))?/;
    }

    const matches = host.match(pattern);

    if (!matches) {
      // Couldn't parse the address, bail.
      return false;
    }

    host = matches.groups.host || '';
    // Port must be a number or null.
    const port = matches.groups.port ? parseInt(matches.groups.port, 10) : null;

    return [host, port, socket, isIPv6];
  }

  /**
   * Checks that the database connection is still up. If not, attempts to reconnect.
   *
   * If the function is unable to reconnect, it will forcibly log the error or, if applicable,
   * return false instead after the 'template_redirect' phase.
   *
   * @param {boolean} [allowBail=true] Allows the function to bail.
   * @return {boolean|undefined} True if the connection is up.
   */
  async checkConnection(allowBail = true) {
    // Check if the connection is alive, use appropriate mysql2 checking method.
    if (this.dbh && (await this.dbh.query('DO 1')).length > 0) {
      return true;
    }

    if (process.env.WP_DEBUG) {
      const originalErrorReporting = process.env.ERROR_REPORTING;
      process.env.ERROR_REPORTING = originalErrorReporting & ~console.error;
    }

    for (let tries = 1; tries <= this.reconnectRetries; tries++) {
      // On the last try, re-enable warnings to see a single message.
      if (this.reconnectRetries === tries && process.env.WP_DEBUG) {
        process.env.ERROR_REPORTING = originalErrorReporting;
      }

      if (await this.dbConnect(false)) {
        if (originalErrorReporting) {
          process.env.ERROR_REPORTING = originalErrorReporting;
        }

        return true;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // If `template_redirect` has already occurred, return false.
    if (process.env.TEMPLATE_REDIRECT) {
      return false;
    }

    if (!allowBail) {
      return false;
    }

    const message = `<h1>Error reconnecting to the database</h1>` +
      `<p>This means that the contact with the database server at <code>${this.dbHost}</code> was lost. This could mean your host's database server is down.</p>` +
      `<ul>` +
      `<li>Are you sure the database server is running?</li>` +
      `<li>Are you sure the database server is not under particularly heavy load?</li>` +
      `</ul>` +
      `<p>If you are unsure what these terms mean you should probably contact your host. If you still need help you can always visit the <a href="https://wordpress.org/support/forums/">WordPress support forums</a>.</p>`;

    this.bail(message, 'db_connect_fail');

      // Indicate a dead database scenario; handle appropriately in JS context.
    console.error('Database is not available.');
  }

  /**
   * Performs a database query using the current connection.
   *
   * @param {string} query Database query.
   * @return {number|boolean} True for CREATE, ALTER, TRUNCATE, and DROP queries. Number of rows
   *                  affected/selected for others. False on error.
   */
  async query(query) {
    if (!this.ready) {
      this.checkCurrentQuery = true;
      return false;
    }

    query = query; // Hook for potential query filters

    if (!query) {
      this.insertId = 0;
      return false;
    }

    this.flush();

    // Log query call
    this.funcCall = `$db->query(${query})`;

    if (this.checkCurrentQuery && !this.checkAscii(query)) {
      const strippedQuery = this.stripInvalidTextFromQuery(query);
      this.flush();

      if (strippedQuery !== query) {
        this.insertId = 0;
        this.lastQuery = query;

        this.lastError = 'WordPress database error: Could not perform query because it contains invalid data.';
        console.error(this.lastError);

        return false;
      }
    }

    this.checkCurrentQuery = true;

    // Keep track of the last query for debugging purposes.
    this.lastQuery = query;

    await this._doQuery(query);

    // Check for database server disconnection and attempt reconnect.
    let mysqlErrno = 0;

    if (this.dbh) {
      mysqlErrno = this.dbh.errno;
    } else {
      // If dbh is defined but not a real connection, set error to reconnect.
      mysqlErrno = 2006;
    }

    if (!this.dbh || mysqlErrno === 2006) {
      if (await this.checkConnection()) {
        await this._doQuery(query);
      } else {
        this.insertId = 0;
        return false;
      }
    }

    // Check and note any errors.
    this.lastError = this.dbh ? this.dbh.error : 'Unable to retrieve the error message from MySQL';

    if (this.lastError) {
      // Clear insertId if failure follows an insert.
      if (this.insertId && /^\s*(insert|replace)\s/i.test(query)) {
        this.insertId = 0;
      }

      this.printError(this.lastError);
      return false;
    }

    let returnVal;

    if (/^\s*(create|alter|truncate|drop)\s/i.test(query)) {
      returnVal = this.result;
    } else if (/^\s*(insert|delete|update|replace)\s/i.test(query)) {
      this.rowsAffected = this.dbh.affectedRows;

      // Record the insertId.
      if (/^\s*(insert|replace)\s/i.test(query)) {
        this.insertId = this.dbh.insertId;
      }

      // Return the number of rows affected.
      returnVal = this.rowsAffected;
    } else {
      let numRows = 0;
      const results = await this.dbh.query(query);
      if (results) {
        results.forEach(row => {
          this.lastResult[numRows] = row;
          numRows++;
        });
      }

      // Log and return the number of rows selected.
      this.numRows = numRows;
      returnVal = numRows;
    }

    return returnVal;
  }

  /**
   * Internal function to execute the database query.
   *
   * @param {string} query The query to run.
   */
  async _doQuery(query) {
    if (process.env.SAVEQUERIES) {
      this.timerStart();
    }

    if (this.dbh) {
      this.result = await this.dbh.query(query);
    }

    ++this.numQueries;

    if (process.env.SAVEQUERIES) {
      this.logQuery(
        query,
        this.timerStop(),
        this.getCaller(),
        this.timeStart,
        {}
      );
    }
  }

  /**
   * Logs query data.
   *
   * @param {string} query The query's SQL.
   * @param {number} queryTime Total time spent on the query, in seconds.
   * @param {string} queryCallstack Comma-separated list of the calling functions.
   * @param {number} queryStart Unix timestamp of the time at the start of the query.
   * @param {Array} queryData Custom query data.
   */
  logQuery(query, queryTime, queryCallstack, queryStart, queryData) {
    this.queries.push([
      query,
      queryTime,
      queryCallstack,
      queryStart,
      queryData,
    ]);
  }

  // Further methods related to query timing and utility classes...

  /**
   * Generates and returns a placeholder escape string for use in prepared queries.
   *
   * @return {string} String to escape placeholders.
   */
  placeholderEscape() {
    if (!this._placeholder) {
      const algo = 'sha256';
      const salt = process.env.AUTH_SALT || String(Math.random());

      this._placeholder = `{${crypto.createHmac(algo, salt).update(`${Date.now()}-${salt}`).digest('hex')}}`;
    }

    return this._placeholder;
  }

  /**
   * Adds a placeholder escape string to escape any `%` that resembles a placeholder.
   *
   * @param {string} query The query to escape.
   * @return {string} Escaped query.
   */
  addPlaceholderEscape(query) {
    return query.replace(/%/g, this.placeholderEscape());
  }

  /**
   * Removes the placeholder escape strings from a query.
   *
   * @param {string} query The query to remove the placeholder from.
   * @return {string} Cleaned query.
   */
  removePlaceholderEscape(query) {
    return query.replace(new RegExp(this.placeholderEscape(), 'g'), '%');
  }

  // Any other filtering and utility methods would follow here...

  /**
   * Inserts a row into the table.
   *
   * @param {string} table Table name.
   * @param {Object} data Data to insert (in column => value pairs).
   *                      Both `data` columns and `data` values should be "raw" (neither should be SQL escaped).
   *                      Sending a null value will cause the column to be set to NULL - the corresponding
   *                      format is ignored in this case.
   * @param {Array|string} [format=null] Optional. Array of formats mapped to each value in `data`.
   *                                    If string, format will be used for all values. Formats are '%d', '%f', '%s'.
   *                                    If omitted, all values in `data` default to strings unless specified.
   * @return {Promise<number|boolean>} The number of rows inserted, or false on error.
   */
  async insert(table, data, format = null) {
    return this._insertReplaceHelper(table, data, format, 'INSERT');
  }

  /**
   * A helper function that aids 'replace' and 'insert' implementation.
   * @private
   * @param {string} table
   * @param {Object} data
   * @param {Array|string} [format]
   * @param {string} type
   * @return {Promise<number|boolean>} The number of rows affected or false on error.
   */
  async _insertReplaceHelper(table, data, format, type) {
    // Method implementation including connection and insertion logic
  }

  /**
   * Replaces a row in the table or inserts it if it does not exist, based on a PRIMARY KEY or a UNIQUE index.
   *
   * A REPLACE works like an INSERT, but deletes old row if a conflict in PRIMARY KEY or UNIQUE index occurs.
   *
   * @param {string} table Table name.
   * @param {Object} data Data to insert (in column => value pairs).
   *                      Requires PRIMARY KEY or UNIQUE index for replacing.
   *                      Sending null sets column NULL; the format is ignored in this case.
   * @param {Array|string} [format=null] Optional. Array of formats for each value; '%d', '%f', '%s'.
   *                                    Defaults to strings unless specified.
   * @return {Promise<number|boolean>} Number of rows affected, or false if error occurs.
   */
  async replace(table, data, format = null) {
    return this._insertReplaceHelper(table, data, format, 'REPLACE');
  }

  /**
   * Replaces a row in the table or inserts it if it does not exist.
   *
   * @param {string} table Table name.
   * @param {Object} data Data to insert.
   * @param {Array|string} [format=null] Format of data.
   * @return {Promise<number|boolean>} Rows affected.
   */
  async replace(table, data, format = null) {
    return this._insertReplaceHelper(table, data, format, 'REPLACE');
  }

  /**
   * Helper function for insert and replace operations.
   *
   * Runs an insert or replace query based on the `type` argument.
   *
   * @private
   * @param {string} table Table name.
   * @param {Object} data Data to insert (in column => value pairs).
   *                      Columns and values should be raw (not SQL escaped). Null will set column to NULL.
   * @param {Array|string} [format=null] Format(s) for each value in `data`. '%d', '%f', '%s'.
   * @param {string} [type='INSERT'] Type of operation. 'INSERT' or 'REPLACE'.
   * @return {Promise<number|boolean>} The number of rows affected, or false on error.
   */
  async _insertReplaceHelper(table, data, format = null, type = 'INSERT') {
    this.insertId = 0;

    if (!['REPLACE', 'INSERT'].includes(type.toUpperCase())) {
      return false;
    }

    const processedData = this.processFields(table, data, format);
    if (processedData === false) {
      return false;
    }

    const formats = [];
    const values = [];
    for (const value of processedData) {
      if (value.value === null) {
        formats.push('NULL');
        continue;
      }

      formats.push(value.format);
      values.push(value.value);
    }

    const fields = '`' + Object.keys(processedData).join('`, `') + '`';
    const formatString = formats.join(', ');

    const sql = `${type} INTO ${table} (${fields}) VALUES (${formatString})`;

    this.checkCurrentQuery = false;
    return this.query(this.prepare(sql, values));
  }

  /**
   * Updates a row in the table.
   *
   * @param {string} table Table name.
   * @param {Object} data Data to update (in column => value pairs).
   *                      Both columns and values should be raw, not SQL escaped.
   *                      Sending null sets column to NULL; format is ignored for nulls.
   * @param {Object} where Named array of WHERE clauses (in column => value pairs).
   *                       Multiple clauses joined with ANDs, columns and values raw.
   *                       Null value results in IS NULL, format ignored.
   * @param {Array|string} [format=null] Optional. Formats for each value in data. '%d', '%f', '%s'.
   *                                    Defaults to strings unless specified.
   * @param {Array|string} [whereFormat=null] Optional. Formats for each value in where condition.
   * @return {Promise<number|boolean>} The number of rows affected, or false on error.
   */
  async update(table, data, where, format = null, whereFormat = null) {
    if (!Array.isArray(data) || !Array.isArray(where)) {
      return false;
    }

    const processedData = this.processFields(table, data, format);
    if (processedData === false) {
      return false;
    }
    const processedWhere = this.processFields(table, where, whereFormat);
    if (processedWhere === false) {
      return false;
    }

    const fields = [];
    const conditions = [];
    const values = [];
    for (const [field, value] of Object.entries(processedData)) {
      if (value.value === null) {
        fields.push(`\`${field}\` = NULL`);
        continue;
      }

      fields.push(`\`${field}\` = ${value.format}`);
      values.push(value.value);
    }
    for (const [field, value] of Object.entries(processedWhere)) {
      if (value.value === null) {
        conditions.push(`\`${field}\` IS NULL`);
        continue;
      }

      conditions.push(`\`${field}\` = ${value.format}`);
      values.push(value.value);
    }

    const fieldString = fields.join(', ');
    const conditionString = conditions.join(' AND ');

    const sql = `UPDATE \`${table}\` SET ${fieldString} WHERE ${conditionString}`;

    this.checkCurrentQuery = false;
    return this.query(this.prepare(sql, values));
  }

  /**
   * Deletes a row in the table.
   *
   * @param {string} table Table name.
   * @param {Object} where Named array of WHERE clauses (column => value pairs).
   *                       Multiple clauses joined with ANDs; columns and values are raw.
   *                       Null value results in IS NULL, ignoring format.
   * @param {Array|string} [whereFormat=null] Formats for each value in WHERE.
   *                                          '%d', '%f', '%s'. Defaults to strings unless specified.
   * @return {Promise<number|boolean>} Number of rows deleted, or false on error.
   */
  async delete(table, where, whereFormat = null) {
    if (!Array.isArray(where)) {
      return false;
    }

    const processedWhere = this.processFields(table, where, whereFormat);
    if (processedWhere === false) {
      return false;
    }

    const conditions = [];
    const values = [];
    for (const [field, value] of Object.entries(processedWhere)) {
      if (value.value === null) {
        conditions.push(`\`${field}\` IS NULL`);
        continue;
      }

      conditions.push(`\`${field}\` = ${value.format}`);
      values.push(value.value);
    }

    const conditionString = conditions.join(' AND ');

    const sql = `DELETE FROM \`${table}\` WHERE ${conditionString}`;

    this.checkCurrentQuery = false;
    return this.query(this.prepare(sql, values));
  }

  /**
   * Processes arrays of field/value pairs and field formats.
   *
   * Handles pairing values with formats and ensures charset compatibility for db operations.
   *
   * @protected
   * @param {string} table Table name.
   * @param {Object} data Array of values keyed by their field names.
   * @param {Array|string} [format] Formats for the data.
   * @return {Array|boolean} Array of fields with paired value and formats, false on error.
   */
  processFields(table, data, format) {
    data = this.processFieldFormats(data, format);
    if (data === false) {
      return false;
    }

    data = this.processFieldCharsets(data, table);
    if (data === false) {
      return false;
    }

    data = this.processFieldLengths(data, table);
    if (data === false) {
      return false;
    }

    const convertedData = this.stripInvalidText(data);

    if (data !== convertedData) {
      const problemFields = [];
      Object.entries(data).forEach(([field, value]) => {
        if (value !== convertedData[field]) {
          problemFields.push(field);
        }
      });

      if (problemFields.length === 1) {
        this.lastError = `WordPress database error: Processing the value for the following field failed: ${problemFields[0]}. The supplied value may be too long or contains invalid data.`;
      } else {
        this.lastError = `WordPress database error: Processing the values for the following fields failed: ${problemFields.join(', ')}. The supplied values may be too long or contain invalid data.`;
      }
  
    }
  }

  /**
   * Prepares arrays of value/format pairs as passed to wpdb CRUD methods.
   *
   * @param {Object} data Array of values keyed by their field names.
   * @param {Array|string} [format] Formats mapped to values in data.
   * @return {Object} Array of values and formats keyed by their field names.
   */
  processFieldFormats(data, format) {
    const formats = Array.isArray(format) ? format : [];
    const originalFormats = [...formats];

    Object.entries(data).forEach(([field, value]) => {
      const formattedValue = {
        value,
        format: '%s',
      };

      if (format) {
        formattedValue.format = formats.shift() || originalFormats[0];
      } else if (this.fieldTypes[field]) {
        formattedValue.format = this.fieldTypes[field];
      }

      data[field] = formattedValue;
    });

    return data;
  }

  // Continue with methods for charset and length processing...

    /**
     * Adds field charsets to field/value/format arrays generated by processFieldFormats().
     *
     * @param {Object} data Values and formats, keyed by field names from processFieldFormats().
     * @param {string} table Table name.
     * @return {Object|boolean} Same data array with added charset info, or false if charset can't be resolved.
     */
    processFieldCharsets(data, table) {
      Object.entries(data).forEach(([field, value]) => {
        if (value.format === '%d' || value.format === '%f') {
          // Skip field if it isn't a string.
          value.charset = false;
        } else {
          value.charset = this.getColCharset(table, field);
          if (value.charset instanceof Error) { // Assuming an Error object is used
            throw new Error('Charset error');
          }
        }

        data[field] = value;
      });

      return data;
    }



  /**
   * Records the maximum string length that string fields can safely save.
   *
   * @param {Object} data Values, formats, and charsets keyed by field names from processFieldCharsets().
   * @param {string} table Table name.
   * @return {Object|boolean} Same data array with added length info, or false if length can't be resolved.
   */
  processFieldLengths(data, table) {
    Object.entries(data).forEach(([field, value]) => {
      if (value.format === '%d' || value.format === '%f') {
        // Skip field if it isn't a string.
        value.length = false;
      } else {
        value.length = this.getColLength(table, field);
        if (value.length instanceof Error) { // Assuming an Error object is used
          throw new Error('Length error');
        }
      }

      data[field] = value;
    });

    return data;
  }

  // Further field processing helpers...

  /**
   * Retrieves one value from the database.
   *
   * Executes a SQL query and returns a value from the result set.
   * If the result is multi-column or multi-row, a specific value indexed by x, y is returned.
   *
   * @param {string|null} [query=null] SQL query to execute, or null to use the previous result.
   * @param {number} [x=0] Column index of value to return, indexed from 0.
   * @param {number} [y=0] Row index of value to return, indexed from 0.
   * @return {string|null} Query result as string, or null on failure.
   */
  async getVar(query = null, x = 0, y = 0) {
    this.funcCall = `$db->get_var("${query}", ${x}, ${y})`;

    if (query) {
      if (this.checkCurrentQuery && this.checkSafeCollation(query)) {
        this.checkCurrentQuery = false;
      }

      await this.query(query);
    }

    // Extract variable from cached results based on x, y coordinates.
    let values;
    if (this.lastResult[y]) {
      values = Object.values(this.lastResult[y]);
    }

    // Return the value or null.
    return (values && values[x] !== undefined && values[x] !== '') ? values[x] : null;
  }

  // Other methods to safely query and retrieve database values...

  /**
   * Retrieves one row from the database.
   *
   * Executes a SQL query and returns a row from the result set.
   *
   * @param {string|null} [query=null] SQL query.
   * @param {string} [output='OBJECT'] The required return type. 'OBJECT', 'ARRAY_A', 'ARRAY_N'.
   * @param {number} [y=0] Row to return, indexed from 0.
   * @return {Object|Array|null} Query result in specified format, or null on failure.
   */
  async getRow(query = null, output = OBJECT, y = 0) {
    this.funcCall = `$db->get_row("${query}", ${output}, ${y})`;

    if (query) {
      if (this.checkCurrentQuery && this.checkSafeCollation(query)) {
        this.checkCurrentQuery = false;
      }

      await this.query(query);
    } else {
      return null;
    }

    if (!this.lastResult[y]) {
      return null;
    }

    const resultRow = this.lastResult[y];
    if (output === OBJECT || output.toUpperCase() === OBJECT) {
      return resultRow || null;
    }
    if (output === ARRAY_A) {
      return resultRow ? { ...resultRow } : null;
    }
    if (output === ARRAY_N) {
      return resultRow ? Object.values(resultRow) : null;
    }

    this.printError(' $db->get_row(string query, output type, int offset) -- Output type must be one of: OBJECT, ARRAY_A, ARRAY_N');
    return null;
  }

  // Methods supporting data retrieval and transformation...

  /**
   * Retrieves one column from the database.
   *
   * Executes a SQL query and returns a column from the result set.
   *
   * @param {string|null} [query=null] SQL query or defaults to previous execution.
   * @param {number} [x=0] Column index to return, indexed from 0.
   * @return {Array<*>} Query result column as an array indexed by row number.
   */
  async getCol(query = null, x = 0) {
    if (query) {
      if (this.checkCurrentQuery && this.checkSafeCollation(query)) {
        this.checkCurrentQuery = false;
      }

      await this.query(query);
    }

    const newArray = [];
    // Extract the column values.
    if (this.lastResult) {
      for (let i = 0, j = this.lastResult.length; i < j; i++) {
        newArray[i] = await this.getVar(null, x, i);
      }
    }

    return newArray;
  }

  // Additional data access utilities...

  /**
   * Retrieves an entire SQL result set from the database (i.e., many rows).
   *
   * Executes a SQL query and returns the full result set.
   *
   * @param {string|null} [query=null] SQL query.
   * @param {string} [output='OBJECT'] Output format: 'ARRAY_A', 'ARRAY_N', 'OBJECT', 'OBJECT_K'.
   * @return {Array|Object|null} Database query results in the specified format, or null if query fails.
   */
  async getResults(query = null, output = OBJECT) {
    this.funcCall = `$db->get_results("${query}", ${output})`;

    if (query) {
      if (this.checkCurrentQuery && this.checkSafeCollation(query)) {
        this.checkCurrentQuery = false;
      }

      await this.query(query);
    } else {
      return null;
    }

  // Support functions for result processing...
    const newArray = [];
    if (output === OBJECT) {
      // Return an integer-keyed array of row objects.
      return this.lastResult;
    } else if (output === OBJECT_K) {
      // Return an array of row objects keyed from column 1, discarding duplicates.
      if (this.lastResult) {
        for (const row of this.lastResult) {
          const varByRef = { ...row };
          const key = Object.values(varByRef)[0];
          if (!(key in newArray)) {
            newArray[key] = row;
          }
        }
      }
      return newArray;
    } else if (output === ARRAY_A || output === ARRAY_N) {
      // Return an integer-keyed array...
      if (this.lastResult) {
        if (output === ARRAY_N) {
          for (const row of this.lastResult) {
            // ...of integer-keyed row arrays.
            newArray.push(Object.values(row));
          }
        } else {
          for (const row of this.lastResult) {
            // ...of column name-keyed row arrays.
            newArray.push({ ...row });
          }
        }
      }
      return newArray;
    } else if (output.toUpperCase() === OBJECT) {
      // Compatibility for case-insensitive output.
      return this.lastResult;
    }
    return null;
  }

  /**
   * Retrieves the character set for the given table.
   *
   * @param {string} table Table name.
   * @return {string|Error} Table character set or error if not found.
   */
  getTableCharset(table) {
    const tableKey = table.toLowerCase();
    // Logic to get charset or return an error...
  }
  
  // Other charset handling methods...

  /**
   * Filters the table charset value before the DB is checked.
   *
   * Returning a non-null value will skip DB charset check, returning that value instead.
   *
   * @param {string|Error|null} [charset=null] The charset to use, or error if not found.
   * @param {string} table The table name being checked.
   */
  getTableCharset(table) {
    const tableKey = table.toLowerCase();
    let charset = null; // Placeholder for filtering logic, equivalent to apply_filters

    if (charset !== null) {
      return charset;
    }

    if (this.tableCharset[tableKey]) {
      return this.tableCharset[tableKey];
    }

    const charsets = new Set();
    const columns = {};

    const tableParts = table.split('.');
    const formattedTable = '`' + tableParts.join('`.`') + '`';
    const results = this.getResults(`SHOW FULL COLUMNS FROM ${formattedTable}`);
    if (!results) {
      return new Error('Could not retrieve table charset.');
    }

    for (const column of results) {
      const field = column.Field.toLowerCase();
      columns[field] = column;
    }

    this.colMeta[tableKey] = columns;

    for (const column of Object.values(columns)) {
      if (column.Collation) {
        const [charset] = column.Collation.split('_');
        charsets.add(charset.toLowerCase());
      }

      const [type] = column.Type.split('(');

      if (['BINARY', 'VARBINARY', 'TINYBLOB', 'MEDIUMBLOB', 'BLOB', 'LONGBLOB'].includes(type.toUpperCase())) {
        this.tableCharset[tableKey] = 'binary';
        return 'binary';
      }
    }

    // utf8mb3 is an alias for utf8.
    if (charsets.has('utf8mb3')) {
      charsets.add('utf8');
      charsets.delete('utf8mb3');
    }

    // Check if we have more than one charset in play.
    const count = charsets.size;
    if (count === 1) {
      charset = [...charsets][0];
    } else if (count === 0) {
      // No charsets, the table might store any character set.
      charset = false;
    } else {
      // More than one charset. Remove latin1 if present and recalculate.
      charsets.delete('latin1');
      const newCount = charsets.size;
      if (newCount === 1) {
        charset = [...charsets][0];
      } else if (newCount === 2 && charsets.has('utf8') && charsets.has('utf8mb4')) {
        charset = 'utf8';
      } else {
        charset = 'ascii';
      }
    }

    this.tableCharset[tableKey] = charset;
    return charset;
  }

  /**
   * Retrieves the character set for the given column.
   *
   * @param {string} table Table name.
   * @param {string} column Column name.
   * @return {string|false|Error} Column charset, false if none, or error.
   */
  getColCharset(table, column) {
    const tableKey = table.toLowerCase();
    const columnKey = column.toLowerCase();
    
    charset = applyFilters('pre_get_col_charset', null, table, column);
    if (charset !== null) {
        return charset;
    }

    // Return false if not using MySQL database.
    if (!this.isMySQL) {
      return false;
    }

    if (!this.tableCharset[tableKey]) {
      // Prime column information.
      const tableCharset = this.getTableCharset(table);
      if (tableCharset instanceof Error) {
        return tableCharset;
      }
    }

    // Return table charset if no column info.
    if (!this.colMeta[tableKey]) {
      return this.tableCharset[tableKey];
    }

    // Return table charset if column doesn't exist.
    if (!this.colMeta[tableKey][columnKey]) {
      return this.tableCharset[tableKey];
    }

    // Return false if not a string column.
    if (!this.colMeta[tableKey][columnKey].Collation) {
      return false;
    }

    const [charset] = this.colMeta[tableKey][columnKey].Collation.split('_');
    return charset;
  }

  /**
   * Retrieves the maximum string length allowed in a given column.
   *
   * Length may be specified as either byte length or character length.
   *
   * @param {string} table Table name.
   * @param {string} column Column name.
   * @return {Object|boolean|Error} Column length info, false if none, or error.
   */
  async getColLength(table, column) {
    const tableKey = table.toLowerCase();
    const columnKey = column.toLowerCase();

    // Return false if not using MySQL database.
    if (!this.isMySQL) {
      return false;
    }

    if (!this.colMeta[tableKey]) {
      // Prime column information.
      const tableCharset = this.getTableCharset(table);
      if (tableCharset instanceof Error) {
        return tableCharset;
      }
    }

    if (!this.colMeta[tableKey][columnKey]) {
      return false;
    }

    const typeInfo = this.colMeta[tableKey][columnKey].Type.split('(');

    const type = typeInfo[0].toLowerCase();
    const length = typeInfo[1] ? parseInt(typeInfo[1].replace(')', ''), 10) : false;

    switch (type) {
      case 'char':
      case 'varchar':
        return {
          type: 'char',
          length,
        };

      case 'binary':
      case 'varbinary':
        return {
          type: 'byte',
          length,
        };

      case 'tinyblob':
      case 'tinytext':
        return {
          type: 'byte',
          length: 255, // 2^8 - 1
        };

      case 'blob':
      case 'text':
        return {
          type: 'byte',
          length: 65535, // 2^16 - 1
        };

      case 'mediumblob':
      case 'mediumtext':
        return {
          type: 'byte',
          length: 16777215, // 2^24 - 1
        };

      case 'longblob':
      case 'longtext':
        return {
          type: 'byte',
          length: 4294967295, // 2^32 - 1
        };

      default:
        return false;
    }
  }

  /**
   * Checks if a string is ASCII.
   *
   * @param {string} inputString String to check.
   * @return {boolean} True if ASCII, false if not.
   */
  checkAscii(inputString) {
    // Use available encoding checks or regular expressions for ASCII validation.
    if (Buffer.isEncoding('ascii') && Buffer.from(inputString, 'ascii').toString('ascii') === inputString) {
      return true;
    }
    if (!/[^\\x00-\\x7F]/.test(inputString)) {
      return true;
    }
    return false;
  }


  /**
   * Checks if the query is accessing a collation considered safe on the current version of MySQL.
   *
   * @param {string} query The query to check.
   * @return {boolean} True if the collation is safe, false if it isn't.
   */
  checkSafeCollation(query) {
    if (this.checkingCollation) {
      return true;
    }

    query = query.trim().replace(/^\s*\(+\s*/, '');
    if (/^(SHOW|DESCRIBE|DESC|EXPLAIN|CREATE)\s/i.test(query)) {
      return true;
    }

    if (this.checkAscii(query)) {
      return true;
    }

    const table = this.getTableFromQuery(query);
    if (!table) {
      return false;
    }

    this.checkingCollation = true;
    const collation = this.getTableCharset(table);
    this.checkingCollation = false;

    if (collation === false || collation === 'latin1') {
      return true;
    }

    const lowerCaseTable = table.toLowerCase();
    if (!this.colMeta[lowerCaseTable]) {
      return false;
    }

    const safeCollations = new Set([
      'utf8_bin',
      'utf8_general_ci',
      'utf8mb3_bin',
      'utf8mb3_general_ci',
      'utf8mb4_bin',
      'utf8mb4_general_ci',
    ]);

    for (const col of Object.values(this.colMeta[lowerCaseTable])) {
      if (!col.Collation) {
        continue;
      }

      if (!safeCollations.has(col.Collation)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Strips any invalid characters based on value/charset pairs.
   *
   * @param {Array} data - Array of value objects, each with 'value', 'charset', and optionally 'length'.
   *                       Additional keys like 'field' are retained.
   * @return {Array|Error} The data array with invalid characters removed, or an error if the process fails.
   */
  async stripInvalidText(data) {
    let dbCheckString = false;

    for (const value of data) {
      const { charset } = value;

      let length = false;
      let truncateByByteLength = false;

      if (typeof value.length === 'object') {
        ({ length } = value.length);
        truncateByByteLength = value.length.type === 'byte';
      }

      if (charset === false) {
        continue;
      }

      if (typeof value.value !== 'string') {
        continue;
      }

      let needsValidation = true;
      if (
        charset === 'latin1' ||
        (value.ascii === undefined && this.checkAscii(value.value))
      ) {
        truncateByByteLength = true;
        needsValidation = false;
      }

      if (truncateByByteLength) {
        // Example: Using Buffer for safe operations
        if (length !== false && Buffer.byteLength(value.value, 'utf8') > length) {
          value.value = value.value.substring(0, length);
        }
        if (!needsValidation) {
          continue;
        }
      }
      needsValidation = false; // Reset for the next iteration if required

      // utf8 handling with regex for speedier operations is feasible in JS using Buffer
      if (['utf8', 'utf8mb3', 'utf8mb4'].includes(charset)) {
        const regex = new RegExp(
          '([\x00-\x7F]|[\xC2-\xDF][\x80-\xBF]|\xE0[\xA0-\xBF][\x80-\xBF]|[\xE1-\xEC][\x80-\xBF]{2}|\xED[\x80-\x9F][\x80-\xBF]|[\xEE-\xEF][\x80-\xBF]{2}' +
          (charset === 'utf8mb4' ? '|\xF0[\x90-\xBF][\x80-\xBF]{2}|[\xF1-\xF3][\x80-\xBF]{3}|\xF4[\x80-\x8F][\x80-\xBF]{2}' : '') +
          '){1,40}|.',
          'g'
        );

        value.value = value.value.replace(regex, '$1');

        if (length !== false && Buffer.from(value.value, 'utf8').length > length) {
          value.value = value.value.slice(0, length);
        }
        continue;
      }

      // If local conversions were insufficient, mark for DB check
      value.db = true;
      dbCheckString = true;
    }

    // Subsequent logic for interacting with the db and final cleanup...
    if (dbCheckString) {
      const queries = [];
      for (const [col, value] of Object.entries(data)) {
        if (value.db) {
          let charset = value.charset;
          if (value.length && value.length.type === 'byte') {
            charset = 'binary';
          }

          const connectionCharset = this.charset || this.dbh.characterSetName();

          const length = value.length ? Math.floor(value.length.length) : null;
          if (length !== null) {
            queries[col] = this.prepare(
              `CONVERT(SUBSTRING(CONVERT(? USING ?), 1, ?) USING ?)`,
              value.value,
              charset,
              length,
              connectionCharset
            );
          } else if (charset !== 'binary') {
            queries[col] = this.prepare(
              `CONVERT(CONVERT(? USING ?) USING ?)`,
              value.value,
              charset,
              connectionCharset
            );
          }

          delete data[col].db;
        }
      }

      const sql = Object.entries(queries).map(([column, query]) => query ? query + ` AS x_${column}` : null).filter(Boolean);

      this.checkCurrentQuery = false;
      const row = await this.getRow(`SELECT ${sql.join(', ')}`, ARRAY_A);
      if (!row) {
        throw new Error('Could not strip invalid text.');
      }

      for (const column of Object.keys(data)) {
        if (row[`x_${column}`] !== undefined) {
          data[column].value = row[`x_${column}`];
        }
      }
    }
    return data;
  }

  /**
   * Strips any invalid characters from the query.
   *
   * @param {string} query Query to convert.
   * @return {string|Error} The converted query, or an error if conversion fails.
   */
  stripInvalidTextFromQuery(query) {
    const trimmedQuery = query.trimStart();
    if (/^(SHOW|DESCRIBE|DESC|EXPLAIN|CREATE)\s/i.test(trimmedQuery)) {
      return query;
    }

    const table = this.getTableFromQuery(query);
    let charset;

    if (table) {
      charset = this.getTableCharset(table);
      if (charset instanceof Error) {
        return charset;
      }

      if (charset === 'binary') {
        return query;
      }
    } else {
      charset = this.charset;
    }

    let data = [{ value: query, charset, ascii: false, length: false }];

    data = this.stripInvalidText(data);
    if (data instanceof Error) {
      return data;
    }

    return data[0].value;
  }

  /**
   * Strips any invalid characters from the string for a given table and column.
   *
   * @param {string} table Table name.
   * @param {string} column Column name.
   * @param {string} value The text to check.
   * @return {string|Error} The converted string, or an error if conversion fails.
   */
  stripInvalidTextForColumn(table, column, value) {
    if (typeof value !== 'string') {
      return value;
    }

    const charset = this.getColCharset(table, column);
    if (!charset) {
      return value; // Not a string column.
    } else if (charset instanceof Error) {
      return charset; // Bail on real errors.
    }

    const data = {
      [column]: {
        value,
        charset,
        length: this.getColLength(table, column),
      },
    };

    const strippedData = this.stripInvalidText(data);
    if (strippedData instanceof Error) {
      return strippedData;
    }

    return strippedData[column].value;
  }

  /**
   * Finds the first table name referenced in a query.
   *
   * @param {string} query The query to search.
   * @return {string|boolean} The table name found, or false if not found.
   */
  getTableFromQuery(query) {
    let modifiedQuery = query.trimEnd(';/-#');
    modifiedQuery = modifiedQuery.trimStart().replace(/^\s*\(+\s*/, '');

    // Strip everything between parentheses except nested selects.
    modifiedQuery = modifiedQuery.replace(/\((?!\s*select)[^()]*?\)/gis, '()');

    // Quickly match most common queries.
    let match = modifiedQuery.match(/^(?:SELECT.*?\s+FROM|INSERT(?:\s+LOW_PRIORITY|\s+DELAYED|\s+HIGH_PRIORITY)?(?:\s+IGNORE)?(?:\s+INTO)?|REPLACE(?:\s+LOW_PRIORITY|\s+DELAYED)?(?:\s+INTO)?|UPDATE(?:\s+LOW_PRIORITY)?(?:\s+IGNORE)?|DELETE(?:\s+LOW_PRIORITY|\s+QUICK|\s+IGNORE)*(?:.+?FROM)?)\s+((?:[0-9a-zA-Z$_.`-]|[\xC2-\xDF][\x80-\xBF])+)/is);
    if (match) {
      return match[1].replace(/`/g, '');
    }

    // Check for SHOW TABLE STATUS or TABLES WHERE Name
    match = modifiedQuery.match(/^\s*SHOW\s+(?:TABLE\s+STATUS|(?:FULL\s+)?TABLES).+WHERE\s+Name\s*=\s*(["'])([0-9a-zA-Z$_.-]+)\1/is);
    if (match) {
      return match[2];
    }

    // Check for SHOW TABLE STATUS LIKE or TABLES LIKE
    match = modifiedQuery.match(/^\s*SHOW\s+(?:TABLE\s+STATUS|(?:FULL\s+)?TABLES)\s+(?:WHERE\s+Name\s+)?LIKE\s*(["'])([\\0-9a-zA-Z$_.-]+)%?\1/is);
    if (match) {
      return match[2].replace(/\\_/g, '_');
    }
    // Big pattern for the rest of the table-related queries.
    const regex = /^(?:(?:EXPLAIN\s+(?:EXTENDED\s+)?)?SELECT.*?\s+FROM|DESCRIBE|DESC|EXPLAIN|HANDLER|(?:LOCK|UNLOCK)\s+TABLE(?:S)?|(?:RENAME|OPTIMIZE|BACKUP|RESTORE|CHECK|CHECKSUM|ANALYZE|REPAIR).*\s+TABLE|TRUNCATE(?:\s+TABLE)?|CREATE(?:\s+TEMPORARY)?\s+TABLE(?:\s+IF\s+NOT\s+EXISTS)?|ALTER(?:\s+IGNORE)?\s+TABLE|DROP\s+TABLE(?:\s+IF\s+EXISTS)?|CREATE(?:\s+\w+)?\s+INDEX.*\s+ON|DROP\s+INDEX.*\s+ON|LOAD\s+DATA.*INFILE.*INTO\s+TABLE|(?:GRANT|REVOKE).*ON\s+TABLE|SHOW\s+(?:.*FROM|.*TABLE))\s+\(*\s*(([0-9a-zA-Z$_.`-]|[\xC2-\xDF][\x80-\xBF])+)/is;
    match = modifiedQuery.match(regex);
    if (match) {
      return match[1].replace(/`/g, '');
    }

    return false;
  }

  /**
   * Loads the column metadata from the last query.
   */
  loadColInfo() {
    if (this.colInfo) {
      return;
    }

    const numFields = this.result.fields.length;

    for (let i = 0; i < numFields; i++) {
      this.colInfo[i] = this.result.fields[i];
    }
  }

  /**
   * Retrieves column metadata from the last query.
   *
   * @param {string} [infoType='name'] Possible values include 'name', 'table', 'def', 'max_length', 'not_null', 'primary_key', 'multiple_key', 'unique_key', 'numeric', 'blob', 'type', 'unsigned', 'zerofill'.
   * @param {number} [colOffset=-1] The offset for col info (0: name, 1: table, etc.).
   * @return {*} Column results.
   */
  getColInfo(infoType = 'name', colOffset = -1) {
    this.loadColInfo();
    if (this.colInfo) {
      if (colOffset === -1) {
        return this.colInfo.map(col => col[infoType]);
      }
      return this.colInfo[colOffset][infoType];
    }
  }

  /**
   * Starts the timer for debugging purposes.
   *
   * @return {boolean} True after starting the timer.
   */
  timerStart() {
    this.timeStart = Date.now();
    return true;
  }

  /**
   * Stops the debugging timer.
   *
   * @return {number} Total time spent on the operation, in seconds.
   */
  timerStop() {
    return (Date.now() - this.timeStart) / 1000;
  }

  /**
   * Wraps errors in a nice header and footer and terminates the process.
   *
   * Will not terminate if showErrors is false.
   *
   * @param {string} message The error message.
   * @param {string} [errorCode='500'] Optional error code.
   * @return {void|boolean} Void if showing errors is enabled, false if disabled.
   */
  bail(message, errorCode = '500') {
    if (this.showErrors) {
      let error = this.dbh ? this.dbh.error : (this.dbh.connectionError ? this.dbh.connectionError : '');

      if (error) {
        console.error(`<p><code>${error}</code></p>
${message}`);
      } else {
        console.error(message);
      }
      process.exit(1); // Terminate the process
    } else {
      const WPError = global.WPError;
      this.error = WPError ? new WPError(errorCode, message) : message;
      return false;
    }
  }

  /**
   * Closes the current database connection.
   *
   * @return {boolean} True if the connection was closed successfully, false otherwise.
   */
  close() {
    if (!this.dbh) {
      return false;
    }

    try {
      const closed = this.dbh.end(); // Assuming `.end()` method to close connection
      if (closed) {
        this.dbh = null;
        this.ready = false;
        this.hasConnected = false;
      }
      return closed;
    } catch (e) {
      console.error('Error closing database connection:', e);
      return false;
    }
  }

  /**
   * Determines whether MySQL database is at least the required minimum version.
   *
   * @return {void|Error} Error if MySQL version is not sufficient.
   */
  checkDatabaseVersion() {
    const requiredMySQLVersion = global.requiredMySQLVersion;
    const wpVersion = getWPVersion();

    // Ensure the server meets the MySQL version requirement.
    if (this.dbVersion() < requiredMySQLVersion) {
      return new Error(`Error: WordPress ${wpVersion} requires MySQL ${requiredMySQLVersion} or higher`);
    }
  }

  /**
   * Retrieves the database character collate.
   *
   * @return {string} The database character collate.
   */
  getCharsetCollate() {
    let charsetCollate = '';

    if (this.charset) {
      charsetCollate = `DEFAULT CHARACTER SET ${this.charset}`;
    }
    if (this.collate) {
      charsetCollate += ` COLLATE ${this.collate}`;
    }

    return charsetCollate;
  }

  // More methods related to database capabilities and checks...

  /**
   * Determines whether the database or WPDB supports a particular feature.
   *
   * Capability sniffs for the database server and current version of WPDB.
   *
   * @param {string} dbCap Feature to check, like 'collation', 'group_concat', 'utf8mb4', etc.
   * @return {boolean} True if the feature is supported, false otherwise.
   */
  hasCap(dbCap) {
    let dbVersion = this.dbVersion();
    let dbServerInfo = this.dbServerInfo();

    // Handling MariaDB version prefixes for older PHP versions.
    if (
      dbVersion === '5.5.5' &&
      dbServerInfo.includes('MariaDB') &&
      parseInt(process.versions.node.split('.')[0]) < 8 // Checking Node.js major version for illustrative purposes
    ) {
      dbServerInfo = dbServerInfo.replace(/^5\.5\.5-(.*)/, '$1');
      dbVersion = dbServerInfo.replace(/[^0-9.].*/, '');
    }

    // Implement checks for specific features based on dbVersion and other logic
    switch (dbCap.toLowerCase()) {
      case 'collation':
      case 'group_concat':
      case 'subqueries':
        return parseFloat(dbVersion) >= 4.1;
      case 'set_charset':
        return parseFloat(dbVersion) >= 5.0; // Changed from 5.0.7 to 5.0
      case 'utf8mb4':
        return true;
      case 'utf8mb4_520':
        return parseFloat(dbVersion) >= 5.6;
      case 'identifier_placeholders':
        return true;
      default:
        return false;
    }
  }

  /**
   * Retrieves a comma-separated list of the names of the functions that called wpdb.
   *
   * @return {string} Comma-separated list of the calling functions.
   */
  getCaller() {
    return (new Error()).stack.split('\n').slice(2).map(line => line.trim()).join(', ');
  }

  /**
   * Retrieves the database server version.
   *
   * @return {string|null} Version number on success, null on failure.
   */
  dbVersion() {
    return this.dbServerInfo().replace(/[^0-9.].*/, '');
  }

  /**
   * Returns the version of the MySQL server.
   *
   * @return {string} Server version as a string.
   */
  dbServerInfo() {
    return this.dbh.serverVersion; // Assuming property for server version
  }

  // Closing class WPDB and adding any final utilities...
}
