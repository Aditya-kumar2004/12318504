# Notification System Design
# Notification System Design

---

# Stage 1 — REST API Design

## Objective

Design a scalable notification system for students where users receive notifications related to:

- Events
- Results
- Placements

The system should support:

- Real-time notification delivery
- Read/unread tracking
- Pagination
- Filtering
- Secure authentication
- Scalable architecture

---

# Authentication

All APIs require Bearer Token authentication.

## Header Format

```http
Authorization: Bearer <access_token>
```

---

# Base URL

```http
/api/v1
```

---

# Notification Object Schema

```json
{
  "id": "string",
  "studentId": "string",
  "type": "Event | Result | Placement",
  "title": "string",
  "message": "string",
  "priority": "low | medium | high",
  "isRead": false,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

# API Design

---

# 1. Get All Notifications

## Endpoint

```http
GET /notifications
```

## Description

Fetch all notifications for the logged-in student.

---

## Query Parameters

| Parameter | Type | Description |
|----------|------|-------------|
| page | number | Current page number |
| limit | number | Notifications per page |
| notification_type | string | Event / Result / Placement |

---

## Request Headers

```http
Authorization: Bearer <token>
```

---

## Success Response

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 120,
  "data": [
    {
      "id": "1",
      "type": "Placement",
      "title": "Afford Hiring Drive",
      "message": "Afford hiring drive scheduled on Thursday",
      "priority": "high",
      "isRead": false,
      "createdAt": "14/05/2026"
    }
  ]
}
```

---

## Error Response

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid access token"
  }
}
```

---

# 2. Get Single Notification

## Endpoint

```http
GET /notifications/:id
```

## Description

Fetch a single notification using notification ID.

---

## Success Response

```json
{
  "success": true,
  "data": {
    "id": "1",
    "type": "Result",
    "title": "Semester Result",
    "message": "Semester 6 results published",
    "priority": "high",
    "isRead": true,
    "createdAt": "14/05/2026"
  }
}
```

---

# 3. Create Notification (Admin)

## Endpoint

```http
POST /notifications
```

## Description

Admin creates a new notification.

---

## Request Body

```json
{
  "studentId": "12345",
  "type": "Placement",
  "title": "Afford Hiring Drive",
  "message": "Afford hiring drive starts tomorrow",
  "priority": "high"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Notification created successfully"
}
```

---

# 4. Mark Notification As Read

## Endpoint

```http
PATCH /notifications/:id/read
```

## Description

Mark a notification as read.

---

## Success Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

# 5. Mark All Notifications As Read

## Endpoint

```http
PATCH /notifications/read-all
```

## Description

Mark all notifications as read for logged-in student.

---

## Success Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

# Pagination Strategy

Pagination is implemented using:

- page
- limit

Example:

```http
GET /notifications?page=1&limit=10
```

Benefits:

- Reduces server load
- Faster API response
- Better frontend performance

---

# Filtering Strategy

Notifications can be filtered by type.

Example:

```http
GET /notifications?notification_type=Placement
```

---

# Real-Time Notification Mechanism

The system uses WebSockets for real-time notification delivery.

---

# Why WebSockets?

WebSockets provide:

- Instant notification delivery
- Persistent bidirectional connection
- Low latency communication
- Better scalability for real-time systems

---

# Alternative Approaches Considered

| Technology | Advantages | Disadvantages |
|------------|------------|---------------|
| Polling | Easy implementation | High DB load |
| Long Polling | Better than polling | Inefficient at scale |
| SSE | Lightweight | One-way communication |
| WebSocket | Real-time + scalable | Slightly complex |

---

# Chosen Approach

WebSocket is selected because the application requires scalable real-time communication for thousands of concurrent students.

---

# Standard Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Notification not found"
  }
}
```

---

# Security Considerations

- Bearer token authentication
- Input validation
- Authorization checks
- Rate limiting
- Secure HTTPS communication

---

# Scalability Considerations

