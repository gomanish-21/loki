from datetime import datetime
from app.config import get_collections


def initialize_sample_info():
    """Initialize sample information documents"""
    try:
        collections = get_collections()
        info_collection = collections["info"]

        if info_collection.count_documents({}) == 0:
            sample_documents = [
                {
                    "title": "Getting Started with SQL",
                    "category": "Tutorials",
                    "content": """
# Getting Started with SQL

SQL (Structured Query Language) is a standard language for managing and manipulating databases.

## Basic SQL Commands

### SELECT Statement
The SELECT statement is used to retrieve data from a database.

```sql
SELECT column1, column2 FROM table_name;
```

### WHERE Clause
The WHERE clause is used to filter records.

```sql
SELECT * FROM users WHERE age > 25;
```

### INSERT Statement
The INSERT statement is used to insert new records.

```sql
INSERT INTO users (name, email, age) VALUES ('John Doe', 'john@example.com', 30);
```

## Best Practices

1. Always use meaningful table and column names
2. Use proper indentation for readability
3. Comment your complex queries
4. Test your queries before running them in production
                    """,
                    "tags": ["sql", "database", "tutorial", "beginner"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "author": "System",
                    "is_published": True,
                },
                {
                    "title": "SQL Formatting Guidelines",
                    "category": "Guidelines",
                    "content": """
# SQL Formatting Guidelines

Proper SQL formatting improves readability and maintainability of your code.

## Indentation Rules

### Basic Indentation
- Use 2 or 4 spaces for indentation
- Be consistent throughout your codebase

### SELECT Statement Formatting
```sql
SELECT 
    column1,
    column2,
    column3
FROM 
    table_name
WHERE 
    condition1
    AND condition2
ORDER BY 
    column1 ASC;
```

### JOIN Statement Formatting
```sql
SELECT 
    t1.column1,
    t2.column2
FROM 
    table1 t1
    INNER JOIN table2 t2 ON t1.id = t2.id
WHERE 
    t1.status = 'active';
```

## Naming Conventions

1. Use UPPERCASE for SQL keywords
2. Use lowercase for table and column names
3. Use snake_case for multi-word names
4. Use descriptive names that explain the purpose
                    """,
                    "tags": ["sql", "formatting", "guidelines", "best-practices"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "author": "System",
                    "is_published": True,
                },
                {
                    "title": "Database Performance Tips",
                    "category": "Performance",
                    "content": """
# Database Performance Tips

Optimizing your database queries can significantly improve application performance.

## Indexing Best Practices

### When to Use Indexes
- Primary keys (automatically indexed)
- Foreign keys
- Columns used in WHERE clauses
- Columns used in ORDER BY clauses
- Columns used in JOIN conditions

### Example Index Creation
```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_date ON orders(order_date);
```

## Query Optimization

### Avoid SELECT *
Instead of:
```sql
SELECT * FROM users;
```

Use:
```sql
SELECT id, name, email FROM users;
```

### Use LIMIT for Large Results
```sql
SELECT * FROM orders ORDER BY created_at DESC LIMIT 100;
```

### Optimize JOINs
```sql
SELECT 
    u.name,
    o.order_date
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active';
```

## Monitoring Performance

1. Use EXPLAIN to analyze query execution plans
2. Monitor slow query logs
3. Regularly review and optimize indexes
4. Consider query caching for frequently used queries
                    """,
                    "tags": ["database", "performance", "optimization", "indexing"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "author": "System",
                    "is_published": True,
                },
                {
                    "title": "Common SQL Mistakes",
                    "category": "Troubleshooting",
                    "content": """
# Common SQL Mistakes and How to Avoid Them

## 1. Missing WHERE Clause in UPDATE/DELETE

### ❌ Wrong
```sql
UPDATE users SET status = 'inactive';
-- This updates ALL users!
```

### ✅ Correct
```sql
UPDATE users SET status = 'inactive' WHERE id = 123;
```

## 2. Incorrect JOIN Syntax

### ❌ Wrong
```sql
SELECT * FROM users, orders WHERE users.id = orders.user_id;
```

### ✅ Correct
```sql
SELECT * FROM users INNER JOIN orders ON users.id = orders.user_id;
```

## 3. Using Reserved Words as Identifiers

### ❌ Wrong
```sql
CREATE TABLE order (
    id INT PRIMARY KEY
);
```

### ✅ Correct
```sql
CREATE TABLE orders (
    id INT PRIMARY KEY
);
```

## 4. Not Handling NULL Values

### ❌ Wrong
```sql
SELECT * FROM users WHERE age = 25;
-- This excludes users with NULL age
```

### ✅ Correct
```sql
SELECT * FROM users WHERE age = 25 OR age IS NULL;
```

## 5. Forgetting to Use DISTINCT

### ❌ Wrong
```sql
SELECT category FROM products;
-- May return duplicates
```

### ✅ Correct
```sql
SELECT DISTINCT category FROM products;
```

## Prevention Tips

1. Always test your queries on a small dataset first
2. Use transactions for critical operations
3. Backup your data before running destructive queries
4. Use parameterized queries to prevent SQL injection
5. Review your queries before execution
                    """,
                    "tags": ["sql", "mistakes", "troubleshooting", "best-practices"],
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                    "author": "System",
                    "is_published": True,
                },
            ]

            for doc in sample_documents:
                info_collection.insert_one(doc)

            print("Sample information documents initialized")
    except Exception as e:
        print(f"Error initializing sample info: {e}")
