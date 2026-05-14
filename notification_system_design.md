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
      "title": "Microsoft Hiring Drive",
      "message": "Microsoft hiring drive scheduled on Friday",
      "priority": "high",
      "isRead": false,
      "createdAt": "2026-05-14T10:00:00Z"
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
    "createdAt": "2026-05-14T10:00:00Z"
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
  "title": "Amazon Hiring Drive",
  "message": "Amazon hiring drive starts tomorrow",
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