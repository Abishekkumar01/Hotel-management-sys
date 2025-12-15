# Technical Stack Overview

This document provides a comprehensive list of the tools, frameworks, and libraries used in this project.

## Frontend (`/frontend`)

*   **Framework:** [Next.js 13](https://nextjs.org/)
    *   *Note: Using the Pages Router structure.*
*   **Language:** JavaScript (ES6+)
*   **UI Library:** 
    *   [Ant Design (v5)](https://ant.design/) - Main component library.
    *   [React Icons](https://react-icons.github.io/react-icons/) - Iconography.
*   **State Management:** 
    *   [Redux Toolkit](https://redux-toolkit.js.org/) - Global state management.
    *   [Redux Persist](https://github.com/rt2zz/redux-persist) - Persistence of state across reloads.
*   **Styling:** [Styled Components](https://styled-components.com/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Utilities:** 
    *   [Day.js](https://day.js.org/) - Date manipulation.
    *   [UUID](https://github.com/uuidjs/uuid) - Application-wide unique identifiers.
*   **Linting & Formatting:** ESLint, Prettier (Airbnb configuration).

## Backend (`/backend`)

*   **Runtime:** [Node.js](https://nodejs.org/)
*   **Framework:** [Express.js](https://expressjs.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) (ODM: [Mongoose](https://mongoosejs.com/))
*   **Authentication:** 
    *   [JSON Web Tokens (JWT)](https://jwt.io/) - Stateless authentication.
    *   [BcryptJS](https://github.com/dcodeIO/bcrypt.js) - Password hashing.
*   **Logging:** 
    *   [Winston](https://github.com/winstonjs/winston) - General logging.
    *   [Morgan](https://github.com/expressjs/morgan) - HTTP request logger.
*   **File Handling:** [Multer](https://github.com/expressjs/multer) - Middleware for handling `multipart/form-data`.
*   **Email Service:** [SendGrid](https://sendgrid.com/)
*   **Security:** 
    *   [Helmet](https://helmetjs.github.io/) - HTTP header security.
    *   [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit) - Rate limiting.
    *   [Cors](https://github.com/expressjs/cors) - Cross-Origin Resource Sharing.
*   **Testing:** [Jest](https://jestjs.io/), [Supertest](https://github.com/ladjs/supertest).

## Admin Panel (`/admin-panel`)

*   **Framework:** [React](https://reactjs.org/) (bootstrapped with Create React App)
*   **UI Library:** 
    *   [Ant Design (v5)](https://ant.design/)
    *   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework.
*   **State Management:** Redux Toolkit, Redux Persist.
*   **HTTP Client:** Axios.
*   **Data Visualization:** [React CountUp](https://github.com/glennreyes/react-countup).
*   **Linting & Formatting:** ESLint, Prettier (Airbnb configuration).
