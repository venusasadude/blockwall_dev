# Blockwall Twitter Dashboard

A full-stack application built for the Blockwall coding task.  
It ingests a Neo4j Twitter dataset and provides:

- A **backend API** in Node.js + Express + TypeScript  
- A **frontend dashboard** in Next.js + React + MUI  
- An interactive **2D force-directed network graph** exploring users, tweets, and hashtags  
- A clean UI with **filtering**, **user detail pages**, and **mode-aware inputs**

Demo:

https://drive.google.com/file/d/1RWoreE3qOeSUHd4zEPcveK5ogWKm8Ppi/view?usp=sharing



## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Neo4j (twitter-v2 dataset)
- `neo4j-driver`
- Modular domain architecture (`overview`, `network`, `user` modules)
- Shared utilities for Neo4j numeric handling and async route handlers

### Frontend
- Next.js (React, App Router)
- Material UI
- `react-force-graph-2d`
- Responsive layout with auto-centering canvas
- Strong TypeScript types

---

## Prerequisites

- Node.js ≥ 18  
- npm ≥ 9  
- Neo4j ≥ 5.x  
- Twitter v2 dataset imported from:  
  https://github.com/neo4j-graph-examples/twitter-v2

---

## Neo4j Setup

Create `.env` inside `/backend`:

```env
PORT=4000
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=neo4j
NEO4J_DATABASE=twitter-v2-50
```

Recommended indexes (not strictly required, but good for performance):

```cypher
CREATE INDEX user_screen_name IF NOT EXISTS
FOR (u:User) ON (u.screen_name);

CREATE INDEX hashtag_name IF NOT EXISTS
FOR (h:Hashtag) ON (h.name);

CREATE INDEX tweet_id IF NOT EXISTS
FOR (t:Tweet) ON (t.id);
```

These match the labels/properties used in the codebase.

---

## ▶ Running the App Locally

### Backend

From the backend project root:

```bash
npm install
npm run dev
```

This starts the API at:

```text
http://localhost:4000
```

### Frontend (separate Next.js project)

From the frontend project root:

```bash
npm install
npm run dev
```

By default, the frontend runs on:

```text
http://localhost:3000
```

and calls the backend under `http://localhost:4000/api/...`.

---

## Backend API Overview

All backend routes are prefixed with `/api`.

The implemented and documented endpoints are:

- `GET /api/overview`
- `GET /api/network`
- `GET /api/user/:screenName`

> There is also an internal `/api/search` endpoint in the codebase, but the dashboard does not expose a global search UI, so it is intentionally omitted from this README.

### 1. Overview

**GET `/api/overview`**

Returns high-level dashboard metrics:

- Total number of users, tweets and hashtags  
- Top 5 users by number of tweets  
- Top 10 most-used hashtags  

**Example response:**

```json
{
  "totals": {
    "users": 38986,
    "tweets": 2407,
    "hashtags": 344
  },
  "topUsersByTweets": [
    {
      "screen_name": "user1",
      "name": "User One",
      "tweetCount": 42,
      "followers": 1234
    }
  ],
  "topHashtags": [
    {
      "name": "space",
      "usageCount": 99
    }
  ]
}
```

This matches the shape returned by `overview.service.ts` (`OverviewResponse` type).

---

### 2. Network

**GET `/api/network`**

Builds a small ego-network around a **user** or a **hashtag**, suitable for consumption by a force-directed graph component.

#### Query parameters

- `user` (optional): screen_name to focus on  
- `hashtag` (optional): hashtag name to focus on (without `#`)  
- `minFollowers` (optional): minimum followers for included users  
- `limit` (optional): max number of tweets to include (default: 200)

At least one of `user` or `hashtag` is required (the route returns `400` otherwise).  
These parameters are parsed and passed through as `NetworkRequestParams` to `network.service.ts`.

#### Response shape

```json
{
  "nodes": [
    {
      "id": "user:nasa",
      "type": "User",
      "label": "nasa",
      "screen_name": "nasa",
      "name": "NASA",
      "followers": 1000000
    },
    {
      "id": "tweet:1234567890",
      "type": "Tweet",
      "label": "We launched a rocket!",
      "text": "We launched a rocket!",
      "created_at": "2020-01-01T12:34:56.000Z"
    },
    {
      "id": "hashtag:space",
      "type": "Hashtag",
      "label": "#space",
      "name": "space"
    }
  ],
  "edges": [
    {
      "id": "POSTS:user:nasa->tweet:1234567890",
      "from": "user:nasa",
      "to": "tweet:1234567890",
      "type": "POSTS"
    },
    {
      "id": "TAGS:tweet:1234567890->hashtag:space",
      "from": "tweet:1234567890",
      "to": "hashtag:space",
      "type": "TAGS"
    }
  ]
}
```

This corresponds to the `GraphNode` / `GraphEdge` types in `network.types.ts` and the mapping logic in `network.service.ts`.

Currently implemented filters:

- `minFollowers` is applied in the Cypher queries to restrict users by follower count.
- `limit` controls how many tweets are pulled into the network, keeping graphs readable.

Future extension (not yet implemented in the code, but considered during design):

- `minHashtagUsage`: filter out very rare hashtags by usage frequency.

---

### 3. User Detail

**GET `/api/user/:screenName`**

Returns:

- User profile data  
- Recent tweets posted by that user  
- Hashtags used in each tweet  

#### Query parameters

- `limit` (optional): max number of tweets to return (default: 50), matching `user.service.ts`.

#### Example response

```json
{
  "user": {
    "screen_name": "nasa",
    "name": "NASA",
    "followers": 1000000,
    "following": 50,
    "location": "USA",
    "profile_image_url": "https://...",
    "statuses": 12345,
    "url": "https://nasa.gov"
  },
  "tweets": [
    {
      "id": 1234567890,
      "text": "We launched a rocket!",
      "created_at": "2020-01-01T12:34:56.000Z",
      "favorites": 200,
      "hashtags": ["space", "rocket"]
    }
  ]
}
```

This matches the structure produced by `getUserDetail` in `user.service.ts` (`UserDetailResponse`).

---

## Frontend Features (Dashboard UX)

On the frontend side (Next.js + MUI), the dashboard provides:

- **Overview page** with totals, top users, and top hashtags
- <img width="1207" height="648" alt="Screenshot 2025-11-18 at 11 50 51" src="https://github.com/user-attachments/assets/f368ea7c-7dc2-4189-a64f-45571cfcea67" />

- **Network page** with:
  - Mode selector: *User network* vs *Hashtag network*
  - Inputs for `user`, `hashtag`, `minFollowers`, `limit`
  - An interactive force-directed graph powered by `react-force-graph-2d`
  - Auto-centering & zoom-to-fit on data or container size changes
  - <img width="1101" height="715" alt="Screenshot 2025-11-18 at 11 52 36" src="https://github.com/user-attachments/assets/965545e2-f947-404f-807f-35f49c6d4244" />
  - Graph filtered by hashtag activity.
  - <img width="1109" height="720" alt="Screenshot 2025-11-18 at 11 53 30" src="https://github.com/user-attachments/assets/916f5c00-f1de-41dd-ae7d-180aceb0e2b1" />

- **User detail page** showing:
  - Profile info for the selected user
  - Recent tweets with their hashtags
  - <img width="1134" height="591" alt="Screenshot 2025-11-18 at 11 54 54" src="https://github.com/user-attachments/assets/0a68eaf8-ea4a-421c-a93f-459f35839b27" />


---

## Author

**Xavier Ramos**  
Full-Stack / AI Engineer
