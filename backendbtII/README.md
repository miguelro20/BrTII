# Flight Search Backend
## Getting Started
### This application contains the backend for a Flight Search Application. It is made using SpringBoot, Gradle, and Java 17. The app handles the following operations:
- #### Get all flights matching a specific criteria
- #### Fetch access tokens to access external services
- #### Get airport and city codes that match specific keywords
- #### Have failovers in case the external services fail

--- 

## Architecture

---

### Controller
#### This app works by first defining a controller using SpringBoot.
#### This controller defines the different api routes using the tags @GetMapping for GET opperations
#### The tag @CrossOrigin is placed in front of all routes in order to allow connections from the frontend development port 3000
#### Logic for pagination and ordering is handled in this layer

---

### Service Layer
#### The service layer does the necessary operations to fulfill the api routes requirements.
#### The service layer creates connections to external services in order to fulfill requests coming from the frontend
#### The service layer is also in charge of handling the use of Dummy Data, which is to be used in case of problems with the external services

---

### Entities
#### Airport Entity:
- ##### The Airport entity is a blueprint for the Airport object, which is used to handle the Dummy Data, and is defined as follows: String iataCode, String name, String state

---
## Tests
### Testing is done using the Test Rest Template which simulates use from the web.
#### Tests are done by calling the api as expected and comparing the response with the expected response. This are found inside HttpRequestTest.
### Two other tests are run, a Smoke Test, and a test that validates the application is not null.