- Pagination for large datasets
- WebSocket-based real-time delivery
- Optimized database indexing
- Caching frequently accessed notifications

---


# Stage 2 — Database Design

---

# Database Choice

## Selected Database: PostgreSQL

PostgreSQL is chosen because:

- Strong ACID compliance
- Excellent support for relational data
- Efficient indexing
- High scalability
- Powerful query optimization
- Reliable transactional support
- Better performance for complex filtering and pagination

---

# Why Not MongoDB?

MongoDB is schema-flexible but this system requires:

- Strong relationships
- Read/unread consistency
- Efficient filtering
- Transaction support
- Structured notification data

Relational databases are more suitable for this use case.

---

# Main Tables

The system contains:

1. students
2. notifications

---

# Students Table Schema

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Notifications Table Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES students(id),
    type VARCHAR(20),
    title VARCHAR(255),
    message TEXT,
    priority VARCHAR(20),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# Column Explanation

| Column | Purpose |
|--------|----------|
| id | Unique notification identifier |
| student_id | Notification owner |
| type | Event / Result / Placement |
| title | Notification title |
| message | Detailed message |
| priority | low / medium / high |
| is_read | Read/unread tracking |
| created_at | Notification creation timestamp |
| updated_at | Last update timestamp |

---

# Database Relationships

- One student can have many notifications
- Each notification belongs to one student

Relationship:

```txt
Student 1 -----> Many Notifications
```

---

# Indexing Strategy

Indexes are required for faster query execution.

---

# Recommended Indexes

```sql
CREATE INDEX idx_student_id
ON notifications(student_id);

CREATE INDEX idx_is_read
ON notifications(is_read);

CREATE INDEX idx_created_at
ON notifications(created_at);

CREATE INDEX idx_student_read_created
ON notifications(student_id, is_read, created_at);
```

---

# Why Composite Index?

The application frequently runs queries like:

```sql
SELECT *
FROM notifications
WHERE student_id = ?
AND is_read = false
ORDER BY created_at DESC;
```

Composite indexes improve:

- filtering speed
- sorting speed
- query execution time

---

# Handling Large Scale Data

## Expected Scale

- 50,000 students
- 5 million notifications

----

# Problems At Large Scale

As data grows:

- Full table scans become expensive
- Query latency increases
- Sorting operations become slower
- Database memory usage increases
- Concurrent traffic increases

---

# Scalability Strategies

## 1. Pagination

Instead of loading all notifications:

```http
GET /notifications?page=1&limit=10
```

Benefits:

- smaller query size
- lower memory usage
- faster responses

---

## 2. Indexing

Indexes improve:

- filtering
- searching
- sorting

Without indexes:
- database scans all rows

With indexes:
- direct lookup becomes possible

---

## 3. Partitioning

Notifications table can be partitioned by:

- created_at
- student_id

Benefits:

- smaller active partitions
- faster queries
- easier maintenance

---

# Example Partitioning Strategy

Monthly partitions:

```txt
notifications_2026_01
notifications_2026_02
notifications_2026_03
```

---

## 4. Caching

Frequently accessed notifications can be cached using Redis.

Benefits:

- reduces DB load
- improves response time
- handles high traffic

---

## 5. Read Replicas

Use read replicas for:

- fetching notifications
- analytics queries
- reporting

Primary DB handles writes.
Replicas handle reads.

This improves scalability.

---

# SQL Queries Based On APIs

---

# 1. Fetch Notifications

