# CampusRide prototype (POE Part 2)

A clickable prototype built with plain HTML, CSS and JavaScript. All rides, names and prices are sample data, and nothing is sent anywhere.


## Pages (screens for your screenshots)

| File | Screen |
|---|---|
| index.html | Home with the two main choices |
| signup.html | Sign-up with university email check and error handling |
| search.html | Search form with direction choice (home to campus or campus to home), From, To, Days and time |
| results.html | Ranked results with sort, price filter, empty state and text map list |
| ride.html | Ride details and "Request a seat" with feedback message |
| offer.html | Offer a ride in either direction, with optional return trip, seat stepper and cost suggestion |
| trips.html | My trips, cancel confirmation with undo, and trip rating |

## Design features to point out in your report

- Usability goals:** two-choice home page, remembered structure, undo on cancel, error prevention on forms.
- Design principles:** visible main actions, feedback after every action, constraints (time and day pickers), mapping (direction, From, To, Days, Time, where the From and To fields swap places when the direction changes), consistent primary button, affordance (hover and focus states, 44px targets).
- Interaction types:** instructing (buttons), exploring (sort and filter), manipulating (direction and day toggles, seat stepper), responding (confirmation messages).
- Social and emotional design:** verified badges, ratings, public pickup points only, friendly empty state and error wording, trips-shared summary.
- WCAG 2.0 AA:** skip link, `lang`, page titles, labelled fields, error summary with links, visible focus, keyboard-operable day toggles and dialog, status shown by text and icon (not colour alone), contrast-checked palette, text alternative for the map, resize to 200%, reduced-motion support.
