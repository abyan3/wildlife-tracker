[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/odvV6PHf)
# Purpose

This is an Express API that can serve as a back end to an application that allows users to track wildlife sightings in US National Parks. It uses Supabase for Postgres database and authentication service.

## Data model

![An image of the desired data model](./data/data-model-viz.png)

## Features

Any user can make a request to get information about all parks, all species, and all sightings. Authenticated users can make a post request to create a sighting record. Authenticated users can make put or delete requests to update or destroy sighting records that belong to their account.

### Endpoints

#### GET /

Success Response: {data: string}

#### GET /parks

Success Response: {data: { list of park objects }}

Error Response: {message: string}

#### GET /parks/:id

Success Response: {data: { park object }}

Error Response: {message: string}

#### GET /species

Success Response: {data: list of species objects }

Error Response: {message: string}

#### GET /species/:id

Success Response: {data: species object }

Error Response: {message: string}

#### GET /sightings

Success Response: {data: list of sightings objects }

Error Response: {message: string}

#### GET /sightings/:id

Success Response: {data: sighting object }

Error Response: {message: string}

#### POST /sightings

Required params: accessToken, parkID, speciesID

Success Response: {data: sighting object }

Error Response: {message: string}

#### POST /auth/signin

Required params: email, password

Success Response: {data:{session:{token: string, expires_at: integer}}}

Error Response: {message: string}

#### POST /auth/signout

Required params: accessToken

Success Response: {}

Error Response: {message: string}

#### POST /auth/signup

Required params: email, password

Success Response: {data: user object }

Error Response: {message: string}


## TODO

This API is not yet complete. These are the tasks remaining.

1. If you don't yet have a project in Supabase, create one. Start at https://database.new/.
2. Create three tables: Parks, Species, Sightings.
3. Parks and Species tables can be created from the CSV files in the data/ directory here. Be sure to configure the tables correctly with primary keys and foreign key (Species belongs to Park) as well as setting columns to be unique and/or non-nullable as appropriate.
4. The Sightings table should have foreign keys referencing Parks, Species, and auth.User tables, all of which are non-nullable. It should also have a column called date_time that is non-nullable and has a data type of timestamptz.
5. Enable row level security (RLS) on all tables. Policies can be created with templates. Parks and species should have "Enable read access for all users." Sightings should use both "Enable read access for all users" and "Enable insert for authenticated users only."
6. In Supabase, under Authentication -> Sign In / Providers, disable "confirm email" option. This allows for easier testing.
7. In this codebase, fix the "Cannot set headers after they are sent to the client" error.
8. Use the Supabase SDK to implement the route handlers in this codebase so they match the behavior listed in Features above. Remember to do proper error handling and return the correct status codes for each case. Routes/parks.js GET / has been completed as an example of using the Supabase SDK. All necessary files and handlers exist, and each handler has comments with details of what it needs.


For 1 point of extra credit each, you can add:

1. Write better tests. Get at least 80% LOC coverage for parks, species, and sightings route handlers. You can mock the Supabase calls, or leave them as-is and these will be integration tests.
2. Deploy to Vercel. Remember this requires forking the repository to belong to your own Github account.
3. Allow a user to delete a sighting that belongs to them. This will require a new route handler plus a row level security policy on Supabase.
4. Improve the path documentation above so each "object" in successful returns lists all the keys it will hold.

## Development Guide

Automated unit tests are written using Jest and Supertest and live inside the tests/ directory. Run them with `npm test.` Tests should be written for any new features as part of development.

There are some tests right now that don't pass. When the work in TODO is completed, they should pass. They may need minor edits to match the functionality, depending on how you implement validations.

There is a Github workflow configured which will run the test suite on push to any branch and pull request to main branch.

## Resources

 - [Supabase Javascript docs](https://supabase.com/docs/reference/javascript)
 - [Supabase database guide](https://supabase.com/docs/guides/database/overview)
 - [Supabase auth service guide](https://supabase.com/docs/guides/auth)

## Security

### 1. Cross site scripting (XSS)
The goal of an XSS attack is to make a normal website return a malicious script to users. This is not applicable as the server side doesn’t render any html and therefore malicious content won’t be displayed to the users.

### 2. SQL injection
While the sighting page calls the supabase database any inserts or writes are protected. This is because users' input aren’t actually included in the queries. The user's input for sighting gets used to add data but any sql injection code would be processed as a string for some fields and others don’t allow it due the format validations.

### 3. DDOS
The server side is vulnerable to DDOS as there is no way to track the amount of requests coming in. This can make the server overwhelmed and unable to answer actual requests from real users. A potential fix for this could be implementing a feature to avoid users becoming a part of botnet. This could be done using a rate limiter to cap the amount of requests being made in a given time.

### 4. Authentication Failure
The api itself doesn't have any login behavior. The endpoints are public and are just reads so there isn’t anything to authenticate. If we had an endpoint for posting a sighting we’d need to verify the person making the request is a valid user.

### 5. Broken Access Controls
Since there are no private sightings, we do not have to worry about wildlife data being seen by anyone. They are intentionally public so there is nothing to expose. If we had an option for private sighting postings, we’d need to have access controls to avoid the private information being seen by unwanted visitors. We could do this by having policies within our database that only allow authorized user ids.

## Containerization
By Containerizing the API we can package the code, the node, and the dependencies all into one image. This means that all the parts run the same on any kind of machine. Before this, in order to run this API we would have to install Node, set up the environment and its versions, and run npm install to do the setup. By having Docker you only need to image without the extra steps. For the api, the supabase database connection, and the express and routes are all put together. This makes deployment easier as you don't have to set up a server or install things but instead pull images and run it, therefore you can simply move the image without additional changes when hosting it. Containerizers also make collaboration easier. With containers all developers are using the exact same environment. This avoids unnecessary time trying to match each other's local set up or dealing with issues because of conflicting machines or environments. The CI/CD pipeline also becomes simpler as you can automate making new images and deploying them automatically. The build process will be the same as defined in the Docker file rather than relying on doing it manually.

## Development Guide

### Building a new image

Build a new image after the code has been updated, including giving it a tag and version

```bash
docker build -t wildlife-client:1.0 .
```

### Run the container

Run the container of the image

```bash
docker run -p 3000:3000 \
  -e SUPABASE_URL=your_supabase_url \
  -e SUPABASE_SERVICE_ROLE_KEY=your_service_role_key \
  wildlife-api:1.0
```

Use `http://localhost:3000/parks` in your browser.

### Stop the container

Find the id then stop it
```bash
docker ps
docker stop <container-id>
```

### Delete a container

```bash
docker rm <container-id>
```

To also delete the image
```bash
docker rmi wildlife-client:1.0
```