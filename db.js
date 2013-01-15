/**
 * A wrapper on Web SQL Database API. It also provides some handy helpers such as create table, select, insert, update and delete.
 *
 * @author     Abdullah Ibrahim
 * @copyright  (c) 2013 designcode.me
 */

var db = {

	/**
	 * @var  Boolean, when connection is established it set to true
	 */
    connected: false,
    
    /**
	 * @var  Integer, with every new query executed, +1 is added to this variable and it becomes the ID of that query
	 */
    query_id: 0,

 	/**
	 * @var  Array, All the queries are stored in this variable
	 */
    sql: [],
    
    /**
	 * @var  Array, holds the query results
	 */
    result: [],
    
    
	/**
	 * Kind of Constructor. Add __bind to Function prototype for easier binding of objects (Taken from prototype.js). 
	 * Also add simple functioanlity that javascript lacks. 
	 * Had Javascript been a proper object oriented language, we would have called it constructor.
	 * It is called by connect method so you don't need to call it yourself
	 *
	 */
    init: function () {
        
        if(typeof __bind === 'undefined') {
            
            Function.prototype.__bind = function (context)
            {
                if (arguments.length < 2 && typeof arguments[0] === "undefined") return this;
                var __method = this, args = slice.call(arguments, 1);
                
                return function() {
                    var a = merge(args, arguments);
                    return __method.apply(context, a);
                }
            }

            Object.prototype.merge = function (o2) {

				o1 = this.valueOf();
				for(var i in o2) {
					o1[i] = o2[i];
				}
				
				return o1;
			}

			merge = function(array, args) {
	            array = slice.call(array, 0);
	            return update(array, args);
	        }
	        
	        update = function(array, args) {
	            var arrayLength = array.length, length = args.length;
	            while (length--) array[arrayLength + length] = args[length];
	            return array;
	        }
	        
	        slice = Array.prototype.slice;
        }
        
    },
    
    /**
	 * Establish connection with database
	 *
	 * @param 	object		info		A javascript object (key: value pair). Must have name key. Optional keys are version, display_name, size
	 */
    connect: function (info) {
        
        this.init();

        var defaults = {
			version			:	'1.0',
			size			:	102400,
			display_name	:	info.name
		};

		info = defaults.merge(info || {});
        
        if(window.openDatabase)
        {
        	this.shell = window.openDatabase(info.name, info.version, info.display_name, info.size);
	        
	        if(this.shell)
	            this.connected = true;
        }
        else
        	console.log('The browser you are using does not support local storage');
    },
    
    /**
	 * Helper function to create tables
	 *
	 * @param 	array		info		An array of objects, each object containing information about table and its fields
	 * @example
	 * db.create_table([{
			name: 'test_table', 
			fields: [
				{name: 'id', type: 'INTEGER PRIMARY KEY'},
				{name: 'title', type: 'VARCHAR'}
			]
		}, {
			name: 'test_2', 
			fields: [
				{name: 'id', type: 'INTEGER PRIMARY KEY'},
				{name: 'title', type: 'VARCHAR'},
				{name: 'another_field', type: 'DECIMAL'}
			]
		}]);
	 *
	 */
    create_table: function (info, drop) {
        
        for(x in info) {
				
			if(info.hasOwnProperty(x)) {
				table = info[x];
				
				if(drop)
					this.query('DROP TABLE IF EXISTS '+table.name);
				
				query = 'CREATE TABLE IF NOT EXISTS '+table.name+'(';
				
				fields = table.fields;
				for(y in fields) {
					if(fields.hasOwnProperty(y)) {
						field = fields[y];
						query += field.name+' '+field.type + ',';
					}
				}
				
				query = query.substring(0, query.length-1);
				query += ')';
				
				this.query(query);
			}
			
		}
        
    },
    
    /**
	 * Executes a query
	 *
	 * @param 	string		sql			The query to execute
	 * @param 	function	callback	The function to call when query is executed successfully
	 * @return	integer		query_id	The ID of the query
	 */
    query: function (sql, callback) {
        
        if(this.connected) {
            
            this.query_id++;
            
            this.shell.transaction(function (tx) {
                
                this.sql[this.query_id] = sql;
                
                tx.executeSql(this.sql[this.query_id], [], function (tx, result) {
                    
                    this.result[this.query_id] = result;
					
					if(callback)
						callback(result);
                    
                }.__bind(this), this.error.__bind(this));
                
            }.__bind(this));
            
            return this.query_id;
            
        } else {
            
            console.log('You are not connected to DB');
            
        }
        
    },

	/**
	 * Helper function for select
	 *
	 * @param 	string		table		Name of table to select from
	 * @param 	object		options		A javascript object (key: value pair).
	 * 									fields		:	Name of fields to be selected, defaults to *
	 * 									order_by	:	sort the result-set by a specified column, defaults to none
	 * 									sort		:	sort ascending or descending, defaults to none
	 * @return	integer		query_id	The ID of the query
	 */
	select: function (table, options) {
		
		query = 'select ';

		if(options.fields)
			query += options.fields;
		else
			query += '*';

		query += ' from '+table+'';
		
		if(options.order_by)
			query += ' order by '+options.order_by;
		
		if(options.sort)
			query += ' '+options.sort;
		
		if(options.limit)
			query += ' limit '+options.limit;
		
		query_id = db.query(query, options.callback || false);
		
		return query_id;
		
	},
    
    /**
	 * Get rows returned by a query
	 *
	 * @param	integer		query_id	The ID of the query
	 * @return	object		rows		Returns the rows that were fetched against the query_id provided
	 */
    rows: function (query_id) {
        
        if(query_id)
            this.query_id = query_id;
        
        return this.result[this.query_id].rows;
        
    },
    
    /**
	 * Get number of rows returned by a query
	 *
	 * @param	integer		query_id	The ID of the query
	 * @return	integer		num_rows	Returns the number of rows that were fetched against the query_id provided
	 */
    num_rows: function (query_id) {
        
        if(query_id)
            this.query_id = query_id;
        
        return this.result[this.query_id].rows.length;
        
    },
	
	/**
	 * Helper function for insert
	 *
	 * @param 	string		table		Name of table where data needs to be inserted
	 * @param 	object		options		A javascript object (key: value pair).
	 * 									fields		:	An array containing name of columns
	 * 									values		:	An array containing values. Every value's index must correspond to that of fields array
	 * 									sort		:	sort ascending or descending, defaults to none
	 * 									callback	:	The function to call when query is executed successfully
	 */
	insert: function (table, options) {
		
		query = 'insert into '+table+' (';
		
		fields = options.fields;
		values = options.values;
		
		for(y in fields) {
		
			if(fields.hasOwnProperty(y)) {
				
				field = fields[y];
				
				query += '`' + field + '`,';
				
			}
			
		}
		
		query = query.substring(0, query.length-1);
		
		query += ') VALUES (';
		
		
		for(y in values) {
		
			if(fields.hasOwnProperty(y)) {
				
				value = values[y];
				
				query += "'" + value + "',";
				
			}
			
		}
		
		query = query.substring(0, query.length-1);
		
		query += ')';
		
		this.query(query, options.callback || false);
		
	},
	
	/**
	 * Helper function for update
	 *
	 * @param 	string		table		Name of table where data needs to be updated
	 * @param 	object		options		A javascript object (key: value pair).
	 * 									id			:	The id of the row, must be provided
	 * 									data		:	A key value pair in which key correspond to name of column and value correspond to value to value of column
	 * 									callback	:	The function to call when query is executed successfully
	 */
	update: function (table, options) {
		
		if( ! options.id)
			return false;
		
		query = 'update '+table+' set ';

		for(y in options.data) {
			query += '`' + y + '` = "' + options.data[y] + '",';
		}
		
		query = query.substring(0, query.length-1);
		
		query += ' where id = '+options.id;
		
		this.query(query, options.callback || false);
		
	},
	
	/**
	 * Helper function for update
	 *
	 * @param 	string		table		Name of table
	 * @param 	object		options		A javascript object (key: value pair).
	 * 									id			:	The id of the row, must be provided
	 * 									callback	:	The function to call when query is executed successfully
	 */
	delete: function (table, options) {
		
		if( ! options.id)
			return false;
		
		query = 'delete from '+table+' where id = "'+options.id+'"';
		this.query(query, options.callback || false);
		
	},
    
	
	/**
	 * Error Function. This function is called by query method. You can modify to show some friendly errors
	 *
	 */
    error: function () {
        
        console.log(arguments);
        
    }

}