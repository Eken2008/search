# Search Application

This is a lightweight web-based search application that allows users to search the web using custom `!bangs`. The application is built with a combination of HTML, JavaScript, and Python (using the Sanic framework).



## Table of Contents

- [Features](#features)
- [Adding as a Default Search Engine](#adding-as-a-default-search-engine)
     - [Firefox](#firefox)
     - [Chrome](#chrome)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
     - [Prerequisites](#prerequisites)
     - [Steps](#steps)
- [Scripts](#scripts)
- [License](#license)

## Features

- **Custom Bangs**: Define your own search shortcuts (`!bangs`) for quick navigation to specific websites.
- **Default Bang**: Select what search engine you want to use as your default.
- **Settings Panel**: Manage custom bangs and default bang through a user-friendly settings interface.
- **Responsive Design**: Optimized for both desktop and mobile devices.



## Adding as a Default Search Engine

### Firefox

1. Open Firefox and navigate to `about:config`.
2. Search for `browser.urlbar.update2.engineAliasRefresh` and set it to `true`.
3. Navigate to `about:preferences#search`
4. Press the "Add" button in the "Search Shortcuts" section
5. Enter `https://search.bagottgames.uk/#query=%s` as url.
6. Save the search engine and set it as default if desired.

### Chrome

1. Open Chrome and go to `chrome://settings/searchEngines`.
2. Under "Manage search engines," click "Add."
3. Enter `https://search.bagottgames.uk/#query=%s` as url.
4. Click "Add" and set it as the default search engine if preferred.



## Usage

1. Enter a search query in the input field.
2. Use `!bangs` to specify a search engine or website (e.g., `!ddg` for DuckDuckGo).
3. Manage bangs and default settings in the settings panel.



## Project Structure

- **Frontend**:
    - `index.html`: Main HTML file for the search interface.
    - `search.js`: Handles search logic and bang processing.
    - `style.css`: Styles for the application.

- **Backend**:
    - `main.py`: Python backend using the Sanic framework to serve the application.
    - `start.sh`: Script to start the server.
    - `stop.sh`: Script to stop the server.



## Setup Instructions

### Prerequisites

- Python 3.x
- Bash shell (for running `start.sh` and `stop.sh`)

### Steps

1. Clone the repository:
     ```bash
     git clone https://github.com/Eken2008/search.git
     cd search
     ```

2. Install Python dependencies:
     ```bash
     pip install -r requirements.txt
     ```

3. Create a `.env` file in the root directory:
     ```env
     PORT=8000
     PROD=false
     ```

4. Start the server:
     ```bash
     ./start.sh
     ```

5. Open your browser and navigate to `http://localhost:<PORT>`.



## Scripts

- **Start Server**: `./start.sh`
- **Stop Server**: `sudo bash stop.sh`



## License

This project is licensed under the MIT License.