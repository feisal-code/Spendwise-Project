💰 SpendWise — Personal Finance & Budget Management

Project Overview

SpendWise is a browser-based personal finance application designed to help users monitor expenses, manage category-based budgets, track savings goals, and manage recurring financial commitments.

The application focuses on providing a practical interface for day-to-day financial management while using client-side JavaScript to handle application logic, user interactions, data processing, and browser-based data persistence.

Key Features

- Account Management — User registration and login using an email address or phone number.
- Budget Management — Create budgets by selecting a currency and defining spending limits for individual categories.
- Expense Tracking — Add, search, filter, and delete expense records.
- Savings Goals — Define savings targets and monitor progress toward those targets.
- Recurring Expenses — Manage recurring financial commitments such as rent, subscriptions, and bills.
- Payment Tracking — Monitor due dates and mark recurring payments as paid.
- Spending Challenges — Interactive challenges designed to encourage consistent financial habits.
- Budget Alerts — Display spending and budget-status information to help users monitor their limits.
- Analytics — Analyze spending patterns across different expense categories.
- Theme Support — Light and dark interface themes.
- Privacy Information — Privacy policy accessible from the application footer.

## Technologies & Development Tools

| Technology | Purpose |
|---|---|
| HTML5 | Application structure and semantic content |
| CSS3 | Layout, styling, responsiveness, and themes |
| JavaScript | Application logic, interactivity, calculations, validation, and DOM manipulation |
| Git | Version control |
| GitHub | Source-code hosting and version management |
| Netlify | Deployment and continuous delivery |

The application is implemented using vanilla JavaScript without a frontend framework.

JavaScript Implementation

The project applies several core JavaScript concepts to implement its functionality:

- Conditionals for validation, budget-status messages, and due-date handling.
- Arrays and objects for managing budgets, expenses, savings goals, recurring payments, and challenges.
- Array methods such as "forEach", "filter", "find", and "reduce" for processing application data and generating spending information.
- DOM manipulation through methods including "getElementById()", "createElement()", "textContent", and "innerHTML".
- Event-driven programming using "submit", "click", "input", and "change" event listeners.
- Local storage for browser-based persistence of application data.
- Web Cryptography API through "crypto.subtle" for password hashing functionality.
- Client-side validation to improve data integrity and user interaction.

Project Structure

Spendwise-Project/
│
├── index.html      # Main application interface
├── style.css       # Application styling and themes
├── script.js       # Application logic and interactivity
└── README.md       # Project documentation

GitHub Repository

The complete SpendWise source code is maintained in a public GitHub repository.

Repository:
https://github.com/feisal-code/Spendwise-Project

GitHub is used as the project's source-code repository and provides version control for application updates.

Live Deployment

SpendWise is deployed using Netlify and is publicly accessible through the following URL:

Live Application:
https://spendwise-feisal.netlify.app

Deployment Architecture

The project uses a simple Git-based deployment workflow:

Local Project
     │
     ▼
   GitHub
     │
     ▼
   Netlify
     │
     ▼
Live SpendWise Website

The project source code is hosted in GitHub, while Netlify handles the deployment of the website to the Internet.

After the GitHub repository is connected to Netlify, changes pushed to the repository can trigger a new deployment automatically.

Deployment Process

The deployment process involved the following stages:

1. Reviewed the project structure and verified that the required HTML, CSS, JavaScript, and supporting assets were available.
2. Uploaded the complete SpendWise project to the public GitHub repository.
3. Connected the GitHub repository to Netlify.
4. Configured Netlify to deploy the project as a static web application.
5. Published the application using the custom Netlify subdomain:
   "spendwise-feisal.netlify.app"
6. Tested the deployed application to verify that the interface, styling, JavaScript functionality, and assets loaded correctly.
7. Made a visible project update and pushed the change to GitHub.
8. Verified that Netlify detected the repository update and deployed the latest version automatically.

Continuous Deployment

A continuous deployment test was performed by making a visible modification to the application and pushing the updated code to GitHub.

Netlify was configured to monitor the connected GitHub repository. After the new commit was pushed, Netlify initiated a new deployment, allowing the updated version of SpendWise to become available on the live website without manually uploading the project again.

This demonstrates the basic GitHub → Netlify continuous deployment workflow used by the project.

Deployment Challenges

Several practical considerations were encountered during deployment:

Project Organization

All required application files needed to be correctly organized before deployment. Incorrect file locations or references could prevent CSS, JavaScript, or other assets from loading correctly on the live site.

Repository Configuration

The GitHub repository needed to contain the complete project and be correctly connected to the Netlify deployment environment.

Local vs Production Testing

An application may function correctly in a local development environment while encountering issues after deployment. Testing the live URL was therefore necessary to verify that resources and JavaScript functionality continued to work correctly in the production environment.

Continuous Deployment Verification

A separate update was required to confirm that changes pushed to GitHub were automatically reflected in the deployed Netlify application.

Lessons Learned

This project provided practical experience with the workflow involved in taking a frontend application from development to production.

Key lessons include:

- Source-code organization is important before deployment.
- GitHub provides a reliable way to maintain and update project source code.
- Netlify simplifies the deployment of static web applications.
- Git-based deployment reduces the need for manual file uploads after the initial setup.
- Production testing is important because local development and deployed environments can behave differently.
- Small, controlled changes are useful when testing continuous deployment.
- Clear project documentation makes the application easier to understand, maintain, and evaluate.

Running the Project Locally

To run SpendWise locally:

1. Clone or download the GitHub repository.
2. Open the project directory in a code editor such as Visual Studio Code.
3. Open "index.html" in a web browser.
4. Alternatively, use a local development server such as the VS Code Live Server extension.
5. Interact with the application and verify its functionality in the browser.

Project Status

Status: Deployed and publicly accessible.

Source Code: GitHub
Hosting & Deployment: Netlify
Application Type: Client-side web application

Submission

The project submission is the public GitHub repository containing the complete SpendWise source code and documentation.

GitHub Repository:
https://github.com/feisal-code/Spendwise-Project

Live Website:
https://spendwise-feisal.netlify.app
