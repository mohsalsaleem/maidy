# Sample Document with Mermaid Diagrams

This is a test document to demonstrate markdown-to-PDF conversion with embedded Mermaid diagrams.

## Architecture Overview

Below is a flowchart showing the system architecture:

```mermaid
graph TD
    A[User] --> B[Frontend]
    B --> C[API Gateway]
    C --> D[Auth Service]
    C --> E[Data Service]
    D --> F[(Database)]
    E --> F
```

## Sequence Diagram

Here's a sequence diagram showing the authentication flow:

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth API
    participant D as Database

    U->>F: Enter credentials
    F->>A: POST /login
    A->>D: Validate user
    D-->>A: User data
    A-->>F: JWT token
    F-->>U: Redirect to dashboard
```

## Features

The system includes the following features:

- **Authentication**: Secure user login and registration
- **Authorization**: Role-based access control
- **Data Management**: CRUD operations for all entities
- **Real-time Updates**: WebSocket support for live data

## Code Example

Here's a simple example in TypeScript:

```typescript
async function fetchData(id: string): Promise<Data> {
  const response = await fetch(`/api/data/${id}`);
  return response.json();
}
```

## State Diagram

The order processing workflow:

```mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Pending: Submit
    Pending --> Processing: Approve
    Pending --> Cancelled: Reject
    Processing --> Completed: Success
    Processing --> Failed: Error
    Completed --> [*]
    Cancelled --> [*]
    Failed --> [*]
```

## Conclusion

This demonstrates markdown with multiple mermaid diagrams, text formatting, and code blocks.
