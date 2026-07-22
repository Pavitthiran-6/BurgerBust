# BurgerBurst

BurgerBurst is a colorful, responsive food-ordering platform with a playful comic-inspired interface. It combines a customer storefront with a complete administration workspace for managing day-to-day restaurant operations.

## Highlights

### Customer experience

- Browse featured dishes, categories, offers, and recommendations
- Search the menu and view detailed food information
- Customize items with toppings and quantity controls
- Save favorites and recently viewed items
- Manage the cart, coupons, rewards, and checkout
- Follow order progress and review previous orders
- Manage profile information, addresses, notifications, and preferences
- Enjoy responsive layouts designed for mobile, tablet, and desktop

### Administration workspace

- View restaurant performance from a central dashboard
- Manage products, categories, pricing, and availability
- Monitor stock levels and inventory activity
- Process and track customer orders
- Manage customers, coupons, rewards, and notifications
- Review analytics and export operational reports
- Maintain restaurant settings and administrator profiles

## Technology

The project is built with:

- React 19 and Vite
- Tailwind CSS
- Framer Motion and GSAP
- Lucide React icons
- Java 21 and Spring Boot
- PostgreSQL and Flyway
- Docker and Render deployment configuration

## Getting started

### Prerequisites

- Node.js 24 or a compatible current release
- npm

### Installation

```bash
git clone https://github.com/Pavitthiran-6/BurgerBust.git
cd BurgerBust
npm install
npm run dev
```

Open the local address displayed by Vite in your terminal.

## Available commands

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Project structure

```text
BurgerBust/
|-- backend/       Java server application and database migrations
|-- docs/          Deployment, operations, and security documentation
|-- public/        Static images, icons, and sound assets
|-- src/
|   |-- admin/     Administration workspace
|   |-- components/ Shared interface components
|   |-- context/   Application context providers
|   |-- data/      Menu and restaurant presentation data
|   |-- hooks/     Reusable React hooks
|   |-- pages/     Customer-facing views
|   `-- services/  Client-side service modules
|-- render.yaml    Render deployment blueprint
`-- vite.config.js Vite configuration
```

## Production build

Create an optimized frontend build with:

```bash
npm run build
```

The generated output is written to `dist/`.

## Deployment

The repository includes a Render blueprint for deploying the application. Keep all production configuration in the hosting platform's protected environment settings and never commit local environment files or credentials.

## Security

- Local environment files are excluded through `.gitignore`
- Example configuration files contain placeholders only
- Production credentials must remain outside source control
- Review staged changes before every push

## Project status

BurgerBurst includes the main customer ordering journey, administration tools, responsive layouts, production build configuration, and deployment documentation. Continued work can focus on usability refinements, accessibility, automated browser coverage, and operational monitoring.
