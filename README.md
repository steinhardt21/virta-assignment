# Virta assigmemt
This repository contains the solutions for Task 1 and Task 2. Unfortunately, I had a very tight schedule last week, but I hope that this work meets your requirements.

## Tech stack
The assignment was implemented using the following technologies:

- [HonoJS](https://hono.dev/): A powerful new Node.js framework that I chose for its ease of deployment on various JavaScript runtimes, such as Cloudflare Workers. This choice ensures that the APIs are easily scalable at a low cost. Additionally, I wanted to experiment with this promising framework for the project.
- PostgresDB: A relational database that can be enhanced with [PostGIS](https://postgis.net/), which adds support for storing, indexing, and querying geospatial data. This feature is crucial for efficiently developing Task 2 of the assignment. In particular, I utilized the `ll_to_earth` and `earth_box` functions.
- [Prisma](https://www.prisma.io/): A highly useful ORM for communicating with PostgresDB, facilitating the creation of a maintainable data layer.
- [Zod](https://zod.dev/): TypeScript-first schema validation with static type inference.
- Docker and Docker Compose: These tools were used to streamline and expedite the project's setup and execution.

## APIs developed

| Method   | URL                                      | Description                              |
| -------- | ---------------------------------------- | ---------------------------------------- |
| `GET`    | `/api/stations`                             | Retrieve all stations.                      |
| `POST`   | `/api/stations`                             | Create a new station.                       |
| `GET`    | `/api/stations/abdcee`                          | Retrieve stations with id abcdee.                       |
| `PUT`    | `/api/stations/abdcee`                          | Update data in station with id abdcee.                 |
| `DELETE` | `/api/stations/abdcee`                   | Delete station with id abdcee.                    |
| `POST`   | `/api/companies`                 | Create a new company              |
| `GET`    | `/api/companies` |Retrieve all comapnies |
| `GET`    | `/api/search?companyId=cly30&radiusKilometers=10&latitude=42.44205&longitude=1.53489` | Search for stations as specified in Task 2. |

Let's see in detail the POST APIs and the API created to fulfill the Task 2.

### POST `/api/companies`

```http
POST /api/companies
```
The body has to be of type JSON and should have the following fields: 
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | **Required**. Name of the company |
| `parentId` | `string` | **Optional**. Id of the parent company that owns this company |

### POST `/api/stations`

```http
POST /api/stations
```
The body has to be of type JSON and must have the following fields: 
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | **Required**. Name of the company |
| `companyId` | `string` | **Required**. Id of the company that owns the station |
| `latitude` | `string` | **Required**. Latitude |
| `longitude` | `string` | **Required**. Longitude |

### GET `/api/search`
Api developed to fulfill the Task 2.

```http
GET /api/search?companyId=cly30&radiusKilometers=10&latitude=42.44205&longitude=1.53489
```
The body has to be of type JSON and must have the following fields: 
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `companyId` | `string` | **Required**. Id of the company|
| `radiusKilometers` | `string` | **Required**. Radius expressed in Kilometers|
| `latitude` | `string` | **Required**. Latitude |
| `longitude` | `string` | **Required**. Longitude |

## Note on SQL Query for Finding Nearest Stations

I created the following SQL query for PostgreSQL to find the nearest stations within a specified radius for a given company:

```typescript
async findNearestStationsWithinRadiusForCompany({ companyId, latitude, longitude, radiusKilometers }: SearchQuery): Promise<StationModelDB[]> {
  const radiusMeters = Number(radiusKilometers) * 1000;
  const result = await prisma.$queryRaw<StationModelDB[]>`
    WITH RECURSIVE company_hierarchy AS (
      SELECT id, name, parent_id
      FROM "Company"
      WHERE id = ${companyId}
      UNION ALL
      SELECT c.id, c.name, c.parent_id
      FROM "Company" c
      INNER JOIN company_hierarchy ch ON c.parent_id = ch.id
    )
    SELECT s.*, ROUND(earth_distance(ll_to_earth(${Number(latitude)},${Number(longitude)}), ll_to_earth(latitude, longitude))::NUMERIC, 2) AS distance
    FROM "Station" AS s
    JOIN company_hierarchy ch ON s.company_id = ch.id
    WHERE
      earth_box(ll_to_earth(${Number(latitude)}, ${Number(longitude)}), ${radiusMeters}) @> ll_to_earth(latitude, longitude)
      AND earth_distance(ll_to_earth(${Number(latitude)}, ${Number(longitude)}), ll_to_earth(latitude, longitude)) < ${radiusMeters}
    ORDER BY
      distance;
  `;
  return result;
}
```
As PostgreSQL doesn’t have a data type for 3D points, the cube data type is used to represent 3D cubes. Points are represented as zero-sized cubes, which is both simple and efficient. A domain-specific type, earth, is defined as a descendant of the cube type, incorporating additional sanity checks (e.g., ensuring the point is close to the planet's surface).

Here are some useful functions that justify this approach:
- ll_to_earth(latitude, longitude): Translates a latitude and longitude pair into the earth type, calculating the 3D point location.
- earth_distance(point1, point2): Computes the distance between two points in the earth format.
- earth_box(point, radius): Creates a bounding cube to contain all points within a specified radius from a given point. This cube is an approximation, but it can be used for efficient searching with the @> (containment) operator, which supports GIST indexes.
This method offers several advantages, such as speed, simplicity, and the ability to redefine the planet's radius (useful for non-Earth calculations or re-defining units of measurement).

## Next possible developments
- Complete the testing of the APIs
- Add Rate Limiter in order to prevent the abuse of the APIs
- Add relevant indexes on the database
- Add caching

# Run the project
In order to run the project we should set the only  ```env ``` variable that is DATABASE_URL. Then the following comands should be run:

Then in order to run the Postgres instance we should run:
```
docker-compose build --no-cache
docker-compose up
```
And after that, we can run the following command to start the server (unfortunately, I had issues starting it with Docker Compose due to the database connection):
```
pnpm dev
```
