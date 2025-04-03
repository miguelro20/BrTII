# Search Flights Application Frontend

## Getting Started

### This is a Flight Search App which handles the following basic operations:
- Search itineraries
- Handle non-stop and round flights
- Show Amenities
- Display price breakdown

## Technical Aspects
- #### Application created using Next JS, TypeScript, React Context, ShadCN/UI and Vitest for testing.
- #### The application developer server runs on port 3000, this can be modified inside the package.json file.
- #### Displayed data comes from the backend, running on http://localhost:8080, which fetches data from Amadeus API .

## Architechture
### Components
#### Custom components are found inside app/components folder. This include:
- ##### FlightSearchForm. This components main purpose is to handle the data being input into the search filters. This component handles said data and stores it inside a React Context, which is then sent to the /flights page, for handling of API calls. This component also handles the logic for communicating with the backend in order to fetch Iata Codes (airport or city codes), to allow the user to have a smooth experience when navigating the app without having to worry with knowing their airport's specific code.
### Pages
### FlightsPage. This page is a dedicated react function, which handles all the logic for fetching and displaying flight information that matches the filters criteria. This page can also handle the selection of specific flights to view their price breakdown and amenities included.

---

### Hooks
#### Hooks are found inside app/hooks and include:
- ##### useFilters. This hook is used to access the value and function established within the SearchFiltersContext. The hook returns the State Variable filters and its setter setFilters, to be used anywhere needed.

---

### Interfaces
#### Interfaces are found inside /app/interfaces and define the different interfaces of objects used in the application, these are divided into two main documents:
- ##### Flight Results: This document holds all the interfaces needed to handle the different data types provided by our backend application.
- ##### Search Filters: This interface holds the data structure needed for the React Context.

### Context
#### The context is established inside /app, and consists of:
- ##### context.ts Where the filters context is created.
- ##### providers.ts Where the context is wrapped inside providers function.
- ##### layout.tsx Where the context is used so it is consistent across the app.

### Integration
#### The FlightSearchForm is called within the main page of the application, this allows for a smooth transition between pages. The user clicks a button within the form, which automatically redirects them to the /flights page, where the logic for fetching the flights' data happens all behind the scenes. 