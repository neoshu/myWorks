# Project Requirements

## Goal
This project will create a web app which can import a csv file and export a pdf file.
The csv file is from HIOKI MEMORY HiLOGGER LR8450.
The csv file is just for temperature recording.
## Users
The electrical appliance safety test engineers will use this web app.

## Core Features
- The web app has an import button for user to select a csv file locally to import.
- The web app is static HTML/JS/CSS app.
- Do not take multiple users into consideration.
- Only one csv file a time is allowed to import to parse and convert.
- The web app has a export button for user to export a pdf file to save locally.
- The csv file is from HIOKI MEMORY HiLOGGER LR8450 so they are with the same format:
	- Row 1 is useless and can be ignored.
	- Row 2 is useless and can be ignored.
	- Row 3 contains test start date and time, you should remember them. "26-05-27 10:09:11.772" means 2026-05-27 and the seconds and milliseconds are omitted in pdf output.
	- Rows 4 to 11 are useless and can be ignored.
	- Row 12 to the end are the useful data (row 12 is header and the others are temperature records).
	- The web app mainly parses row 12 to the end.
	- The last column is useless and can be ignored.

## UI / UX Requirements
A local web app with the necessary CSS styling.
You can style this local web app however you see fit.

## Data / Logic Requirements
- The example csv is [example.CSV](./example.CSV)
- From line 12:
	- Column A is time with interval 1s.
	- The other columns, except the last column, are temperature records with unit of Celsius.
	- The number of useful columns is not constant. It is definitely less than 30.
- After import the csv file and parse, the web app shall have the necessary inputs for user to input temperature test location for each column that will perform the new header.
	- For example, csv U1-1[C], user input `supply cord`;
	- csv U1-2[C], user input `x2 capacitor`
	- etc...
	- The final header should be only the user input, like "supply cord".
	- Empty fields should fall back to the CSV header like U1-1[C].
- After collecting all the necessary information, the output pdf file shall contain:
	- The start date and time, such as format 2026-05-27 10:09, seconds and milliseconds are omitted.
	- The end date and time (start time + the last row of time column), seconds and milliseconds are omitted.
	- The duration, such as 2h33m34s. The milliseconds are omitted.
	- The CSV has scientific notation like +2.62400E+01, which is 26.24. PDF temperatures display as 26.24 °C. All temperatures always show 2 decimals.
	- The start temperature for each column header.
	- The end temperature for each column header.
	- The max temperature for each column header.
	- The chart format: scatter with smooth lines; x-axis displays seconds, y-axis displays temperature. You decide which tool, external or not, is perfect for this project.
	- e.g. 29 input fields mean 29 curves in the chart.
	- The pdf file is A4 page size. One page is good, two pages are also OK.
	- You can style this pdf however you see fit.
- The pdf file has default file name result.pdf.

## Out of Scope
Not decided yet.

## Acceptance Criteria
- Static app opens locally in browser.
- Imports LR8450 CSV.
- Ignores rows/last column correctly.
- Lets user rename each temperature channel.
- Falls back to CSV header for blank names.
- Calculates start, end, duration, start/end/max temperatures.
- Exports `result.pdf` in A4 with summary table and chart.

## Notes / Open Questions
Not decided yet.