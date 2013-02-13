# DB.JS
DB.JS is a wrapper on Web SQL Database API. It also provides some handy helpers such as create table, select, insert, update and delete.

## Getting Started
This class assumes that you have knowledge of Web SQL Database API. If not, check this link http://www.w3.org/TR/webdatabase/

## Usage
First you must include db.js in your html
	<script type="text/javascript" src="db.js"></script>

### Connecting to DB
	db.connect({
		'name' : 'test',
		'version' : '1.0',
		'display_name': 'Test Database',
		'size': 102400
	});

### Creating New Table
	db.create_table([{
		name: 'students', 
		fields: [
			{name: 'id', type: 'INTEGER PRIMARY KEY'},
			{name: 'name', type: 'VARCHAR'}
		]
	}, {
		name: 'courses', 
		fields: [
			{name: 'id', type: 'INTEGER PRIMARY KEY'},
			{name: 'name', type: 'VARCHAR'}
		]
	}, {
		name: 'student_courses', 
		fields: [
			{name: 'id', type: 'INTEGER PRIMARY KEY'},
			{name: 'student_id', type: 'INTEGER'}
			{name: 'course_id', type: 'VARCHAR'}
		]
	}]);

### Creating table and dropping table if one exists with same name
	db.create_table([{
		name: 'students', 
		fields: [
			{name: 'id', type: 'INTEGER PRIMARY KEY'},
			{name: 'name', type: 'VARCHAR'}
		]
	}], true);

### Querying
	db.query('select * from students where id > 100', function (results) {
		console.log(results);
	});

### Using Select Helper
	db.select('students', {
		limit: 10,
		order_by: 'id',
		sort: 'DESC',
		callback: function (results) {
			// Number of Rows
			console.log(results.rows.length);

			for(i = 0; i < results.rows.length; i++) {
				// Returns a object that has keys and values that correspond to column name and values respectively
				console.log(results.rows.item(i));
			}
		}
	});

### Using Insert Helper
	db.insert('student_courses', {
		fields: ['student_id', 'course_id'], 
		values: ['100', '50'],
		callback: function (results) {
			// Returns the last insert id
			console.log(results.insertId);
		}
	});

### Using Update Helper
	db.update('students', {
		id: '5',
		data: {
			'name': 'designcode'
		},
		callback: function (results) {
			console.log(results);
		}
	});

### Using Delete Helper
	db.delete('students', {
		id: '5',
		callback: function (results) {
			console.log(results);
		}
	});

## TODO
Make a where clause helper to use in helper functions