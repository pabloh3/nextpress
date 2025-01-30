import { envConfig } from '../wp-config.js';
import wpdb from '../wp-includes/class-wpdb.js';

describe('wpdb', () => {
    test('should execute a SELECT query correctly', async () => {
        const results = await wpdb.query('SELECT * FROM wp_posts');
        expect(results).toEqual([{ id: 1, name: 'Test' }]);
    });

    test('should handle empty query results', async () => {
        const results = await wpdb.query('SELECT * FROM wp_comments');
        expect(results).toEqual([]);
    });

    // Add more tests for methods like get_results, insert, update, delete
});
