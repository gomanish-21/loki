// MongoDB initialization script for the formatter application
// This script runs when the MongoDB container starts for the first time

// Switch to the formatter database
db = db.getSiblingDB("formatter_db");

// Create the formatting_history collection
db.createCollection("formatting_history");

// Create indexes for better performance
db.formatting_history.createIndex({ timestamp: -1 });
db.formatting_history.createIndex({ format_type: 1 });
db.formatting_history.createIndex({ timestamp: -1, format_type: 1 });

// Create a TTL index to automatically delete old records (optional)
// Uncomment the line below if you want to automatically delete records older than 30 days
// db.formatting_history.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 2592000 });

// Insert some sample data for testing (optional)
db.formatting_history.insertMany([
  {
    content: '{"name":"John Doe","age":30,"email":"john@example.com"}',
    formatted_content:
      '{\n  "name": "John Doe",\n  "age": 30,\n  "email": "john@example.com"\n}',
    format_type: "json",
    timestamp: new Date(),
    indent_size: 2,
  },
  {
    content: "SELECT name,age FROM users WHERE age>25 ORDER BY name;",
    formatted_content:
      "SELECT\n    name,\n    age\nFROM\n    users\nWHERE\n    age > 25\nORDER BY\n    name;",
    format_type: "sql",
    timestamp: new Date(),
    indent_size: 4,
  },
]);

print("MongoDB initialization completed successfully!");
print("Database: formatter_db");
print("Collection: formatting_history");
print("Indexes created for optimal performance");
