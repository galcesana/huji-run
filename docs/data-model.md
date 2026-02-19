# HUJI Run - Data Model

## Database Schema (Relational)

### Users
- `id`: UUID (Primary Key)
- `email`: String (Unique)
- `name`: String
- `image`: String (URL)
- `role`: Enum (`COACH`, `CO_COACH`, `MEMBER`)
- `status`: Enum (`PENDING`, `ACTIVE`, `REJECTED`, `BANNED`)
- `team_id`: UUID (Foreign Key -> Teams.id)
- `created_at`: DateTime

### Teams
- `id`: UUID (Primary Key)
- `name`: String
- `join_code`: String (Unique)
- `created_at`: DateTime

### JoinRequests
- `id`: UUID (Primary Key)
- `team_id`: UUID
- `user_id`: UUID
- `status`: Enum (`PENDING`, `APPROVED`, `REJECTED`)
- `note`: String
- `reviewed_by`: UUID (Coach ID)
- `reviewed_at`: DateTime

### StravaAccounts
- `user_id`: UUID (Primary Key, Foreign Key -> Users.id)
- `athlete_id`: BigInt
- `refresh_token`: String (Encrypted)
- `access_token`: String (Encrypted)
- `expires_at`: BigInt
- `scope`: String

### Activities
- `id`: UUID (Primary Key)
- `team_id`: UUID
- `user_id`: UUID
- `source`: String ("strava")
- `source_activity_id`: BigInt (Unique)
- `name`: String
- `description`: String
- `distance`: Float (meters)
- `moving_time`: Int (seconds)
- `elapsed_time`: Int (seconds)
- `total_elevation_gain`: Float (meters)
- `start_date`: DateTime
- `start_latlng`: Json
- `map_polyline`: String
- `average_speed`: Float (m/s)
- `max_speed`: Float (m/s)

### Posts
- `id`: UUID (Primary Key)
- `team_id`: UUID
- `user_id`: UUID
- `activity_id`: UUID (Nullable)
- `content`: String
- `created_at`: DateTime

### Likes
- `post_id`: UUID
- `user_id`: UUID
- `created_at`: DateTime
- *Constraint: Unique(post_id, user_id)*

### Comments
- `id`: UUID (Primary Key)
- `post_id`: UUID
- `user_id`: UUID
- `content`: String
- `created_at`: DateTime

### Meetups
- `id`: UUID (Primary Key)
- `team_id`: UUID
- `created_by`: UUID
- `title`: String
- `start_time`: DateTime
- `location_name`: String
- `location_url`: String
- `route_url`: String
- `notes`: Text
- `created_at`: DateTime

### MeetupRSVPs
- `meetup_id`: UUID
- `user_id`: UUID
- `status`: Enum (`GOING`, `MAYBE`, `NOT_GOING`)
- `updated_at`: DateTime