```sql
SELECT *
FROM notifications
WHERE student_id = $1
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

---

# 2. Fetch Notifications By Type

```sql
SELECT *
FROM notifications
WHERE student_id = $1
AND type = 'Placement'
ORDER BY created_at DESC
LIMIT 10 OFFSET 0;
```

---

# 3. Fetch Single Notification

```sql
SELECT *
FROM notifications
WHERE id = $1;
```

---

# 4. Mark Notification As Read

```sql
UPDATE notifications
SET is_read = TRUE,
updated_at = CURRENT_TIMESTAMP
WHERE id = $1;
```

---

# 5. Mark All Notifications As Read

```sql
UPDATE notifications
SET is_read = TRUE,
updated_at = CURRENT_TIMESTAMP
WHERE student_id = $1;
```

---

# Future Improvements

- Redis caching
- Kafka event streaming
- Database sharding
- Notification archival
- Async processing queues

---

# Conclusion

PostgreSQL is selected because it provides:

- scalability
- strong consistency
- indexing support
- efficient querying
- transactional reliability

The proposed schema and indexing strategy can efficiently support millions of notifications and tens of thousands of concurrent students.

# Stage 3 — Query Optimization

---

# Problem Statement

The following query becomes slow at large scale:

```sql
SELECT * FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at ASC;
```

---

# Why Is This Query Slow?

The system contains:

- 50,000 students
- 5 million notifications

At this scale, the query becomes slow because of several reasons.

---

# 1. Full Table Scan

Without proper indexes, the database scans the entire notifications table.

This is called a Full Table Scan.

The database checks:

- every row
- every student
- every notification

This becomes extremely expensive with millions of rows.

---

# 2. Filtering Cost

The query filters using:

```sql
student_id
is_read
```

Without indexes:
- database must search row by row

This increases CPU and memory usage.

---

# 3. Sorting Cost

The query also performs:

```sql
ORDER BY created_at ASC
```

Sorting millions of rows is expensive.

Database may create temporary memory structures for sorting.

This increases query latency.

---

# 4. SELECT * Problem

Using:

```sql
SELECT *
```

retrieves all columns even if frontend only needs:

- title
- message
- created_at

Fetching unnecessary columns increases:

- memory usage
- disk I/O
- network transfer

---

# Optimized Solution

The query can be optimized using a composite index.

---

# Recommended Composite Index

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(student_id, is_read, created_at);
```

---

# Why Composite Index Works

This index helps with:

1. Filtering by student_id
2. Filtering unread notifications
3. Sorting by created_at

The database can directly locate matching rows instead of scanning the full table.

---

# Optimized Query

```sql
SELECT id, title, message, created_at
FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at ASC
LIMIT 20;
```

---

# Improvements Made

| Optimization | Benefit |
|--------------|----------|
| Composite index | Faster filtering + sorting |
| Removed SELECT * | Lower memory usage |
| LIMIT added | Reduced result size |

---

# Expected Performance Improvement

Without index:
- Full table scan
- High latency
- Slow response

With index:
- Indexed lookup
- Faster sorting
- Much lower query execution time

Performance may improve from several seconds to milliseconds.

---

# Should We Index Every Column?

## Answer: No

Indexing every column is NOT recommended.

---

# Why Indexing Every Column Is Bad

Indexes consume:

- storage space
- memory
- CPU resources

Every INSERT, UPDATE, DELETE operation must also update indexes.

Too many indexes cause:

- slower writes
- increased maintenance cost
- larger database size
- slower insert performance

---

# Best Practice

Indexes should only be created on:

- frequently searched columns
- filtering columns
- sorting columns
- join columns

Examples:

- student_id
- is_read
- created_at

---

# Query — Students Who Received Placement Notifications In Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';
```

---

# Query Explanation

This query:

- filters Placement notifications
- checks last 7 days
- returns unique students

---

# Additional Optimization Strategies

## 1. Pagination

Use:

```sql
LIMIT
OFFSET
```

to reduce result size.

---

## 2. Partitioning

Partition notifications table by:

- month
- year
- student_id

Benefits:

- smaller partitions
- faster queries
- easier maintenance

---

## 3. Redis Caching

Cache frequently accessed unread notifications.

Benefits:

- reduced DB load
- faster API response
- improved scalability

---

# Conclusion

Query optimization is essential for large-scale systems.

The main optimizations used are:

- composite indexing
- limiting selected columns
- pagination
- caching
- partitioning

These strategies ensure fast notification retrieval even with millions of records.